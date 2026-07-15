/**
 * Centralized error handler middleware.
 * Maps domain errors to HTTP responses with the standard error envelope.
 * NOTE: Order matters — more specific subclasses must be checked before their parents.
 */

import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import {
  IntentionDomainError,
  IntentionAlreadySetError,
  TextTooLongError,
  IntentionNotFoundError,
  InvalidRatingError,
  StorageError,
} from '../domain/Intention';
import { ErrorEnvelope } from '../types';
import { logger } from '../config/logger';

function buildErrorEnvelope(
  errorCode: string,
  message: string,
  traceId: string,
  details?: { field: string; message: string }[],
): ErrorEnvelope {
  return {
    errorCode,
    message,
    timestamp: new Date().toISOString(),
    traceId,
    ...(details && details.length > 0 ? { details } : {}),
  };
}

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  const traceId = (req.headers['x-trace-id'] as string) ?? req.traceId ?? uuidv4();

  // StorageError — server-side failure (check before generic IntentionDomainError)
  if (err instanceof StorageError) {
    logger.error('Storage error', { traceId, error: err.message });
    res.status(500).json(
      buildErrorEnvelope('STORAGE_ERROR', 'A storage error occurred. Please try again.', traceId),
    );
    return;
  }

  // Specific domain errors — client errors (4xx)
  if (err instanceof IntentionAlreadySetError) {
    res.status(409).json(buildErrorEnvelope(err.code, err.message, traceId));
    return;
  }

  if (err instanceof TextTooLongError) {
    res.status(422).json(buildErrorEnvelope(err.code, err.message, traceId));
    return;
  }

  if (err instanceof IntentionNotFoundError) {
    res.status(404).json(buildErrorEnvelope(err.code, err.message, traceId));
    return;
  }

  if (err instanceof InvalidRatingError) {
    res.status(422).json(buildErrorEnvelope(err.code, err.message, traceId));
    return;
  }

  if (err instanceof IntentionDomainError) {
    // Generic domain validation errors
    const statusCode = err.code === 'VALIDATION_ERROR' ? 400 : 422;
    res.status(statusCode).json(buildErrorEnvelope(err.code, err.message, traceId));
    return;
  }

  // Unexpected errors — server errors (5xx)
  logger.error('Unhandled error', {
    traceId,
    error: err.message,
    stack: err.stack,
  });

  res.status(500).json(
    buildErrorEnvelope(
      'INTERNAL_SERVER_ERROR',
      'An unexpected error occurred.',
      traceId,
    ),
  );
}
