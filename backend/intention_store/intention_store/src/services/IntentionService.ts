/**
 * Application service layer for the Intention Store.
 * Orchestrates business workflows: local-first writes, sync attempts, constraint enforcement.
 */

import { v4 as uuidv4 } from 'uuid';
import {
  IntentionRecord,
  IntentionAlreadySetError,
  IntentionNotFoundError,
  InvalidRatingError,
  TextTooLongError,
  StorageError,
  createIntentionRecord,
  applyRating,
  isValidRating,
  isValidISODate,
  MAX_INTENTION_TEXT_LENGTH,
  IntentionDomainError,
} from '../domain/Intention';
import { IntentionRepository } from '../repositories/IntentionRepository';
import {
  SaveIntentionRequest,
  SaveIntentionResponse,
  GetTodaysIntentionResponse,
  GetPreviousIntentionResponse,
  SaveEveningRatingRequest,
  SaveEveningRatingResponse,
  ListIntentionsResponse,
  IntentionDto,
} from '../types';
import { logger, logAudit } from '../config/logger';

export interface SyncAdapter {
  syncSave(record: IntentionRecord): Promise<boolean>;
  syncUpdate(record: IntentionRecord): Promise<boolean>;
}

function toDto(record: IntentionRecord): IntentionDto {
  return {
    id: record.id,
    userId: record.userId,
    date: record.date,
    text: record.text,
    rating: record.rating,
    synced: record.synced,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

export class IntentionService {
  constructor(
    private readonly localRepo: IntentionRepository,
    private readonly syncAdapter: SyncAdapter,
    private readonly now: () => string = () => new Date().toISOString(),
    private readonly generateId: () => string = uuidv4,
  ) {}

  /**
   * Save today's intention locally and attempt immediate sync.
   */
  async saveIntention(
    userId: string,
    request: SaveIntentionRequest,
    traceId: string,
  ): Promise<SaveIntentionResponse> {
    // Validate inputs
    if (!request.text || request.text.trim().length === 0) {
      throw new IntentionDomainError('VALIDATION_ERROR', 'Intention text is required.');
    }
    if (request.text.length > MAX_INTENTION_TEXT_LENGTH) {
      throw new TextTooLongError();
    }
    if (!request.date || !isValidISODate(request.date)) {
      throw new IntentionDomainError('VALIDATION_ERROR', 'date must be a valid ISO date string (YYYY-MM-DD).');
    }

    // Enforce single-intention-per-day constraint
    const existing = await this.localRepo.findByUserAndDate(userId, request.date);
    if (existing) {
      throw new IntentionAlreadySetError();
    }

    // Create the record
    const record = createIntentionRecord({
      id: this.generateId(),
      userId,
      date: request.date,
      text: request.text,
      now: this.now,
    });

    // Write to local store
    try {
      await this.localRepo.save(record);
    } catch (err) {
      logger.error('Failed to save intention to local store', { traceId, error: err });
      throw new StorageError('Failed to persist intention record locally.');
    }

    // Attempt immediate sync
    let synced = false;
    try {
      synced = await this.syncAdapter.syncSave(record);
    } catch (err) {
      logger.warn('Sync failed after local save; record queued', { traceId, error: err });
      synced = false;
    }

    // Update sync status in local store if sync succeeded
    if (synced) {
      try {
        await this.localRepo.update({ ...record, synced: true });
      } catch (err) {
        logger.warn('Failed to update sync status in local store', { traceId, error: err });
      }
    }

    logAudit({
      traceId,
      operation: 'saveIntention',
      userId,
      status: 'success',
      details: { date: request.date, synced },
    });

    return { id: record.id, synced };
  }

  /**
   * Retrieve today's intention from local store.
   */
  async getTodaysIntention(
    userId: string,
    date: string,
    traceId: string,
  ): Promise<GetTodaysIntentionResponse> {
    if (!date || !isValidISODate(date)) {
      throw new IntentionDomainError('VALIDATION_ERROR', 'date must be a valid ISO date string (YYYY-MM-DD).');
    }

    let record: IntentionRecord | null;
    try {
      record = await this.localRepo.findByUserAndDate(userId, date);
    } catch (err) {
      logger.error('Failed to read from local store', { traceId, error: err });
      throw new StorageError('Failed to read intention record from local store.');
    }

    logAudit({
      traceId,
      operation: 'getTodaysIntention',
      userId,
      status: 'success',
      details: { date, found: record !== null },
    });

    return { intention: record ? toDto(record) : null };
  }

  /**
   * Retrieve the most recent past intention before a given date.
   */
  async getPreviousIntention(
    userId: string,
    beforeDate: string,
    traceId: string,
  ): Promise<GetPreviousIntentionResponse> {
    if (!beforeDate || !isValidISODate(beforeDate)) {
      throw new IntentionDomainError('VALIDATION_ERROR', 'beforeDate must be a valid ISO date string (YYYY-MM-DD).');
    }

    let record: IntentionRecord | null;
    try {
      record = await this.localRepo.findMostRecentBefore(userId, beforeDate);
    } catch (err) {
      logger.error('Failed to read from local store', { traceId, error: err });
      throw new StorageError('Failed to read previous intention from local store.');
    }

    logAudit({
      traceId,
      operation: 'getPreviousIntention',
      userId,
      status: 'success',
      details: { beforeDate, found: record !== null },
    });

    return { intention: record ? toDto(record) : null };
  }

  /**
   * Attach an evening rating to today's intention record.
   */
  async saveEveningRating(
    userId: string,
    request: SaveEveningRatingRequest,
    traceId: string,
  ): Promise<SaveEveningRatingResponse> {
    // Validate inputs
    if (!request.date || !isValidISODate(request.date)) {
      throw new IntentionDomainError('VALIDATION_ERROR', 'date must be a valid ISO date string (YYYY-MM-DD).');
    }
    if (!request.rating || !isValidRating(request.rating)) {
      throw new InvalidRatingError();
    }

    // Find existing intention
    const existing = await this.localRepo.findByUserAndDate(userId, request.date);
    if (!existing) {
      throw new IntentionNotFoundError();
    }

    // Apply rating
    const updated = applyRating(existing, request.rating, this.now);

    // Write to local store
    try {
      await this.localRepo.update(updated);
    } catch (err) {
      logger.error('Failed to update intention in local store', { traceId, error: err });
      throw new StorageError('Failed to persist rating update locally.');
    }

    // Attempt immediate sync
    let synced = false;
    try {
      synced = await this.syncAdapter.syncUpdate(updated);
    } catch (err) {
      logger.warn('Sync failed after local rating update; record queued', { traceId, error: err });
      synced = false;
    }

    // Update sync status in local store if sync succeeded
    if (synced) {
      try {
        await this.localRepo.update({ ...updated, synced: true });
      } catch (err) {
        logger.warn('Failed to update sync status in local store after rating', { traceId, error: err });
      }
    }

    logAudit({
      traceId,
      operation: 'saveEveningRating',
      userId,
      status: 'success',
      details: { date: request.date, rating: request.rating, synced },
    });

    return { synced };
  }

  /**
   * List all intention records for the current user.
   */
  async listIntentions(
    userId: string,
    traceId: string,
  ): Promise<ListIntentionsResponse> {
    let records: IntentionRecord[];
    try {
      records = await this.localRepo.listByUser(userId);
    } catch (err) {
      logger.error('Failed to list intentions from local store', { traceId, error: err });
      throw new StorageError('Failed to list intention records from local store.');
    }

    logAudit({
      traceId,
      operation: 'listIntentions',
      userId,
      status: 'success',
      details: { count: records.length },
    });

    return { intentions: records.map(toDto) };
  }
}
