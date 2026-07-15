# OpenAPI Specifications

This directory contains the OpenAPI/Swagger spec files for all backend services.
Specs are sourced from each service's `swagger/` folder after backend code generation.

## How to use these specs

For every API call in a user story, locate the matching endpoint in the spec files
here and implement the integration **exactly as the spec defines** — request shape,
response shape, headers, and error codes must all match the contract precisely.

**Zero contract mismatch is required.** Do not invent request fields, assume response
fields, or approximate types. If the spec says a field is a string, treat it as a
string. If the spec defines specific error codes, handle them. Any deviation between
the UI integration and the spec is a bug.

## Finding the right spec file

Spec files are named after the service that generated them, e.g.
`learner_service.openapi.yml`, `skills_intelligence_service.openapi.yml`.

Sometimes two or more services are merged into one before code generation. In that
case a single spec file will cover endpoints from multiple original services and its
filename may reflect the combined name, e.g. `learner_service_skills_service.openapi.yml`.

**Match by endpoint path and HTTP method, not by filename.** If a user story references
"Learner Service POST /learners/resume" but you do not find a file named
`learner_service.openapi.yml`, search all spec files in this directory for
`POST /learners/resume` — the endpoint will be present in whichever file covers that
service, including a merged one.

## If an endpoint is missing from all spec files

Implement the call as a typed stub and add a comment:
`// TODO: endpoint <METHOD> <path> not found in openapi-specs — verify with backend team`

Do not silently skip the integration or hardcode a response shape.
