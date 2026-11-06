import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import fs from 'fs';
import { env } from './config/env';
import { checkDatabaseConnection } from './config/database';
import { requestLogger } from './shared/middleware/requestLogger';
import { globalApiLimiter } from './shared/middleware/rateLimiter';
import { notFoundHandler } from './shared/middleware/notFoundHandler';
import { errorHandler } from './shared/middleware/errorHandler';
import { sendSuccess } from './shared/utils/response';
import { HealthCheckData } from './shared/types';

// Feature route imports
import { authRoutes } from './features/auth/auth.routes';
import { categoryRoutes } from './features/categories/category.routes';
import { brandRoutes } from './features/brands/brand.routes';
import { productRoutes } from './features/products/product.routes';
import { orderRoutes } from './features/orders/order.routes';
import { inventoryRoutes } from './features/inventory/inventory.routes';
import { adminRoutes } from './features/admin/admin.routes';
import { mediaRoutes } from './features/media/media.routes';
import { bannerRoutes } from './features/banners/banner.routes';
import { paymentRoutes } from './features/payments/payment.routes';

export function createApp(): Application {
  const app = express();

  // Trust reverse proxy (Docker / Nginx / Cloudflare) for accurate client IP detection
  app.set('trust proxy', 1);

  // Security headers & CORS
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    })
  );
  const allowedOrigins = env.CORS_ORIGIN.split(',').map((o) => o.trim());
  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(null, true);
        }
      },
      credentials: true,
    })
  );

  // Request parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Static uploads serving
  const uploadsDir = path.resolve(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  app.use('/uploads', express.static(uploadsDir));

  // Logging
  app.use(requestLogger);

  // Root endpoint
  app.get('/', (_req: Request, res: Response) => {
    sendSuccess(res, { message: 'everythinganything API is running' });
  });

  // API v1 Router (protected by Global API Rate Limiter)
  const v1Router = express.Router();
  v1Router.use(globalApiLimiter);

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

    sendSuccess(
      res,
      healthData,
      isHealthy ? 'System is healthy' : 'Database connection is degraded',
      isHealthy ? 200 : 503
    );
  });

  // Mount feature routes
  v1Router.use('/auth', authRoutes);
  v1Router.use('/categories', categoryRoutes);
  v1Router.use('/brands', brandRoutes);
  v1Router.use('/products', productRoutes);
  v1Router.use('/orders', orderRoutes);
  v1Router.use('/inventory', inventoryRoutes);
  v1Router.use('/admin', adminRoutes);
  v1Router.use('/media', mediaRoutes);
  v1Router.use('/banners', bannerRoutes);
  v1Router.use('/payments', paymentRoutes);

  // Mount API v1 router
  app.use('/api/v1', v1Router);

  // Fallback 404 handler
  app.use(notFoundHandler);

  // Centralized Error handler
  app.use(errorHandler);

  return app;
}
