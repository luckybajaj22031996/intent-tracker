import nock from 'nock';
import { IntentionStoreAdapter } from '../../src/infrastructure/intentionStore/IntentionStoreAdapter';
import { SyncRecord } from '../../src/domain/SyncRecord';

const BASE_URL = 'http://intention-store-service:8080';

const record: SyncRecord = {
  id: 'rec-1',
  userId: 'user-1',
  type: 'intention',
  date: '2024-01-15',
  content: 'Be present',
  updatedAt: '2024-01-15T08:00:00.000Z',
  synced: false,
};

describe('IntentionStoreAdapter', () => {
  let adapter: IntentionStoreAdapter;

  beforeEach(() => {
    adapter = new IntentionStoreAdapter(BASE_URL);
    nock.cleanAll();
  });

  afterEach(() => {
    nock.cleanAll();
  });

  describe('listPendingRecords', () => {
    it('returns pending records from the intention store', async () => {
      nock(BASE_URL)
        .get('/intentions')
        .query({ synced: 'false' })
        .reply(200, { intentions: [record] });

      const result = await adapter.listPendingRecords();
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('rec-1');
    });

    it('returns empty array when no pending records', async () => {
      nock(BASE_URL)
        .get('/intentions')
        .query({ synced: 'false' })
        .reply(200, { intentions: [] });

      const result = await adapter.listPendingRecords();
      expect(result).toEqual([]);
    });

    it('returns empty array when intentions field is missing from response', async () => {
      nock(BASE_URL)
        .get('/intentions')
        .query({ synced: 'false' })
        .reply(200, {});

      const result = await adapter.listPendingRecords();
      expect(result).toEqual([]);
    });

    it('throws on server error', async () => {
      nock(BASE_URL)
        .get('/intentions')
        .query({ synced: 'false' })
        .reply(500, { message: 'Server error' });

      await expect(adapter.listPendingRecords()).rejects.toThrow();
    });
  });

  describe('getRecord', () => {
    it('returns record when found', async () => {
      nock(BASE_URL)
        .get('/intentions/rec-1')
        .reply(200, record);

      const result = await adapter.getRecord('rec-1');
      expect(result).toEqual(record);
    });

    it('returns null when record not found (404)', async () => {
      nock(BASE_URL)
        .get('/intentions/rec-1')
        .reply(404, { message: 'Not found' });

      const result = await adapter.getRecord('rec-1');
      expect(result).toBeNull();
    });

    it('throws on server error (non-404)', async () => {
      nock(BASE_URL)
        .get('/intentions/rec-1')
        .reply(500, { message: 'Server error' });

      await expect(adapter.getRecord('rec-1')).rejects.toThrow();
    });
  });

  describe('markSynced', () => {
    it('calls PATCH with synced: true', async () => {
      nock(BASE_URL)
        .patch('/intentions/rec-1', { synced: true })
        .reply(200);

      await expect(adapter.markSynced('rec-1')).resolves.toBeUndefined();
    });

    it('throws on server error', async () => {
      nock(BASE_URL)
        .patch('/intentions/rec-1')
        .reply(500, { message: 'Server error' });

      await expect(adapter.markSynced('rec-1')).rejects.toThrow();
    });
  });

  describe('saveIntention', () => {
    it('calls POST /intentions with correct payload', async () => {
      nock(BASE_URL)
        .post('/intentions')
        .reply(201);

      await expect(adapter.saveIntention(record)).resolves.toBeUndefined();
    });

    it('throws on server error', async () => {
      nock(BASE_URL)
        .post('/intentions')
        .reply(500, { message: 'Server error' });

      await expect(adapter.saveIntention(record)).rejects.toThrow();
    });
  });

  describe('saveEveningRating', () => {
    const ratingRecord: SyncRecord = { ...record, type: 'evening-rating', rating: 4 };

    it('calls POST /intentions/evening-rating with correct payload', async () => {
      nock(BASE_URL)
        .post('/intentions/evening-rating')
        .reply(201);

      await expect(adapter.saveEveningRating(ratingRecord)).resolves.toBeUndefined();
    });

    it('throws on server error', async () => {
      nock(BASE_URL)
        .post('/intentions/evening-rating')
        .reply(500, { message: 'Server error' });

      await expect(adapter.saveEveningRating(ratingRecord)).rejects.toThrow();
    });
  });
});
