/**
 * In-memory implementation of IntentionRepository.
 * Used for testing and as a fallback when IndexedDB is not available.
 */

import { IntentionRecord } from '../domain/Intention';
import { IntentionRepository } from './IntentionRepository';

export class InMemoryIntentionRepository implements IntentionRepository {
  private store: Map<string, IntentionRecord> = new Map();

  private makeKey(userId: string, date: string): string {
    return `${userId}::${date}`;
  }

  async save(record: IntentionRecord): Promise<void> {
    const key = this.makeKey(record.userId, record.date);
    this.store.set(key, { ...record });
  }

  async findByUserAndDate(userId: string, date: string): Promise<IntentionRecord | null> {
    const key = this.makeKey(userId, date);
    const record = this.store.get(key);
    return record ? { ...record } : null;
  }

  async findMostRecentBefore(userId: string, beforeDate: string): Promise<IntentionRecord | null> {
    const userRecords = Array.from(this.store.values()).filter(
      (r) => r.userId === userId && r.date < beforeDate,
    );

    if (userRecords.length === 0) return null;

    userRecords.sort((a, b) => b.date.localeCompare(a.date));
    return { ...userRecords[0] };
  }

  async update(record: IntentionRecord): Promise<void> {
    const key = this.makeKey(record.userId, record.date);
    if (!this.store.has(key)) {
      throw new Error(`Record not found for userId=${record.userId}, date=${record.date}`);
    }
    this.store.set(key, { ...record });
  }

  async listByUser(userId: string): Promise<IntentionRecord[]> {
    const userRecords = Array.from(this.store.values())
      .filter((r) => r.userId === userId)
      .sort((a, b) => a.date.localeCompare(b.date));
    return userRecords.map((r) => ({ ...r }));
  }

  /**
   * Clear all records (for test teardown).
   */
  clear(): void {
    this.store.clear();
  }
}
