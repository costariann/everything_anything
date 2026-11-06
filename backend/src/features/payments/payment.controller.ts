import { Request, Response, NextFunction } from 'express';
import { paystackService } from './paystack.service';
import { sendSuccess } from '../../shared/utils/response';
import { BadRequestError } from '../../shared/errors/AppError';

export class PaymentController {
  /**
   * POST /api/v1/payments/paystack/initialize
   */
  async initializePaystack(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const { orderPublicId, email, callbackUrl } = req.body;
      if (!orderPublicId) {
        throw new BadRequestError('orderPublicId is required');
      }

      const result = await paystackService.initializePayment({
        orderPublicId,
        email,
        callbackUrl,
      });

      return sendSuccess(res, result, 'Paystack transaction initialized', 200);
    } catch (error) {
      return next(error);
    }
  }

  /**
   * GET /api/v1/payments/paystack/verify/:reference
   */
  async verifyPaystack(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const { reference } = req.params;
      if (!reference) {
        throw new BadRequestError('Payment reference is required');
      }

      const result = await paystackService.verifyPayment(reference);
      return sendSuccess(res, result, 'Payment verified successfully', 200);
    } catch (error) {
      return next(error);
    }
  }

  /**
   * POST /api/v1/payments/paystack/webhook
   */
  async paystackWebhook(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const signature = (req.headers['x-paystack-signature'] as string) || '';
      const rawBody = JSON.stringify(req.body);

      const result = await paystackService.handleWebhook(signature, rawBody, req.body);
      return res.status(200).json(result);
    } catch (error) {
      return next(error);
    }
  }
}

export const paymentController = new PaymentController();
