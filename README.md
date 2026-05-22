# TaskWeave

TaskWeave is a multi-LLM workflow orchestration platform:

- **Backend**: Fastify + Drizzle + PostgreSQL
- **Frontend**: React + Vite + Zustand + React Flow
- **Extension**: Chrome extension for context capture

This README is the canonical setup/run guide for local development.

## Monorepo layout

- `backend/`: API server, workflow runtime, DB migrations/seed scripts
- `frontend/taskweave-flow-main/`: web app
- `extension/`: browser extension
- `docker-compose.yml`: local PostgreSQL + Redis services

## Prerequisites

- Node.js 20+ (npm included)
- Docker Desktop
- API keys (at least one LLM provider key)
  - OpenAI (`OPENAI_API_KEY`)
  - Google Gemini (`GOOGLE_API_KEY`)
  - Anthropic (`ANTHROPIC_API_KEY`)

## 1) Clone and install

```bash
git clone <your-fork-or-repo-url>
cd task-weave

npm install
cd backend && npm install && cd ..
cd frontend/taskweave-flow-main && npm install && cd ../..
cd extension && npm install && cd ..
```

## 2) Configure environment

Copy backend env template:

```bash
cp backend/env.example backend/.env
```

Update `backend/.env` values:

```env
NODE_ENV=development
PORT=3000
HOST=localhost
CORS_ORIGIN=http://localhost:8080

DATABASE_URL=postgresql://postgres:password@localhost:5444/taskweave
JWT_SECRET=replace-with-a-32-plus-character-secret

OPENAI_API_KEY=
GOOGLE_API_KEY=
ANTHROPIC_API_KEY=
```

Notes:

- `JWT_SECRET` is validated and must be at least 32 characters.
- `DATABASE_URL` above matches the default `docker-compose.yml` postgres service.

## 3) Start infrastructure

```bash
docker-compose up -d
```

Optional: include pgAdmin profile

```bash
docker-compose --profile tools up -d
```

## 4) Initialize database

```bash
cd backend
npm run db:migrate
npm run db:seed
```

What this does:

- Applies `init.sql` and SQL migrations under `backend/migrations`
- Seeds a demo user (`demo@taskweave.com` / `Demo1234!`) if it does not exist

## 5) Run the app

In separate terminals:

```bash
# Terminal 1
cd backend
npm run dev
```

```bash
# Terminal 2
cd frontend/taskweave-flow-main
npm run dev
```

Open:

- Frontend: `http://localhost:8080`
- Backend health: `http://localhost:3000/health`
- Backend readiness: `http://localhost:3000/health/ready`

## Core API endpoints

- Auth: `/api/auth/*`
- Tasks: `/api/tasks/*`
- Templates: `/api/templates/*`
- Conversations: `/api/conversations/*`
- Executions: `/api/executions/*`
- Agents: `/api/agents/*` (JWT-protected)
- MCP: `/api/mcp/*` (JWT-protected)

## Tests

Backend tests:

```bash
cd backend
npx vitest run
```

## Build commands

```bash
cd backend && npm run build
cd frontend/taskweave-flow-main && npm run build
cd extension && npm run build
```

## Browser extension (optional)

```bash
cd extension
npm run build
```

Then in Chrome:

1. Open `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked**
4. Select `extension/dist`

## Known caveats

- Backend TypeScript build has legacy strict-type debt in older modules not touched by this upgrade pass.
- Redis is available via `docker-compose` but is not yet deeply integrated for execution state/caching.

## Additional docs

- `AUDIT.md` - deep review findings and upgrade plan
- `CHANGELOG.md` - all implemented upgrade changes by phase
- `docs/DOCUMENTATION.md` - product-level docs
