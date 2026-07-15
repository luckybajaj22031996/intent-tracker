/**
 * Centralised environment configuration.
 * All required secrets/config are read from env vars with NO defaults.
 * Missing required values cause a fail-fast startup error.
 */

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function optionalEnv(name: string, fallback: string): string {
  return process.env[name] ?? fallback;
}

export const config = {
  port: parseInt(optionalEnv('PORT', '8081'), 10),
  nodeEnv: optionalEnv('NODE_ENV', 'production'),

  supabase: {
    url: requireEnv('SUPABASE_URL'),
    anonKey: requireEnv('SUPABASE_ANON_KEY'),
  },

  intentionStore: {
    baseUrl: requireEnv('INTENTION_STORE_BASE_URL'),
  },
} as const;
