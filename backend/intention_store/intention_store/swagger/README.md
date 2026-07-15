# Intention Store — OpenAPI Specification

This directory contains the hand-authored OpenAPI 3.1.0 contract for the **Intention Store** service (`intention-store-service`). It is the source of truth for all API consumers: the frontend client, integration tests, and the mock server.

## File

- `intention-store-openapi.yaml` — OpenAPI 3.1.0 specification for all five endpoints declared in `01_Service-Context.md`.

## Regenerate consumer clients

```bash
# TypeScript/Axios client (frontend)
npx @openapitools/openapi-generator-cli generate \
  -g typescript-axios \
  -i swagger/intention-store-openapi.yaml \
  -o ../frontend/src/api/intention-store

# Validate the spec
npx @apidevtools/swagger-cli validate swagger/intention-store-openapi.yaml
```

## Authoring spec

This file was authored following the rules in `05_OpenAPI-Spec.md`. Any new endpoint added in code must also be added here in the same change. Any change to a request or response shape must bump `info.version`.
