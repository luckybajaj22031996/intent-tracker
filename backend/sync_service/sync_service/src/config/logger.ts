import pino from 'pino';

/**
 * Application logger — structured JSON output.
 */
export const logger = pino({
  name: 'sync-service',
  level: process.env['LOG_LEVEL'] ?? 'info',
  redact: ['req.headers.authorization', 'userJwt', 'jwt', 'token'],
});

/**
 * Dedicated audit channel — separate stream for compliance/audit events.
 * Structured entries include timestamp and traceId automatically via pino.
 */
export const auditLogger = pino({
  name: 'sync-service-audit',
  level: 'info',
  redact: ['req.headers.authorization', 'userJwt', 'jwt', 'token'],
});
