import { Request, Response } from 'express';
import { orderService } from './order.service';
import { sendSuccess } from '../../shared/utils/response';
import { UnauthorizedError } from '../../shared/errors/AppError';

export class OrderController {
  async create(req: Request, res: Response) {
    const userId = req.user?.userId;
    const result = await orderService.createOrder({
      ...req.body,
      userId,
    });
    return sendSuccess(res, result, 'Order placed successfully', 201);
  }

  async getByPublicId(req: Request, res: Response) {
    const order = await orderService.getOrderByPublicId(req.params.publicId, req.user?.userId);
    return sendSuccess(res, order, 'Order details retrieved');
  }

  async getMyOrders(req: Request, res: Response) {
    if (!req.user) {
      throw new UnauthorizedError('Unauthorized');
    }
    const orders = await orderService.getCustomerOrders(req.user.userId);
    return sendSuccess(res, orders, 'Customer orders retrieved');
  }

  async listAdmin(req: Request, res: Response) {
    const orders = await orderService.listAdminOrders(req.query as any);
    return sendSuccess(res, orders, 'Admin orders retrieved');
  }

  async updateStatus(req: Request, res: Response) {
    const updated = await orderService.updateOrderStatus(
      req.params.publicId,
      req.body.status,
      req.body.paymentStatus
    );
    return sendSuccess(res, updated, 'Order status updated');
  }
}

export const orderController = new OrderController();

