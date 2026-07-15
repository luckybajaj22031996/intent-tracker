import { Request, Response, NextFunction } from 'express';
import {
  SyncUnauthenticatedError,
  SyncNetworkError,
  SyncInternalError,
} from '../../domain/SyncRecord';
import { logger } from '../../config/logger';

/**
 * Standard error envelope per 03_Common-Guidelines.md:
 * errorCode, message, timestamp, traceId
 */
export interface ErrorEnvelope {
  errorCode: string;
  message: string;
  timestamp: string;
  traceId: string;
}

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
): void {
  // requestLogger middleware always sets x-trace-id; fall back to 'unknown' as a safety net
  const traceId = (req.headers['x-trace-id'] as string | undefined) ?? 'unknown';
  const timestamp = new Date().toISOString();

  if (err instanceof SyncUnauthenticatedError) {
    const body: ErrorEnvelope = {
      errorCode: err.code,
      message: err.message,
      timestamp,
      traceId,
    };
    res.status(401).json(body);
    return;
  }

  if (err instanceof SyncNetworkError) {
    const body: ErrorEnvelope = {
      errorCode: err.code,
      message: 'Supabase could not be reached. Please retry when connectivity is confirmed.',
      timestamp,
      traceId,
    };
    res.status(503).json(body);
    return;
  }

  if (err instanceof SyncInternalError) {
    logger.error({ traceId, event: 'sync_internal_error', message: err.message });
    const body: ErrorEnvelope = {
      errorCode: err.code,
      message: 'An unexpected failure occurred during sync. Please retry.',
      timestamp,
      traceId,
    };
    res.status(500).json(body);
    return;
  }

  // Unhandled / unexpected errors
  logger.error({ traceId, event: 'unhandled_error', message: err.message, stack: err.stack });
  const body: ErrorEnvelope = {
    errorCode: 'INTERNAL_SERVER_ERROR',
    message: 'An unexpected server error occurred.',
    timestamp,
    traceId,
  };
  res.status(500).json(body);
}
