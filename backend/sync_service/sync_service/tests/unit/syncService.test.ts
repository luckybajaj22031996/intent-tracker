import { SyncService } from '../../src/application/SyncService';
import { ISupabaseAdapter } from '../../src/infrastructure/supabase/ISupabaseAdapter';
import { IIntentionStoreAdapter } from '../../src/infrastructure/intentionStore/IIntentionStoreAdapter';
import {
  SyncUnauthenticatedError,
  SyncNetworkError,
  SyncInternalError,
  SyncRecord,
} from '../../src/domain/SyncRecord';

const makeRecord = (overrides: Partial<SyncRecord> = {}): SyncRecord => ({
  id: 'rec-1',
  userId: 'user-1',
  type: 'intention',
  date: '2024-01-15',
  content: 'Be present',
  updatedAt: '2024-01-15T08:00:00.000Z',
  synced: false,
  ...overrides,
});

function makeSupabaseAdapter(overrides: Partial<ISupabaseAdapter> = {}): jest.Mocked<ISupabaseAdapter> {
  return {
    validateSession: jest.fn().mockResolvedValue('user-1'),
    recordExists: jest.fn().mockResolvedValue(false),
    createRecord: jest.fn().mockResolvedValue(undefined),
    updateRecord: jest.fn().mockResolvedValue(undefined),
    fetchAllRecords: jest.fn().mockResolvedValue([]),
    ...overrides,
  } as jest.Mocked<ISupabaseAdapter>;
}

function makeIntentionStoreAdapter(overrides: Partial<IIntentionStoreAdapter> = {}): jest.Mocked<IIntentionStoreAdapter> {
  return {
    listPendingRecords: jest.fn().mockResolvedValue([]),
    getRecord: jest.fn().mockResolvedValue(null),
    markSynced: jest.fn().mockResolvedValue(undefined),
    saveIntention: jest.fn().mockResolvedValue(undefined),
    saveEveningRating: jest.fn().mockResolvedValue(undefined),
    ...overrides,
  } as jest.Mocked<IIntentionStoreAdapter>;
}

describe('SyncService', () => {
  describe('triggerSync', () => {
    it('throws SyncUnauthenticatedError when session is invalid', async () => {
      const supabase = makeSupabaseAdapter({ validateSession: jest.fn().mockResolvedValue(null) });
      const store = makeIntentionStoreAdapter();
      const service = new SyncService(supabase, store);

      await expect(service.triggerSync('invalid-jwt')).rejects.toThrow(SyncUnauthenticatedError);
    });

    it('returns { pushed: 0, pulled: 0 } when no pending records and no remote records', async () => {
      const supabase = makeSupabaseAdapter();
      const store = makeIntentionStoreAdapter();
      const service = new SyncService(supabase, store);

      const result = await service.triggerSync('valid-jwt');
      expect(result).toEqual({ pushed: 0, pulled: 0 });
    });

    it('pushes pending local records to Supabase (create path)', async () => {
      const record = makeRecord();
      const supabase = makeSupabaseAdapter({
        recordExists: jest.fn().mockResolvedValue(false),
      });
      const store = makeIntentionStoreAdapter({
        listPendingRecords: jest.fn().mockResolvedValue([record]),
      });
      const service = new SyncService(supabase, store);

      const result = await service.triggerSync('valid-jwt');

      expect(supabase.createRecord).toHaveBeenCalledWith(record, 'valid-jwt');
      expect(store.markSynced).toHaveBeenCalledWith(record.id);
      expect(result.pushed).toBe(1);
    });

    it('pushes pending local records to Supabase (update path)', async () => {
      const record = makeRecord();
      const supabase = makeSupabaseAdapter({
        recordExists: jest.fn().mockResolvedValue(true),
      });
      const store = makeIntentionStoreAdapter({
        listPendingRecords: jest.fn().mockResolvedValue([record]),
      });
      const service = new SyncService(supabase, store);

      const result = await service.triggerSync('valid-jwt');

      expect(supabase.updateRecord).toHaveBeenCalledWith(record, 'valid-jwt');
      expect(supabase.createRecord).not.toHaveBeenCalled();
      expect(result.pushed).toBe(1);
    });

    it('pulls remote records not present locally', async () => {
      const remote = makeRecord({ id: 'remote-1', synced: true });
      const supabase = makeSupabaseAdapter({
        fetchAllRecords: jest.fn().mockResolvedValue([remote]),
      });
      const store = makeIntentionStoreAdapter({
        getRecord: jest.fn().mockResolvedValue(null),
      });
      const service = new SyncService(supabase, store);

      const result = await service.triggerSync('valid-jwt');

      expect(store.saveIntention).toHaveBeenCalledWith(remote);
      expect(result.pulled).toBe(1);
    });

    it('applies last-write-wins when remote is newer than local', async () => {
      const local = makeRecord({ updatedAt: '2024-01-15T08:00:00.000Z' });
      const remote = makeRecord({ updatedAt: '2024-01-15T10:00:00.000Z', content: 'Remote wins' });
      const supabase = makeSupabaseAdapter({
        fetchAllRecords: jest.fn().mockResolvedValue([remote]),
      });
      const store = makeIntentionStoreAdapter({
        getRecord: jest.fn().mockResolvedValue(local),
      });
      const service = new SyncService(supabase, store);

      const result = await service.triggerSync('valid-jwt');

      expect(store.saveIntention).toHaveBeenCalledWith(remote);
      expect(result.pulled).toBe(1);
    });

    it('does not overwrite local when local is newer than remote', async () => {
      const local = makeRecord({ updatedAt: '2024-01-15T12:00:00.000Z' });
      const remote = makeRecord({ updatedAt: '2024-01-15T08:00:00.000Z', content: 'Old remote' });
      const supabase = makeSupabaseAdapter({
        fetchAllRecords: jest.fn().mockResolvedValue([remote]),
      });
      const store = makeIntentionStoreAdapter({
        getRecord: jest.fn().mockResolvedValue(local),
      });
      const service = new SyncService(supabase, store);

      const result = await service.triggerSync('valid-jwt');

      expect(store.saveIntention).not.toHaveBeenCalled();
      expect(result.pulled).toBe(0);
    });

    it('calls saveEveningRating for evening-rating type records', async () => {
      const remote = makeRecord({ type: 'evening-rating', rating: 4, synced: true });
      const supabase = makeSupabaseAdapter({
        fetchAllRecords: jest.fn().mockResolvedValue([remote]),
      });
      const store = makeIntentionStoreAdapter({
        getRecord: jest.fn().mockResolvedValue(null),
      });
      const service = new SyncService(supabase, store);

      await service.triggerSync('valid-jwt');

      expect(store.saveEveningRating).toHaveBeenCalledWith(remote);
      expect(store.saveIntention).not.toHaveBeenCalled();
    });

    it('throws SyncInternalError when listPendingRecords fails', async () => {
      const supabase = makeSupabaseAdapter();
      const store = makeIntentionStoreAdapter({
        listPendingRecords: jest.fn().mockRejectedValue(new Error('DB error')),
      });
      const service = new SyncService(supabase, store);

      await expect(service.triggerSync('valid-jwt')).rejects.toThrow(SyncInternalError);
    });

    it('throws SyncNetworkError when Supabase returns ECONNREFUSED during push (via code)', async () => {
      const record = makeRecord();
      const networkErr = Object.assign(new Error('connect failed'), { code: 'ECONNREFUSED' });
      const supabase = makeSupabaseAdapter({
        recordExists: jest.fn().mockRejectedValue(networkErr),
      });
      const store = makeIntentionStoreAdapter({
        listPendingRecords: jest.fn().mockResolvedValue([record]),
      });
      const service = new SyncService(supabase, store);

      await expect(service.triggerSync('valid-jwt')).rejects.toThrow(SyncNetworkError);
    });

    it('throws SyncNetworkError when error message contains ECONNREFUSED', async () => {
      const record = makeRecord();
      const networkErr = new Error('ECONNREFUSED 127.0.0.1:8080');
      const supabase = makeSupabaseAdapter({
        recordExists: jest.fn().mockRejectedValue(networkErr),
      });
      const store = makeIntentionStoreAdapter({
        listPendingRecords: jest.fn().mockResolvedValue([record]),
      });
      const service = new SyncService(supabase, store);

      await expect(service.triggerSync('valid-jwt')).rejects.toThrow(SyncNetworkError);
    });

    it('throws SyncNetworkError when Supabase returns ETIMEDOUT during pull', async () => {
      const networkErr = Object.assign(new Error('ETIMEDOUT'), { code: 'ETIMEDOUT' });
      const supabase = makeSupabaseAdapter({
        fetchAllRecords: jest.fn().mockRejectedValue(networkErr),
      });
      const store = makeIntentionStoreAdapter();
      const service = new SyncService(supabase, store);

      await expect(service.triggerSync('valid-jwt')).rejects.toThrow(SyncNetworkError);
    });

    it('throws SyncNetworkError when pull phase encounters ENOTFOUND', async () => {
      const networkErr = Object.assign(new Error('ENOTFOUND supabase.co'), { code: 'ENOTFOUND' });
      const supabase = makeSupabaseAdapter({
        fetchAllRecords: jest.fn().mockRejectedValue(networkErr),
      });
      const store = makeIntentionStoreAdapter();
      const service = new SyncService(supabase, store);

      await expect(service.triggerSync('valid-jwt')).rejects.toThrow(SyncNetworkError);
    });

    it('throws SyncInternalError for non-network push errors', async () => {
      const record = makeRecord();
      const supabase = makeSupabaseAdapter({
        recordExists: jest.fn().mockRejectedValue(new Error('Unexpected DB error')),
      });
      const store = makeIntentionStoreAdapter({
        listPendingRecords: jest.fn().mockResolvedValue([record]),
      });
      const service = new SyncService(supabase, store);

      await expect(service.triggerSync('valid-jwt')).rejects.toThrow(SyncInternalError);
    });

    it('throws SyncInternalError for non-network pull errors', async () => {
      const remote = makeRecord({ id: 'remote-1', synced: true });
      const supabase = makeSupabaseAdapter({
        fetchAllRecords: jest.fn().mockResolvedValue([remote]),
      });
      const store = makeIntentionStoreAdapter({
        getRecord: jest.fn().mockRejectedValue(new Error('Store read error')),
      });
      const service = new SyncService(supabase, store);

      await expect(service.triggerSync('valid-jwt')).rejects.toThrow(SyncInternalError);
    });

    it('throws SyncNetworkError when pull record write encounters network error', async () => {
      const remote = makeRecord({ id: 'remote-1', synced: true });
      const networkErr = Object.assign(new Error('ECONNRESET'), { code: 'ECONNRESET' });
      const supabase = makeSupabaseAdapter({
        fetchAllRecords: jest.fn().mockResolvedValue([remote]),
      });
      const store = makeIntentionStoreAdapter({
        getRecord: jest.fn().mockResolvedValue(null),
        saveIntention: jest.fn().mockRejectedValue(networkErr),
      });
      const service = new SyncService(supabase, store);

      await expect(service.triggerSync('valid-jwt')).rejects.toThrow(SyncNetworkError);
    });

    it('throws SyncInternalError when pull record write encounters non-network error', async () => {
      const remote = makeRecord({ id: 'remote-1', synced: true });
      const supabase = makeSupabaseAdapter({
        fetchAllRecords: jest.fn().mockResolvedValue([remote]),
      });
      const store = makeIntentionStoreAdapter({
        getRecord: jest.fn().mockResolvedValue(null),
        saveIntention: jest.fn().mockRejectedValue(new Error('Write failed')),
      });
      const service = new SyncService(supabase, store);

      await expect(service.triggerSync('valid-jwt')).rejects.toThrow(SyncInternalError);
    });

    it('does not throw SyncNetworkError for non-Error objects', async () => {
      const record = makeRecord();
      const supabase = makeSupabaseAdapter({
        recordExists: jest.fn().mockRejectedValue('string error'),
      });
      const store = makeIntentionStoreAdapter({
        listPendingRecords: jest.fn().mockResolvedValue([record]),
      });
      const service = new SyncService(supabase, store);

      // Non-Error objects are treated as internal errors
      await expect(service.triggerSync('valid-jwt')).rejects.toThrow(SyncInternalError);
    });

    it('returns correct pushed and pulled counts for mixed scenario', async () => {
      const localPending = [makeRecord({ id: 'local-1' }), makeRecord({ id: 'local-2' })];
      const remoteRecords = [
        makeRecord({ id: 'remote-1', synced: true }),
        makeRecord({ id: 'remote-2', synced: true }),
        makeRecord({ id: 'remote-3', synced: true }),
      ];
      const supabase = makeSupabaseAdapter({
        recordExists: jest.fn().mockResolvedValue(false),
        fetchAllRecords: jest.fn().mockResolvedValue(remoteRecords),
      });
      const store = makeIntentionStoreAdapter({
        listPendingRecords: jest.fn().mockResolvedValue(localPending),
        getRecord: jest.fn().mockResolvedValue(null),
      });
      const service = new SyncService(supabase, store);

      const result = await service.triggerSync('valid-jwt');
      expect(result.pushed).toBe(2);
      expect(result.pulled).toBe(3);
    });
  });
});
