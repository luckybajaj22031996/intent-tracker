/**
 * Domain entity: Intention
 * Represents a single daily intention record with optional evening rating.
 */

export type Rating = 'honoured' | 'partial' | 'not_today';

export const VALID_RATINGS: Rating[] = ['honoured', 'partial', 'not_today'];

export const MAX_INTENTION_TEXT_LENGTH = 140;

export interface IntentionRecord {
  id: string;
  userId: string;
  date: string; // ISO date string YYYY-MM-DD
  text: string;
  rating: Rating | null;
  synced: boolean;
  createdAt: string; // ISO timestamp
  updatedAt: string | null; // ISO timestamp
}

/**
 * Domain errors for the Intention entity.
 */
export class IntentionDomainError extends Error {
  constructor(
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = 'IntentionDomainError';
    Object.setPrototypeOf(this, IntentionDomainError.prototype);
  }
}

export class IntentionAlreadySetError extends IntentionDomainError {
  constructor() {
    super('INTENTION_ALREADY_SET', 'You have already set today\'s intention.');
    this.name = 'IntentionAlreadySetError';
    Object.setPrototypeOf(this, IntentionAlreadySetError.prototype);
  }
}

export class TextTooLongError extends IntentionDomainError {
  constructor() {
    super('TEXT_TOO_LONG', 'Intention must be 140 characters or fewer.');
    this.name = 'TextTooLongError';
    Object.setPrototypeOf(this, TextTooLongError.prototype);
  }
}

export class IntentionNotFoundError extends IntentionDomainError {
  constructor() {
    super('INTENTION_NOT_FOUND', 'No intention found for today.');
    this.name = 'IntentionNotFoundError';
    Object.setPrototypeOf(this, IntentionNotFoundError.prototype);
  }
}

export class InvalidRatingError extends IntentionDomainError {
  constructor() {
    super('INVALID_RATING', 'Rating must be honoured, partial, or not_today.');
    this.name = 'InvalidRatingError';
    Object.setPrototypeOf(this, InvalidRatingError.prototype);
  }
}

export class StorageError extends IntentionDomainError {
  constructor(message: string) {
    super('STORAGE_ERROR', message);
    this.name = 'StorageError';
    Object.setPrototypeOf(this, StorageError.prototype);
  }
}

/**
 * Validates an ISO date string (YYYY-MM-DD).
 */
export function isValidISODate(date: string): boolean {
  if (typeof date !== 'string') return false;
  const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/;
  if (!isoDatePattern.test(date)) return false;
  const parsed = new Date(date);
  return !isNaN(parsed.getTime()) && parsed.toISOString().startsWith(date);
}

/**
 * Validates a rating value.
 */
export function isValidRating(rating: string): rating is Rating {
  return VALID_RATINGS.includes(rating as Rating);
}

/**
 * Validates intention text.
 */
export function validateIntentionText(text: string): void {
  if (!text || text.trim().length === 0) {
    throw new IntentionDomainError('VALIDATION_ERROR', 'Intention text is required.');
  }
  if (text.length > MAX_INTENTION_TEXT_LENGTH) {
    throw new TextTooLongError();
  }
}

/**
 * Creates a new IntentionRecord value object.
 */
export function createIntentionRecord(params: {
  id: string;
  userId: string;
  date: string;
  text: string;
  now: () => string;
}): IntentionRecord {
  validateIntentionText(params.text);

  return {
    id: params.id,
    userId: params.userId,
    date: params.date,
    text: params.text,
    rating: null,
    synced: false,
    createdAt: params.now(),
    updatedAt: null,
  };
}

/**
 * Applies an evening rating to an existing IntentionRecord.
 */
export function applyRating(
  record: IntentionRecord,
  rating: string,
  now: () => string,
): IntentionRecord {
  if (!isValidRating(rating)) {
    throw new InvalidRatingError();
  }
  return {
    ...record,
    rating,
    synced: false,
    updatedAt: now(),
  };
}
