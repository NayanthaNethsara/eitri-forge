.PHONY: install install-python dev dev-web dev-admin dev-agent build typecheck

PYTHON ?= python3.12
PNPM ?= pnpm

install:
	$(PNPM) install

install-python:
	$(PYTHON) -m venv --clear apps/agent-backend/.venv
	cd apps/agent-backend && .venv/bin/python -m pip install -r requirements.txt

dev:
	$(PNPM) dev

dev-web:
	$(PNPM) --filter @eitri/web dev

dev-admin:
	$(PNPM) --filter @eitri/admin dev

dev-agent:
	apps/agent-backend/.venv/bin/python -m uvicorn main:app --app-dir apps/agent-backend --reload --port 8000

build:
	$(PNPM) build

typecheck:
	$(PNPM) typecheck
