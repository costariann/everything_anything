import { Request, Response } from 'express';
import { authService } from './auth.service';
import { sendSuccess } from '../../shared/utils/response';
import { UnauthorizedError } from '../../shared/errors/AppError';

export class AuthController {
  async register(req: Request, res: Response) {
    const result = await authService.register(req.body);
    return sendSuccess(res, result, 'Registration successful', 201);
  }

  async login(req: Request, res: Response) {
    const result = await authService.login(req.body);
    return sendSuccess(res, result, 'Login successful', 200);
  }

  async refresh(req: Request, res: Response) {
    const result = await authService.refresh(req.body.refreshToken);
    return sendSuccess(res, result, 'Token refreshed successfully', 200);
  }

  async me(req: Request, res: Response) {
    if (!req.user) {
      throw new UnauthorizedError('Unauthorized');
    }
    const user = await authService.getMe(req.user.userId);
    return sendSuccess(res, user, 'Current user profile retrieved', 200);
  }
}

export const authController = new AuthController();

