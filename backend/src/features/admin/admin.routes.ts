import { Router, Request, Response } from 'express';
import { prisma } from '../../config/database';
import { authGuard } from '../../shared/middleware/authGuard';
import { roleGuard } from '../../shared/middleware/roleGuard';
import { sendSuccess } from '../../shared/utils/response';

export const adminRoutes = Router();

adminRoutes.get('/stats', authGuard, roleGuard('ADMIN'), async (_req: Request, res: Response) => {
  const [
    totalOrders,
    totalProducts,
    totalCustomers,
    paidOrders,
    recentOrders,
    lowStockVariants,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.product.count({ where: { deletedAt: null } }),
    prisma.user.count({ where: { role: 'CUSTOMER', deletedAt: null } }),
    prisma.order.findMany({
      where: { paymentStatus: 'PAID' },
      select: { totalAmount: true },
    }),
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { fullName: true, email: true } },
      },
    }),
    prisma.productVariant.count({
      where: { stockQuantity: { lte: 5 }, deletedAt: null },
    }),
  ]);

  const totalRevenue = paidOrders.reduce((sum, order) => sum + Number(order.totalAmount), 0);

  const formattedRecent = recentOrders.map((o) => ({
    publicId: o.publicId,
    orderNumber: o.orderNumber,
    customer: o.user ? o.user.fullName : o.guestFullName || 'Guest',
    totalAmount: Number(o.totalAmount),
    status: o.status,
    paymentStatus: o.paymentStatus,
    createdAt: o.createdAt,
  }));

  return sendSuccess(
    res,
    {
      metrics: {
        totalRevenue,
        totalOrders,
        totalProducts,
        totalCustomers,
        lowStockVariants,
      },
      recentOrders: formattedRecent,
    },
    'Admin dashboard metrics retrieved'
  );
});

adminRoutes.get('/customers', authGuard, roleGuard('ADMIN'), async (_req: Request, res: Response) => {
  const customers = await prisma.user.findMany({
    where: { role: 'CUSTOMER', deletedAt: null },
    orderBy: { createdAt: 'desc' },
    select: {
      publicId: true,
      email: true,
      fullName: true,
      phone: true,
      createdAt: true,
      _count: {
        select: { orders: true },
      },
    },
  });

  const formatted = customers.map((c) => ({
    publicId: c.publicId,
    email: c.email,
    fullName: c.fullName,
    phone: c.phone,
    orderCount: c._count.orders,
    registeredAt: c.createdAt,
  }));

  return sendSuccess(res, formatted, 'Customers list retrieved');
});

