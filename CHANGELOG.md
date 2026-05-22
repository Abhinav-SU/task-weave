# Changelog

All notable changes to this project are documented in this file.

## [Unreleased]

### Critical fixes

- Secured `agents` and `mcp` APIs behind JWT auth to remove unauthenticated execution paths.
- Fixed template persistence consistency by standardizing `is_template` handling and wiring frontend template APIs to `/api/templates`.
- Repaired conversation/message route schema mismatches (`sender`, `content_type`, `parent_id`) and removed writes to non-existent counters.
- Fixed task stats endpoint to compute counts from actual `conversations` and `messages` tables.
- Added workflow node type normalization (`ai-platform`/legacy aliases -> executor node types) to prevent builder/runtime incompatibility.
- Aligned DB bootstrap with runtime needs by adding task metadata/template columns in `init.sql` and a new SQL migration.
- Implemented missing `db:migrate` and `db:seed` scripts (`migrate.ts`, `seed.ts`) so setup commands now work.

### Dependency upgrades

- Upgraded backend runtime dependencies: `openai` (v6), `dotenv`, `socket.io`, and `zod` to current stable lines.
- Removed unused backend dependencies (`@fastify/websocket`, `ioredis`, `winston`) to reduce attack surface and install bloat.
- Upgraded frontend tooling dependencies: `vite`, `@vitejs/plugin-react-swc`, `next-themes`, `lucide-react`, `react-day-picker`.
- Upgraded extension dependencies: `socket.io-client`, `esbuild`, and `typescript`.
- Updated Drizzle CLI scripts to modern command syntax (`drizzle-kit generate` / `push`).
- Added npm lockfiles to root, backend, frontend, and extension for reproducible installs.

### Architecture improvements

- Added centralized environment validation in `backend/src/config/env.ts` to fail fast on invalid configuration.
- Refactored backend bootstrap and DB initialization to consume shared validated config instead of ad-hoc `process.env` reads.
- Limited pretty logging transport to non-production environments for cleaner production logging and lower overhead.
- Improved DB pool error handling to avoid forced process exits from event callbacks.
- Added in-process execution cancellation tracking so cancelled workflow runs stop node execution promptly.

### Missing functionality

- Added `GET /health/ready` with a live Postgres check for readiness probes.
- Added global request error normalization for validation and internal errors.
- Added API rate limiting and security headers middleware (`@fastify/rate-limit`, `@fastify/helmet`).
- Implemented `GET /api/tasks/search` to match frontend API usage.
- Added exponential backoff retry handling for OpenAI/Gemini/Claude workflow node execution calls.

### Testing

- Added backend unit tests for workflow node alias normalization and LLM retry behavior in `WorkflowExecutionService`.
- Tests now verify both successful retry recovery and terminal retry failure behavior.

### Documentation

- Rewrote `README.md` as a full clone-to-run guide with aligned env values, migration/seed steps, and service startup flow.
- Added frontend `.env.example` with API and WebSocket endpoint defaults.
