# eitri-forge
An intelligent hardware blacksmith that crafts optimized, fully compatible PC builds tailored to user budget and workload requirements.

## Requirements

- Node.js 20 or newer and pnpm 10.32.1
- Python 3.12 for the default Makefile setup (the backend supports Python 3.11 or newer)

## Setup

```sh
make install
make install-python
```

Run the web and admin apps together with `make dev`, or separately with `make dev-web` and `make dev-admin`. Run the Python service with `make dev-agent` in another terminal. The services listen on ports 3000, 3001, and 8000 respectively.

Check health at `http://localhost:3000/api/health`, `http://localhost:3001/api/health`, and `http://localhost:8000/health`. Each returns JSON with `status` and `service` fields.

Use `make typecheck` to check TypeScript and `make build` to build the Next.js apps. See [agent.md](agent.md) for the workspace map.
