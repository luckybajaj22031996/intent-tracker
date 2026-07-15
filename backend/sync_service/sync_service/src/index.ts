/**
 * Service entrypoint.
 * Reads config (fails fast on missing secrets), wires dependencies,
 * and starts the HTTP server on the assigned port 8081.
 */
import { config } from './config/env';
import { logger } from './config/logger';
import { createApp } from './app';
import { SyncService } from './application/SyncService';
import { SupabaseAdapter } from './infrastructure/supabase/SupabaseAdapter';
import { IntentionStoreAdapter } from './infrastructure/intentionStore/IntentionStoreAdapter';

// Fail fast: config() reads required env vars and throws if any are missing.
// This happens at module load time before the server starts.
const supabaseAdapter = new SupabaseAdapter(config.supabase.url, config.supabase.anonKey);
const intentionStoreAdapter = new IntentionStoreAdapter(config.intentionStore.baseUrl);
const syncService = new SyncService(supabaseAdapter, intentionStoreAdapter);

const app = createApp(syncService);

const server = app.listen(config.port, () => {
  logger.info({
    event: 'server_started',
    port: config.port,
    nodeEnv: config.nodeEnv,
    service: 'sync-service',
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info({ event: 'server_shutdown', reason: 'SIGTERM' });
  server.close(() => {
    logger.info({ event: 'server_closed' });
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info({ event: 'server_shutdown', reason: 'SIGINT' });
  server.close(() => {
    logger.info({ event: 'server_closed' });
    process.exit(0);
  });
});

export { app, server };
