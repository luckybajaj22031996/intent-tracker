import axios, { AxiosInstance } from 'axios';
import { SyncRecord } from '../../domain/SyncRecord';
import { IIntentionStoreAdapter } from './IIntentionStoreAdapter';
import { logger } from '../../config/logger';

interface IntentionStoreListResponse {
  intentions?: SyncRecord[];
}

/**
 * HTTP adapter for the Intention Store sibling service (port 8080).
 * Calls the declared APIs: listIntentions, saveIntention, saveEveningRating.
 */
export class IntentionStoreAdapter implements IIntentionStoreAdapter {
  private readonly client: AxiosInstance;

  constructor(intentionStoreBaseUrl: string) {
    this.client = axios.create({
      baseURL: intentionStoreBaseUrl,
      timeout: 10_000,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  async listPendingRecords(): Promise<SyncRecord[]> {
    try {
      const response = await this.client.get<IntentionStoreListResponse>('/intentions', {
        params: { synced: false },
      });
      return response.data?.intentions ?? [];
    } catch (err) {
      logger.error({ event: 'intention_store_list_error', error: (err as Error).message });
      throw err;
    }
  }

  async getRecord(id: string): Promise<SyncRecord | null> {
    try {
      const response = await this.client.get<SyncRecord | null>(`/intentions/${id}`);
      return response.data ?? null;
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.status === 404) {
        return null;
      }
      logger.error({ event: 'intention_store_get_error', id, error: (err as Error).message });
      throw err;
    }
  }

  async markSynced(id: string): Promise<void> {
    try {
      await this.client.patch(`/intentions/${id}`, { synced: true });
    } catch (err) {
      logger.error({ event: 'intention_store_mark_synced_error', id, error: (err as Error).message });
      throw err;
    }
  }

  async saveIntention(record: SyncRecord): Promise<void> {
    try {
      await this.client.post('/intentions', {
        id: record.id,
        userId: record.userId,
        date: record.date,
        content: record.content,
        updatedAt: record.updatedAt,
        synced: true,
      });
    } catch (err) {
      logger.error({ event: 'intention_store_save_intention_error', recordId: record.id, error: (err as Error).message });
      throw err;
    }
  }

  async saveEveningRating(record: SyncRecord): Promise<void> {
    try {
      await this.client.post('/intentions/evening-rating', {
        id: record.id,
        userId: record.userId,
        date: record.date,
        rating: record.rating,
        updatedAt: record.updatedAt,
        synced: true,
      });
    } catch (err) {
      logger.error({ event: 'intention_store_save_rating_error', recordId: record.id, error: (err as Error).message });
      throw err;
    }
  }
}
