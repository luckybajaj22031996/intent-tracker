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

describe('POST /sync/trigger', () => {
  it('returns 200 with pushed/pulled counts on success', async () => {
    const syncService = makeMockSyncService({
      triggerSync: jest.fn().mockResolvedValue({ pushed: 3, pulled: 1 }),
    });
    const app = createApp(syncService);

    const res = await request(app)
      .post('/sync/trigger')
      .set('Authorization', 'Bearer valid-jwt')
      .send({});

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ pushed: 3, pulled: 1 });
  });

  it('returns 200 with { pushed: 0, pulled: 0 } when nothing to sync', async () => {
    const syncService = makeMockSyncService();
    const app = createApp(syncService);

    const res = await request(app)
      .post('/sync/trigger')
      .set('Authorization', 'Bearer valid-jwt')
      .send({});

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ pushed: 0, pulled: 0 });
  });

  it('returns 401 when Authorization header is missing', async () => {
    const syncService = makeMockSyncService();
    const app = createApp(syncService);

    const res = await request(app).post('/sync/trigger').send({});

    expect(res.status).toBe(401);
    expect(res.body.errorCode).toBe('SYNC_UNAUTHENTICATED');
    expect(res.body.message).toBeDefined();
    expect(res.body.timestamp).toBeDefined();
    expect(res.body.traceId).toBeDefined();
  });

  it('returns 401 when Authorization header is not Bearer format', async () => {
    const syncService = makeMockSyncService();
    const app = createApp(syncService);

    const res = await request(app)
      .post('/sync/trigger')
      .set('Authorization', 'Basic dXNlcjpwYXNz')
      .send({});

    expect(res.status).toBe(401);
    expect(res.body.errorCode).toBe('SYNC_UNAUTHENTICATED');
  });

  it('returns 401 when Bearer token is empty string', async () => {
    const syncService = makeMockSyncService();
    const app = createApp(syncService);

    const res = await request(app)
      .post('/sync/trigger')
      .set('Authorization', 'Bearer ')
      .send({});

    expect(res.status).toBe(401);
    expect(res.body.errorCode).toBe('SYNC_UNAUTHENTICATED');
  });

  it('returns 401 when service throws SyncUnauthenticatedError', async () => {
    const syncService = makeMockSyncService({
      triggerSync: jest.fn().mockRejectedValue(new SyncUnauthenticatedError()),
    });
    const app = createApp(syncService);

    const res = await request(app)
      .post('/sync/trigger')
      .set('Authorization', 'Bearer expired-jwt')
      .send({});

    expect(res.status).toBe(401);
    expect(res.body.errorCode).toBe('SYNC_UNAUTHENTICATED');
    expect(res.body.timestamp).toBeDefined();
    expect(res.body.traceId).toBeDefined();
  });

  it('returns 503 when service throws SyncNetworkError', async () => {
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
    expect(res.body.timestamp).toBeDefined();
    expect(res.body.traceId).toBeDefined();
  });

  it('returns 500 when service throws SyncInternalError', async () => {
    const syncService = makeMockSyncService({
      triggerSync: jest.fn().mockRejectedValue(new SyncInternalError('DB failure')),
    });
    const app = createApp(syncService);

    const res = await request(app)
      .post('/sync/trigger')
      .set('Authorization', 'Bearer valid-jwt')
      .send({});

    expect(res.status).toBe(500);
    expect(res.body.errorCode).toBe('SYNC_INTERNAL_ERROR');
    expect(res.body.timestamp).toBeDefined();
    expect(res.body.traceId).toBeDefined();
  });

  it('returns 500 for unexpected errors', async () => {
    const syncService = makeMockSyncService({
      triggerSync: jest.fn().mockRejectedValue(new Error('Unexpected')),
    });
    const app = createApp(syncService);

    const res = await request(app)
      .post('/sync/trigger')
      .set('Authorization', 'Bearer valid-jwt')
      .send({});

    expect(res.status).toBe(500);
    expect(res.body.errorCode).toBe('INTERNAL_SERVER_ERROR');
  });

  it('includes x-trace-id in response headers when provided', async () => {
    const syncService = makeMockSyncService();
    const app = createApp(syncService);

    const res = await request(app)
      .post('/sync/trigger')
      .set('Authorization', 'Bearer valid-jwt')
      .set('x-trace-id', 'test-trace-123')
      .send({});

    expect(res.headers['x-trace-id']).toBe('test-trace-123');
  });

  it('generates a traceId when x-trace-id header is not provided', async () => {
    const syncService = makeMockSyncService();
    const app = createApp(syncService);

    const res = await request(app)
      .post('/sync/trigger')
      .set('Authorization', 'Bearer valid-jwt')
      .send({});

    expect(res.headers['x-trace-id']).toBeDefined();
    expect(typeof res.headers['x-trace-id']).toBe('string');
  });

  it('accepts empty request body', async () => {
    const syncService = makeMockSyncService({
      triggerSync: jest.fn().mockResolvedValue({ pushed: 1, pulled: 0 }),
    });
    const app = createApp(syncService);

    const res = await request(app)
      .post('/sync/trigger')
      .set('Authorization', 'Bearer valid-jwt');

    expect(res.status).toBe(200);
  });

  it('uses traceId from header in error response when Authorization is missing', async () => {
    const syncService = makeMockSyncService();
    const app = createApp(syncService);

    const res = await request(app)
      .post('/sync/trigger')
      .set('x-trace-id', 'my-trace-id')
      .send({});

    expect(res.status).toBe(401);
    expect(res.body.traceId).toBe('my-trace-id');
  });
});

describe('GET /health', () => {
  it('returns 200 with status ok', async () => {
    const syncService = makeMockSyncService();
    const app = createApp(syncService);

    const res = await request(app).get('/health');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.service).toBe('sync-service');
  });
});

describe('GET /health/ready', () => {
  it('returns 200 with status ready', async () => {
    const syncService = makeMockSyncService();
    const app = createApp(syncService);

    const res = await request(app).get('/health/ready');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ready');
    expect(res.body.service).toBe('sync-service');
  });
});
