/**
 * Health check controller.
 * Returns liveness and readiness status for the service.
 */

import { Request, Response } from 'express';

export function healthCheck(_req: Request, res: Response): void {
  res.status(200).json({
    status: 'ok',
    service: 'intention-store-service',
    timestamp: new Date().toISOString(),
  });
}
