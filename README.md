# eitri-forge

An intelligent hardware blacksmith that crafts optimized, fully compatible PC builds tailored to user budget and workload requirements.

## Environment

```sh
make env
```

This creates `.env` at the repository root from `.env.example` without overwriting an existing file. Python settings, Next.js local commands, and Docker Compose read this root configuration. Environment variables exported by the process take precedence. `.env` files are excluded from Git and Docker build contexts.

The example PostgreSQL password is for local development. Set the database credentials and ports as needed. Gemini project and model settings are only needed when invoking the LLM agent; the applications and database can start before Google authentication is configured.

## Docker Compose

Start Docker, then run:

```sh
make compose-up
```

This builds and starts the Python backend and PostgreSQL, waiting for their health checks. Run the Next.js applications locally with `make dev`.

| Service | Local address | Health check |
| --- | --- | --- |
| Agent backend | http://localhost:8000 | `/health`, `/ready` |
| PostgreSQL 17 | localhost:5432 | `pg_isready` |

Backend and PostgreSQL host ports can be changed in the root `.env`. Ports bind to localhost. Compose uses its internal `postgres:5432` address for backend database connections regardless of the host port.

The Python image uses Python 3.12, pinned dependencies, a separate build stage, and a non-root runtime. Dependency layers are cached separately from application source. Database credentials are injected at runtime and are not included in the image build.

```sh
make compose-logs
make compose-down
```

PostgreSQL data is stored in the named `postgres_data` volume. `compose-down` preserves it. Changing the initial PostgreSQL username, database name, or password in `.env` does not alter an already initialized volume.

The backend readiness check runs a database query. PostgreSQL provides the foundation for Eitri's application data; retailer inventory continues through internal provider tools. Business tables and migrations will be introduced alongside the features that need them.

## Local development

Install Node.js 20 or newer, pnpm 10.32.1, Python 3.12, and uv, then run:

```sh
make env
make install
make install-python
make db-up
```

Run `make dev` for the customer app on port 3000 and admin app on port 3001. Individual frontend commands are `make dev-web` and `make dev-admin`. Both expose `/api/health`. Use `make compose-up` for the containerized backend, or `make dev-agent` in another terminal for local FastAPI on port 8000. Stop the backend container before starting local FastAPI on the same port.

Use `make typecheck` and `make build` for checks. The backend declares dependencies in `pyproject.toml` and pins them in `uv.lock`. After changing dependencies, run `make lock-python` and `make install-python`.

## LangGraph agent and inventory

The agent uses Gemini through an LLM adapter. Internal inventory tools live under `apps/agent-backend/tools/inventory` and execute inside the agent process.

Set `GOOGLE_API_KEY` in the root `.env` and run:

```sh
apps/agent-backend/.venv/bin/eitri-agent "Find an AM5 CPU under 200 USD and check its stock."
```

To use Vertex AI instead, set `EITRI_LLM_PROVIDER=vertex` and `GOOGLE_CLOUD_PROJECT`, then configure Application Default Credentials. Containers do not inherit host Google credentials. For a Vertex AI invocation in Docker, mount a credentials file readable by the container's non-root user and provide its container path:

```sh
docker compose run --rm \
  --volume /absolute/path/google-credentials.json:/run/google-credentials.json:ro \
  --env GOOGLE_APPLICATION_CREDENTIALS=/run/google-credentials.json \
  agent-backend eitri-agent "Find DDR5 RAM."
```

Cloud deployments can provide a workload identity instead. See the [backend guide](apps/agent-backend/README.md) for model configuration, tool contracts, and provider integration, and [agent.md](agent.md) for repository conventions.
