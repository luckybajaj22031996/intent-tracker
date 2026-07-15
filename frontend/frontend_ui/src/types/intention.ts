import { z } from 'zod';

// ─── Enums ───────────────────────────────────────────────────────────────────

export const RatingSchema = z.enum(['honoured', 'partial', 'not_today']);
export type Rating = z.infer<typeof RatingSchema>;

// ─── Core record ─────────────────────────────────────────────────────────────

export const IntentionRecordSchema = z.object({
  id: z.string().uuid(),
  userId: z.string(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  text: z.string().max(140),
  rating: RatingSchema.nullable(),
  synced: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string().nullable(),
});

export type IntentionRecord = z.infer<typeof IntentionRecordSchema>;

// ─── Request schemas ──────────────────────────────────────────────────────────

export const SaveIntentionRequestSchema = z.object({
  text: z.string().min(1).max(140),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export type SaveIntentionRequest = z.infer<typeof SaveIntentionRequestSchema>;

export const SaveEveningRatingRequestSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  rating: RatingSchema,
});

export type SaveEveningRatingRequest = z.infer<typeof SaveEveningRatingRequestSchema>;

// ─── Response schemas ─────────────────────────────────────────────────────────

export const SaveIntentionResponseSchema = z.object({
  id: z.string().uuid(),
  synced: z.boolean(),
});

export type SaveIntentionResponse = z.infer<typeof SaveIntentionResponseSchema>;

export const GetTodaysIntentionResponseSchema = z.object({
  intention: IntentionRecordSchema.nullable(),
});

export type GetTodaysIntentionResponse = z.infer<typeof GetTodaysIntentionResponseSchema>;

export const GetPreviousIntentionResponseSchema = z.object({
  intention: IntentionRecordSchema.nullable(),
});

export type GetPreviousIntentionResponse = z.infer<typeof GetPreviousIntentionResponseSchema>;

export const SaveEveningRatingResponseSchema = z.object({
  synced: z.boolean(),
});

export type SaveEveningRatingResponse = z.infer<typeof SaveEveningRatingResponseSchema>;

export const ListIntentionsResponseSchema = z.object({
  intentions: z.array(IntentionRecordSchema),
});

export type ListIntentionsResponse = z.infer<typeof ListIntentionsResponseSchema>;

// ─── Error envelope ───────────────────────────────────────────────────────────

export const ErrorEnvelopeSchema = z.object({
  errorCode: z.string(),
  message: z.string(),
  timestamp: z.string(),
  traceId: z.string(),
  details: z
    .array(
      z.object({
        field: z.string(),
        message: z.string(),
      }),
    )
    .optional(),
});

export type ErrorEnvelope = z.infer<typeof ErrorEnvelopeSchema>;

// ─── API error (normalised by interceptor) ────────────────────────────────────

export interface ApiError {
  status?: number;
  code?: string;
  message: string;
}
