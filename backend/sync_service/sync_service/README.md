# Sync Service

Manages bidirectional synchronisation between the local IndexedDB store and
Supabase Postgres for the **DayDrop** application.

- **Port:** `8081` (hard-assigned)
- **Language:** TypeScript
- **Framework:** Express.js
- **Build tool:** npm

## Overview

The Sync Service is triggered when the device regains network connectivity or
immediately after the user completes magic-link authentication. It:

1. **Pushes** all locally pending intention and evening-rating records to Supabase Postgres.
2. **Pulls** any remote records created or updated on another device/session.
3. **Resolves conflicts** using last-write-wins (most recent `updatedAt` timestamp wins).

## API

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/sync/trigger` | Trigger a full bidirectional sync |
| `GET`  | `/health` | Liveness probe |
| `GET`  | `/health/ready` | Readiness probe |

See [`swagger/sync-service-openapi.yaml`](swagger/sync-service-openapi.yaml) for the full OpenAPI 3.1 contract.

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `SUPABASE_URL` | ✅ | Supabase project URL |
| `SUPABASE_ANON_KEY` | ✅ | Supabase anonymous API key |
| `INTENTION_STORE_BASE_URL` | ✅ | Base URL of the Intention Store service |
| `PORT` | No | HTTP port (default: `8081`) |
| `NODE_ENV` | No | Runtime environment (default: `production`) |
| `LOG_LEVEL` | No | Pino log level (default: `info`) |

> **Security:** All required variables must be set. The service fails at startup if any are missing — there are no insecure defaults.

## Quick Start

```bash
# Install dependencies
make install

# Run tests
make test

# Build
make build

# Start with Docker
make docker-run

# Stop
make docker-stop
```

## Development

```bash
# Set required env vars
export SUPABASE_URL=https://your-project.supabase.co
export SUPABASE_ANON_KEY=your-anon-key
export INTENTION_STORE_BASE_URL=http://localhost:8080

# Run in dev mode
npm run dev
```

## Testing

```bash
# Full suite with coverage
npm test

# Unit tests only
npm run test:unit

# Integration tests only
npm run test:integration

# Contract tests only
npm run test:contract
```

Coverage thresholds: branches ≥ 90%, functions ≥ 95%, lines ≥ 95%, statements ≥ 90%.

## Architecture

```
src/
├── config/          # Env config (fail-fast) + structured logger
├── domain/          # SyncRecord entity, domain errors, resolveConflict
├── application/     # SyncService — orchestrates push/pull cycle
├── infrastructure/
│   ├── supabase/    # SupabaseAdapter — calls Supabase REST API
│   └── intentionStore/ # IntentionStoreAdapter — calls sibling service
└── web/
    ├── middleware/  # requestLogger, errorHandler
    └── routes/      # syncRoutes, healthRoutes
```

## Error Codes

| Code | HTTP | Description |
|------|------|-------------|
| `SYNC_UNAUTHENTICATED` | 401 | No active Supabase session |
| `SYNC_NETWORK_ERROR` | 503 | Supabase unreachable |
| `SYNC_INTERNAL_ERROR` | 500 | Unexpected failure during sync |
