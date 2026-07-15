import { z } from 'zod';

export const SyncResultSchema = z.object({
  pushed: z.number().int().min(0),
  pulled: z.number().int().min(0),
});

export type SyncResult = z.infer<typeof SyncResultSchema>;

export const SyncHealthResponseSchema = z.object({
  status: z.enum(['ok', 'ready']),
  service: z.string(),
});

export type SyncHealthResponse = z.infer<typeof SyncHealthResponseSchema>;
