/**
 * Unit tests — Controller: IntentionController.
 * Tests boundary validation and response shaping in isolation.
 */

import { Request, Response, NextFunction } from 'express';
import { IntentionController } from '../../../src/controllers/intentionController';
import { IntentionService, SyncAdapter } from '../../../src/services/IntentionService';
import { InMemoryIntentionRepository } from '../../../src/repositories/InMemoryIntentionRepository';
import { IntentionDomainError } from '../../../src/domain/Intention';

const FIXED_NOW = '2026-07-15T07:00:00.000Z';
const FIXED_ID = 'a3f7c2d1-84b0-4e2a-9c6f-1d2e3f4a5b6c';
const USER_ID = 'user-uuid-1234';
const TRACE_ID = 'test-trace-id';

function makeSyncAdapter(): SyncAdapter {
  return {
    syncSave: jest.fn().mockResolvedValue(true),
    syncUpdate: jest.fn().mockResolvedValue(true),
  };
}

function makeController() {
  const repo = new InMemoryIntentionRepository();
  const syncAdapter = makeSyncAdapter();
  const service = new IntentionService(repo, syncAdapter, () => FIXED_NOW, () => FIXED_ID);
  const controller = new IntentionController(service);
  return { controller, service, repo };
}

function makeReq(overrides: Partial<Request> = {}): Partial<Request> {
  return {
    traceId: TRACE_ID,
    userId: USER_ID,
    body: {},
    query: {},
    headers: {},
    ...overrides,
  };
}

function makeRes(): {
  res: Partial<Response>;
  json: jest.Mock;
  status: jest.Mock;
} {
  const json = jest.fn().mockReturnThis();
  const status = jest.fn().mockReturnValue({ json });
  return { res: { status, json }, json, status };
}

const next: NextFunction = jest.fn();

describe('IntentionController.saveIntention', () => {
  it('returns 401 when userId is not set', async () => {
    const { controller } = makeController();
    const req = makeReq({ userId: undefined });
    const { res, status } = makeRes();
    await controller.saveIntention(req as Request, res as Response, next);
    expect(status).toHaveBeenCalledWith(401);
  });

  it('calls next with error when text is missing', async () => {
    const { controller } = makeController();
    const req = makeReq({ body: { date: '2026-07-15' } });
    const { res } = makeRes();
    const nextFn = jest.fn();
    await controller.saveIntention(req as Request, res as Response, nextFn);
    expect(nextFn).toHaveBeenCalledWith(expect.any(IntentionDomainError));
  });

  it('calls next with error when date is missing', async () => {
    const { controller } = makeController();
    const req = makeReq({ body: { text: 'Focus.' } });
    const { res } = makeRes();
    const nextFn = jest.fn();
    await controller.saveIntention(req as Request, res as Response, nextFn);
    expect(nextFn).toHaveBeenCalledWith(expect.any(IntentionDomainError));
  });

  it('calls next with error when text is not a string', async () => {
    const { controller } = makeController();
    const req = makeReq({ body: { text: 123, date: '2026-07-15' } });
    const { res } = makeRes();
    const nextFn = jest.fn();
    await controller.saveIntention(req as Request, res as Response, nextFn);
    expect(nextFn).toHaveBeenCalledWith(expect.any(IntentionDomainError));
  });

  it('calls next with error when date is not a string', async () => {
    const { controller } = makeController();
    const req = makeReq({ body: { text: 'Focus.', date: 20260715 } });
    const { res } = makeRes();
    const nextFn = jest.fn();
    await controller.saveIntention(req as Request, res as Response, nextFn);
    expect(nextFn).toHaveBeenCalledWith(expect.any(IntentionDomainError));
  });

  it('returns 201 on success', async () => {
    const { controller } = makeController();
    const req = makeReq({ body: { text: 'Focus.', date: '2026-07-15' } });
    const { res, status } = makeRes();
    await controller.saveIntention(req as Request, res as Response, next);
    expect(status).toHaveBeenCalledWith(201);
  });
});

describe('IntentionController.getTodaysIntention', () => {
  it('returns 401 when userId is not set', async () => {
    const { controller } = makeController();
    const req = makeReq({ userId: undefined, query: { date: '2026-07-15' } });
    const { res, status } = makeRes();
    await controller.getTodaysIntention(req as Request, res as Response, next);
    expect(status).toHaveBeenCalledWith(401);
  });

  it('calls next with error when date query param is missing', async () => {
    const { controller } = makeController();
    const req = makeReq({ query: {} });
    const { res } = makeRes();
    const nextFn = jest.fn();
    await controller.getTodaysIntention(req as Request, res as Response, nextFn);
    expect(nextFn).toHaveBeenCalledWith(expect.any(IntentionDomainError));
  });

  it('returns 200 on success', async () => {
    const { controller } = makeController();
    const req = makeReq({ query: { date: '2026-07-15' } });
    const { res, status } = makeRes();
    await controller.getTodaysIntention(req as Request, res as Response, next);
    expect(status).toHaveBeenCalledWith(200);
  });
});

describe('IntentionController.getPreviousIntention', () => {
  it('returns 401 when userId is not set', async () => {
    const { controller } = makeController();
    const req = makeReq({ userId: undefined, query: { beforeDate: '2026-07-15' } });
    const { res, status } = makeRes();
    await controller.getPreviousIntention(req as Request, res as Response, next);
    expect(status).toHaveBeenCalledWith(401);
  });

  it('calls next with error when beforeDate query param is missing', async () => {
    const { controller } = makeController();
    const req = makeReq({ query: {} });
    const { res } = makeRes();
    const nextFn = jest.fn();
    await controller.getPreviousIntention(req as Request, res as Response, nextFn);
    expect(nextFn).toHaveBeenCalledWith(expect.any(IntentionDomainError));
  });

  it('returns 200 on success', async () => {
    const { controller } = makeController();
    const req = makeReq({ query: { beforeDate: '2026-07-15' } });
    const { res, status } = makeRes();
    await controller.getPreviousIntention(req as Request, res as Response, next);
    expect(status).toHaveBeenCalledWith(200);
  });
});

describe('IntentionController.saveEveningRating', () => {
  it('returns 401 when userId is not set', async () => {
    const { controller } = makeController();
    const req = makeReq({ userId: undefined, body: { date: '2026-07-15', rating: 'honoured' } });
    const { res, status } = makeRes();
    await controller.saveEveningRating(req as Request, res as Response, next);
    expect(status).toHaveBeenCalledWith(401);
  });

  it('calls next with error when date is missing', async () => {
    const { controller } = makeController();
    const req = makeReq({ body: { rating: 'honoured' } });
    const { res } = makeRes();
    const nextFn = jest.fn();
    await controller.saveEveningRating(req as Request, res as Response, nextFn);
    expect(nextFn).toHaveBeenCalledWith(expect.any(IntentionDomainError));
  });

  it('calls next with error when rating is missing', async () => {
    const { controller } = makeController();
    const req = makeReq({ body: { date: '2026-07-15' } });
    const { res } = makeRes();
    const nextFn = jest.fn();
    await controller.saveEveningRating(req as Request, res as Response, nextFn);
    expect(nextFn).toHaveBeenCalledWith(expect.any(IntentionDomainError));
  });

  it('calls next with error when date is not a string', async () => {
    const { controller } = makeController();
    const req = makeReq({ body: { date: 20260715, rating: 'honoured' } });
    const { res } = makeRes();
    const nextFn = jest.fn();
    await controller.saveEveningRating(req as Request, res as Response, nextFn);
    expect(nextFn).toHaveBeenCalledWith(expect.any(IntentionDomainError));
  });

  it('calls next with error when rating is not a string', async () => {
    const { controller } = makeController();
    const req = makeReq({ body: { date: '2026-07-15', rating: 123 } });
    const { res } = makeRes();
    const nextFn = jest.fn();
    await controller.saveEveningRating(req as Request, res as Response, nextFn);
    expect(nextFn).toHaveBeenCalledWith(expect.any(IntentionDomainError));
  });
});

describe('IntentionController.listIntentions', () => {
  it('returns 401 when userId is not set', async () => {
    const { controller } = makeController();
    const req = makeReq({ userId: undefined });
    const { res, status } = makeRes();
    await controller.listIntentions(req as Request, res as Response, next);
    expect(status).toHaveBeenCalledWith(401);
  });

  it('returns 200 with intentions array', async () => {
    const { controller } = makeController();
    const req = makeReq();
    const { res, status } = makeRes();
    await controller.listIntentions(req as Request, res as Response, next);
    expect(status).toHaveBeenCalledWith(200);
  });
});
