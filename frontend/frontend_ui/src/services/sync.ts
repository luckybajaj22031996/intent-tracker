import { syncApi } from '@/lib/api';
import { SyncResultSchema, type SyncResult } from '@/types/sync';

/**
 * POST /sync/trigger
 * Initiates a full bidirectional sync of pending local IndexedDB changes
 * to Supabase Postgres and pulls any remote changes back.
 */
export async function triggerSync(): Promise<SyncResult> {
  const data = await syncApi.post<unknown, SyncResult>('/sync/trigger', {});
  return SyncResultSchema.parse(data);
}
