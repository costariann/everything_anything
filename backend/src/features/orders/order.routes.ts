import { Router } from 'express';
import { orderController } from './order.controller';
import { authGuard, optionalAuthGuard } from '../../shared/middleware/authGuard';
import { roleGuard } from '../../shared/middleware/roleGuard';
import { validateRequest } from '../../shared/middleware/validate';
import { checkoutLimiter } from '../../shared/middleware/rateLimiter';
import { createOrderSchema, updateOrderStatusSchema } from './order.validation';

export const orderRoutes = Router();

// Storefront & Guest checkout (optionalAuthGuard attaches user if token is provided)
orderRoutes.post(
  '/',
  checkoutLimiter,
  optionalAuthGuard,
  validateRequest({ body: createOrderSchema }),
  orderController.create
);

// Customer order history
orderRoutes.get('/my-orders', authGuard, orderController.getMyOrders);

// Public / Guest tracking & order details lookup
orderRoutes.get('/:publicId', optionalAuthGuard, orderController.getByPublicId);

// Admin orders management
orderRoutes.get('/admin/all', authGuard, roleGuard('ADMIN'), orderController.listAdmin);
orderRoutes.patch(
  '/admin/:publicId/status',
  authGuard,
  roleGuard('ADMIN'),
  validateRequest({ body: updateOrderStatusSchema }),
  orderController.updateStatus
);

