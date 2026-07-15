/**
 * Unit tests — Middleware: errorHandler.
 */

import { Request, Response, NextFunction } from 'express';
import { errorHandler } from '../../../src/middleware/errorHandler';
import {
  IntentionAlreadySetError,
  TextTooLongError,
  IntentionNotFoundError,
  InvalidRatingError,
  StorageError,
  IntentionDomainError,
} from '../../../src/domain/Intention';

function makeReqRes(traceId?: string): {
  req: Partial<Request>;
  res: Partial<Response>;
  json: jest.Mock;
  status: jest.Mock;
} {
  const json = jest.fn().mockReturnThis();
  const status = jest.fn().mockReturnValue({ json });
  const req: Partial<Request> = {
    headers: traceId ? { 'x-trace-id': traceId } : {},
    traceId: traceId ?? 'generated-trace-id',
  };
  const res: Partial<Response> = {
    status,
    json,
  };
  return { req, res, json, status };
}

const next: NextFunction = jest.fn();

describe('errorHandler middleware', () => {
  it('maps IntentionAlreadySetError to 409', () => {
    const { req, res, status, json } = makeReqRes('trace-1');
    errorHandler(
      new IntentionAlreadySetError(),
      req as Request,
      res as Response,
      next,
    );
    expect(status).toHaveBeenCalledWith(409);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({ errorCode: 'INTENTION_ALREADY_SET' }),
    );
  });

  it('maps TextTooLongError to 422', () => {
    const { req, res, status, json } = makeReqRes('trace-2');
    errorHandler(new TextTooLongError(), req as Request, res as Response, next);
    expect(status).toHaveBeenCalledWith(422);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({ errorCode: 'TEXT_TOO_LONG' }),
    );
  });

  it('maps IntentionNotFoundError to 404', () => {
    const { req, res, status, json } = makeReqRes('trace-3');
    errorHandler(new IntentionNotFoundError(), req as Request, res as Response, next);
    expect(status).toHaveBeenCalledWith(404);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({ errorCode: 'INTENTION_NOT_FOUND' }),
    );
  });

  it('maps InvalidRatingError to 422', () => {
    const { req, res, status, json } = makeReqRes('trace-4');
    errorHandler(new InvalidRatingError(), req as Request, res as Response, next);
    expect(status).toHaveBeenCalledWith(422);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({ errorCode: 'INVALID_RATING' }),
    );
  });

  it('maps StorageError to 500', () => {
    const { req, res, status, json } = makeReqRes('trace-5');
    errorHandler(new StorageError('Disk full'), req as Request, res as Response, next);
    expect(status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({ errorCode: 'STORAGE_ERROR' }),
    );
  });

  it('maps generic IntentionDomainError with VALIDATION_ERROR code to 400', () => {
    const { req, res, status, json } = makeReqRes('trace-6');
    errorHandler(
      new IntentionDomainError('VALIDATION_ERROR', 'Bad input'),
      req as Request,
      res as Response,
      next,
    );
    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({ errorCode: 'VALIDATION_ERROR' }),
    );
  });

  it('maps generic IntentionDomainError with other code to 422', () => {
    const { req, res, status } = makeReqRes('trace-7');
    errorHandler(
      new IntentionDomainError('SOME_ERROR', 'Some error'),
      req as Request,
      res as Response,
      next,
    );
    expect(status).toHaveBeenCalledWith(422);
  });

  it('maps unexpected errors to 500', () => {
    const { req, res, status, json } = makeReqRes('trace-8');
    errorHandler(new Error('Unexpected'), req as Request, res as Response, next);
    expect(status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({ errorCode: 'INTERNAL_SERVER_ERROR' }),
    );
  });

  it('includes traceId from request header', () => {
    const { req, res, json } = makeReqRes('my-trace-id');
    errorHandler(new IntentionAlreadySetError(), req as Request, res as Response, next);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({ traceId: 'my-trace-id' }),
    );
  });

  it('includes timestamp in error envelope', () => {
    const { req, res, json } = makeReqRes('trace-9');
    errorHandler(new TextTooLongError(), req as Request, res as Response, next);
    const call = json.mock.calls[0][0] as Record<string, unknown>;
    expect(typeof call['timestamp']).toBe('string');
  });

  it('includes message in error envelope', () => {
    const { req, res, json } = makeReqRes('trace-10');
    errorHandler(new TextTooLongError(), req as Request, res as Response, next);
    const call = json.mock.calls[0][0] as Record<string, unknown>;
    expect(typeof call['message']).toBe('string');
    expect(call['message']).toBe('Intention must be 140 characters or fewer.');
  });

  it('generates a traceId when x-trace-id header is missing', () => {
    const { req, res, json } = makeReqRes();
    // Remove the traceId from req to test header-based generation
    req.traceId = undefined as unknown as string;
    req.headers = {};
    errorHandler(new TextTooLongError(), req as Request, res as Response, next);
    const call = json.mock.calls[0][0] as Record<string, unknown>;
    expect(typeof call['traceId']).toBe('string');
    expect(call['traceId']).toBeTruthy();
  });
});
