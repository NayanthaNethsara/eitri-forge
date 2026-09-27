.PHONY: env install install-python lock-python dev dev-web dev-admin dev-agent build typecheck compose-up compose-down compose-logs db-up

PNPM ?= pnpm

env:
	@test -f .env || cp .env.example .env

install:
	$(PNPM) install

install-python:
	cd apps/agent-backend && uv sync --locked --python 3.12

lock-python:
	cd apps/agent-backend && uv lock

dev:
	$(PNPM) dev

dev-web:
	$(PNPM) --filter @eitri/web dev

dev-admin:
	$(PNPM) --filter @eitri/admin dev

dev-agent: env
	apps/agent-backend/.venv/bin/python -m uvicorn main:app --app-dir apps/agent-backend --reload --port 8000

build:
	$(PNPM) build

typecheck:
	$(PNPM) typecheck

compose-up: env
	docker compose up --build --detach --wait

compose-down:
	docker compose down

compose-logs:
	docker compose logs --follow

db-up: env
	docker compose up --detach --wait postgres
