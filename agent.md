# Eitri Forge repository guide

- `apps/web` is the customer-facing Next.js application on port 3000.
- `apps/admin` is the shop admin Next.js application on port 3001.
- `apps/agent-backend` is the Python FastAPI service on port 8000. Agent logic can be added here later.
- `packages/types` holds TypeScript contracts shared by the web applications.
- `packages/config` holds the shared TypeScript bases and Tailwind preset.

Use pnpm workspaces for JavaScript dependencies and Turbo for JavaScript build and development tasks. Use the root Makefile for setup and service commands. Keep the three `/health` responses in the same shape: `status` and `service`.

## Strict code style and quality rules

- Maintain a proper, clean folder structure.
- Write self-explanatory code with clear, descriptive names and small, focused functions.
- Do not write comments. Only include comments when strictly necessary to explain non-obvious business intent or hardware constraints.
- Do not add unused abstractions, speculative helpers, or premature future-proofing code. Build only what is explicitly requested.
- Use semantic color tokens (for example, `bg-success`, `text-destructive`, `border-muted`), never raw color hexes or generic color utilities.
- Keep one color language per visual signal. Do not reuse the same palette for two different meanings within the same view.
- Do not use emojis in responses, commit messages, comments, UI text, or code.
