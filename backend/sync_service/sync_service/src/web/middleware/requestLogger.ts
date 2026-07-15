import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../../config/logger';

/**
 * Attaches a traceId to every request and logs incoming requests.
 */
export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const traceId = (req.headers['x-trace-id'] as string) ?? uuidv4();
  req.headers['x-trace-id'] = traceId;
  res.setHeader('x-trace-id', traceId);

  logger.info({
    event: 'request_received',
    method: req.method,
    path: req.path,
    traceId,
  });

  res.on('finish', () => {
    logger.info({
      event: 'request_completed',
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      traceId,
    });
  });

  next();
}
