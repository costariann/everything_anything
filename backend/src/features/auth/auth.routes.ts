import { Router } from 'express';
import { authController } from './auth.controller';
import { validateRequest } from '../../shared/middleware/validate';
import { registerSchema, loginSchema, refreshTokenSchema } from './auth.validation';
import { authGuard } from '../../shared/middleware/authGuard';

export const authRoutes = Router();

authRoutes.post(
  '/register',
  validateRequest({ body: registerSchema }),
  authController.register
);

authRoutes.post(
  '/login',
  validateRequest({ body: loginSchema }),
  authController.login
);

authRoutes.post(
  '/refresh',
  validateRequest({ body: refreshTokenSchema }),
  authController.refresh
);

authRoutes.get('/me', authGuard, authController.me);

