import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env';
import { checkDatabaseConnection } from './config/database';
import { requestLogger } from './shared/middleware/requestLogger';
import { notFoundHandler } from './shared/middleware/notFoundHandler';
import { errorHandler } from './shared/middleware/errorHandler';
import { sendSuccess } from './shared/utils/response';
import { HealthCheckData } from './shared/types';

export function createApp(): Application {
  const app = express();

  // Security headers & CORS
  app.use(helmet());
  app.use(
    cors({
      origin: env.CORS_ORIGIN,
      credentials: true,
    })
  );

  // Request parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Logging
  app.use(requestLogger);

  // Root endpoint
  app.get('/', (_req: Request, res: Response) => {
    sendSuccess(res, { message: 'everythinganything API is running' });
  });

  // API v1 Router
  const v1Router = express.Router();

  v1Router.get('/', (_req: Request, res: Response) => {
    sendSuccess(res, {
      version: '1.0.0',
      description: 'everythinganything API v1',
    });
  });

  // Health-check endpoint that verifies database connectivity
  v1Router.get('/health', async (_req: Request, res: Response) => {
    const dbStatus = await checkDatabaseConnection();
    const isHealthy = dbStatus.connected;

    const healthData: HealthCheckData = {
      status: isHealthy ? 'healthy' : 'degraded',
      uptimeSeconds: Math.floor(process.uptime()),
      environment: env.NODE_ENV,
      timestamp: new Date().toISOString(),
      database: {
        connected: dbStatus.connected,
        message: dbStatus.message,
      },
    };

    sendSuccess(res, healthData, isHealthy ? 'System is healthy' : 'Database connection is degraded', isHealthy ? 200 : 503);
  });

  // Mount API v1 router
  app.use('/api/v1', v1Router);

  // Fallback 404 handler
  app.use(notFoundHandler);

  // Centralized Error handler
  app.use(errorHandler);

  return app;
}

