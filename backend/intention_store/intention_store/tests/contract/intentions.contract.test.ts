/**
 * Contract tests — Verify every API declared in 01_Service-Context.md.
 * Validates schema, status codes, payload validation, and auth.
 */

import request from 'supertest';
import { Application } from 'express';
import { createApp } from '../../src/app';
import { IntentionService, SyncAdapter } from '../../src/services/IntentionService';
import { InMemoryIntentionRepository } from '../../src/repositories/InMemoryIntentionRepository';
import { AppConfig } from '../../src/config';
import { SupabaseClient } from '@supabase/supabase-js';

const FIXED_NOW = '2026-07-15T07:00:00.000Z';
const FIXED_ID = 'a3f7c2d1-84b0-4e2a-9c6f-1d2e3f4a5b6c';
const USER_ID = 'user-uuid-1234';
const VALID_TOKEN = 'valid-jwt-token';

const mockConfig: AppConfig = {
  port: 8080,
  nodeEnv: 'test',
  supabaseUrl: 'http://localhost:54321',
  supabaseAnonKey: 'test-anon-key',
  corsOrigin: '*',
  logLevel: 'silent',
};

function makeMockSupabase(): SupabaseClient {
  return {
    auth: {
      getUser: jest.fn().mockImplementation((token: string) => {
        if (token === VALID_TOKEN) {
          return Promise.resolve({ data: { user: { id: USER_ID } }, error: null });
        }
        return Promise.resolve({ data: { user: null }, error: { message: 'Invalid token' } });
      }),
    },
    from: jest.fn(),
  } as unknown as SupabaseClient;
}

function makeSyncAdapter(): SyncAdapter {
  return {
    syncSave: jest.fn().mockResolvedValue(true),
    syncUpdate: jest.fn().mockResolvedValue(true),
  };
}

function makeApp(): Application {
  const repo = new InMemoryIntentionRepository();
  const syncAdapter = makeSyncAdapter();
  const service = new IntentionService(repo, syncAdapter, () => FIXED_NOW, () => FIXED_ID);
  const supabase = makeMockSupabase();
  return createApp(mockConfig, supabase, service);
}

const auth = { Authorization: `Bearer ${VALID_TOKEN}` };

/**
 * Validates the standard error envelope shape.
 */
function expectErrorEnvelope(body: Record<string, unknown>): void {
  expect(typeof body['errorCode']).toBe('string');
  expect(typeof body['message']).toBe('string');
  expect(typeof body['timestamp']).toBe('string');
  expect(typeof body['traceId']).toBe('string');
}

/**
 * Validates an IntentionRecord shape.
 */
function expectIntentionRecord(record: Record<string, unknown>): void {
  expect(typeof record['id']).toBe('string');
  expect(typeof record['userId']).toBe('string');
  expect(typeof record['date']).toBe('string');
  expect(typeof record['text']).toBe('string');
  expect(record['rating'] === null || typeof record['rating'] === 'string').toBe(true);
  expect(typeof record['synced']).toBe('boolean');
  expect(typeof record['createdAt']).toBe('string');
  expect(record['updatedAt'] === null || typeof record['updatedAt'] === 'string').toBe(true);
}

describe('Contract: CALL saveIntention — POST /api/intentions', () => {
  it('201: returns SaveIntentionResponse schema', async () => {
    const app = makeApp();
    const res = await request(app)
      .post('/api/intentions')
      .set(auth)
      .send({ text: 'Focus on deep work.', date: '2026-07-15' });

    expect(res.status).toBe(201);
    expect(typeof res.body['id']).toBe('string');
    expect(typeof res.body['synced']).toBe('boolean');
    // id should be a UUID
    expect(res.body['id']).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );
  });

  it('401: UNAUTHORIZED when no token', async () => {
    const app = makeApp();
    const res = await request(app)
      .post('/api/intentions')
      .send({ text: 'Focus.', date: '2026-07-15' });
    expect(res.status).toBe(401);
    expectErrorEnvelope(res.body as Record<string, unknown>);
    expect(res.body['errorCode']).toBe('UNAUTHORIZED');
  });

  it('409: INTENTION_ALREADY_SET when duplicate date', async () => {
    const app = makeApp();
    await request(app)
      .post('/api/intentions')
      .set(auth)
      .send({ text: 'First.', date: '2026-07-15' });
    const res = await request(app)
      .post('/api/intentions')
      .set(auth)
      .send({ text: 'Second.', date: '2026-07-15' });
    expect(res.status).toBe(409);
    expectErrorEnvelope(res.body as Record<string, unknown>);
    expect(res.body['errorCode']).toBe('INTENTION_ALREADY_SET');
  });

  it('422: TEXT_TOO_LONG when text exceeds 140 chars', async () => {
    const app = makeApp();
    const res = await request(app)
      .post('/api/intentions')
      .set(auth)
      .send({ text: 'a'.repeat(141), date: '2026-07-15' });
    expect(res.status).toBe(422);
    expectErrorEnvelope(res.body as Record<string, unknown>);
    expect(res.body['errorCode']).toBe('TEXT_TOO_LONG');
  });

  it('400: VALIDATION_ERROR when text is missing', async () => {
    const app = makeApp();
    const res = await request(app)
      .post('/api/intentions')
      .set(auth)
      .send({ date: '2026-07-15' });
    expect(res.status).toBe(400);
    expectErrorEnvelope(res.body as Record<string, unknown>);
  });

  it('400: VALIDATION_ERROR when date is missing', async () => {
    const app = makeApp();
    const res = await request(app)
      .post('/api/intentions')
      .set(auth)
      .send({ text: 'Focus.' });
    expect(res.status).toBe(400);
    expectErrorEnvelope(res.body as Record<string, unknown>);
  });
});

describe('Contract: CALL getTodaysIntention — GET /api/intentions/today', () => {
  it('200: returns GetTodaysIntentionResponse with null when none exists', async () => {
    const app = makeApp();
    const res = await request(app)
      .get('/api/intentions/today')
      .set(auth)
      .query({ date: '2026-07-15' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('intention');
    expect(res.body['intention']).toBeNull();
  });

  it('200: returns GetTodaysIntentionResponse with IntentionRecord when exists', async () => {
    const app = makeApp();
    await request(app)
      .post('/api/intentions')
      .set(auth)
      .send({ text: 'Focus.', date: '2026-07-15' });
    const res = await request(app)
      .get('/api/intentions/today')
      .set(auth)
      .query({ date: '2026-07-15' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('intention');
    expectIntentionRecord(res.body['intention'] as Record<string, unknown>);
  });

  it('401: UNAUTHORIZED when no token', async () => {
    const app = makeApp();
    const res = await request(app)
      .get('/api/intentions/today')
      .query({ date: '2026-07-15' });
    expect(res.status).toBe(401);
    expectErrorEnvelope(res.body as Record<string, unknown>);
  });

  it('400: VALIDATION_ERROR when date is missing', async () => {
    const app = makeApp();
    const res = await request(app)
      .get('/api/intentions/today')
      .set(auth);
    expect(res.status).toBe(400);
    expectErrorEnvelope(res.body as Record<string, unknown>);
  });
});

describe('Contract: CALL getPreviousIntention — GET /api/intentions/previous', () => {
  it('200: returns GetPreviousIntentionResponse with null when none exists', async () => {
    const app = makeApp();
    const res = await request(app)
      .get('/api/intentions/previous')
      .set(auth)
      .query({ beforeDate: '2026-07-15' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('intention');
    expect(res.body['intention']).toBeNull();
  });

  it('200: returns GetPreviousIntentionResponse with IntentionRecord when exists', async () => {
    const app = makeApp();
    await request(app)
      .post('/api/intentions')
      .set(auth)
      .send({ text: 'Yesterday.', date: '2026-07-14' });
    const res = await request(app)
      .get('/api/intentions/previous')
      .set(auth)
      .query({ beforeDate: '2026-07-15' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('intention');
    expectIntentionRecord(res.body['intention'] as Record<string, unknown>);
  });

  it('401: UNAUTHORIZED when no token', async () => {
    const app = makeApp();
    const res = await request(app)
      .get('/api/intentions/previous')
      .query({ beforeDate: '2026-07-15' });
    expect(res.status).toBe(401);
    expectErrorEnvelope(res.body as Record<string, unknown>);
  });

  it('400: VALIDATION_ERROR when beforeDate is missing', async () => {
    const app = makeApp();
    const res = await request(app)
      .get('/api/intentions/previous')
      .set(auth);
    expect(res.status).toBe(400);
    expectErrorEnvelope(res.body as Record<string, unknown>);
  });
});

describe('Contract: CALL saveEveningRating — PATCH /api/intentions/rating', () => {
  it('200: returns SaveEveningRatingResponse schema', async () => {
    const app = makeApp();
    await request(app)
      .post('/api/intentions')
      .set(auth)
      .send({ text: 'Focus.', date: '2026-07-15' });
    const res = await request(app)
      .patch('/api/intentions/rating')
      .set(auth)
      .send({ date: '2026-07-15', rating: 'honoured' });
    expect(res.status).toBe(200);
    expect(typeof res.body['synced']).toBe('boolean');
  });

  it('401: UNAUTHORIZED when no token', async () => {
    const app = makeApp();
    const res = await request(app)
      .patch('/api/intentions/rating')
      .send({ date: '2026-07-15', rating: 'honoured' });
    expect(res.status).toBe(401);
    expectErrorEnvelope(res.body as Record<string, unknown>);
  });

  it('404: INTENTION_NOT_FOUND when no intention for date', async () => {
    const app = makeApp();
    const res = await request(app)
      .patch('/api/intentions/rating')
      .set(auth)
      .send({ date: '2026-07-15', rating: 'honoured' });
    expect(res.status).toBe(404);
    expectErrorEnvelope(res.body as Record<string, unknown>);
    expect(res.body['errorCode']).toBe('INTENTION_NOT_FOUND');
  });

  it('422: INVALID_RATING for invalid rating value', async () => {
    const app = makeApp();
    await request(app)
      .post('/api/intentions')
      .set(auth)
      .send({ text: 'Focus.', date: '2026-07-15' });
    const res = await request(app)
      .patch('/api/intentions/rating')
      .set(auth)
      .send({ date: '2026-07-15', rating: 'bad_value' });
    expect(res.status).toBe(422);
    expectErrorEnvelope(res.body as Record<string, unknown>);
    expect(res.body['errorCode']).toBe('INVALID_RATING');
  });

  it('400: VALIDATION_ERROR when date is missing', async () => {
    const app = makeApp();
    const res = await request(app)
      .patch('/api/intentions/rating')
      .set(auth)
      .send({ rating: 'honoured' });
    expect(res.status).toBe(400);
    expectErrorEnvelope(res.body as Record<string, unknown>);
  });

  it('400: VALIDATION_ERROR when rating is missing', async () => {
    const app = makeApp();
    const res = await request(app)
      .patch('/api/intentions/rating')
      .set(auth)
      .send({ date: '2026-07-15' });
    expect(res.status).toBe(400);
    expectErrorEnvelope(res.body as Record<string, unknown>);
  });
});

describe('Contract: CALL listIntentions — GET /api/intentions', () => {
  it('200: returns ListIntentionsResponse schema', async () => {
    const app = makeApp();
    const res = await request(app)
      .get('/api/intentions')
      .set(auth);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('intentions');
    expect(Array.isArray(res.body['intentions'])).toBe(true);
  });

  it('200: each intention in the array matches IntentionRecord schema', async () => {
    const app = makeApp();
    await request(app)
      .post('/api/intentions')
      .set(auth)
      .send({ text: 'Focus.', date: '2026-07-15' });
    const res = await request(app)
      .get('/api/intentions')
      .set(auth);
    expect(res.status).toBe(200);
    const intentions = res.body['intentions'] as Record<string, unknown>[];
    expect(intentions.length).toBeGreaterThan(0);
    intentions.forEach(expectIntentionRecord);
  });

  it('401: UNAUTHORIZED when no token', async () => {
    const app = makeApp();
    const res = await request(app).get('/api/intentions');
    expect(res.status).toBe(401);
    expectErrorEnvelope(res.body as Record<string, unknown>);
  });
});
