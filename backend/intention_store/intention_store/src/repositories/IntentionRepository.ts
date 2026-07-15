/**
 * Repository interface for intention records.
 * Abstracts the underlying storage (IndexedDB or in-memory for tests).
 */

import { IntentionRecord } from '../domain/Intention';

export interface IntentionRepository {
  /**
   * Save a new intention record.
   */
  save(record: IntentionRecord): Promise<void>;

  /**
   * Find an intention record by userId and date.
   */
  findByUserAndDate(userId: string, date: string): Promise<IntentionRecord | null>;

  /**
   * Find the most recent intention record before a given date for a user.
   */
  findMostRecentBefore(userId: string, beforeDate: string): Promise<IntentionRecord | null>;

  /**
   * Update an existing intention record.
   */
  update(record: IntentionRecord): Promise<void>;

  /**
   * List all intention records for a user, ordered by date ascending.
   */
  listByUser(userId: string): Promise<IntentionRecord[]>;
}
