import {
  SyncUnauthenticatedError,
  SyncNetworkError,
  SyncInternalError,
  resolveConflict,
  SyncRecord,
} from '../../src/domain/SyncRecord';

describe('Domain: SyncRecord', () => {
  const baseRecord: SyncRecord = {
    id: 'rec-1',
    userId: 'user-1',
    type: 'intention',
    date: '2024-01-15',
    content: 'Be present',
    updatedAt: '2024-01-15T08:00:00.000Z',
    synced: false,
  };

  describe('resolveConflict', () => {
    it('returns remote record when remote is newer', () => {
      const local: SyncRecord = { ...baseRecord, updatedAt: '2024-01-15T08:00:00.000Z' };
      const remote: SyncRecord = { ...baseRecord, updatedAt: '2024-01-15T09:00:00.000Z', content: 'Remote version' };
      const result = resolveConflict(local, remote);
      expect(result).toBe(remote);
    });

    it('returns local record when local is newer', () => {
      const local: SyncRecord = { ...baseRecord, updatedAt: '2024-01-15T10:00:00.000Z', content: 'Local version' };
      const remote: SyncRecord = { ...baseRecord, updatedAt: '2024-01-15T09:00:00.000Z' };
      const result = resolveConflict(local, remote);
      expect(result).toBe(local);
    });

    it('returns remote record when timestamps are equal (remote wins on tie)', () => {
      const ts = '2024-01-15T08:00:00.000Z';
      const local: SyncRecord = { ...baseRecord, updatedAt: ts };
      const remote: SyncRecord = { ...baseRecord, updatedAt: ts, content: 'Remote' };
      const result = resolveConflict(local, remote);
      expect(result).toBe(remote);
    });

    it('handles evening-rating type records', () => {
      const local: SyncRecord = { ...baseRecord, type: 'evening-rating', rating: 3, updatedAt: '2024-01-15T20:00:00.000Z' };
      const remote: SyncRecord = { ...baseRecord, type: 'evening-rating', rating: 5, updatedAt: '2024-01-15T21:00:00.000Z' };
      const result = resolveConflict(local, remote);
      expect(result.rating).toBe(5);
    });
  });

  describe('SyncUnauthenticatedError', () => {
    it('has correct code and name', () => {
      const err = new SyncUnauthenticatedError();
      expect(err.code).toBe('SYNC_UNAUTHENTICATED');
      expect(err.name).toBe('SyncUnauthenticatedError');
      expect(err.message).toContain('No active Supabase session');
      expect(err).toBeInstanceOf(Error);
    });
  });

  describe('SyncNetworkError', () => {
    it('has correct code and name', () => {
      const err = new SyncNetworkError();
      expect(err.code).toBe('SYNC_NETWORK_ERROR');
      expect(err.name).toBe('SyncNetworkError');
      expect(err.message).toContain('Supabase could not be reached');
    });

    it('captures cause stack', () => {
      const cause = new Error('ECONNREFUSED');
      const err = new SyncNetworkError(cause);
      expect(err.stack).toContain('Caused by');
    });
  });

  describe('SyncInternalError', () => {
    it('has correct code and name', () => {
      const err = new SyncInternalError('Something went wrong');
      expect(err.code).toBe('SYNC_INTERNAL_ERROR');
      expect(err.name).toBe('SyncInternalError');
      expect(err.message).toBe('Something went wrong');
    });

    it('captures cause stack', () => {
      const cause = new Error('DB error');
      const err = new SyncInternalError('Wrapped', cause);
      expect(err.stack).toContain('Caused by');
    });
  });
});
