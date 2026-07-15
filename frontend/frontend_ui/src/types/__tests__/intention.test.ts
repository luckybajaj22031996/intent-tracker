import { describe, it, expect } from 'vitest';
import {
  IntentionRecordSchema,
  SaveIntentionRequestSchema,
  SaveIntentionResponseSchema,
  SaveEveningRatingRequestSchema,
  SaveEveningRatingResponseSchema,
  ListIntentionsResponseSchema,
  GetTodaysIntentionResponseSchema,
  RatingSchema,
} from '../intention';

const validRecord = {
  id: 'a3f7c2d1-84b0-4e2a-9c6f-1d2e3f4a5b6c',
  userId: 'user-uuid-1234',
  date: '2026-07-15',
  text: 'Focus on deep work.',
  rating: null,
  synced: false,
  createdAt: '2026-07-15T07:00:00.000Z',
  updatedAt: null,
};

describe('RatingSchema', () => {
  it('accepts valid ratings', () => {
    expect(RatingSchema.parse('honoured')).toBe('honoured');
    expect(RatingSchema.parse('partial')).toBe('partial');
    expect(RatingSchema.parse('not_today')).toBe('not_today');
  });

  it('rejects invalid ratings', () => {
    expect(() => RatingSchema.parse('bad')).toThrow();
  });
});

describe('IntentionRecordSchema', () => {
  it('parses a valid record', () => {
    expect(() => IntentionRecordSchema.parse(validRecord)).not.toThrow();
  });

  it('rejects text over 140 chars', () => {
    expect(() =>
      IntentionRecordSchema.parse({ ...validRecord, text: 'a'.repeat(141) }),
    ).toThrow();
  });

  it('rejects invalid date format', () => {
    expect(() =>
      IntentionRecordSchema.parse({ ...validRecord, date: '15-07-2026' }),
    ).toThrow();
  });

  it('accepts a valid rating', () => {
    const record = IntentionRecordSchema.parse({ ...validRecord, rating: 'honoured' });
    expect(record.rating).toBe('honoured');
  });
});

describe('SaveIntentionRequestSchema', () => {
  it('accepts valid request', () => {
    expect(() =>
      SaveIntentionRequestSchema.parse({ text: 'My intention', date: '2026-07-15' }),
    ).not.toThrow();
  });

  it('rejects empty text', () => {
    expect(() =>
      SaveIntentionRequestSchema.parse({ text: '', date: '2026-07-15' }),
    ).toThrow();
  });

  it('rejects text over 140 chars', () => {
    expect(() =>
      SaveIntentionRequestSchema.parse({ text: 'a'.repeat(141), date: '2026-07-15' }),
    ).toThrow();
  });
});

describe('SaveIntentionResponseSchema', () => {
  it('parses a valid response', () => {
    const result = SaveIntentionResponseSchema.parse({
      id: 'a3f7c2d1-84b0-4e2a-9c6f-1d2e3f4a5b6c',
      synced: false,
    });
    expect(result.synced).toBe(false);
  });
});

describe('SaveEveningRatingRequestSchema', () => {
  it('accepts valid rating request', () => {
    expect(() =>
      SaveEveningRatingRequestSchema.parse({ date: '2026-07-15', rating: 'honoured' }),
    ).not.toThrow();
  });

  it('rejects invalid rating', () => {
    expect(() =>
      SaveEveningRatingRequestSchema.parse({ date: '2026-07-15', rating: 'great' }),
    ).toThrow();
  });
});

describe('SaveEveningRatingResponseSchema', () => {
  it('parses synced: true', () => {
    expect(SaveEveningRatingResponseSchema.parse({ synced: true }).synced).toBe(true);
  });
});

describe('ListIntentionsResponseSchema', () => {
  it('parses a list response', () => {
    const result = ListIntentionsResponseSchema.parse({ intentions: [validRecord] });
    expect(result.intentions).toHaveLength(1);
  });

  it('parses an empty list', () => {
    const result = ListIntentionsResponseSchema.parse({ intentions: [] });
    expect(result.intentions).toHaveLength(0);
  });
});

describe('GetTodaysIntentionResponseSchema', () => {
  it('parses a found intention', () => {
    const result = GetTodaysIntentionResponseSchema.parse({ intention: validRecord });
    expect(result.intention).not.toBeNull();
  });

  it('parses null intention', () => {
    const result = GetTodaysIntentionResponseSchema.parse({ intention: null });
    expect(result.intention).toBeNull();
  });
});
