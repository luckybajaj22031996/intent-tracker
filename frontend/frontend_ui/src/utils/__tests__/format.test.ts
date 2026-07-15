import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  formatDate,
  formatShortDate,
  getTodayIso,
  isEveningMode,
  getMonthName,
  getDaysInMonth,
  getFirstDayOfMonth,
} from '../format';

describe('formatDate', () => {
  it('formats an ISO date to a long human-readable string', () => {
    const result = formatDate('2026-07-15');
    expect(result).toContain('2026');
    expect(result).toContain('July');
    expect(result).toContain('15');
  });
});

describe('formatShortDate', () => {
  it('formats an ISO date to a short date', () => {
    const result = formatShortDate('2026-07-15');
    expect(result).toContain('15');
    expect(result).toContain('Jul');
  });
});

describe('getTodayIso', () => {
  it('returns a string in YYYY-MM-DD format', () => {
    const result = getTodayIso();
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('returns today\'s date', () => {
    const now = new Date();
    const expected = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    expect(getTodayIso()).toBe(expected);
  });
});

describe('isEveningMode', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns true after 5 PM', () => {
    vi.setSystemTime(new Date('2026-07-15T18:00:00'));
    expect(isEveningMode()).toBe(true);
  });

  it('returns false before 5 PM', () => {
    vi.setSystemTime(new Date('2026-07-15T09:00:00'));
    expect(isEveningMode()).toBe(false);
  });

  it('returns true at exactly 5 PM', () => {
    vi.setSystemTime(new Date('2026-07-15T17:00:00'));
    expect(isEveningMode()).toBe(true);
  });
});

describe('getMonthName', () => {
  it('returns the month and year', () => {
    const result = getMonthName(new Date(2026, 6, 1)); // July 2026
    expect(result).toContain('July');
    expect(result).toContain('2026');
  });
});

describe('getDaysInMonth', () => {
  it('returns 31 for July', () => {
    expect(getDaysInMonth(2026, 6)).toBe(31);
  });

  it('returns 28 for February in a non-leap year', () => {
    expect(getDaysInMonth(2026, 1)).toBe(28);
  });

  it('returns 29 for February in a leap year', () => {
    expect(getDaysInMonth(2024, 1)).toBe(29);
  });
});

describe('getFirstDayOfMonth', () => {
  it('returns the correct day of week for July 2026 (Wednesday = 3)', () => {
    expect(getFirstDayOfMonth(2026, 6)).toBe(3);
  });
});
