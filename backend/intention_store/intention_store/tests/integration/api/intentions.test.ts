/**
 * Integration tests — Web layer: HTTP endpoints via supertest.
 * Tests the full request/response cycle including middleware.
 */

import request from 'supertest';
import { Application } from 'express';
import { createApp } from '../../../src/app';
import { IntentionService, SyncAdapter } from '../../../src/services/IntentionService';
import { InMemoryIntentionRepository } from '../../../src/repositories/InMemoryIntentionRepository';
import { AppConfig } from '../../../src/config';
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

function makeMockSupabase(userId = USER_ID): SupabaseClient {
  return {
    auth: {
      getUser: jest.fn().mockImplementation((token: string) => {
        if (token === VALID_TOKEN) {
          return Promise.resolve({ data: { user: { id: userId } }, error: null });
        }
        return Promise.resolve({ data: { user: null }, error: { message: 'Invalid token' } });
      }),
    },
    from: jest.fn(),
  } as unknown as SupabaseClient;
}

function makeSyncAdapter(saveResult = true, updateResult = true): SyncAdapter {
  return {
    syncSave: jest.fn().mockResolvedValue(saveResult),
    syncUpdate: jest.fn().mockResolvedValue(updateResult),
  };
}

function makeApp(syncSave = true, syncUpdate = true): {
  app: Application;
  repo: InMemoryIntentionRepository;
} {
  const repo = new InMemoryIntentionRepository();
  const syncAdapter = makeSyncAdapter(syncSave, syncUpdate);
  const service = new IntentionService(repo, syncAdapter, () => FIXED_NOW, () => FIXED_ID);
  const supabase = makeMockSupabase();
  const app = createApp(mockConfig, supabase, service);
  return { app, repo };
}

const authHeader = { Authorization: `Bearer ${VALID_TOKEN}` };

describe('GET /health', () => {
  it('returns 200 with status ok (no auth required)', async () => {
    const { app } = makeApp();
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.service).toBe('intention-store-service');
  });
});

describe('POST /api/intentions (saveIntention)', () => {
  it('returns 201 with id and synced when valid', async () => {
    const { app } = makeApp(true);
    const res = await request(app)
      .post('/api/intentions')
      .set(authHeader)
      .send({ text: 'Focus on deep work.', date: '2026-07-15' });
    expect(res.status).toBe(201);
    expect(res.body.id).toBe(FIXED_ID);
    expect(res.body.synced).toBe(true);
  });

  it('returns 201 with synced=false when sync fails', async () => {
    const { app } = makeApp(false);
    const res = await request(app)
      .post('/api/intentions')
      .set(authHeader)
      .send({ text: 'Focus on deep work.', date: '2026-07-15' });
    expect(res.status).toBe(201);
    expect(res.body.synced).toBe(false);
  });

  it('returns 401 when no auth token provided', async () => {
    const { app } = makeApp();
    const res = await request(app)
      .post('/api/intentions')
      .send({ text: 'Focus.', date: '2026-07-15' });
    expect(res.status).toBe(401);
    expect(res.body.errorCode).toBe('UNAUTHORIZED');
  });

  it('returns 401 when invalid auth token provided', async () => {
    const { app } = makeApp();
    const res = await request(app)
      .post('/api/intentions')
      .set({ Authorization: 'Bearer invalid-token' })
      .send({ text: 'Focus.', date: '2026-07-15' });
    expect(res.status).toBe(401);
    expect(res.body.errorCode).toBe('UNAUTHORIZED');
  });

  it('returns 400 when text is missing', async () => {
    const { app } = makeApp();
    const res = await request(app)
      .post('/api/intentions')
      .set(authHeader)
      .send({ date: '2026-07-15' });
    expect(res.status).toBe(400);
    expect(res.body.errorCode).toBeDefined();
    expect(res.body.message).toBeDefined();
    expect(res.body.timestamp).toBeDefined();
    expect(res.body.traceId).toBeDefined();
  });

  it('returns 400 when date is missing', async () => {
    const { app } = makeApp();
    const res = await request(app)
      .post('/api/intentions')
      .set(authHeader)
      .send({ text: 'Focus.' });
    expect(res.status).toBe(400);
    expect(res.body.errorCode).toBeDefined();
  });

  it('returns 422 when text exceeds 140 characters', async () => {
    const { app } = makeApp();
    const res = await request(app)
      .post('/api/intentions')
      .set(authHeader)
      .send({ text: 'a'.repeat(141), date: '2026-07-15' });
    expect(res.status).toBe(422);
    expect(res.body.errorCode).toBe('TEXT_TOO_LONG');
  });

  it('accepts text at exactly 140 characters', async () => {
    const { app } = makeApp();
    const res = await request(app)
      .post('/api/intentions')
      .set(authHeader)
      .send({ text: 'a'.repeat(140), date: '2026-07-15' });
    expect(res.status).toBe(201);
  });

  it('returns 409 when intention already exists for the date', async () => {
    const { app } = makeApp();
    await request(app)
      .post('/api/intentions')
      .set(authHeader)
      .send({ text: 'First.', date: '2026-07-15' });
    const res = await request(app)
      .post('/api/intentions')
      .set(authHeader)
      .send({ text: 'Second.', date: '2026-07-15' });
    expect(res.status).toBe(409);
    expect(res.body.errorCode).toBe('INTENTION_ALREADY_SET');
  });

  it('returns 400 when date is invalid', async () => {
    const { app } = makeApp();
    const res = await request(app)
      .post('/api/intentions')
      .set(authHeader)
      .send({ text: 'Focus.', date: 'not-a-date' });
    expect(res.status).toBe(400);
  });

  it('returns error envelope with required fields', async () => {
    const { app } = makeApp();
    const res = await request(app)
      .post('/api/intentions')
      .set(authHeader)
      .send({ date: '2026-07-15' });
    expect(res.body).toHaveProperty('errorCode');
    expect(res.body).toHaveProperty('message');
    expect(res.body).toHaveProperty('timestamp');
    expect(res.body).toHaveProperty('traceId');
  });
});

describe('GET /api/intentions/today (getTodaysIntention)', () => {
  it('returns 200 with null intention when none exists', async () => {
    const { app } = makeApp();
    const res = await request(app)
      .get('/api/intentions/today')
      .set(authHeader)
      .query({ date: '2026-07-15' });
    expect(res.status).toBe(200);
    expect(res.body.intention).toBeNull();
  });

  it('returns 200 with intention when it exists', async () => {
    const { app } = makeApp();
    await request(app)
      .post('/api/intentions')
      .set(authHeader)
      .send({ text: 'Focus.', date: '2026-07-15' });
    const res = await request(app)
      .get('/api/intentions/today')
      .set(authHeader)
      .query({ date: '2026-07-15' });
    expect(res.status).toBe(200);
    expect(res.body.intention).not.toBeNull();
    expect(res.body.intention.text).toBe('Focus.');
  });

  it('returns 401 when no auth token', async () => {
    const { app } = makeApp();
    const res = await request(app)
      .get('/api/intentions/today')
      .query({ date: '2026-07-15' });
    expect(res.status).toBe(401);
  });

  it('returns 400 when date is missing', async () => {
    const { app } = makeApp();
    const res = await request(app)
      .get('/api/intentions/today')
      .set(authHeader);
    expect(res.status).toBe(400);
  });

  it('returns 400 when date is invalid', async () => {
    const { app } = makeApp();
    const res = await request(app)
      .get('/api/intentions/today')
      .set(authHeader)
      .query({ date: 'bad-date' });
    expect(res.status).toBe(400);
  });
});

describe('GET /api/intentions/previous (getPreviousIntention)', () => {
  it('returns 200 with null when no previous intention', async () => {
    const { app } = makeApp();
    const res = await request(app)
      .get('/api/intentions/previous')
      .set(authHeader)
      .query({ beforeDate: '2026-07-15' });
    expect(res.status).toBe(200);
    expect(res.body.intention).toBeNull();
  });

  it('returns 200 with previous intention when it exists', async () => {
    const { app } = makeApp();
    await request(app)
      .post('/api/intentions')
      .set(authHeader)
      .send({ text: 'Yesterday.', date: '2026-07-14' });
    const res = await request(app)
      .get('/api/intentions/previous')
      .set(authHeader)
      .query({ beforeDate: '2026-07-15' });
    expect(res.status).toBe(200);
    expect(res.body.intention.text).toBe('Yesterday.');
    expect(res.body.intention.date).toBe('2026-07-14');
  });

  it('returns 401 when no auth token', async () => {
    const { app } = makeApp();
    const res = await request(app)
      .get('/api/intentions/previous')
      .query({ beforeDate: '2026-07-15' });
    expect(res.status).toBe(401);
  });

  it('returns 400 when beforeDate is missing', async () => {
    const { app } = makeApp();
    const res = await request(app)
      .get('/api/intentions/previous')
      .set(authHeader);
    expect(res.status).toBe(400);
  });

  it('returns 400 when beforeDate is invalid', async () => {
    const { app } = makeApp();
    const res = await request(app)
      .get('/api/intentions/previous')
      .set(authHeader)
      .query({ beforeDate: 'bad-date' });
    expect(res.status).toBe(400);
  });
});

describe('PATCH /api/intentions/rating (saveEveningRating)', () => {
  it('returns 200 with synced=true when valid', async () => {
    const { app } = makeApp(true, true);
    await request(app)
      .post('/api/intentions')
      .set(authHeader)
      .send({ text: 'Focus.', date: '2026-07-15' });
    const res = await request(app)
      .patch('/api/intentions/rating')
      .set(authHeader)
      .send({ date: '2026-07-15', rating: 'honoured' });
    expect(res.status).toBe(200);
    expect(res.body.synced).toBe(true);
  });

  it('accepts all three valid rating values', async () => {
    const ratings = ['honoured', 'partial', 'not_today'];
    for (const rating of ratings) {
      const { app } = makeApp(true, true);
      await request(app)
        .post('/api/intentions')
        .set(authHeader)
        .send({ text: 'Focus.', date: '2026-07-15' });
      const res = await request(app)
        .patch('/api/intentions/rating')
        .set(authHeader)
        .send({ date: '2026-07-15', rating });
      expect(res.status).toBe(200);
    }
  });

  it('returns 401 when no auth token', async () => {
    const { app } = makeApp();
    const res = await request(app)
      .patch('/api/intentions/rating')
      .send({ date: '2026-07-15', rating: 'honoured' });
    expect(res.status).toBe(401);
  });

  it('returns 404 when no intention exists for the date', async () => {
    const { app } = makeApp();
    const res = await request(app)
      .patch('/api/intentions/rating')
      .set(authHeader)
      .send({ date: '2026-07-15', rating: 'honoured' });
    expect(res.status).toBe(404);
    expect(res.body.errorCode).toBe('INTENTION_NOT_FOUND');
  });

  it('returns 422 for invalid rating value', async () => {
    const { app } = makeApp();
    await request(app)
      .post('/api/intentions')
      .set(authHeader)
      .send({ text: 'Focus.', date: '2026-07-15' });
    const res = await request(app)
      .patch('/api/intentions/rating')
      .set(authHeader)
      .send({ date: '2026-07-15', rating: 'invalid' });
    expect(res.status).toBe(422);
    expect(res.body.errorCode).toBe('INVALID_RATING');
  });

  it('returns 400 when date is missing', async () => {
    const { app } = makeApp();
    const res = await request(app)
      .patch('/api/intentions/rating')
      .set(authHeader)
      .send({ rating: 'honoured' });
    expect(res.status).toBe(400);
  });

  it('returns 400 when rating is missing', async () => {
    const { app } = makeApp();
    const res = await request(app)
      .patch('/api/intentions/rating')
      .set(authHeader)
      .send({ date: '2026-07-15' });
    expect(res.status).toBe(400);
  });
});

describe('GET /api/intentions (listIntentions)', () => {
  it('returns 200 with empty array when no intentions', async () => {
    const { app } = makeApp();
    const res = await request(app)
      .get('/api/intentions')
      .set(authHeader);
    expect(res.status).toBe(200);
    expect(res.body.intentions).toEqual([]);
  });

  it('returns 200 with all intentions ordered by date', async () => {
    const { app } = makeApp();
    await request(app)
      .post('/api/intentions')
      .set(authHeader)
      .send({ text: 'Day 15.', date: '2026-07-15' });
    await request(app)
      .post('/api/intentions')
      .set(authHeader)
      .send({ text: 'Day 14.', date: '2026-07-14' });
    const res = await request(app)
      .get('/api/intentions')
      .set(authHeader);
    expect(res.status).toBe(200);
    expect(res.body.intentions).toHaveLength(2);
    expect(res.body.intentions[0].date).toBe('2026-07-14');
    expect(res.body.intentions[1].date).toBe('2026-07-15');
  });

  it('returns 401 when no auth token', async () => {
    const { app } = makeApp();
    const res = await request(app).get('/api/intentions');
    expect(res.status).toBe(401);
  });

  it('includes rating in the response', async () => {
    const { app } = makeApp(true, true);
    await request(app)
      .post('/api/intentions')
      .set(authHeader)
      .send({ text: 'Focus.', date: '2026-07-15' });
    await request(app)
      .patch('/api/intentions/rating')
      .set(authHeader)
      .send({ date: '2026-07-15', rating: 'partial' });
    const res = await request(app)
      .get('/api/intentions')
      .set(authHeader);
    expect(res.body.intentions[0].rating).toBe('partial');
  });
});

describe('404 handler', () => {
  it('returns 404 for unknown routes', async () => {
    const { app } = makeApp();
    const res = await request(app).get('/unknown-route');
    expect(res.status).toBe(404);
    expect(res.body.errorCode).toBe('NOT_FOUND');
  });
});
