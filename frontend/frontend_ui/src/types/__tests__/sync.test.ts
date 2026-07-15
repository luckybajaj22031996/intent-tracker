import { describe, it, expect } from 'vitest';
import { SyncResultSchema, SyncHealthResponseSchema } from '../sync';

describe('SyncResultSchema', () => {
  it('parses a valid sync result', () => {
    const result = SyncResultSchema.parse({ pushed: 3, pulled: 1 });
    expect(result.pushed).toBe(3);
    expect(result.pulled).toBe(1);
  });

  it('rejects negative values', () => {
    expect(() => SyncResultSchema.parse({ pushed: -1, pulled: 0 })).toThrow();
  });
});

describe('SyncHealthResponseSchema', () => {
  it('parses ok status', () => {
    const result = SyncHealthResponseSchema.parse({ status: 'ok', service: 'sync-service' });
    expect(result.status).toBe('ok');
  });

  it('parses ready status', () => {
    const result = SyncHealthResponseSchema.parse({ status: 'ready', service: 'sync-service' });
    expect(result.status).toBe('ready');
  });
});
