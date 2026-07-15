import axios, { AxiosInstance, AxiosError } from 'axios';
import { SyncRecord } from '../../domain/SyncRecord';
import { ISupabaseAdapter } from './ISupabaseAdapter';
import { logger } from '../../config/logger';

interface SupabaseIntentionRow {
  id: string;
  user_id: string;
  type: string;
  date: string;
  content: string | null;
  rating: number | null;
  updated_at: string;
}

/**
 * Supabase REST API adapter.
 * Authenticates with the Supabase anon key + user JWT session token.
 */
export class SupabaseAdapter implements ISupabaseAdapter {
  private readonly client: AxiosInstance;

  constructor(supabaseUrl: string, anonKey: string) {
    this.client = axios.create({
      baseURL: supabaseUrl,
      timeout: 10_000,
      headers: {
        'Content-Type': 'application/json',
        apikey: anonKey,
      },
    });
  }

  async validateSession(userJwt: string): Promise<string | null> {
    try {
      const response = await this.client.get<{ id?: string }>('/auth/v1/user', {
        headers: this.authHeaders(userJwt),
      });
      return response.data?.id ?? null;
    } catch (err) {
      const axiosErr = err as AxiosError;
      if (axiosErr.response?.status === 401 || axiosErr.response?.status === 403) {
        return null;
      }
      logger.error({ event: 'supabase_validate_session_error', error: (err as Error).message });
      throw err;
    }
  }

  async recordExists(recordId: string, userJwt: string): Promise<boolean> {
    try {
      const response = await this.client.get<{ id: string }[]>('/rest/v1/intentions', {
        headers: this.authHeaders(userJwt),
        params: { id: `eq.${recordId}`, select: 'id' },
      });
      return Array.isArray(response.data) && response.data.length > 0;
    } catch (err) {
      logger.error({ event: 'supabase_record_exists_error', recordId, error: (err as Error).message });
      throw err;
    }
  }

  async createRecord(record: SyncRecord, userJwt: string): Promise<void> {
    try {
      await this.client.post('/rest/v1/intentions', this.toSupabasePayload(record), {
        headers: {
          ...this.authHeaders(userJwt),
          Prefer: 'return=minimal',
        },
      });
    } catch (err) {
      logger.error({ event: 'supabase_create_record_error', recordId: record.id, error: (err as Error).message });
      throw err;
    }
  }

  async updateRecord(record: SyncRecord, userJwt: string): Promise<void> {
    try {
      await this.client.patch('/rest/v1/intentions', this.toSupabasePayload(record), {
        headers: {
          ...this.authHeaders(userJwt),
          Prefer: 'return=minimal',
        },
        params: { id: `eq.${record.id}` },
      });
    } catch (err) {
      logger.error({ event: 'supabase_update_record_error', recordId: record.id, error: (err as Error).message });
      throw err;
    }
  }

  async fetchAllRecords(userJwt: string): Promise<SyncRecord[]> {
    try {
      const response = await this.client.get<SupabaseIntentionRow[]>('/rest/v1/intentions', {
        headers: this.authHeaders(userJwt),
        params: { select: '*', order: 'updated_at.desc' },
      });
      return response.data.map((row) => this.fromSupabaseRow(row));
    } catch (err) {
      logger.error({ event: 'supabase_fetch_records_error', error: (err as Error).message });
      throw err;
    }
  }

  private authHeaders(userJwt: string): Record<string, string> {
    return {
      Authorization: `Bearer ${userJwt}`,
    };
  }

  private toSupabasePayload(record: SyncRecord): SupabaseIntentionRow {
    return {
      id: record.id,
      user_id: record.userId,
      type: record.type,
      date: record.date,
      content: record.content ?? null,
      rating: record.rating ?? null,
      updated_at: record.updatedAt,
    };
  }

  private fromSupabaseRow(row: SupabaseIntentionRow): SyncRecord {
    return {
      id: row.id,
      userId: row.user_id,
      type: row.type as 'intention' | 'evening-rating',
      date: row.date,
      content: row.content ?? undefined,
      rating: row.rating ?? undefined,
      updatedAt: row.updated_at,
      synced: true,
    };
  }
}
