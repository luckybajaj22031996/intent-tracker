/**
 * Supabase-backed implementation of IntentionRepository.
 * Reads and writes to Supabase Postgres via the REST API.
 * Used for sync operations when the device is online.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { IntentionRecord, Rating } from '../domain/Intention';
import { IntentionRepository } from './IntentionRepository';
import { StorageError } from '../domain/Intention';
import { logger } from '../config/logger';

interface SupabaseIntentionRow {
  id: string;
  user_id: string;
  date: string;
  text: string;
  rating: string | null;
  synced: boolean;
  created_at: string;
  updated_at: string | null;
}

function rowToRecord(row: SupabaseIntentionRow): IntentionRecord {
  return {
    id: row.id,
    userId: row.user_id,
    date: row.date,
    text: row.text,
    rating: (row.rating as Rating | null) ?? null,
    synced: row.synced,
    createdAt: row.created_at,
    updatedAt: row.updated_at ?? null,
  };
}

function recordToRow(record: IntentionRecord): SupabaseIntentionRow {
  return {
    id: record.id,
    user_id: record.userId,
    date: record.date,
    text: record.text,
    rating: record.rating,
    synced: record.synced,
    created_at: record.createdAt,
    updated_at: record.updatedAt,
  };
}

export class SupabaseIntentionRepository implements IntentionRepository {
  private readonly tableName = 'intentions';

  constructor(private readonly supabase: SupabaseClient) {}

  async save(record: IntentionRecord): Promise<void> {
    const row = recordToRow({ ...record, synced: true });
    const result = await this.supabase
      .from(this.tableName)
      .upsert(row, { onConflict: 'id' });
    const error = result.error;

    if (error) {
      logger.error('SupabaseIntentionRepository.save failed', { error: error.message });
      throw new StorageError(`Failed to save intention to Supabase: ${error.message}`);
    }
  }

  async findByUserAndDate(userId: string, date: string): Promise<IntentionRecord | null> {
    const result = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('user_id', userId)
      .eq('date', date)
      .maybeSingle();
    const { error } = result;
    const data = result.data as SupabaseIntentionRow | null;

    if (error) {
      logger.error('SupabaseIntentionRepository.findByUserAndDate failed', {
        error: error.message,
      });
      throw new StorageError(`Failed to query intention from Supabase: ${error.message}`);
    }

    return data ? rowToRecord(data) : null;
  }

  async findMostRecentBefore(userId: string, beforeDate: string): Promise<IntentionRecord | null> {
    const result = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('user_id', userId)
      .lt('date', beforeDate)
      .order('date', { ascending: false })
      .limit(1)
      .maybeSingle();
    const { error } = result;
    const data = result.data as SupabaseIntentionRow | null;

    if (error) {
      logger.error('SupabaseIntentionRepository.findMostRecentBefore failed', {
        error: error.message,
      });
      throw new StorageError(`Failed to query previous intention from Supabase: ${error.message}`);
    }

    return data ? rowToRecord(data) : null;
  }

  async update(record: IntentionRecord): Promise<void> {
    const row = recordToRow({ ...record, synced: true });
    const result = await this.supabase
      .from(this.tableName)
      .update({
        rating: row.rating,
        synced: row.synced,
        updated_at: row.updated_at,
      })
      .eq('id', record.id)
      .eq('user_id', record.userId);
    const error = result.error;

    if (error) {
      logger.error('SupabaseIntentionRepository.update failed', { error: error.message });
      throw new StorageError(`Failed to update intention in Supabase: ${error.message}`);
    }
  }

  async listByUser(userId: string): Promise<IntentionRecord[]> {
    const result = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: true });
    const { error } = result;
    const data = result.data as SupabaseIntentionRow[] | null;

    if (error) {
      logger.error('SupabaseIntentionRepository.listByUser failed', { error: error.message });
      throw new StorageError(`Failed to list intentions from Supabase: ${error.message}`);
    }

    return (data ?? []).map(rowToRecord);
  }
}
