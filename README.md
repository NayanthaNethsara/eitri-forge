# eitri-forge

An intelligent hardware blacksmith that crafts optimized, fully compatible PC builds tailored to user budget and workload requirements.

## Environment

```sh
make env
```

This creates `.env` at the repository root from `.env.example` without overwriting an existing file. Python settings and Docker Compose read this root configuration. The web app uses `apps/web/.env.local`, which Next.js loads automatically. Copy `apps/web/.env.example` to that file when setting up the web app. Environment variables exported by the process take precedence. `.env` files are excluded from Git and Docker build contexts.

The example PostgreSQL password is for local development. Set the database credentials and ports as needed. Gemini project and model settings are only needed when invoking the LLM agent; the applications and database can start before Google authentication is configured.

## Docker Compose

Start Docker, then run:

```sh
make compose-up
```

This builds and starts the Python backend and PostgreSQL, waiting for their health checks. Run the Next.js applications locally with `make dev`.

| Service       | Local address         | Health check        |
| ------------- | --------------------- | ------------------- |
| Agent backend | http://localhost:8000 | `/health`, `/ready` |
| PostgreSQL 17 | localhost:5432        | `pg_isready`        |

Backend and PostgreSQL host ports can be changed in the root `.env`. Ports bind to localhost. Compose uses its internal `postgres:5432` address for backend database connections regardless of the host port.

The Python image uses Python 3.12, pinned dependencies, a separate build stage, and a non-root runtime. Dependency layers are cached separately from application source. Database credentials are injected at runtime and are not included in the image build.

```sh
make compose-logs
make compose-down
```

PostgreSQL data is stored in the named `postgres_data` volume. `compose-down` preserves it. Changing the initial PostgreSQL username, database name, or password in `.env` does not alter an already initialized volume.

The backend readiness check runs a database query. PostgreSQL provides the foundation for Eitri's application data; retailer inventory continues through internal provider tools. Business tables and migrations will be introduced alongside the features that need them.

## Local development

Install Node.js 20.9 or newer, pnpm 10.32.1, Python 3.12, and uv, then run:

```sh
make env
make install
make install-python
make db-up
```

Run `make dev` for the customer app on port 3000 and admin app on port 3001. Individual frontend commands are `make dev-web` and `make dev-admin`. Both expose `/api/health`. Use `make compose-up` for the containerized backend, or `make dev-agent` in another terminal for local FastAPI on port 8000. Stop the backend container before starting local FastAPI on the same port.

Both frontend apps use Next.js 16.3.6 and React 19. The customer app contains the chat starter; the admin app is a placeholder for future shop controls. Production builds use Next.js's webpack option so CSS compilation works in restricted environments.

The customer app opens an Eitri chat at `http://localhost:3000`. Set `GOOGLE_API_KEY` in the root `.env`, start the backend with `make compose-up`, then run `make dev-web`. The web app forwards chat requests to `AGENT_BACKEND_URL` in `apps/web/.env.local` (default `http://127.0.0.1:8000`). The chat currently uses the bundled sample inventory.

Use `make typecheck` and `make build` for checks. The backend declares dependencies in `pyproject.toml` and pins them in `uv.lock`. After changing dependencies, run `make lock-python` and `make install-python`.

## LangGraph agent and inventory

The agent uses Gemini through an LLM adapter. The backend lives in `apps/agent-backend/app`: `orchestrator` contains the LangGraph agent, `inventory` contains the models, JSON repository, and internal tools, and `api` contains the HTTP routes.

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

## Shopping chat frontend

The web app keeps environment validation in `lib/env.ts`, shared values in `lib/constants.ts`, formatting and URL helpers in `lib/utils.ts`, and feature helpers under `lib/chat` and `lib/shopping`. Frontend types live in `types/chat.ts` and `types/shopping.ts`.

Assistant replies support Markdown, tables, links and images. The backend returns `reply` plus `products` taken from validated inventory tool results. Product cards are inventory results, not an inferred purchase recommendation. Optional catalog `image_url` values supply images; the sample catalog has no photos, so cards show a category fallback. HTML embedded in Markdown is not rendered.

The cart stores a local shortlist in the browser, including quantities and the last known price and stock snapshot. A cart cannot mix shops or currencies. Reviewing the cart prepares a chat message containing the selected SKUs. Checkout, stock reservation, authenticated customer carts and tenant routing are not implemented.

After backend response changes, restart the local backend or rebuild its container with `make compose-up`. Keep using `make dev-web` for the frontend. Avoid running a production build against the same `.next` directory while the development server is running.

## Frontend code quality

Zod validates the web environment, chat request and response payloads, product data, image URLs and saved carts. Runtime schemas live with feature helpers in `apps/web/lib`; inferred domain types live in `apps/web/types`.

```sh
pnpm lint
pnpm lint:fix
pnpm format
pnpm format:check
pnpm typecheck
```

ESLint uses a root flat configuration for JavaScript, TypeScript, React hooks and Next.js rules. Prettier handles formatting separately. Generated files, environment files, Python service files and `agent.md` are excluded from formatting. `make lint`, `make format` and `make format-check` are also available.
