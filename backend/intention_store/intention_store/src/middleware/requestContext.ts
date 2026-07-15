/**
 * Request context middleware.
 * Attaches a traceId to every request for structured logging and audit.
 */

import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      traceId: string;
      userId?: string;
    }
  }
}

export function requestContext(req: Request, _res: Response, next: NextFunction): void {
  req.traceId = (req.headers['x-trace-id'] as string) ?? uuidv4();
  next();
}
