import { Response } from 'express';
import { ApiResponse } from '../types';

export function sendSuccess<T>(
  res: Response,
  data: T,
  message = 'Operation successful',
  statusCode = 200
): Response {
  const payload: ApiResponse<T> = {
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
  };
  return res.status(statusCode).json(payload);
}

export function sendError(
  res: Response,
  message = 'Internal server error',
  statusCode = 500,
  errorDetail?: string
): Response {
  const payload: ApiResponse = {
    success: false,
    message,
    error: errorDetail,
    timestamp: new Date().toISOString(),
  };
  return res.status(statusCode).json(payload);
}

