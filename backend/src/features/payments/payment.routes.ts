import { Router } from 'express';
import { paymentController } from './payment.controller';
import { checkoutLimiter } from '../../shared/middleware/rateLimiter';

export const paymentRoutes = Router();

// Paystack payment routes
paymentRoutes.post('/paystack/initialize', checkoutLimiter, (req, res, next) =>
  paymentController.initializePaystack(req, res, next)
);

paymentRoutes.get('/paystack/verify/:reference', (req, res, next) =>
  paymentController.verifyPaystack(req, res, next)
);

paymentRoutes.post('/paystack/webhook', (req, res, next) =>
  paymentController.paystackWebhook(req, res, next)
);

