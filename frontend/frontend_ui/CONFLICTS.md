# Conflicts

## API Response Shape Discrepancies

### evening-review: PATCH endpoint path
- **Markdown says**: `POST /intentions/today/rating`
- **OpenAPI spec says**: `PATCH /api/intentions/rating` with body `{ date, rating }`
- **Chosen**: OpenAPI spec (authoritative contract)
- **Reason**: OpenAPI spec is the authoritative backend contract per README.md

### calendar-history: Response envelope
- **Markdown says**: `{ "status": "success", "data": [...] }`
- **OpenAPI spec says**: `{ "intentions": [...] }` (no status wrapper)
- **Chosen**: OpenAPI spec
- **Reason**: OpenAPI spec is the authoritative backend contract

### day-detail: Endpoint
- **Markdown says**: `GET /intentions/:date`
- **OpenAPI spec**: No `/intentions/:date` endpoint exists; closest is `GET /api/intentions/today?date=YYYY-MM-DD`
- **Chosen**: Use `GET /api/intentions/today?date=` for deep-link scenario
- **Reason**: No exact match in spec; using closest available endpoint

### auth-flow: Endpoints not in scope
- **Markdown says**: `POST /auth/v1/magiclink`, `GET /auth/v1/verify`
- **OpenAPI spec**: Neither endpoint is in the provided spec files (auth service not in scope)
- **Chosen**: Stub implementations with `// TODO` comments
- **Reason**: `intention-store` and `sync-service` are the only in-scope capabilities
