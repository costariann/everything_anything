import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';
import { sendError } from '../utils/response';
import { logger } from '../utils/logger';
import { env } from '../../config/env';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void {
  logger.error(`Unhandled error: ${err.message}`, err.stack);

  if (err instanceof AppError) {
    sendError(
      res,
      err.message,
      err.statusCode,
      env.NODE_ENV === 'development' ? err.stack : undefined
    );
    return;
  }

  // Generic internal server error
  const message = env.NODE_ENV === 'production' 
    ? 'Internal server error' 
    : err.message || 'Internal server error';

  const errorDetail = env.NODE_ENV === 'development' ? err.stack : undefined;

  sendError(res, message, 500, errorDetail);
}

