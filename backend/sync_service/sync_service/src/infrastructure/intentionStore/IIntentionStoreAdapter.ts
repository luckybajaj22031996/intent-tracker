import { SyncRecord } from '../../domain/SyncRecord';

/**
 * Port for the Intention Store sibling service.
 * In the browser context this is a direct method call to the client-side
 * service layer. In the Node/Express context (this service) it is an
 * HTTP call to the intention-store-service at port 8080.
 */
export interface IIntentionStoreAdapter {
  /**
   * Returns all local records that have not yet been pushed to Supabase.
   * Maps to CALL listIntentions on the Intention Store.
   */
  listPendingRecords(): Promise<SyncRecord[]>;

  /**
   * Returns a single local record by id, or null if not found.
   */
  getRecord(id: string): Promise<SyncRecord | null>;

  /**
   * Marks a local record as synced so it is not pushed again.
   */
  markSynced(id: string): Promise<void>;

  /**
   * Writes a remote intention record back into the local store.
   * Maps to CALL saveIntention on the Intention Store.
   */
  saveIntention(record: SyncRecord): Promise<void>;

  /**
   * Writes a remote evening-rating record back into the local store.
   * Maps to CALL saveEveningRating on the Intention Store.
   */
  saveEveningRating(record: SyncRecord): Promise<void>;
}
