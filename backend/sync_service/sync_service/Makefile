.PHONY: build test docker-build docker-run docker-stop lint typecheck install clean

SERVICE_NAME := sync-service
VERSION := 1.0.0

install:
	npm ci

build: install
	npm run build

test: install
	npm run test

lint: install
	npm run lint

typecheck: install
	npm run typecheck

docker-build:
	docker build -t $(SERVICE_NAME):$(VERSION) .

docker-run:
	docker compose up --build -d

docker-stop:
	docker compose down

clean:
	rm -rf dist/ coverage/ node_modules/
