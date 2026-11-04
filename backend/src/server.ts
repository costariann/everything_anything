import { createApp } from './app';
import { env } from './config/env';
import { pool, checkDatabaseConnection } from './config/database';
import { logger } from './shared/utils/logger';

const app = createApp();

const server = app.listen(env.PORT, async () => {
  logger.info(`🚀 Backend server started in ${env.NODE_ENV} mode on port ${env.PORT}`);
  logger.info(`📡 Health check available at: http://localhost:${env.PORT}/api/v1/health`);

  // Initial database check
  const dbStatus = await checkDatabaseConnection();
  if (dbStatus.connected) {
    logger.info('✅ PostgreSQL connected successfully');
  } else {
    logger.warn(`⚠️ PostgreSQL connection warning: ${dbStatus.message}`);
  }
});

// Graceful shutdown handling
async function gracefulShutdown(signal: string) {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);

  server.close(async () => {
    logger.info('HTTP server closed.');
    try {
      await pool.end();
      logger.info('PostgreSQL pool drained.');
      process.exit(0);
    } catch (err) {
      logger.error('Error during PostgreSQL pool shutdown:', err);
      process.exit(1);
    }
  });

  // Force close after 10s timeout
  setTimeout(() => {
    logger.error('Graceful shutdown timeout exceeded, forcing exit.');
    process.exit(1);
  }, 10000);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

