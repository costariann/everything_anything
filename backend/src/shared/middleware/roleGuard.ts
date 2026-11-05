import { Request, Response, NextFunction } from 'express';
import { ForbiddenError, UnauthorizedError } from '../errors/AppError';

export function roleGuard(requiredRole: 'ADMIN' | 'CUSTOMER') {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new UnauthorizedError('User authentication required');
    }

    if (req.user.role !== requiredRole && req.user.role !== 'ADMIN') {
      throw new ForbiddenError(`Access denied. ${requiredRole} privileges required.`);
    }

    next();
  };
}

