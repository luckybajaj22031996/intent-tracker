/**
 * Unit tests — Domain layer: Intention entity, value objects, domain errors.
 */

import {
  IntentionRecord,
  VALID_RATINGS,
  MAX_INTENTION_TEXT_LENGTH,
  IntentionDomainError,
  IntentionAlreadySetError,
  TextTooLongError,
  IntentionNotFoundError,
  InvalidRatingError,
  StorageError,
  isValidISODate,
  isValidRating,
  validateIntentionText,
  createIntentionRecord,
  applyRating,
} from '../../../src/domain/Intention';

const FIXED_NOW = '2026-07-15T07:00:00.000Z';
const now = () => FIXED_NOW;

describe('Domain constants', () => {
  it('MAX_INTENTION_TEXT_LENGTH is 140', () => {
    expect(MAX_INTENTION_TEXT_LENGTH).toBe(140);
  });

  it('VALID_RATINGS contains exactly honoured, partial, not_today', () => {
    expect(VALID_RATINGS).toEqual(['honoured', 'partial', 'not_today']);
  });
});

describe('isValidISODate', () => {
  it('returns true for a valid ISO date', () => {
    expect(isValidISODate('2026-07-15')).toBe(true);
  });

  it('returns true for 2000-01-01', () => {
    expect(isValidISODate('2000-01-01')).toBe(true);
  });

  it('returns false for an invalid date string', () => {
    expect(isValidISODate('not-a-date')).toBe(false);
  });

  it('returns false for a datetime string', () => {
    expect(isValidISODate('2026-07-15T07:00:00Z')).toBe(false);
  });

  it('returns false for an empty string', () => {
    expect(isValidISODate('')).toBe(false);
  });

  it('returns false for a date with invalid month', () => {
    expect(isValidISODate('2026-13-01')).toBe(false);
  });

  it('returns false for a date with invalid day', () => {
    expect(isValidISODate('2026-07-32')).toBe(false);
  });

  it('returns false for a non-string', () => {
    // @ts-expect-error testing runtime guard
    expect(isValidISODate(20260715)).toBe(false);
  });
});

describe('isValidRating', () => {
  it('returns true for honoured', () => {
    expect(isValidRating('honoured')).toBe(true);
  });

  it('returns true for partial', () => {
    expect(isValidRating('partial')).toBe(true);
  });

  it('returns true for not_today', () => {
    expect(isValidRating('not_today')).toBe(true);
  });

  it('returns false for an invalid rating', () => {
    expect(isValidRating('invalid')).toBe(false);
  });

  it('returns false for an empty string', () => {
    expect(isValidRating('')).toBe(false);
  });

  it('returns false for HONOURED (wrong case)', () => {
    expect(isValidRating('HONOURED')).toBe(false);
  });
});

describe('validateIntentionText', () => {
  it('accepts text at exactly 140 characters', () => {
    const text = 'a'.repeat(140);
    expect(() => validateIntentionText(text)).not.toThrow();
  });

  it('accepts normal text', () => {
    expect(() => validateIntentionText('Focus on deep work.')).not.toThrow();
  });

  it('throws TextTooLongError for text exceeding 140 characters', () => {
    const text = 'a'.repeat(141);
    expect(() => validateIntentionText(text)).toThrow(TextTooLongError);
  });

  it('throws IntentionDomainError for empty text', () => {
    expect(() => validateIntentionText('')).toThrow(IntentionDomainError);
  });

  it('throws IntentionDomainError for whitespace-only text', () => {
    expect(() => validateIntentionText('   ')).toThrow(IntentionDomainError);
  });
});

describe('createIntentionRecord', () => {
  const params = {
    id: 'test-uuid',
    userId: 'user-1',
    date: '2026-07-15',
    text: 'Focus on deep work.',
    now,
  };

  it('creates a valid intention record', () => {
    const record = createIntentionRecord(params);
    expect(record).toMatchObject({
      id: 'test-uuid',
      userId: 'user-1',
      date: '2026-07-15',
      text: 'Focus on deep work.',
      rating: null,
      synced: false,
      createdAt: FIXED_NOW,
      updatedAt: null,
    });
  });

  it('sets synced to false by default', () => {
    const record = createIntentionRecord(params);
    expect(record.synced).toBe(false);
  });

  it('sets rating to null by default', () => {
    const record = createIntentionRecord(params);
    expect(record.rating).toBeNull();
  });

  it('throws TextTooLongError when text exceeds 140 characters', () => {
    expect(() =>
      createIntentionRecord({ ...params, text: 'a'.repeat(141) }),
    ).toThrow(TextTooLongError);
  });

  it('throws IntentionDomainError when text is empty', () => {
    expect(() =>
      createIntentionRecord({ ...params, text: '' }),
    ).toThrow(IntentionDomainError);
  });

  it('accepts text at exactly 140 characters', () => {
    const text = 'a'.repeat(140);
    const record = createIntentionRecord({ ...params, text });
    expect(record.text).toBe(text);
  });
});

describe('applyRating', () => {
  const baseRecord: IntentionRecord = {
    id: 'test-uuid',
    userId: 'user-1',
    date: '2026-07-15',
    text: 'Focus on deep work.',
    rating: null,
    synced: true,
    createdAt: FIXED_NOW,
    updatedAt: null,
  };

  const RATING_NOW = '2026-07-15T21:00:00.000Z';
  const ratingNow = () => RATING_NOW;

  it('applies honoured rating', () => {
    const updated = applyRating(baseRecord, 'honoured', ratingNow);
    expect(updated.rating).toBe('honoured');
  });

  it('applies partial rating', () => {
    const updated = applyRating(baseRecord, 'partial', ratingNow);
    expect(updated.rating).toBe('partial');
  });

  it('applies not_today rating', () => {
    const updated = applyRating(baseRecord, 'not_today', ratingNow);
    expect(updated.rating).toBe('not_today');
  });

  it('sets synced to false after rating update', () => {
    const updated = applyRating(baseRecord, 'honoured', ratingNow);
    expect(updated.synced).toBe(false);
  });

  it('sets updatedAt to the current time', () => {
    const updated = applyRating(baseRecord, 'honoured', ratingNow);
    expect(updated.updatedAt).toBe(RATING_NOW);
  });

  it('does not mutate the original record', () => {
    applyRating(baseRecord, 'honoured', ratingNow);
    expect(baseRecord.rating).toBeNull();
    expect(baseRecord.synced).toBe(true);
  });

  it('throws InvalidRatingError for an invalid rating', () => {
    expect(() => applyRating(baseRecord, 'invalid', ratingNow)).toThrow(InvalidRatingError);
  });

  it('throws InvalidRatingError for empty string', () => {
    expect(() => applyRating(baseRecord, '', ratingNow)).toThrow(InvalidRatingError);
  });
});

describe('Domain error classes', () => {
  it('IntentionAlreadySetError has correct code and message', () => {
    const err = new IntentionAlreadySetError();
    expect(err.code).toBe('INTENTION_ALREADY_SET');
    expect(err.message).toBe("You have already set today's intention.");
    expect(err instanceof IntentionDomainError).toBe(true);
    expect(err instanceof Error).toBe(true);
  });

  it('TextTooLongError has correct code and message', () => {
    const err = new TextTooLongError();
    expect(err.code).toBe('TEXT_TOO_LONG');
    expect(err.message).toBe('Intention must be 140 characters or fewer.');
    expect(err instanceof IntentionDomainError).toBe(true);
  });

  it('IntentionNotFoundError has correct code and message', () => {
    const err = new IntentionNotFoundError();
    expect(err.code).toBe('INTENTION_NOT_FOUND');
    expect(err.message).toBe('No intention found for today.');
    expect(err instanceof IntentionDomainError).toBe(true);
  });

  it('InvalidRatingError has correct code and message', () => {
    const err = new InvalidRatingError();
    expect(err.code).toBe('INVALID_RATING');
    expect(err.message).toBe('Rating must be honoured, partial, or not_today.');
    expect(err instanceof IntentionDomainError).toBe(true);
  });

  it('StorageError has correct code and custom message', () => {
    const err = new StorageError('Disk full');
    expect(err.code).toBe('STORAGE_ERROR');
    expect(err.message).toBe('Disk full');
    expect(err instanceof IntentionDomainError).toBe(true);
  });

  it('IntentionDomainError instanceof checks work correctly', () => {
    const err = new IntentionAlreadySetError();
    expect(err instanceof IntentionAlreadySetError).toBe(true);
    expect(err instanceof IntentionDomainError).toBe(true);
    expect(err instanceof Error).toBe(true);
  });
});
