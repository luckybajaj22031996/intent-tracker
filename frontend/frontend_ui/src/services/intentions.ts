import { intentionApi } from '@/lib/api';
import {
  GetPreviousIntentionResponseSchema,
  GetTodaysIntentionResponseSchema,
  ListIntentionsResponseSchema,
  SaveEveningRatingRequestSchema,
  SaveEveningRatingResponseSchema,
  SaveIntentionRequestSchema,
  SaveIntentionResponseSchema,
  type GetPreviousIntentionResponse,
  type GetTodaysIntentionResponse,
  type ListIntentionsResponse,
  type SaveEveningRatingRequest,
  type SaveEveningRatingResponse,
  type SaveIntentionRequest,
  type SaveIntentionResponse,
} from '@/types/intention';

/**
 * POST /api/intentions
 * Persist today's intention text locally and queue for Supabase sync.
 */
export async function saveIntention(
  payload: SaveIntentionRequest,
): Promise<SaveIntentionResponse> {
  const validated = SaveIntentionRequestSchema.parse(payload);
  const data = await intentionApi.post<unknown, SaveIntentionResponse>(
    '/api/intentions',
    validated,
  );
  return SaveIntentionResponseSchema.parse(data);
}

/**
 * GET /api/intentions/today?date=YYYY-MM-DD
 * Retrieve today's intention record from the local store.
 */
export async function getTodaysIntention(
  date: string,
): Promise<GetTodaysIntentionResponse> {
  const data = await intentionApi.get<unknown, GetTodaysIntentionResponse>(
    '/api/intentions/today',
    { params: { date } },
  );
  return GetTodaysIntentionResponseSchema.parse(data);
}

/**
 * GET /api/intentions/previous?beforeDate=YYYY-MM-DD
 * Retrieve the most recent past intention before the given date.
 */
export async function getPreviousIntention(
  beforeDate: string,
): Promise<GetPreviousIntentionResponse> {
  const data = await intentionApi.get<unknown, GetPreviousIntentionResponse>(
    '/api/intentions/previous',
    { params: { beforeDate } },
  );
  return GetPreviousIntentionResponseSchema.parse(data);
}

/**
 * PATCH /api/intentions/rating
 * Attach an evening rating to today's intention record.
 */
export async function saveEveningRating(
  payload: SaveEveningRatingRequest,
): Promise<SaveEveningRatingResponse> {
  const validated = SaveEveningRatingRequestSchema.parse(payload);
  const data = await intentionApi.patch<unknown, SaveEveningRatingResponse>(
    '/api/intentions/rating',
    validated,
  );
  return SaveEveningRatingResponseSchema.parse(data);
}

/**
 * GET /api/intentions
 * Return all intention records for the current user.
 */
export async function listIntentions(): Promise<ListIntentionsResponse> {
  const data = await intentionApi.get<unknown, ListIntentionsResponse>(
    '/api/intentions',
  );
  return ListIntentionsResponseSchema.parse(data);
}
