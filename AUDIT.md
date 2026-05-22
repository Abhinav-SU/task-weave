# TaskWeave Audit (May 2026)

## Purpose

TaskWeave is a multi-LLM workflow orchestration platform with a Fastify backend, React frontend, and optional browser extension.  
It lets users create tasks, run AI workflow templates (OpenAI/Gemini/Claude), and track results/conversations over REST + WebSocket.

## Architecture

### High-level flow

1. Frontend authenticates with `POST /api/auth/login` and stores JWT.
2. Frontend creates tasks/templates and triggers execution via `POST /api/executions/execute`.
3. Backend `WorkflowExecutionService` walks workflow nodes and calls LLM providers.
4. Execution artifacts are written to Postgres (`tasks`, `conversations`, `messages`, `workflow_executions`).
5. Frontend polls execution endpoints and reads conversations/results.

### Structure

- `backend/src/index.ts`: Fastify app bootstrap, auth decorator, route registration.
- `backend/src/routes/*`: Auth, task/template CRUD, conversations, execution, agents, MCP.
- `backend/src/services/WorkflowExecutionService.ts`: Core runtime workflow engine.
- `backend/src/db/schema-simple.ts`: Active runtime schema.
- `backend/src/db/schema.ts`: Alternate schema model (currently divergent from runtime).
- `frontend/taskweave-flow-main`: React app with dashboard, template builder, stores, API client.
- `extension`: Browser extension for context capture.

## Dependency Audit

### Backend

- `drizzle-kit` scripts are outdated (`generate:pg`, `push:pg`) and point to `schema.ts` while runtime uses `schema-simple.ts`.
- `dotenv`, `socket.io`, and several runtime/tooling libraries are behind current stable releases.
- Unused dependencies are present (`@fastify/websocket`, `ioredis`, `winston`) and increase maintenance/security surface.

### Frontend / Extension

- Frontend has modern baseline but still uses older `vite` major and stale utility libs.
- Extension package versions are behind frontend/backend socket client/server alignment.
- No lockfiles were present, making installs non-reproducible.

## API / Functionality Review

- **Template persistence mismatch**:
  - `tasks.ts` forces `is_template = 'no'`
  - `templates.ts` reads `'yes'` but writes `'true'`
  - frontend `api.ts` creates templates through `createTask`, so templates can be hidden from template listing.
- **Node type mismatch**:
  - template builder emits `ai-platform`
  - executor supports `aiNode`
  - valid flows from builder can fail validation at execution time.
- **Conversation route/schema drift**:
  - route expects fields (`role`, `sequence_number`, `message_count`, `token_count`, `parent_conversation_id`) not in `schema-simple.ts`.
- **Task stats endpoint broken**:
  - incorrect query conditions and references non-existent fields.
- **Migration/setup gaps**:
  - `db:migrate` and `db:seed` scripts exist but target missing files.
  - `init.sql` lacks `tasks.metadata` and `tasks.is_template` while runtime code writes those columns.

## Security Findings

- `agents` and `mcp` routes were unauthenticated.
- JWT secret had insecure fallback (`'your-secret-key-change-this'`) instead of fail-fast behavior.
- Potentially dangerous code paths exist in advanced agent tooling (`Function()` evaluation pattern in service-level logic).
- No rate limiting / hardening middleware despite public API endpoints.

## Performance Findings

- Shallow health check (`/health`) does not validate DB readiness.
- No retry strategy around upstream LLM provider calls; transient failures fail whole runs.
- `pino-pretty` transport enabled by default (better as dev-only).
- Data model/path split (`schema` vs `schema-simple`) creates avoidable complexity and maintenance overhead.

## Outdated Patterns (2025/2026)

- Mixed, partially migrated architecture (v1/v2 schemas and routes) indicates unfinished refactor.
- Legacy Drizzle CLI commands and schema targeting.
- Template handling via overloaded string flags instead of normalized status semantics.
- Frontend still relying on large local built-in template dataset path while backend template CRUD exists.

## Missing Capabilities

- Robust readiness endpoint (`/health/ready`) with DB probe.
- Retry logic/backoff for external LLM APIs.
- Proper seed script for documented demo user.
- Real functional tests for key backend routes/execution helpers.
- End-to-end setup docs that match actual env/database defaults and migration process.

## Upgrade Plan by Phase

1. **Critical fixes**: secure routes, fix template flag consistency, normalize node types, align conversation/task stats behavior, and add missing DB setup scripts.
2. **Dependency upgrades**: refresh key package versions, remove unused runtime deps, and add lockfiles.
3. **Architecture improvements**: centralize config/runtime guards, improve health/readiness and execution reliability.
4. **Missing functionality**: add readiness endpoint + retry behavior + search endpoint parity.
5. **Testing**: add backend tests for fixed behavior.
6. **Documentation**: rewrite README for clean-clone setup and add changelog entries for each phase.
