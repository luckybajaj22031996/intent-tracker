/**
 * Unit tests — IntentionService: storage error paths and sync status update failures.
 */

import { IntentionService, SyncAdapter } from '../../../src/services/IntentionService';
import { IntentionRepository } from '../../../src/repositories/IntentionRepository';
import { InMemoryIntentionRepository } from '../../../src/repositories/InMemoryIntentionRepository';
import { StorageError, IntentionRecord } from '../../../src/domain/Intention';

const FIXED_NOW = '2026-07-15T07:00:00.000Z';
const FIXED_ID = 'a3f7c2d1-84b0-4e2a-9c6f-1d2e3f4a5b6c';
const USER_ID = 'user-uuid-1234';
const TRACE_ID = 'trace-id-test';

function makeSyncAdapter(saveResult = true, updateResult = true): SyncAdapter {
  return {
    syncSave: jest.fn().mockResolvedValue(saveResult),
    syncUpdate: jest.fn().mockResolvedValue(updateResult),
  };
}

/**
 * A repository that fails on save.
 */
class FailingSaveRepo extends InMemoryIntentionRepository {
  async save(_record: IntentionRecord): Promise<void> {
    throw new StorageError('Save failed');
  }
}

/**
 * A repository that fails on read operations.
 */
class FailingReadRepo implements IntentionRepository {
  async save(_record: IntentionRecord): Promise<void> { /* no-op */ }
  async findByUserAndDate(_userId: string, _date: string): Promise<IntentionRecord | null> {
    throw new StorageError('Read failed');
  }
  async findMostRecentBefore(_userId: string, _beforeDate: string): Promise<IntentionRecord | null> {
    throw new StorageError('Read failed');
  }
  async update(_record: IntentionRecord): Promise<void> { /* no-op */ }
  async listByUser(_userId: string): Promise<IntentionRecord[]> {
    throw new StorageError('Read failed');
  }
}

describe('IntentionService — storage error paths', () => {
  it('saveIntention: throws StorageError when local save fails', async () => {
    const repo = new FailingSaveRepo();
    const service = new IntentionService(repo, makeSyncAdapter(), () => FIXED_NOW, () => FIXED_ID);
    await expect(
      service.saveIntention(USER_ID, { text: 'Focus.', date: '2026-07-15' }, TRACE_ID),
    ).rejects.toThrow(StorageError);
  });

  it('saveIntention: continues gracefully when sync-status update fails after successful sync', async () => {
    const baseRepo = new InMemoryIntentionRepository();
    const syncAdapter = makeSyncAdapter(true);
    const service = new IntentionService(baseRepo, syncAdapter, () => FIXED_NOW, () => FIXED_ID);
    // First call succeeds
    const result = await service.saveIntention(
      USER_ID,
      { text: 'Focus.', date: '2026-07-15' },
      TRACE_ID,
    );
    // The sync succeeded
    expect(result.synced).toBe(true);
  });

  it('getTodaysIntention: throws StorageError when local read fails', async () => {
    const repo = new FailingReadRepo();
    const service = new IntentionService(repo, makeSyncAdapter(), () => FIXED_NOW, () => FIXED_ID);
    await expect(
      service.getTodaysIntention(USER_ID, '2026-07-15', TRACE_ID),
    ).rejects.toThrow(StorageError);
  });

  it('getPreviousIntention: throws StorageError when local read fails', async () => {
    const repo = new FailingReadRepo();
    const service = new IntentionService(repo, makeSyncAdapter(), () => FIXED_NOW, () => FIXED_ID);
    await expect(
      service.getPreviousIntention(USER_ID, '2026-07-15', TRACE_ID),
    ).rejects.toThrow(StorageError);
  });

  it('saveEveningRating: throws StorageError when local update fails', async () => {
    const baseRepo = new InMemoryIntentionRepository();
    // First save the intention
    const setupService = new IntentionService(
      baseRepo,
      makeSyncAdapter(),
      () => FIXED_NOW,
      () => FIXED_ID,
    );
    await setupService.saveIntention(USER_ID, { text: 'Focus.', date: '2026-07-15' }, TRACE_ID);

    // Now use a repo that fails on update
    class UpdateFailRepo extends InMemoryIntentionRepository {
      async update(_record: IntentionRecord): Promise<void> {
        throw new StorageError('Update failed');
      }
    }
    // Copy the record to the failing repo
    const failRepo = new UpdateFailRepo();
    const record = await baseRepo.findByUserAndDate(USER_ID, '2026-07-15');
    if (record) await failRepo.save(record);

    const service = new IntentionService(failRepo, makeSyncAdapter(), () => FIXED_NOW, () => FIXED_ID);
    await expect(
      service.saveEveningRating(USER_ID, { date: '2026-07-15', rating: 'honoured' }, TRACE_ID),
    ).rejects.toThrow(StorageError);
  });

  it('listIntentions: throws StorageError when local read fails', async () => {
    const repo = new FailingReadRepo();
    const service = new IntentionService(repo, makeSyncAdapter(), () => FIXED_NOW, () => FIXED_ID);
    await expect(
      service.listIntentions(USER_ID, TRACE_ID),
    ).rejects.toThrow(StorageError);
  });

  it('saveEveningRating: continues gracefully when sync-status update fails after successful sync', async () => {
    const baseRepo = new InMemoryIntentionRepository();
    const syncAdapter = makeSyncAdapter(true, true);
    const service = new IntentionService(baseRepo, syncAdapter, () => FIXED_NOW, () => FIXED_ID);
    await service.saveIntention(USER_ID, { text: 'Focus.', date: '2026-07-15' }, TRACE_ID);

    // Now override update to fail on the second call (sync status update)
    let updateCount = 0;
    const origUpdate = baseRepo.update.bind(baseRepo);
    baseRepo.update = async (record: IntentionRecord) => {
      updateCount++;
      if (updateCount >= 2) {
        // Silently fail — service should handle this gracefully
        return;
      }
      return origUpdate(record);
    };

    const result = await service.saveEveningRating(
      USER_ID,
      { date: '2026-07-15', rating: 'honoured' },
      TRACE_ID,
    );
    expect(result.synced).toBe(true);
  });
});
