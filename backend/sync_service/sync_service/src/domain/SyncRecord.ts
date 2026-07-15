/**
 * Domain entity representing a single intention or evening-rating record
 * that participates in the sync cycle.
 */
export type RecordType = 'intention' | 'evening-rating';

export interface SyncRecord {
  id: string;
  userId: string;
  type: RecordType;
  date: string; // ISO date string YYYY-MM-DD
  content?: string; // intention text (max 140 chars)
  rating?: number; // evening rating 1-5
  updatedAt: string; // ISO 8601 datetime — used for last-write-wins
  synced: boolean; // true if already pushed to Supabase
}

/**
 * Value object representing the result of a completed sync cycle.
 */
export interface SyncResult {
  pushed: number;
  pulled: number;
}

/**
 * Domain exception: no active Supabase session when sync is attempted.
 */
export class SyncUnauthenticatedError extends Error {
  public readonly code = 'SYNC_UNAUTHENTICATED';
  constructor() {
    super('No active Supabase session exists; Sign in to sync your data.');
    this.name = 'SyncUnauthenticatedError';
  }
}

/**
 * Domain exception: Supabase could not be reached during the sync attempt.
 */
export class SyncNetworkError extends Error {
  public readonly code = 'SYNC_NETWORK_ERROR';
  constructor(cause?: Error) {
    super('Supabase could not be reached during the sync attempt.');
    this.name = 'SyncNetworkError';
    if (cause) {
      this.stack = `${this.stack}\nCaused by: ${cause.stack}`;
    }
  }
}

/**
 * Domain exception: an unexpected failure occurred during push or pull phase.
 */
export class SyncInternalError extends Error {
  public readonly code = 'SYNC_INTERNAL_ERROR';
  constructor(message: string, cause?: Error) {
    super(message);
    this.name = 'SyncInternalError';
    if (cause) {
      this.stack = `${this.stack}\nCaused by: ${cause.stack}`;
    }
  }
}

/**
 * Applies last-write-wins conflict resolution between a local and remote record.
 * Returns the record with the more recent updatedAt timestamp.
 */
export function resolveConflict(local: SyncRecord, remote: SyncRecord): SyncRecord {
  const localTime = new Date(local.updatedAt).getTime();
  const remoteTime = new Date(remote.updatedAt).getTime();
  return remoteTime >= localTime ? remote : local;
}
