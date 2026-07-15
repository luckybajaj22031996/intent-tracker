/**
 * Express application factory.
 * Wires together middleware, routes, and error handling.
 * Exported separately from index.ts to enable testing without starting the server.
 */

import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { SupabaseClient } from '@supabase/supabase-js';
import { IntentionService } from './services/IntentionService';
import { IntentionController } from './controllers/intentionController';
import { healthCheck } from './controllers/healthController';
import { requestContext } from './middleware/requestContext';
import { createAuthMiddleware } from './middleware/authMiddleware';
import { errorHandler } from './middleware/errorHandler';
import { AppConfig } from './config';
import { logger } from './config/logger';

export function createApp(
  config: AppConfig,
  supabase: SupabaseClient,
  intentionService: IntentionService,
): Application {
  const app = express();

  // Security headers
  app.use(helmet());

  // CORS
  app.use(
    cors({
      origin: config.corsOrigin,
      methods: ['GET', 'POST', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Trace-Id'],
    }),
  );

  // Body parsing
  app.use(express.json({ limit: '10kb' }));

  // Request context (traceId)
  app.use(requestContext);

  // Request logging
  app.use((req: Request, _res: Response, next) => {
    logger.info('Incoming request', {
      method: req.method,
      path: req.path,
      traceId: req.traceId,
    });
    next();
  });

  // Health check (unauthenticated)
  app.get('/health', healthCheck);

  // Auth middleware for protected routes
  const authMiddleware = createAuthMiddleware(supabase);
  const controller = new IntentionController(intentionService);

  // API routes
  const router = express.Router();

  // POST /api/intentions — saveIntention
  router.post('/', authMiddleware, controller.saveIntention);

  // GET /api/intentions — listIntentions
  router.get('/', authMiddleware, controller.listIntentions);

  // GET /api/intentions/today — getTodaysIntention
  router.get('/today', authMiddleware, controller.getTodaysIntention);

  // GET /api/intentions/previous — getPreviousIntention
  router.get('/previous', authMiddleware, controller.getPreviousIntention);

  // PATCH /api/intentions/rating — saveEveningRating
  router.patch('/rating', authMiddleware, controller.saveEveningRating);

  app.use('/api/intentions', router);

  // 404 handler
  app.use((_req: Request, res: Response) => {
    res.status(404).json({
      errorCode: 'NOT_FOUND',
      message: 'The requested resource was not found.',
      timestamp: new Date().toISOString(),
      traceId: 'unknown',
    });
  });

  // Centralized error handler (must be last)
  app.use(errorHandler);

  return app;
}
