/**
 * Unit tests — Data access layer: InMemoryIntentionRepository.
 */

import { InMemoryIntentionRepository } from '../../../src/repositories/InMemoryIntentionRepository';
import { IntentionRecord } from '../../../src/domain/Intention';

const FIXED_NOW = '2026-07-15T07:00:00.000Z';

function makeRecord(overrides: Partial<IntentionRecord> = {}): IntentionRecord {
  return {
    id: 'test-uuid-1',
    userId: 'user-1',
    date: '2026-07-15',
    text: 'Focus on deep work.',
    rating: null,
    synced: false,
    createdAt: FIXED_NOW,
    updatedAt: null,
    ...overrides,
  };
}

describe('InMemoryIntentionRepository', () => {
  let repo: InMemoryIntentionRepository;

  beforeEach(() => {
    repo = new InMemoryIntentionRepository();
  });

  describe('save', () => {
    it('saves a record and retrieves it by user and date', async () => {
      const record = makeRecord();
      await repo.save(record);
      const found = await repo.findByUserAndDate('user-1', '2026-07-15');
      expect(found).toEqual(record);
    });

    it('stores a copy (not a reference)', async () => {
      const record = makeRecord();
      await repo.save(record);
      record.text = 'mutated';
      const found = await repo.findByUserAndDate('user-1', '2026-07-15');
      expect(found?.text).toBe('Focus on deep work.');
    });
  });

  describe('findByUserAndDate', () => {
    it('returns null when no record exists', async () => {
      const found = await repo.findByUserAndDate('user-1', '2026-07-15');
      expect(found).toBeNull();
    });

    it('returns null for a different user', async () => {
      await repo.save(makeRecord({ userId: 'user-1' }));
      const found = await repo.findByUserAndDate('user-2', '2026-07-15');
      expect(found).toBeNull();
    });

    it('returns null for a different date', async () => {
      await repo.save(makeRecord({ date: '2026-07-15' }));
      const found = await repo.findByUserAndDate('user-1', '2026-07-14');
      expect(found).toBeNull();
    });

    it('returns a copy (not a reference)', async () => {
      await repo.save(makeRecord());
      const found = await repo.findByUserAndDate('user-1', '2026-07-15');
      if (found) found.text = 'mutated';
      const found2 = await repo.findByUserAndDate('user-1', '2026-07-15');
      expect(found2?.text).toBe('Focus on deep work.');
    });
  });

  describe('findMostRecentBefore', () => {
    it('returns null when no records exist', async () => {
      const found = await repo.findMostRecentBefore('user-1', '2026-07-15');
      expect(found).toBeNull();
    });

    it('returns null when all records are on or after beforeDate', async () => {
      await repo.save(makeRecord({ date: '2026-07-15' }));
      const found = await repo.findMostRecentBefore('user-1', '2026-07-15');
      expect(found).toBeNull();
    });

    it('returns the most recent record before the given date', async () => {
      await repo.save(makeRecord({ id: 'uuid-1', date: '2026-07-13', text: 'Day 13' }));
      await repo.save(makeRecord({ id: 'uuid-2', date: '2026-07-14', text: 'Day 14' }));
      const found = await repo.findMostRecentBefore('user-1', '2026-07-15');
      expect(found?.date).toBe('2026-07-14');
      expect(found?.text).toBe('Day 14');
    });

    it('ignores records from other users', async () => {
      await repo.save(makeRecord({ userId: 'user-2', date: '2026-07-14', text: 'Other user' }));
      const found = await repo.findMostRecentBefore('user-1', '2026-07-15');
      expect(found).toBeNull();
    });

    it('returns a copy (not a reference)', async () => {
      await repo.save(makeRecord({ date: '2026-07-14' }));
      const found = await repo.findMostRecentBefore('user-1', '2026-07-15');
      if (found) found.text = 'mutated';
      const found2 = await repo.findMostRecentBefore('user-1', '2026-07-15');
      expect(found2?.text).toBe('Focus on deep work.');
    });
  });

  describe('update', () => {
    it('updates an existing record', async () => {
      const record = makeRecord();
      await repo.save(record);
      const updated = { ...record, rating: 'honoured' as const, synced: true };
      await repo.update(updated);
      const found = await repo.findByUserAndDate('user-1', '2026-07-15');
      expect(found?.rating).toBe('honoured');
      expect(found?.synced).toBe(true);
    });

    it('throws when record does not exist', async () => {
      const record = makeRecord();
      await expect(repo.update(record)).rejects.toThrow();
    });
  });

  describe('listByUser', () => {
    it('returns empty array when no records exist', async () => {
      const records = await repo.listByUser('user-1');
      expect(records).toEqual([]);
    });

    it('returns all records for the user ordered by date ascending', async () => {
      await repo.save(makeRecord({ id: 'uuid-2', date: '2026-07-15', text: 'Day 15' }));
      await repo.save(makeRecord({ id: 'uuid-1', date: '2026-07-14', text: 'Day 14' }));
      const records = await repo.listByUser('user-1');
      expect(records).toHaveLength(2);
      expect(records[0].date).toBe('2026-07-14');
      expect(records[1].date).toBe('2026-07-15');
    });

    it('excludes records from other users', async () => {
      await repo.save(makeRecord({ userId: 'user-1', id: 'uuid-1' }));
      await repo.save(makeRecord({ userId: 'user-2', id: 'uuid-2' }));
      const records = await repo.listByUser('user-1');
      expect(records).toHaveLength(1);
      expect(records[0].userId).toBe('user-1');
    });

    it('returns copies (not references)', async () => {
      await repo.save(makeRecord());
      const records = await repo.listByUser('user-1');
      records[0].text = 'mutated';
      const records2 = await repo.listByUser('user-1');
      expect(records2[0].text).toBe('Focus on deep work.');
    });
  });

  describe('clear', () => {
    it('removes all records', async () => {
      await repo.save(makeRecord());
      repo.clear();
      const found = await repo.findByUserAndDate('user-1', '2026-07-15');
      expect(found).toBeNull();
    });
  });
});
