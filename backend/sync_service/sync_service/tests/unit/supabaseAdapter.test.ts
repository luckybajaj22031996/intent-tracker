import nock from 'nock';
import { SupabaseAdapter } from '../../src/infrastructure/supabase/SupabaseAdapter';
import { SyncRecord } from '../../src/domain/SyncRecord';

// Use nock to intercept HTTP calls made by axios
const SUPABASE_URL = 'https://test.supabase.co';
const ANON_KEY = 'test-anon-key';
const USER_JWT = 'test-user-jwt';

const record: SyncRecord = {
  id: 'rec-1',
  userId: 'user-1',
  type: 'intention',
  date: '2024-01-15',
  content: 'Be present',
  updatedAt: '2024-01-15T08:00:00.000Z',
  synced: false,
};

describe('SupabaseAdapter', () => {
  let adapter: SupabaseAdapter;

  beforeEach(() => {
    adapter = new SupabaseAdapter(SUPABASE_URL, ANON_KEY);
    nock.cleanAll();
  });

  afterEach(() => {
    nock.cleanAll();
  });

  describe('validateSession', () => {
    it('returns userId when session is valid', async () => {
      nock(SUPABASE_URL)
        .get('/auth/v1/user')
        .reply(200, { id: 'user-1', email: 'test@example.com' });

      const result = await adapter.validateSession(USER_JWT);
      expect(result).toBe('user-1');
    });

    it('returns null when response has no id', async () => {
      nock(SUPABASE_URL)
        .get('/auth/v1/user')
        .reply(200, {});

      const result = await adapter.validateSession(USER_JWT);
      expect(result).toBeNull();
    });

    it('returns null when session is invalid (401)', async () => {
      nock(SUPABASE_URL)
        .get('/auth/v1/user')
        .reply(401, { message: 'Invalid token' });

      const result = await adapter.validateSession(USER_JWT);
      expect(result).toBeNull();
    });

    it('returns null when session is forbidden (403)', async () => {
      nock(SUPABASE_URL)
        .get('/auth/v1/user')
        .reply(403, { message: 'Forbidden' });

      const result = await adapter.validateSession(USER_JWT);
      expect(result).toBeNull();
    });

    it('throws on unexpected server error', async () => {
      nock(SUPABASE_URL)
        .get('/auth/v1/user')
        .reply(500, { message: 'Server error' });

      await expect(adapter.validateSession(USER_JWT)).rejects.toThrow();
    });
  });

  describe('recordExists', () => {
    it('returns true when record exists', async () => {
      nock(SUPABASE_URL)
        .get('/rest/v1/intentions')
        .query(true)
        .reply(200, [{ id: 'rec-1' }]);

      const result = await adapter.recordExists('rec-1', USER_JWT);
      expect(result).toBe(true);
    });

    it('returns false when record does not exist', async () => {
      nock(SUPABASE_URL)
        .get('/rest/v1/intentions')
        .query(true)
        .reply(200, []);

      const result = await adapter.recordExists('rec-1', USER_JWT);
      expect(result).toBe(false);
    });

    it('throws on server error', async () => {
      nock(SUPABASE_URL)
        .get('/rest/v1/intentions')
        .query(true)
        .reply(500, { message: 'Server error' });

      await expect(adapter.recordExists('rec-1', USER_JWT)).rejects.toThrow();
    });
  });

  describe('createRecord', () => {
    it('calls POST /rest/v1/intentions with correct payload', async () => {
      nock(SUPABASE_URL)
        .post('/rest/v1/intentions')
        .reply(201);

      await expect(adapter.createRecord(record, USER_JWT)).resolves.toBeUndefined();
    });

    it('throws on server error', async () => {
      nock(SUPABASE_URL)
        .post('/rest/v1/intentions')
        .reply(500, { message: 'Server error' });

      await expect(adapter.createRecord(record, USER_JWT)).rejects.toThrow();
    });
  });

  describe('updateRecord', () => {
    it('calls PATCH /rest/v1/intentions with correct payload', async () => {
      nock(SUPABASE_URL)
        .patch('/rest/v1/intentions')
        .query(true)
        .reply(200);

      await expect(adapter.updateRecord(record, USER_JWT)).resolves.toBeUndefined();
    });

    it('throws on server error', async () => {
      nock(SUPABASE_URL)
        .patch('/rest/v1/intentions')
        .query(true)
        .reply(500, { message: 'Server error' });

      await expect(adapter.updateRecord(record, USER_JWT)).rejects.toThrow();
    });
  });

  describe('fetchAllRecords', () => {
    it('returns mapped SyncRecord array', async () => {
      const row = {
        id: 'rec-1',
        user_id: 'user-1',
        type: 'intention',
        date: '2024-01-15',
        content: 'Be present',
        rating: null,
        updated_at: '2024-01-15T08:00:00.000Z',
      };
      nock(SUPABASE_URL)
        .get('/rest/v1/intentions')
        .query(true)
        .reply(200, [row]);

      const result = await adapter.fetchAllRecords(USER_JWT);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('rec-1');
      expect(result[0].userId).toBe('user-1');
      expect(result[0].synced).toBe(true);
      expect(result[0].content).toBe('Be present');
      expect(result[0].rating).toBeUndefined();
    });

    it('maps rating field correctly for evening-rating records', async () => {
      const row = {
        id: 'rec-2',
        user_id: 'user-1',
        type: 'evening-rating',
        date: '2024-01-15',
        content: null,
        rating: 4,
        updated_at: '2024-01-15T20:00:00.000Z',
      };
      nock(SUPABASE_URL)
        .get('/rest/v1/intentions')
        .query(true)
        .reply(200, [row]);

      const result = await adapter.fetchAllRecords(USER_JWT);
      expect(result[0].rating).toBe(4);
      expect(result[0].content).toBeUndefined();
    });

    it('returns empty array when no records', async () => {
      nock(SUPABASE_URL)
        .get('/rest/v1/intentions')
        .query(true)
        .reply(200, []);

      const result = await adapter.fetchAllRecords(USER_JWT);
      expect(result).toEqual([]);
    });

    it('throws on server error', async () => {
      nock(SUPABASE_URL)
        .get('/rest/v1/intentions')
        .query(true)
        .reply(500, { message: 'Server error' });

      await expect(adapter.fetchAllRecords(USER_JWT)).rejects.toThrow();
    });
  });
});
