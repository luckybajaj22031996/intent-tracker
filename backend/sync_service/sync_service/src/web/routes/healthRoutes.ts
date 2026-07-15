import { Router, Request, Response } from 'express';

/**
 * Health check endpoints.
 * GET /health — liveness probe
 * GET /health/ready — readiness probe
 */
export function createHealthRouter(): Router {
  const router = Router();

  router.get('/', (_req: Request, res: Response) => {
    res.status(200).json({ status: 'ok', service: 'sync-service' });
  });

  router.get('/ready', (_req: Request, res: Response) => {
    res.status(200).json({ status: 'ready', service: 'sync-service' });
  });

  return router;
}
