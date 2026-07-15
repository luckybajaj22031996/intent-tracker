/**
 * Shared TypeScript types for the Intention Store service.
 */

export interface ErrorEnvelope {
  errorCode: string;
  message: string;
  timestamp: string;
  traceId: string;
  details?: ValidationDetail[];
}

export interface ValidationDetail {
  field: string;
  message: string;
}

export interface SaveIntentionRequest {
  text: string;
  date: string;
}

export interface SaveIntentionResponse {
  id: string;
  synced: boolean;
}

export interface GetTodaysIntentionRequest {
  date: string;
}

export interface GetTodaysIntentionResponse {
  intention: IntentionDto | null;
}

export interface GetPreviousIntentionRequest {
  beforeDate: string;
}

export interface GetPreviousIntentionResponse {
  intention: IntentionDto | null;
}

export interface SaveEveningRatingRequest {
  date: string;
  rating: string;
}

export interface SaveEveningRatingResponse {
  synced: boolean;
}

export interface ListIntentionsResponse {
  intentions: IntentionDto[];
}

export interface IntentionDto {
  id: string;
  userId: string;
  date: string;
  text: string;
  rating: string | null;
  synced: boolean;
  createdAt: string;
  updatedAt: string | null;
}
