/**
 * Unit tests — Middleware: authMiddleware.
 */

import { Request, Response, NextFunction } from 'express';
import { createAuthMiddleware } from '../../../src/middleware/authMiddleware';
import { SupabaseClient } from '@supabase/supabase-js';

const VALID_TOKEN = 'valid-jwt-token';
const USER_ID = 'user-uuid-1234';

function makeMockSupabase(userId?: string, error?: string): SupabaseClient {
  return {
    auth: {
      getUser: jest.fn().mockImplementation((token: string) => {
        if (token === VALID_TOKEN && !error) {
          return Promise.resolve({
            data: { user: { id: userId ?? USER_ID } },
            error: null,
          });
        }
        if (error) {
          return Promise.resolve({
            data: { user: null },
            error: { message: error },
          });
        }
        return Promise.resolve({
          data: { user: null },
          error: { message: 'Invalid token' },
        });
      }),
    },
  } as unknown as SupabaseClient;
}

function makeReqRes(authHeader?: string): {
  req: Partial<Request>;
  res: Partial<Response>;
  json: jest.Mock;
  status: jest.Mock;
  next: NextFunction;
} {
  const json = jest.fn().mockReturnThis();
  const status = jest.fn().mockReturnValue({ json });
  const req: Partial<Request> = {
    headers: authHeader ? { authorization: authHeader } : {},
    traceId: 'test-trace-id',
  };
  const res: Partial<Response> = { status, json };
  const next: NextFunction = jest.fn();
  return { req, res, json, status, next };
}

describe('authMiddleware', () => {
  it('calls next() and sets userId when token is valid', async () => {
    const supabase = makeMockSupabase();
    const middleware = createAuthMiddleware(supabase);
    const { req, res, next } = makeReqRes(`Bearer ${VALID_TOKEN}`);
    await middleware(req as Request, res as Response, next);
    expect(next).toHaveBeenCalled();
    expect(req.userId).toBe(USER_ID);
  });

  it('returns 401 when Authorization header is missing', async () => {
    const supabase = makeMockSupabase();
    const middleware = createAuthMiddleware(supabase);
    const { req, res, status, json, next } = makeReqRes();
    await middleware(req as Request, res as Response, next);
    expect(status).toHaveBeenCalledWith(401);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({ errorCode: 'UNAUTHORIZED' }),
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 401 when Authorization header does not start with Bearer', async () => {
    const supabase = makeMockSupabase();
    const middleware = createAuthMiddleware(supabase);
    const { req, res, status, next } = makeReqRes('Basic some-token');
    await middleware(req as Request, res as Response, next);
    expect(status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 401 when token is invalid', async () => {
    const supabase = makeMockSupabase();
    const middleware = createAuthMiddleware(supabase);
    const { req, res, status, json, next } = makeReqRes('Bearer invalid-token');
    await middleware(req as Request, res as Response, next);
    expect(status).toHaveBeenCalledWith(401);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({ errorCode: 'UNAUTHORIZED' }),
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 401 when Supabase returns an error', async () => {
    const supabase = makeMockSupabase(undefined, 'Token expired');
    const middleware = createAuthMiddleware(supabase);
    const { req, res, status, next } = makeReqRes(`Bearer ${VALID_TOKEN}`);
    await middleware(req as Request, res as Response, next);
    expect(status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 500 when Supabase throws unexpectedly', async () => {
    const supabase = {
      auth: {
        getUser: jest.fn().mockRejectedValue(new Error('Network error')),
      },
    } as unknown as SupabaseClient;
    const middleware = createAuthMiddleware(supabase);
    const { req, res, status, next } = makeReqRes(`Bearer ${VALID_TOKEN}`);
    await middleware(req as Request, res as Response, next);
    expect(status).toHaveBeenCalledWith(500);
    expect(next).not.toHaveBeenCalled();
  });
});
