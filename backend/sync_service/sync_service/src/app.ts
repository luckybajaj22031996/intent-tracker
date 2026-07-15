import express, { Application } from 'express';
import { ISyncService } from './application/SyncService';
import { createSyncRouter } from './web/routes/syncRoutes';
import { createHealthRouter } from './web/routes/healthRoutes';
import { errorHandler } from './web/middleware/errorHandler';
import { requestLogger } from './web/middleware/requestLogger';

/**
 * Creates and configures the Express application.
 * Accepts the sync service as a dependency for testability.
 */
export function createApp(syncService: ISyncService): Application {
  const app = express();

  // Security: disable x-powered-by header
  app.disable('x-powered-by');

  // Parse JSON bodies
  app.use(express.json({ limit: '1mb' }));

  // Request logging + traceId injection
  app.use(requestLogger);

  // Routes
  app.use('/health', createHealthRouter());
  app.use('/sync', createSyncRouter(syncService));

  // Centralized error handler (must be last)
  app.use(errorHandler);

  return app;
}
