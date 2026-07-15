/**
 * Configuration module — reads from environment variables.
 * All required secrets must be present; missing values cause startup failure.
 */

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `[Config] Required environment variable "${name}" is not set. ` +
        'The application cannot start without it.',
    );
  }
  return value;
}

function optionalEnv(name: string, defaultValue: string): string {
  return process.env[name] ?? defaultValue;
}

export interface AppConfig {
  port: number;
  nodeEnv: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
  corsOrigin: string;
  logLevel: string;
}

let _config: AppConfig | null = null;

export function loadConfig(): AppConfig {
  if (_config) return _config;

  _config = {
    port: parseInt(optionalEnv('PORT', '8080'), 10),
    nodeEnv: optionalEnv('NODE_ENV', 'production'),
    supabaseUrl: requireEnv('SUPABASE_URL'),
    supabaseAnonKey: requireEnv('SUPABASE_ANON_KEY'),
    corsOrigin: optionalEnv('CORS_ORIGIN', '*'),
    logLevel: optionalEnv('LOG_LEVEL', 'info'),
  };

  return _config;
}

/**
 * Reset config (for testing purposes only).
 */
export function resetConfig(): void {
  _config = null;
}
