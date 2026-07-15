/**
 * Unit tests — Config module.
 */

import { loadConfig, resetConfig } from '../../../src/config';

describe('loadConfig', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    resetConfig();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
    resetConfig();
  });

  it('loads config successfully when all required env vars are set', () => {
    process.env['SUPABASE_URL'] = 'https://test.supabase.co';
    process.env['SUPABASE_ANON_KEY'] = 'test-anon-key';
    process.env['PORT'] = '8080';
    process.env['NODE_ENV'] = 'test';

    const config = loadConfig();
    expect(config.supabaseUrl).toBe('https://test.supabase.co');
    expect(config.supabaseAnonKey).toBe('test-anon-key');
    expect(config.port).toBe(8080);
    expect(config.nodeEnv).toBe('test');
  });

  it('throws when SUPABASE_URL is missing', () => {
    delete process.env['SUPABASE_URL'];
    process.env['SUPABASE_ANON_KEY'] = 'test-anon-key';
    expect(() => loadConfig()).toThrow('SUPABASE_URL');
  });

  it('throws when SUPABASE_ANON_KEY is missing', () => {
    process.env['SUPABASE_URL'] = 'https://test.supabase.co';
    delete process.env['SUPABASE_ANON_KEY'];
    expect(() => loadConfig()).toThrow('SUPABASE_ANON_KEY');
  });

  it('defaults PORT to 8080 when not set', () => {
    process.env['SUPABASE_URL'] = 'https://test.supabase.co';
    process.env['SUPABASE_ANON_KEY'] = 'test-anon-key';
    delete process.env['PORT'];
    const config = loadConfig();
    expect(config.port).toBe(8080);
  });

  it('defaults NODE_ENV to production when not set', () => {
    process.env['SUPABASE_URL'] = 'https://test.supabase.co';
    process.env['SUPABASE_ANON_KEY'] = 'test-anon-key';
    delete process.env['NODE_ENV'];
    const config = loadConfig();
    expect(config.nodeEnv).toBe('production');
  });

  it('returns cached config on second call', () => {
    process.env['SUPABASE_URL'] = 'https://test.supabase.co';
    process.env['SUPABASE_ANON_KEY'] = 'test-anon-key';
    const config1 = loadConfig();
    const config2 = loadConfig();
    expect(config1).toBe(config2);
  });

  it('uses custom CORS_ORIGIN when set', () => {
    process.env['SUPABASE_URL'] = 'https://test.supabase.co';
    process.env['SUPABASE_ANON_KEY'] = 'test-anon-key';
    process.env['CORS_ORIGIN'] = 'https://app.example.com';
    const config = loadConfig();
    expect(config.corsOrigin).toBe('https://app.example.com');
  });
});
