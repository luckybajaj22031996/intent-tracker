/**
 * Unit tests — Application/service layer: IntentionService.
 */

import { IntentionService, SyncAdapter } from '../../../src/services/IntentionService';
import { InMemoryIntentionRepository } from '../../../src/repositories/InMemoryIntentionRepository';
import {
  IntentionAlreadySetError,
  TextTooLongError,
  IntentionNotFoundError,
  InvalidRatingError,
  IntentionDomainError,
} from '../../../src/domain/Intention';

const FIXED_NOW = '2026-07-15T07:00:00.000Z';
const FIXED_ID = 'a3f7c2d1-84b0-4e2a-9c6f-1d2e3f4a5b6c';
const USER_ID = 'user-uuid-1234';
const TRACE_ID = 'trace-id-test';

function makeSyncAdapter(syncResult = true): SyncAdapter {
  return {
    syncSave: jest.fn().mockResolvedValue(syncResult),
    syncUpdate: jest.fn().mockResolvedValue(syncResult),
  };
}

function makeService(syncResult = true) {
  const repo = new InMemoryIntentionRepository();
  const syncAdapter = makeSyncAdapter(syncResult);
  const service = new IntentionService(
    repo,
    syncAdapter,
    () => FIXED_NOW,
    () => FIXED_ID,
  );
  return { repo, syncAdapter, service };
}

describe('IntentionService.saveIntention', () => {
  it('saves an intention and returns id and synced=true when sync succeeds', async () => {
    const { service } = makeService(true);
    const result = await service.saveIntention(
      USER_ID,
      { text: 'Focus on deep work.', date: '2026-07-15' },
      TRACE_ID,
    );
    expect(result.id).toBe(FIXED_ID);
    expect(result.synced).toBe(true);
  });

  it('saves an intention and returns synced=false when sync fails', async () => {
    const { service } = makeService(false);
    const result = await service.saveIntention(
      USER_ID,
      { text: 'Focus on deep work.', date: '2026-07-15' },
      TRACE_ID,
    );
    expect(result.id).toBe(FIXED_ID);
    expect(result.synced).toBe(false);
  });

  it('throws TextTooLongError when text exceeds 140 characters', async () => {
    const { service } = makeService();
    await expect(
      service.saveIntention(USER_ID, { text: 'a'.repeat(141), date: '2026-07-15' }, TRACE_ID),
    ).rejects.toThrow(TextTooLongError);
  });

  it('accepts text at exactly 140 characters', async () => {
    const { service } = makeService();
    const result = await service.saveIntention(
      USER_ID,
      { text: 'a'.repeat(140), date: '2026-07-15' },
      TRACE_ID,
    );
    expect(result.id).toBe(FIXED_ID);
  });

  it('throws IntentionDomainError when text is empty', async () => {
    const { service } = makeService();
    await expect(
      service.saveIntention(USER_ID, { text: '', date: '2026-07-15' }, TRACE_ID),
    ).rejects.toThrow(IntentionDomainError);
  });

  it('throws IntentionDomainError when date is invalid', async () => {
    const { service } = makeService();
    await expect(
      service.saveIntention(USER_ID, { text: 'Focus.', date: 'not-a-date' }, TRACE_ID),
    ).rejects.toThrow(IntentionDomainError);
  });

  it('throws IntentionAlreadySetError when intention already exists for the date', async () => {
    const { service } = makeService();
    await service.saveIntention(USER_ID, { text: 'First.', date: '2026-07-15' }, TRACE_ID);
    await expect(
      service.saveIntention(USER_ID, { text: 'Second.', date: '2026-07-15' }, TRACE_ID),
    ).rejects.toThrow(IntentionAlreadySetError);
  });

  it('allows different users to set intentions for the same date', async () => {
    const { service } = makeService();
    await service.saveIntention('user-1', { text: 'User 1.', date: '2026-07-15' }, TRACE_ID);
    const result = await service.saveIntention(
      'user-2',
      { text: 'User 2.', date: '2026-07-15' },
      TRACE_ID,
    );
    expect(result.id).toBe(FIXED_ID);
  });

  it('returns synced=false when sync adapter throws', async () => {
    const repo = new InMemoryIntentionRepository();
    const syncAdapter: SyncAdapter = {
      syncSave: jest.fn().mockRejectedValue(new Error('Network error')),
      syncUpdate: jest.fn().mockResolvedValue(true),
    };
    const service = new IntentionService(repo, syncAdapter, () => FIXED_NOW, () => FIXED_ID);
    const result = await service.saveIntention(
      USER_ID,
      { text: 'Focus.', date: '2026-07-15' },
      TRACE_ID,
    );
    expect(result.synced).toBe(false);
  });

  it('throws IntentionDomainError when date is missing', async () => {
    const { service } = makeService();
    await expect(
      // @ts-expect-error testing runtime guard
      service.saveIntention(USER_ID, { text: 'Focus.' }, TRACE_ID),
    ).rejects.toThrow(IntentionDomainError);
  });
});

describe('IntentionService.getTodaysIntention', () => {
  it('returns null when no intention exists for the date', async () => {
    const { service } = makeService();
    const result = await service.getTodaysIntention(USER_ID, '2026-07-15', TRACE_ID);
    expect(result.intention).toBeNull();
  });

  it('returns the intention record when it exists', async () => {
    const { service } = makeService();
    await service.saveIntention(USER_ID, { text: 'Focus.', date: '2026-07-15' }, TRACE_ID);
    const result = await service.getTodaysIntention(USER_ID, '2026-07-15', TRACE_ID);
    expect(result.intention).not.toBeNull();
    expect(result.intention?.text).toBe('Focus.');
    expect(result.intention?.date).toBe('2026-07-15');
  });

  it('throws IntentionDomainError when date is invalid', async () => {
    const { service } = makeService();
    await expect(
      service.getTodaysIntention(USER_ID, 'bad-date', TRACE_ID),
    ).rejects.toThrow(IntentionDomainError);
  });

  it('throws IntentionDomainError when date is empty', async () => {
    const { service } = makeService();
    await expect(
      service.getTodaysIntention(USER_ID, '', TRACE_ID),
    ).rejects.toThrow(IntentionDomainError);
  });

  it('does not return another user\'s intention', async () => {
    const { service } = makeService();
    await service.saveIntention('other-user', { text: 'Other.', date: '2026-07-15' }, TRACE_ID);
    const result = await service.getTodaysIntention(USER_ID, '2026-07-15', TRACE_ID);
    expect(result.intention).toBeNull();
  });
});

describe('IntentionService.getPreviousIntention', () => {
  it('returns null when no previous intention exists', async () => {
    const { service } = makeService();
    const result = await service.getPreviousIntention(USER_ID, '2026-07-15', TRACE_ID);
    expect(result.intention).toBeNull();
  });

  it('returns the most recent past intention', async () => {
    const { service } = makeService();
    await service.saveIntention('user-1', { text: 'Day 13.', date: '2026-07-13' }, TRACE_ID);
    await service.saveIntention('user-1', { text: 'Day 14.', date: '2026-07-14' }, TRACE_ID);
    const result = await service.getPreviousIntention('user-1', '2026-07-15', TRACE_ID);
    expect(result.intention?.date).toBe('2026-07-14');
    expect(result.intention?.text).toBe('Day 14.');
  });

  it('does not return the intention for the given date itself', async () => {
    const { service } = makeService();
    await service.saveIntention('user-1', { text: 'Today.', date: '2026-07-15' }, TRACE_ID);
    const result = await service.getPreviousIntention('user-1', '2026-07-15', TRACE_ID);
    expect(result.intention).toBeNull();
  });

  it('throws IntentionDomainError when beforeDate is invalid', async () => {
    const { service } = makeService();
    await expect(
      service.getPreviousIntention(USER_ID, 'bad-date', TRACE_ID),
    ).rejects.toThrow(IntentionDomainError);
  });

  it('throws IntentionDomainError when beforeDate is empty', async () => {
    const { service } = makeService();
    await expect(
      service.getPreviousIntention(USER_ID, '', TRACE_ID),
    ).rejects.toThrow(IntentionDomainError);
  });
});

describe('IntentionService.saveEveningRating', () => {
  it('saves a rating and returns synced=true when sync succeeds', async () => {
    const { service } = makeService(true);
    await service.saveIntention(USER_ID, { text: 'Focus.', date: '2026-07-15' }, TRACE_ID);
    const result = await service.saveEveningRating(
      USER_ID,
      { date: '2026-07-15', rating: 'honoured' },
      TRACE_ID,
    );
    expect(result.synced).toBe(true);
  });

  it('saves a rating and returns synced=false when sync fails', async () => {
    const repo = new InMemoryIntentionRepository();
    const syncAdapter: SyncAdapter = {
      syncSave: jest.fn().mockResolvedValue(true),
      syncUpdate: jest.fn().mockResolvedValue(false),
    };
    const service = new IntentionService(repo, syncAdapter, () => FIXED_NOW, () => FIXED_ID);
    await service.saveIntention(USER_ID, { text: 'Focus.', date: '2026-07-15' }, TRACE_ID);
    const result = await service.saveEveningRating(
      USER_ID,
      { date: '2026-07-15', rating: 'honoured' },
      TRACE_ID,
    );
    expect(result.synced).toBe(false);
  });

  it('accepts all three valid rating values', async () => {
    const ratings = ['honoured', 'partial', 'not_today'] as const;
    for (const rating of ratings) {
      const repo = new InMemoryIntentionRepository();
      const service = new IntentionService(
        repo,
        makeSyncAdapter(true),
        () => FIXED_NOW,
        () => FIXED_ID,
      );
      await service.saveIntention(USER_ID, { text: 'Focus.', date: '2026-07-15' }, TRACE_ID);
      const result = await service.saveEveningRating(
        USER_ID,
        { date: '2026-07-15', rating },
        TRACE_ID,
      );
      expect(result.synced).toBe(true);
    }
  });

  it('throws InvalidRatingError for an invalid rating', async () => {
    const { service } = makeService();
    await service.saveIntention(USER_ID, { text: 'Focus.', date: '2026-07-15' }, TRACE_ID);
    await expect(
      service.saveEveningRating(USER_ID, { date: '2026-07-15', rating: 'bad' }, TRACE_ID),
    ).rejects.toThrow(InvalidRatingError);
  });

  it('throws IntentionNotFoundError when no intention exists for the date', async () => {
    const { service } = makeService();
    await expect(
      service.saveEveningRating(USER_ID, { date: '2026-07-15', rating: 'honoured' }, TRACE_ID),
    ).rejects.toThrow(IntentionNotFoundError);
  });

  it('throws IntentionDomainError when date is invalid', async () => {
    const { service } = makeService();
    await expect(
      service.saveEveningRating(USER_ID, { date: 'bad-date', rating: 'honoured' }, TRACE_ID),
    ).rejects.toThrow(IntentionDomainError);
  });

  it('throws IntentionDomainError when rating is empty', async () => {
    const { service } = makeService();
    await service.saveIntention(USER_ID, { text: 'Focus.', date: '2026-07-15' }, TRACE_ID);
    await expect(
      service.saveEveningRating(USER_ID, { date: '2026-07-15', rating: '' }, TRACE_ID),
    ).rejects.toThrow(InvalidRatingError);
  });

  it('updates the rating in the local store', async () => {
    const { service, repo } = makeService(true);
    await service.saveIntention(USER_ID, { text: 'Focus.', date: '2026-07-15' }, TRACE_ID);
    await service.saveEveningRating(
      USER_ID,
      { date: '2026-07-15', rating: 'partial' },
      TRACE_ID,
    );
    const record = await repo.findByUserAndDate(USER_ID, '2026-07-15');
    expect(record?.rating).toBe('partial');
  });

  it('returns synced=false when sync adapter throws', async () => {
    const repo = new InMemoryIntentionRepository();
    const syncAdapter: SyncAdapter = {
      syncSave: jest.fn().mockResolvedValue(true),
      syncUpdate: jest.fn().mockRejectedValue(new Error('Network error')),
    };
    const service = new IntentionService(repo, syncAdapter, () => FIXED_NOW, () => FIXED_ID);
    await service.saveIntention(USER_ID, { text: 'Focus.', date: '2026-07-15' }, TRACE_ID);
    const result = await service.saveEveningRating(
      USER_ID,
      { date: '2026-07-15', rating: 'honoured' },
      TRACE_ID,
    );
    expect(result.synced).toBe(false);
  });
});

describe('IntentionService.listIntentions', () => {
  it('returns empty array when no intentions exist', async () => {
    const { service } = makeService();
    const result = await service.listIntentions(USER_ID, TRACE_ID);
    expect(result.intentions).toEqual([]);
  });

  it('returns all intentions for the user ordered by date', async () => {
    const { service } = makeService();
    await service.saveIntention('user-1', { text: 'Day 15.', date: '2026-07-15' }, TRACE_ID);
    await service.saveIntention('user-1', { text: 'Day 14.', date: '2026-07-14' }, TRACE_ID);
    const result = await service.listIntentions('user-1', TRACE_ID);
    expect(result.intentions).toHaveLength(2);
    expect(result.intentions[0].date).toBe('2026-07-14');
    expect(result.intentions[1].date).toBe('2026-07-15');
  });

  it('excludes other users\' intentions', async () => {
    const { service } = makeService();
    await service.saveIntention('user-1', { text: 'User 1.', date: '2026-07-15' }, TRACE_ID);
    await service.saveIntention('user-2', { text: 'User 2.', date: '2026-07-15' }, TRACE_ID);
    const result = await service.listIntentions('user-1', TRACE_ID);
    expect(result.intentions).toHaveLength(1);
    expect(result.intentions[0].userId).toBe('user-1');
  });

  it('includes rating in the response', async () => {
    const { service } = makeService(true);
    await service.saveIntention(USER_ID, { text: 'Focus.', date: '2026-07-15' }, TRACE_ID);
    await service.saveEveningRating(
      USER_ID,
      { date: '2026-07-15', rating: 'honoured' },
      TRACE_ID,
    );
    const result = await service.listIntentions(USER_ID, TRACE_ID);
    expect(result.intentions[0].rating).toBe('honoured');
  });
});
