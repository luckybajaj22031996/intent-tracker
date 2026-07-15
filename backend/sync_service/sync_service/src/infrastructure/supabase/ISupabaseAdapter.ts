import { SyncRecord } from '../../domain/SyncRecord';

/**
 * Port for the Supabase external integration.
 * Implementations call Supabase REST API endpoints.
 */
export interface ISupabaseAdapter {
  /**
   * Validates the user's JWT against Supabase Auth.
   * Returns the userId if valid, null if invalid/expired.
   */
  validateSession(userJwt: string): Promise<string | null>;

  /**
   * Checks whether a record with the given id already exists in Supabase.
   */
  recordExists(recordId: string, userJwt: string): Promise<boolean>;

  /**
   * Creates a new intention or evening-rating record in Supabase.
   */
  createRecord(record: SyncRecord, userJwt: string): Promise<void>;

  /**
   * Updates an existing intention or evening-rating record in Supabase.
   */
  updateRecord(record: SyncRecord, userJwt: string): Promise<void>;

  /**
   * Fetches all intention and evening-rating records for the authenticated user.
   */
  fetchAllRecords(userJwt: string): Promise<SyncRecord[]>;
}
