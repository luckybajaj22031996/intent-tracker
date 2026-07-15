/**
 * Structured logger using Winston.
 * Separate audit channel from application logs.
 */

import winston from 'winston';

const { combine, timestamp, json, errors } = winston.format;

const appLogger = winston.createLogger({
  level: process.env['LOG_LEVEL'] ?? 'info',
  format: combine(
    errors({ stack: true }),
    timestamp(),
    json(),
  ),
  defaultMeta: { service: 'intention-store-service' },
  transports: [
    new winston.transports.Console({
      silent: process.env['NODE_ENV'] === 'test',
    }),
  ],
});

const auditLogger = winston.createLogger({
  level: 'info',
  format: combine(timestamp(), json()),
  defaultMeta: { service: 'intention-store-service', channel: 'audit' },
  transports: [
    new winston.transports.Console({
      silent: process.env['NODE_ENV'] === 'test',
    }),
  ],
});

export function logAudit(params: {
  traceId: string;
  operation: string;
  userId?: string;
  status: 'success' | 'failure' | 'retry';
  details?: Record<string, unknown>;
}): void {
  auditLogger.info('audit', {
    ...params,
    // Mask any sensitive fields
    userId: params.userId ? `[user:${params.userId.substring(0, 8)}...]` : undefined,
  });
}

export { appLogger as logger };
