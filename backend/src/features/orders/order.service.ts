import { Prisma, OrderStatus, PaymentStatus } from '@prisma/client';
import { prisma } from '../../config/database';
import { BadRequestError, NotFoundError } from '../../shared/errors/AppError';

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
    const randomHex = Math.floor(1000 + Math.random() * 9000);
    return `ORD-${dateStr}-${randomHex}`;
  }

  async createOrder(data: CreateOrderInput) {
    if (!data.userId && !data.guestEmail) {
      throw new BadRequestError('Email address is required for guest checkout.');
    }

    // Resolve variants and check inventory
    const variantPublicIds = data.items.map((i) => i.variantPublicId);
    const variants = await prisma.productVariant.findMany({
      where: {
        publicId: { in: variantPublicIds },
        deletedAt: null,
      },
      include: {
        product: { select: { id: true, name: true, isPublished: true, deletedAt: true } },
      },
    });

    if (variants.length !== data.items.length) {
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

    for (const item of data.items) {
      const variant = variantMap.get(item.variantPublicId);
      if (!variant) {
        throw new BadRequestError(`Variant ${item.variantPublicId} not found.`);
      }

      if (!variant.product || !variant.product.isPublished) {
        throw new BadRequestError(`Product ${variant.product?.name || ''} is unavailable.`);
      }

      if (variant.stockQuantity < item.quantity) {
        throw new BadRequestError(
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

    const shippingFee = new Prisma.Decimal(subtotal.gte(100) ? 0 : 10); // Free shipping over $100
    const totalAmount = subtotal.add(shippingFee);
    const orderNumber = this.generateOrderNumber();

    const order = await prisma.$transaction(async (tx) => {
      // Decrement inventory stock
      for (const item of data.items) {
        const variant = variantMap.get(item.variantPublicId)!;
        await tx.productVariant.update({
          where: { id: variant.id },
          data: {
            stockQuantity: {
              decrement: item.quantity,
            },
          },
        });
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
      // In a real app we'd verify admin role here or allow guest tracking with email
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
    const order = await prisma.order.findUnique({ where: { publicId } });
    if (!order) {
      throw new NotFoundError('Order not found.');
    }

    const updated = await prisma.order.update({
      where: { id: order.id },
      data: {
        status,
        ...(paymentStatus ? { paymentStatus } : {}),
      },
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
