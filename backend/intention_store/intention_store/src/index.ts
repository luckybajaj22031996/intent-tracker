/**
 * Service entrypoint.
 * Loads configuration, initialises Supabase, wires dependencies, starts the server.
 * Production-safe by default: no debug mode unless NODE_ENV=development is explicitly set.
 */

import { createClient } from '@supabase/supabase-js';
import { loadConfig } from './config';
import { createApp } from './app';
import { InMemoryIntentionRepository } from './repositories/InMemoryIntentionRepository';
import { SupabaseSyncAdapter } from './services/SupabaseSyncAdapter';
import { IntentionService } from './services/IntentionService';
import { logger } from './config/logger';

function startServer(): Promise<void> {
  return new Promise((resolve, reject) => {
    // Load and validate configuration — fails fast if required env vars are missing
    let config;
    try {
      config = loadConfig();
    } catch (err) {
      reject(err);
      return;
    }

    logger.info('Starting intention-store-service', {
      port: config.port,
      nodeEnv: config.nodeEnv,
    });

    // Initialise Supabase client
    const supabase = createClient(config.supabaseUrl, config.supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Wire dependencies
    // NOTE: In a browser context, IndexedDB would be used as the local repo.
    // In this Node.js server context, we use an in-memory store as the local repo
    // (the server acts as the API layer; the actual IndexedDB lives in the browser client).
    const localRepo = new InMemoryIntentionRepository();
    const syncAdapter = new SupabaseSyncAdapter(supabase);
    const intentionService = new IntentionService(localRepo, syncAdapter);

    const app = createApp(config, supabase, intentionService);

    const server = app.listen(config.port, () => {
      logger.info(`intention-store-service listening on port ${config.port}`);
      resolve();
    });

    server.on('error', (err) => {
      reject(err);
    });

    // Graceful shutdown
    const shutdown = (signal: string) => {
      logger.info(`Received ${signal}; shutting down gracefully`);
      server.close(() => {
        logger.info('Server closed');
        process.exit(0);
      });

      // Force exit after 10 seconds
      setTimeout(() => {
        logger.error('Forced shutdown after timeout');
        process.exit(1);
      }, 10_000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  });
}

startServer().catch((err: Error) => {
  // eslint-disable-next-line no-console
  console.error('Fatal startup error:', err.message);
  process.exit(1);
});
