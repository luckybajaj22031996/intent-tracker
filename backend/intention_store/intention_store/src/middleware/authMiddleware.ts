/**
 * Authentication middleware.
 * Validates the Supabase JWT session token from the Authorization header.
 * Attaches the userId to the request context.
 *
 * Auth scheme: Supabase anon key (env var) + user JWT session token.
 * Magic link email auth only — no passwords, no OAuth in v1.
 */

import { Request, Response, NextFunction } from 'express';
import { SupabaseClient } from '@supabase/supabase-js';
import { ErrorEnvelope } from '../types';
import { logger } from '../config/logger';

export function createAuthMiddleware(supabase: SupabaseClient) {
  return async function authMiddleware(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      const envelope: ErrorEnvelope = {
        errorCode: 'UNAUTHORIZED',
        message: 'Missing or invalid Authorization header. Provide a Bearer token.',
        timestamp: new Date().toISOString(),
        traceId: req.traceId,
      };
      res.status(401).json(envelope);
      return;
    }

    const token = authHeader.substring('Bearer '.length);

    try {
      const { data, error } = await supabase.auth.getUser(token);

      if (error || !data.user) {
        logger.warn('Auth validation failed', {
          traceId: req.traceId,
          error: error?.message,
        });
        const envelope: ErrorEnvelope = {
          errorCode: 'UNAUTHORIZED',
          message: 'Invalid or expired session token.',
          timestamp: new Date().toISOString(),
          traceId: req.traceId,
        };
        res.status(401).json(envelope);
        return;
      }

      req.userId = data.user.id;
      next();
    } catch (err) {
      logger.error('Auth middleware unexpected error', { traceId: req.traceId, error: err });
      const envelope: ErrorEnvelope = {
        errorCode: 'INTERNAL_SERVER_ERROR',
        message: 'Authentication service error.',
        timestamp: new Date().toISOString(),
        traceId: req.traceId,
      };
      res.status(500).json(envelope);
    }
  };
}
