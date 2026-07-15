.PHONY: build test docker-build docker-run docker-stop lint typecheck clean install

SERVICE_NAME := intention-store-service
VERSION := 1.0.0

## Install dependencies
install:
	npm ci

## Compile TypeScript to dist/
build: install
	npm run build

## Run the full test suite with coverage
test: install
	npm test

## Run linter (zero warnings)
lint: install
	npm run lint

## Run TypeScript type checker
typecheck: install
	npm run typecheck

## Build the Docker image
docker-build: build
	docker build -t $(SERVICE_NAME):$(VERSION) .

## Start the service and infrastructure via docker compose
docker-run:
	docker compose up --build -d

## Tear down via docker compose
docker-stop:
	docker compose down

## Remove build artifacts
clean:
	rm -rf dist dist-test coverage

## Show help
help:
	@echo "Available targets:"
	@echo "  install       Install npm dependencies"
	@echo "  build         Compile TypeScript"
	@echo "  test          Run full test suite with coverage"
	@echo "  lint          Run ESLint (zero warnings)"
	@echo "  typecheck     Run TypeScript type checker"
	@echo "  docker-build  Build Docker image"
	@echo "  docker-run    Start service via docker compose"
	@echo "  docker-stop   Stop service via docker compose"
	@echo "  clean         Remove build artifacts"
