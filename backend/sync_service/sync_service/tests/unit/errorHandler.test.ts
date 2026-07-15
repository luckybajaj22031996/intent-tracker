import { Request, Response, NextFunction } from 'express';
import { errorHandler } from '../../src/web/middleware/errorHandler';
import {
  SyncUnauthenticatedError,
  SyncNetworkError,
  SyncInternalError,
} from '../../src/domain/SyncRecord';

function makeReq(headers: Record<string, string> = {}): Partial<Request> {
  return { headers } as Partial<Request>;
}

function makeRes(): { status: jest.Mock; json: jest.Mock; statusCode: number } {
  const res = {
    statusCode: 200,
    status: jest.fn(),
    json: jest.fn(),
  };
  res.status.mockReturnValue(res);
  return res;
}

const noop: NextFunction = jest.fn();

describe('errorHandler middleware', () => {
  it('returns 401 for SyncUnauthenticatedError with traceId from header', () => {
    const req = makeReq({ 'x-trace-id': 'trace-123' });
    const res = makeRes();

    errorHandler(
      new SyncUnauthenticatedError(),
      req as Request,
      res as unknown as Response,
      noop,
    );

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        errorCode: 'SYNC_UNAUTHENTICATED',
        traceId: 'trace-123',
      }),
    );
  });

  it('returns 401 for SyncUnauthenticatedError with unknown traceId when header absent', () => {
    const req = makeReq({});
    const res = makeRes();

    errorHandler(
      new SyncUnauthenticatedError(),
      req as Request,
      res as unknown as Response,
      noop,
    );

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        errorCode: 'SYNC_UNAUTHENTICATED',
        traceId: 'unknown',
      }),
    );
  });

  it('returns 503 for SyncNetworkError', () => {
    const req = makeReq({ 'x-trace-id': 'trace-456' });
    const res = makeRes();

    errorHandler(
      new SyncNetworkError(),
      req as Request,
      res as unknown as Response,
      noop,
    );

    expect(res.status).toHaveBeenCalledWith(503);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        errorCode: 'SYNC_NETWORK_ERROR',
        traceId: 'trace-456',
      }),
    );
  });

  it('returns 500 for SyncInternalError', () => {
    const req = makeReq({ 'x-trace-id': 'trace-789' });
    const res = makeRes();

    errorHandler(
      new SyncInternalError('DB failure'),
      req as Request,
      res as unknown as Response,
      noop,
    );

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        errorCode: 'SYNC_INTERNAL_ERROR',
        traceId: 'trace-789',
      }),
    );
  });

  it('returns 500 for unexpected errors', () => {
    const req = makeReq({ 'x-trace-id': 'trace-000' });
    const res = makeRes();

    errorHandler(
      new Error('Something unexpected'),
      req as Request,
      res as unknown as Response,
      noop,
    );

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        errorCode: 'INTERNAL_SERVER_ERROR',
        traceId: 'trace-000',
      }),
    );
  });

  it('includes timestamp in ISO 8601 format', () => {
    const req = makeReq({ 'x-trace-id': 'trace-ts' });
    const res = makeRes();

    errorHandler(
      new SyncUnauthenticatedError(),
      req as Request,
      res as unknown as Response,
      noop,
    );

    const call = res.json.mock.calls[0][0] as { timestamp: string };
    expect(() => new Date(call.timestamp)).not.toThrow();
    expect(call.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });
});
