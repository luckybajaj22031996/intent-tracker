import {
  SyncRecord,
  SyncResult,
  SyncUnauthenticatedError,
  SyncNetworkError,
  SyncInternalError,
  resolveConflict,
} from '../domain/SyncRecord';
import { ISupabaseAdapter } from '../infrastructure/supabase/ISupabaseAdapter';
import { IIntentionStoreAdapter } from '../infrastructure/intentionStore/IIntentionStoreAdapter';
import { logger, auditLogger } from '../config/logger';

export interface ISyncService {
  triggerSync(userJwt: string): Promise<SyncResult>;
}

export class SyncService implements ISyncService {
  constructor(
    private readonly supabaseAdapter: ISupabaseAdapter,
    private readonly intentionStoreAdapter: IIntentionStoreAdapter,
  ) {}

  async triggerSync(userJwt: string): Promise<SyncResult> {
    // Validate session
    const session = await this.supabaseAdapter.validateSession(userJwt);
    if (!session) {
      throw new SyncUnauthenticatedError();
    }

    let pushed = 0;
    let pulled = 0;

    // --- PUSH PHASE: local → Supabase ---
    let localRecords: SyncRecord[];
    try {
      localRecords = await this.intentionStoreAdapter.listPendingRecords();
    } catch (err) {
      throw new SyncInternalError('Failed to retrieve pending local records', err as Error);
    }

    for (const record of localRecords) {
      try {
        const exists = await this.supabaseAdapter.recordExists(record.id, userJwt);
        if (exists) {
          await this.supabaseAdapter.updateRecord(record, userJwt);
        } else {
          await this.supabaseAdapter.createRecord(record, userJwt);
        }
        await this.intentionStoreAdapter.markSynced(record.id);
        pushed++;
        auditLogger.info({
          event: 'record_pushed',
          recordId: record.id,
          recordType: record.type,
        });
      } catch (err) {
        if (isNetworkError(err)) {
          throw new SyncNetworkError(err as Error);
        }
        throw new SyncInternalError(`Failed to push record ${record.id}`, err as Error);
      }
    }

    // --- PULL PHASE: Supabase → local ---
    let remoteRecords: SyncRecord[];
    try {
      remoteRecords = await this.supabaseAdapter.fetchAllRecords(userJwt);
    } catch (err) {
      if (isNetworkError(err)) {
        throw new SyncNetworkError(err as Error);
      }
      throw new SyncInternalError('Failed to fetch remote records', err as Error);
    }

    for (const remote of remoteRecords) {
      try {
        const local = await this.intentionStoreAdapter.getRecord(remote.id);
        if (local) {
          const winner = resolveConflict(local, remote);
          if (winner === remote) {
            // Remote wins — write back to local store
            await this.writeRemoteToLocal(remote);
            pulled++;
          }
          // If local wins, no action needed — local is already correct
        } else {
          // Record doesn't exist locally — pull it in
          await this.writeRemoteToLocal(remote);
          pulled++;
        }
        auditLogger.info({
          event: 'record_pulled',
          recordId: remote.id,
          recordType: remote.type,
        });
      } catch (err) {
        if (isNetworkError(err)) {
          throw new SyncNetworkError(err as Error);
        }
        throw new SyncInternalError(`Failed to pull record ${remote.id}`, err as Error);
      }
    }

    logger.info({ event: 'sync_complete', pushed, pulled });
    return { pushed, pulled };
  }

  private async writeRemoteToLocal(record: SyncRecord): Promise<void> {
    if (record.type === 'intention') {
      await this.intentionStoreAdapter.saveIntention(record);
    } else if (record.type === 'evening-rating') {
      await this.intentionStoreAdapter.saveEveningRating(record);
    }
  }
}

function isNetworkError(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  const networkCodes = ['ECONNREFUSED', 'ENOTFOUND', 'ETIMEDOUT', 'ECONNRESET', 'EHOSTUNREACH'];
  return networkCodes.some(
    (code) => err.message.includes(code) || (err as NodeJS.ErrnoException).code === code,
  );
}
