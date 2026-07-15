# Sync Service — OpenAPI Specification

`sync-service-openapi.yaml` is the **source of truth** for the Sync Service HTTP contract.
It is hand-authored per `05_OpenAPI-Spec.md` and checked into the repository.

## Regenerate consumer clients

```bash
npx @openapitools/openapi-generator-cli generate \
  -g typescript-axios \
  -i swagger/sync-service-openapi.yaml \
  -o ../frontend/src/api/sync
```

## Validate the spec

```bash
npx @apidevtools/swagger-cli validate swagger/sync-service-openapi.yaml
```

## Authoring spec

See `05_OpenAPI-Spec.md` in the workspace root for the full authoring rules and
maintenance policy.
