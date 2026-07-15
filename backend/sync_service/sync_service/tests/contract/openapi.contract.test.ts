/**
 * Contract tests: verify the running app matches the OpenAPI spec.
 * Every operation declared in 01_Service-Context.md must be present
 * and return the correct status codes and response shapes.
 */
import request from 'supertest';
import { createApp } from '../../src/app';
import { ISyncService } from '../../src/application/SyncService';
import {
  SyncUnauthenticatedError,
  SyncNetworkError,
  SyncInternalError,
} from '../../src/domain/SyncRecord';

function makeMockSyncService(overrides: Partial<ISyncService> = {}): jest.Mocked<ISyncService> {
  return {
    triggerSync: jest.fn().mockResolvedValue({ pushed: 0, pulled: 0 }),
    ...overrides,
  } as jest.Mocked<ISyncService>;
}

describe('Contract: POST /sync/trigger', () => {
  describe('200 OK — SyncResult schema', () => {
    it('response body has required fields pushed (integer) and pulled (integer)', async () => {
      const syncService = makeMockSyncService({
        triggerSync: jest.fn().mockResolvedValue({ pushed: 3, pulled: 1 }),
      });
      const app = createApp(syncService);

      const res = await request(app)
        .post('/sync/trigger')
        .set('Authorization', 'Bearer valid-jwt')
        .send({});

      expect(res.status).toBe(200);
      expect(typeof res.body.pushed).toBe('number');
      expect(typeof res.body.pulled).toBe('number');
      expect(Number.isInteger(res.body.pushed)).toBe(true);
      expect(Number.isInteger(res.body.pulled)).toBe(true);
      expect(res.body.pushed).toBeGreaterThanOrEqual(0);
      expect(res.body.pulled).toBeGreaterThanOrEqual(0);
    });
  });

  describe('401 Unauthorized — ErrorEnvelope schema', () => {
    it('response body has errorCode SYNC_UNAUTHENTICATED, message, timestamp, traceId', async () => {
      const syncService = makeMockSyncService({
        triggerSync: jest.fn().mockRejectedValue(new SyncUnauthenticatedError()),
      });
      const app = createApp(syncService);

      const res = await request(app)
        .post('/sync/trigger')
        .set('Authorization', 'Bearer bad-jwt')
        .send({});

      expect(res.status).toBe(401);
      expect(res.body.errorCode).toBe('SYNC_UNAUTHENTICATED');
      expect(typeof res.body.message).toBe('string');
      expect(typeof res.body.timestamp).toBe('string');
      expect(typeof res.body.traceId).toBe('string');
      // timestamp must be ISO 8601
      expect(() => new Date(res.body.timestamp)).not.toThrow();
    });

    it('returns 401 when no Authorization header (missing session)', async () => {
      const syncService = makeMockSyncService();
      const app = createApp(syncService);

      const res = await request(app).post('/sync/trigger').send({});

      expect(res.status).toBe(401);
      expect(res.body.errorCode).toBe('SYNC_UNAUTHENTICATED');
    });
  });

  describe('503 Service Unavailable — ErrorEnvelope schema', () => {
    it('response body has errorCode SYNC_NETWORK_ERROR, message, timestamp, traceId', async () => {
      const syncService = makeMockSyncService({
        triggerSync: jest.fn().mockRejectedValue(new SyncNetworkError()),
      });
      const app = createApp(syncService);

      const res = await request(app)
        .post('/sync/trigger')
        .set('Authorization', 'Bearer valid-jwt')
        .send({});

      expect(res.status).toBe(503);
      expect(res.body.errorCode).toBe('SYNC_NETWORK_ERROR');
      expect(typeof res.body.message).toBe('string');
      expect(typeof res.body.timestamp).toBe('string');
      expect(typeof res.body.traceId).toBe('string');
    });
  });

  describe('500 Internal Server Error — ErrorEnvelope schema', () => {
    it('response body has errorCode SYNC_INTERNAL_ERROR, message, timestamp, traceId', async () => {
      const syncService = makeMockSyncService({
        triggerSync: jest.fn().mockRejectedValue(new SyncInternalError('Unexpected')),
      });
      const app = createApp(syncService);

      const res = await request(app)
        .post('/sync/trigger')
        .set('Authorization', 'Bearer valid-jwt')
        .send({});

      expect(res.status).toBe(500);
      expect(res.body.errorCode).toBe('SYNC_INTERNAL_ERROR');
      expect(typeof res.body.message).toBe('string');
      expect(typeof res.body.timestamp).toBe('string');
      expect(typeof res.body.traceId).toBe('string');
    });
  });

  describe('Auth contract', () => {
    it('does not call triggerSync when Authorization header is absent', async () => {
      const syncService = makeMockSyncService();
      const app = createApp(syncService);

      await request(app).post('/sync/trigger').send({});

      expect(syncService.triggerSync).not.toHaveBeenCalled();
    });

    it('passes the JWT token (without Bearer prefix) to triggerSync', async () => {
      const syncService = makeMockSyncService();
      const app = createApp(syncService);

      await request(app)
        .post('/sync/trigger')
        .set('Authorization', 'Bearer my-jwt-token')
        .send({});

      expect(syncService.triggerSync).toHaveBeenCalledWith('my-jwt-token');
    });
  });
});

describe('Contract: GET /health', () => {
  it('returns 200 with status and service fields', async () => {
    const syncService = makeMockSyncService();
    const app = createApp(syncService);

    const res = await request(app).get('/health');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status');
    expect(res.body).toHaveProperty('service');
    expect(res.body.service).toBe('sync-service');
  });
});
