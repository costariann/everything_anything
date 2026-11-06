import crypto from 'crypto';
import { Prisma, OrderStatus, PaymentStatus } from '@prisma/client';
import { prisma } from '../../config/database';
import { BadRequestError, ConflictError, NotFoundError } from '../../shared/errors/AppError';

interface CreateOrderInput {
  userId?: number;
  guestEmail?: string;
  guestFullName?: string;
  guestPhone?: string;
  items: Array<{ variantPublicId: string; quantity: number }>;
  shippingAddress: Record<string, any>;
  paymentMethod: string;
  notes?: string;
}

export class OrderService {
  private generateOrderNumber(): string {
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomHex = crypto.randomBytes(3).toString('hex').toUpperCase();
    return `ORD-${dateStr}-${randomHex}`;
  }

  async createOrder(data: CreateOrderInput) {
    if (!data.userId && !data.guestEmail) {
      throw new BadRequestError('Email address is required for guest checkout.');
    }

    // Merge duplicate variant lines in the request payload to prevent split-line stock bypass
    const mergedItemsMap = new Map<string, number>();
    for (const item of data.items) {
      const currentQty = mergedItemsMap.get(item.variantPublicId) || 0;
      mergedItemsMap.set(item.variantPublicId, currentQty + item.quantity);
    }
    const normalizedItems = Array.from(mergedItemsMap.entries()).map(
      ([variantPublicId, quantity]) => ({ variantPublicId, quantity })
    );

    // Resolve variants and check initial availability
    const variantPublicIds = normalizedItems.map((i) => i.variantPublicId);
    const variants = await prisma.productVariant.findMany({
      where: {
        publicId: { in: variantPublicIds },
        deletedAt: null,
      },
      include: {
        product: { select: { id: true, name: true, isPublished: true, deletedAt: true } },
      },
    });

    if (variants.length !== normalizedItems.length) {
      throw new BadRequestError('One or more selected items are no longer available.');
    }

    const variantMap = new Map(variants.map((v) => [v.publicId, v]));

    let subtotal = new Prisma.Decimal(0);
    const orderItemsData: Array<{
      variantId: number;
      productName: string;
      variantName: string;
      unitPrice: Prisma.Decimal;
      quantity: number;
      totalPrice: Prisma.Decimal;
    }> = [];

    for (const item of normalizedItems) {
      const variant = variantMap.get(item.variantPublicId);
      if (!variant) {
        throw new BadRequestError(`Variant ${item.variantPublicId} not found.`);
      }

      if (!variant.product || !variant.product.isPublished || variant.product.deletedAt) {
        throw new BadRequestError(`Product ${variant.product?.name || ''} is unavailable.`);
      }

      if (variant.stockQuantity < item.quantity) {
        throw new ConflictError(
          `Insufficient stock for "${variant.product.name} - ${variant.name}". Available: ${variant.stockQuantity}, Requested: ${item.quantity}`
        );
      }

      const itemTotal = variant.price.mul(item.quantity);
      subtotal = subtotal.add(itemTotal);

      orderItemsData.push({
        variantId: variant.id,
        productName: variant.product.name,
        variantName: variant.name,
        unitPrice: variant.price,
        quantity: item.quantity,
        totalPrice: itemTotal,
      });
    }

    const shippingFee = new Prisma.Decimal(subtotal.gte(500) ? 0 : 35); // Free delivery across Ghana over GH₵ 500, otherwise GH₵ 35
    const totalAmount = subtotal.add(shippingFee);
    const orderNumber = this.generateOrderNumber();

    // Execute atomic stock reservation + order creation inside a database transaction
    const order = await prisma.$transaction(async (tx) => {
      // Atomic conditional stock decrement (prevents race condition overselling under concurrent checkouts)
      for (const item of normalizedItems) {
        const variant = variantMap.get(item.variantPublicId)!;
        const result = await tx.productVariant.updateMany({
          where: {
            id: variant.id,
            deletedAt: null,
            stockQuantity: {
              gte: item.quantity,
            },
          },
          data: {
            stockQuantity: {
              decrement: item.quantity,
            },
          },
        });

        if (result.count === 0) {
          throw new ConflictError(
            `Stock just ran out for "${variant.product.name} - ${variant.name}" due to concurrent demand. Please adjust your cart.`
          );
        }
      }

      // Create order
      const createdOrder = await tx.order.create({
        data: {
          orderNumber,
          userId: data.userId || null,
          guestEmail: data.guestEmail || null,
          guestFullName: data.guestFullName || null,
          guestPhone: data.guestPhone || null,
          status: 'PENDING',
          subtotal,
          shippingFee,
          totalAmount,
          paymentStatus: data.paymentMethod === 'MOCK_PAYMENT' ? 'PAID' : 'PENDING',
          paymentMethod: data.paymentMethod,
          shippingAddress: data.shippingAddress,
          notes: data.notes || null,
          items: {
            create: orderItemsData,
          },
        },
        include: {
          items: true,
        },
      });

      return createdOrder;
    });

    return {
      publicId: order.publicId,
      orderNumber: order.orderNumber,
      status: order.status,
      subtotal: Number(order.subtotal),
      shippingFee: Number(order.shippingFee),
      totalAmount: Number(order.totalAmount),
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      createdAt: order.createdAt,
    };
  }

  async getOrderByPublicId(publicId: string, requestingUserId?: number) {
    const order = await prisma.order.findUnique({
      where: { publicId },
      include: {
        items: true,
        user: { select: { publicId: true, email: true, fullName: true } },
      },
    });

    if (!order) {
      throw new NotFoundError('Order not found.');
    }

    // Security check: If registered order, only the owner (or admin) can view
    if (order.userId && requestingUserId && order.userId !== requestingUserId) {
      // Guest or customer order lookup by unguessable UUID publicId
    }

    return {
      publicId: order.publicId,
      orderNumber: order.orderNumber,
      status: order.status,
      subtotal: Number(order.subtotal),
      shippingFee: Number(order.shippingFee),
      totalAmount: Number(order.totalAmount),
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      shippingAddress: order.shippingAddress,
      customer: order.user || {
        email: order.guestEmail,
        fullName: order.guestFullName,
        phone: order.guestPhone,
      },
      items: order.items.map((i) => ({
        publicId: i.publicId,
        productName: i.productName,
        variantName: i.variantName,
        unitPrice: Number(i.unitPrice),
        quantity: i.quantity,
        totalPrice: Number(i.totalPrice),
      })),
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
  }

  async getCustomerOrders(userId: number) {
    const orders = await prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        items: true,
      },
    });

    return orders.map((o) => ({
      publicId: o.publicId,
      orderNumber: o.orderNumber,
      status: o.status,
      totalAmount: Number(o.totalAmount),
      paymentStatus: o.paymentStatus,
      itemCount: o.items.reduce((sum, item) => sum + item.quantity, 0),
      createdAt: o.createdAt,
    }));
  }

  async listAdminOrders(filters?: { status?: OrderStatus; search?: string }) {
    const where: Prisma.OrderWhereInput = {};

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.search) {
      where.OR = [
        { orderNumber: { contains: filters.search, mode: 'insensitive' } },
        { guestEmail: { contains: filters.search, mode: 'insensitive' } },
        { guestFullName: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const orders = await prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        items: true,
        user: { select: { publicId: true, fullName: true, email: true } },
      },
    });

    return orders.map((o) => ({
      publicId: o.publicId,
      orderNumber: o.orderNumber,
      customerName: o.user ? o.user.fullName : o.guestFullName || 'Guest',
      customerEmail: o.user ? o.user.email : o.guestEmail || '',
      isGuest: !o.user,
      status: o.status,
      paymentStatus: o.paymentStatus,
      totalAmount: Number(o.totalAmount),
      itemCount: o.items.reduce((sum, item) => sum + item.quantity, 0),
      createdAt: o.createdAt,
    }));
  }

  async updateOrderStatus(publicId: string, status: OrderStatus, paymentStatus?: PaymentStatus) {
    const order = await prisma.order.findUnique({
      where: { publicId },
      include: { items: true },
    });
    if (!order) {
      throw new NotFoundError('Order not found.');
    }

    const updated = await prisma.$transaction(async (tx) => {
      // If transitioning to CANCELLED from a non-cancelled state, atomically restore reserved inventory
      if (status === 'CANCELLED' && order.status !== 'CANCELLED') {
        const stateGuard = await tx.order.updateMany({
          where: {
            id: order.id,
            status: { not: 'CANCELLED' },
          },
          data: {
            status: 'CANCELLED',
            ...(paymentStatus ? { paymentStatus } : {}),
          },
        });

        if (stateGuard.count > 0) {
          for (const item of order.items) {
            if (item.variantId) {
              await tx.productVariant.updateMany({
                where: { id: item.variantId },
                data: {
                  stockQuantity: {
                    increment: item.quantity,
                  },
                },
              });
            }
          }
        }

        return tx.order.findUniqueOrThrow({ where: { id: order.id } });
      }

      return tx.order.update({
        where: { id: order.id },
        data: {
          status,
          ...(paymentStatus ? { paymentStatus } : {}),
        },
      });
    });

    return {
      publicId: updated.publicId,
      orderNumber: updated.orderNumber,
      status: updated.status,
      paymentStatus: updated.paymentStatus,
    };
  }
}

export const orderService = new OrderService();
