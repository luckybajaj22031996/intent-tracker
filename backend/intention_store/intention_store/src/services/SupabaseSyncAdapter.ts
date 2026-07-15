/**
 * Supabase sync adapter.
 * Attempts to sync local intention records to Supabase Postgres.
 * Returns true on success, false on failure (offline / error).
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { IntentionRecord } from '../domain/Intention';
import { SyncAdapter } from './IntentionService';
import { logger } from '../config/logger';

export class SupabaseSyncAdapter implements SyncAdapter {
  constructor(private readonly supabase: SupabaseClient) {}

  async syncSave(record: IntentionRecord): Promise<boolean> {
    try {
      const { error } = await this.supabase.from('intentions').upsert(
        {
          id: record.id,
          user_id: record.userId,
          date: record.date,
          text: record.text,
          rating: record.rating,
          synced: true,
          created_at: record.createdAt,
          updated_at: record.updatedAt,
        },
        { onConflict: 'id' },
      );

      if (error) {
        logger.warn('SupabaseSyncAdapter.syncSave: Supabase error', { error: error.message });
        return false;
      }

      return true;
    } catch (err) {
      logger.warn('SupabaseSyncAdapter.syncSave: network or unexpected error', { error: err });
      return false;
    }
  }

  async syncUpdate(record: IntentionRecord): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('intentions')
        .update({
          rating: record.rating,
          synced: true,
          updated_at: record.updatedAt ?? new Date().toISOString(),
        })
        .eq('id', record.id)
        .eq('user_id', record.userId);

      if (error) {
        logger.warn('SupabaseSyncAdapter.syncUpdate: Supabase error', { error: error.message });
        return false;
      }

      return true;
    } catch (err) {
      logger.warn('SupabaseSyncAdapter.syncUpdate: network or unexpected error', { error: err });
      return false;
    }
  }
}
