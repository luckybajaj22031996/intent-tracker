# Intention Store Service

**Service ID:** `intention-store-service`  
**Port:** `8080`  
**Part of:** DayDrop — a mobile-first progressive web app for setting one daily intention each morning and reflecting on it each evening.

## Overview

The Intention Store is the core data layer of DayDrop. It persists each user's daily intention text and evening rating locally (in-memory on the server, mirroring the IndexedDB pattern for the browser client) and syncs those records to Supabase Postgres when the device is online.

Key responsibilities:
- **Local-first writes** — all data is written locally before any sync attempt
- **140-character limit** — enforced at the domain layer
- **Single intention per day** — enforced at the domain layer
- **Evening ratings** — `honoured | partial | not_today`
- **Supabase sync** — immediate sync attempt on every write; graceful fallback to queued state on failure

## API

All endpoints are documented in [`swagger/intention-store-openapi.yaml`](swagger/intention-store-openapi.yaml).

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/intentions` | Save today's intention (`saveIntention`) |
| `GET` | `/api/intentions` | List all intentions (`listIntentions`) |
| `GET` | `/api/intentions/today` | Get today's intention (`getTodaysIntention`) |
| `GET` | `/api/intentions/previous` | Get previous intention (`getPreviousIntention`) |
| `PATCH` | `/api/intentions/rating` | Save evening rating (`saveEveningRating`) |
| `GET` | `/health` | Health check (unauthenticated) |

**Auth:** Supabase JWT Bearer token (magic link email auth only — no passwords, no OAuth in v1).

## Quick start

```bash
# 1. Install dependencies
npm install

# 2. Copy and fill in environment variables
cp .env.example .env
# Edit .env with your SUPABASE_URL and SUPABASE_ANON_KEY

# 3. Build
npm run build

# 4. Start (production)
npm start

# 5. Start (development, with hot reload)
npm run dev
```

## Environment variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `SUPABASE_URL` | ✅ Yes | — | Supabase project URL |
| `SUPABASE_ANON_KEY` | ✅ Yes | — | Supabase anonymous key |
| `PORT` | No | `8080` | Server port |
| `NODE_ENV` | No | `production` | Runtime environment |
| `CORS_ORIGIN` | No | `*` | CORS allowed origin |
| `LOG_LEVEL` | No | `info` | Winston log level |

The application **fails at startup** if `SUPABASE_URL` or `SUPABASE_ANON_KEY` are not set.

## Development commands

```bash
npm run build       # Compile TypeScript
npm test            # Run full test suite with coverage
npm run lint        # Run ESLint (zero warnings)
npm run typecheck   # TypeScript type check only
```

## Docker

```bash
# Build image
make docker-build

# Start service
make docker-run

# Stop service
make docker-stop
```

## Testing

```bash
npm test                    # All tests + coverage
npm run test:unit           # Unit tests only
npm run test:integration    # Integration tests only
npm run test:contract       # Contract tests only
```

Coverage thresholds: Statements ≥ 80%, Branches ≥ 80%, Functions ≥ 85%, Lines ≥ 85%.

## Project structure

```
intention_store/
├── src/
│   ├── app.ts                    # Express app factory
│   ├── index.ts                  # Service entrypoint
│   ├── config/
│   │   ├── index.ts              # Configuration (env vars)
│   │   └── logger.ts             # Winston logger + audit channel
│   ├── controllers/
│   │   ├── intentionController.ts
│   │   └── healthController.ts
│   ├── domain/
│   │   └── Intention.ts          # Domain entity, errors, value objects
│   ├── middleware/
│   │   ├── authMiddleware.ts     # Supabase JWT validation
│   │   ├── errorHandler.ts       # Centralized error handler
│   │   └── requestContext.ts     # TraceId injection
│   ├── repositories/
│   │   ├── IntentionRepository.ts          # Interface
│   │   ├── InMemoryIntentionRepository.ts  # In-memory (local-first)
│   │   └── SupabaseIntentionRepository.ts  # Supabase (sync target)
│   ├── services/
│   │   ├── IntentionService.ts    # Application service layer
│   │   └── SupabaseSyncAdapter.ts # Supabase sync adapter
│   └── types/
│       └── index.ts               # Shared TypeScript types
├── swagger/
│   ├── intention-store-openapi.yaml  # OpenAPI 3.1.0 spec (source of truth)
│   └── README.md
├── tests/
│   ├── unit/                     # Unit tests (domain, service, repo, middleware)
│   ├── integration/              # Integration tests (HTTP endpoints)
│   └── contract/                 # Contract tests (API shape verification)
├── Dockerfile
├── docker-compose.yml
├── Makefile
├── package.json
├── tsconfig.json
└── .env.example
```

## Architecture decisions

- **Local-first**: All writes go to the in-memory store first; Supabase sync is attempted immediately but failures are graceful (record stays queued with `synced: false`).
- **No custom auth server**: Authentication is entirely delegated to Supabase (magic link only).
- **Row-level security**: Supabase RLS policies ensure per-user data isolation at the database layer.
- **Layered architecture**: Controllers → Service → Repository, with domain errors mapped to HTTP status codes by the centralized error handler.
