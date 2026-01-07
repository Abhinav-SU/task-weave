# TaskWeave - Complete Documentation

**Version:** 2.0  
**Last Updated:** January 6, 2026  
**Status:** Production Ready ✅

---

## 📑 Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Architecture](#architecture)
4. [Features](#features)
5. [API Reference](#api-reference)
6. [Development Guide](#development-guide)
7. [Deployment](#deployment)
8. [Troubleshooting](#troubleshooting)
9. [Changelog](#changelog)

---

## Overview

### What is TaskWeave?

TaskWeave is an **AI Workflow Orchestration Platform** that lets you chain multiple LLM models together in visual workflows. Instead of using one AI for everything, TaskWeave allows you to use the right model for each step.

```
┌─────────┐    ┌──────────┐    ┌──────────┐    ┌────────┐
│  START  │───▶│  GPT-4   │───▶│  Gemini  │───▶│  GPT-4 │───▶ END
│ (Input) │    │(Research)│    │(Analyze) │    │(Format)│
└─────────┘    └──────────┘    └──────────┘    └────────┘
```

### Key Capabilities

- **Visual Workflow Builder**: Drag-and-drop nodes to create AI workflows
- **Multi-LLM Chaining**: Connect different AI models (GPT-4, Gemini, etc.)
- **Variable Interpolation**: Pass outputs between workflow nodes (`{{variable}}`, `{{node_X_output}}`)
- **Template Library**: 4 production-ready templates for common tasks
- **Real-time Execution**: Watch workflows execute step-by-step with WebSocket updates
- **Markdown Rendering**: Beautiful formatting for AI responses with syntax highlighting

### Supported AI Providers

| Provider | Models | Status |
|----------|--------|--------|
| **OpenAI** | GPT-4, GPT-4-turbo, GPT-3.5 | ✅ Active |
| **Google** | Gemini 2.5 Flash, Gemini 1.5 Pro | ✅ Active |
| **MCP** | Model Context Protocol | ✅ Active |
| **Anthropic** | Claude 3.5 Sonnet | 📦 Code exists, not active |

---

## Quick Start

### Prerequisites

- Node.js v18+ 
- PostgreSQL (via Docker)
- API Keys: OpenAI, Google AI

### 1. Clone & Install

```bash
git clone https://github.com/Abhinav-SU/task-weave.git
cd task-weave

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend/taskweave-flow-main
npm install
```

### 2. Configure Environment

Create `backend/.env`:

```env
# Database
DATABASE_URL=postgresql://taskweave_user:taskweave_pass@localhost:5444/taskweave_db

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# AI Provider API Keys
OPENAI_API_KEY=sk-proj-your-openai-key
GOOGLE_API_KEY=your-google-ai-key

# Server
PORT=3000
NODE_ENV=development
```

### 3. Start Services

```powershell
# Terminal 1: Start PostgreSQL
cd D:\03_Projects\TaskWeave
docker-compose up -d

# Terminal 2: Start Backend (port 3000)
cd backend
npm run dev

# Terminal 3: Start Frontend (port 8080)
cd frontend/taskweave-flow-main
npm run dev
```

### 4. Access Application

- **Frontend:** http://localhost:8080
- **Backend API:** http://localhost:3000
- **Health Check:** http://localhost:3000/health

### 5. Login

**Demo Account:**
- Email: `demo@taskweave.com`
- Password: `Demo1234!`

### 6. Run Your First Workflow

1. Navigate to **Templates** page
2. Click **Run** on "Code Review & Documentation"
3. Paste your code in the textarea
4. Click **Execute Workflow**
5. Watch real-time execution in **All Tasks** → Click task

---

## Architecture

### Tech Stack

**Backend:**
- Runtime: Node.js v23.7.0
- Framework: Fastify
- Language: TypeScript
- Database: PostgreSQL 15 (Drizzle ORM)
- Real-time: Socket.IO (WebSocket)
- Auth: JWT

**Frontend:**
- Framework: React 18
- Language: TypeScript
- Build: Vite
- UI: TailwindCSS + shadcn/ui
- State: Zustand
- Routing: React Router

**Infrastructure:**
- Container: Docker (PostgreSQL)
- Package Manager: npm
- Version Control: Git

### Project Structure

```
TaskWeave/
├── backend/                          # Backend API
│   ├── src/
│   │   ├── index.ts                 # Entry point
│   │   ├── db/
│   │   │   ├── index.ts             # Database connection
│   │   │   └── schema-simple.ts     # Database schema
│   │   ├── routes/
│   │   │   ├── auth.ts              # Authentication
│   │   │   ├── tasks.ts             # Task CRUD
│   │   │   ├── templates.ts         # Template management
│   │   │   ├── conversations.ts     # Conversation tracking
│   │   │   └── executions.ts        # Workflow execution
│   │   ├── services/
│   │   │   └── WorkflowExecutionService.ts  # Multi-LLM orchestration
│   │   ├── websocket/
│   │   │   ├── index.ts             # WebSocket server
│   │   │   ├── connectionHandler.ts # Connection management
│   │   │   ├── conversationHandler.ts # Conversation events
│   │   │   └── taskHandler.ts       # Task events
│   │   └── middleware/              # Auth, CORS, etc.
│   ├── migrations/                   # Database migrations
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/taskweave-flow-main/     # Frontend Dashboard
│   ├── src/
│   │   ├── main.tsx                 # Entry point
│   │   ├── App.tsx                  # Root component
│   │   ├── pages/
│   │   │   ├── Index.tsx            # Landing page
│   │   │   ├── Login.tsx            # Authentication
│   │   │   ├── DashboardHome.tsx    # Dashboard home
│   │   │   ├── AllTasks.tsx         # Task list
│   │   │   ├── TaskDetail.tsx       # Task details + results
│   │   │   ├── Templates.tsx        # Template gallery
│   │   │   └── Settings.tsx         # User settings
│   │   ├── components/
│   │   │   ├── landing/             # Landing page components
│   │   │   ├── dashboard/           # Dashboard components
│   │   │   ├── ui/                  # shadcn/ui components
│   │   │   ├── MessageContent.tsx   # Markdown renderer
│   │   │   └── RunTemplateDialog.tsx # Template execution
│   │   ├── lib/
│   │   │   └── api.ts               # API client
│   │   └── store/
│   │       └── taskStore.ts         # Zustand state
│   ├── package.json
│   └── vite.config.ts
│
├── docs/                             # Documentation (this file)
├── scripts/                          # Utility scripts
├── docker-compose.yml                # PostgreSQL container
└── README.md                         # Project overview
```

### Database Schema

**Tables:**
- `users` - User accounts (JWT auth)
- `tasks` - Task records (title, description, status, metadata)
- `conversations` - AI conversations (platform, messages)
- `messages` - Individual AI messages (sender, content)
- `workflow_executions` - Execution history (status, variables, results)

### API Architecture

**REST API:**
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Authenticate
- `GET /api/tasks` - List tasks
- `POST /api/tasks` - Create task
- `GET /api/tasks/:id` - Get task details
- `POST /api/templates/:id/run` - Execute workflow template
- `GET /api/executions/:taskId` - List task executions

**WebSocket Events:**
- `task:created` - New task created
- `task:updated` - Task status changed
- `execution:started` - Workflow started
- `execution:node:start` - Node execution started
- `execution:node:complete` - Node completed
- `execution:completed` - Workflow completed

---

## Features

### 1. Visual Workflow Builder

Create workflows by connecting nodes:
- **Start Node**: Entry point with input variables
- **AI Node**: Call LLM with configurable prompt
- **End Node**: Final output

**Variable System:**
- Input variables: `{{topic}}`, `{{code}}`, `{{query}}`
- Node outputs: `{{node_1_output}}`, `{{node_2_output}}`
- Automatic resolution during execution

### 2. Multi-LLM Chaining

Execute workflows that chain multiple AI models:

```javascript
// Example: Code Review Workflow
Node 1 (Gemini): Review code → node_1_output
Node 2 (GPT-4): Generate docs using {{node_1_output}} → node_2_output
Node 3 (GPT-4): Create README using {{node_2_output}} → final output
```

### 3. Template System

**4 Production Templates:**

1. **Code Review & Documentation**
   - Input: Code paste
   - Flow: Gemini review → GPT-4 docs → GPT-4 README
   - Use: Automated code review and documentation

2. **Business Intelligence Research**
   - Input: Business topic
   - Flow: GPT-4 research → Gemini analysis → GPT-4 summary
   - Use: Market research and analysis

3. **Technical Analysis**
   - Input: Technology/topic
   - Flow: GPT-4 analyze → Gemini deep-dive → GPT-4 report
   - Use: Technical documentation and research

4. **Smart Research with MCP**
   - Input: Research query
   - Flow: MCP gather context → GPT-4 synthesize
   - Use: Research with Model Context Protocol

### 4. Real-time Execution

**WebSocket Updates:**
- See which node is executing
- View intermediate outputs
- Track execution progress
- Get final results instantly

**Execution Flow:**
1. User clicks "Run" on template
2. Frontend sends POST to `/api/templates/:id/run`
3. Backend creates workflow execution
4. WorkflowExecutionService orchestrates LLM calls
5. WebSocket emits progress events
6. Results saved to database
7. Frontend displays formatted output

### 5. Markdown Rendering

AI responses rendered with:
- **Syntax highlighting** (react-syntax-highlighter)
- **Code blocks** with proper formatting
- **Headers, lists, tables** styled with Tailwind
- **Links** open in new tab
- **Blockquotes** with left border
- **Inline code** with background

### 6. Task Management

- Create tasks manually or via template
- View task list (grid/list view)
- Filter by status (active, completed, archived)
- Search tasks
- Track workflow executions per task
- View conversation history

---

## API Reference

### Authentication

**Register:**
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "username": "john_doe"
}

Response: { "token": "jwt-token", "user": {...} }
```

**Login:**
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!"
}

Response: { "token": "jwt-token", "user": {...} }
```

### Tasks

**List Tasks:**
```http
GET /api/tasks?page=1&limit=20
Authorization: Bearer <jwt-token>

Response: {
  "tasks": [...],
  "pagination": { "total": 50, "page": 1, "limit": 20 }
}
```

**Create Task:**
```http
POST /api/tasks
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "title": "Research AI Ethics",
  "description": "Comprehensive analysis",
  "platforms": ["chatgpt", "gemini"],
  "metadata": { "nodes": [...], "edges": [...] }
}

Response: { "task": {...} }
```

**Get Task:**
```http
GET /api/tasks/:id
Authorization: Bearer <jwt-token>

Response: {
  "task": {...},
  "conversations": [...]
}
```

### Templates

**List Templates:**
```http
GET /api/templates
Authorization: Bearer <jwt-token>

Response: {
  "tasks": [...],
  "pagination": {...}
}
```

**Run Template:**
```http
POST /api/templates/:id/run
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "variables": {
    "topic": "Blockchain",
    "code": "def hello(): print('world')"
  }
}

Response: {
  "execution": {
    "id": "uuid",
    "status": "running",
    "task_id": "uuid"
  }
}
```

### Executions

**List Executions:**
```http
GET /api/executions/:taskId
Authorization: Bearer <jwt-token>

Response: [
  {
    "id": "uuid",
    "status": "completed",
    "variables": {...},
    "results": {...},
    "started_at": "2026-01-06T...",
    "completed_at": "2026-01-06T..."
  }
]
```

---

## Development Guide

### Backend Development

**Run in Development Mode:**
```bash
cd backend
npm run dev  # Uses tsx with hot reload
```

**Database Operations:**
```bash
# Generate migration
npm run db:generate

# Push schema changes
npm run db:push

# Open Drizzle Studio
npm run db:studio
```

**API Testing:**
```bash
# Health check
curl http://localhost:3000/health

# Test authentication
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@taskweave.com","password":"Demo1234!"}'
```

### Frontend Development

**Run in Development Mode:**
```bash
cd frontend/taskweave-flow-main
npm run dev  # Vite dev server on port 8080
```

**Build for Production:**
```bash
npm run build  # Output to dist/
npm run preview  # Preview production build
```

**Component Development:**
- Landing page: `src/components/landing/`
- Dashboard: `src/components/dashboard/`
- UI primitives: `src/components/ui/` (shadcn)

### Adding a New AI Provider

1. **Add API key to `.env`:**
```env
ANTHROPIC_API_KEY=your-key
```

2. **Update WorkflowExecutionService:**
```typescript
// backend/src/services/WorkflowExecutionService.ts
async executeNode(node, variables) {
  if (node.data.platform === 'claude') {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4096,
        messages: [{ role: 'user', content: resolvedPrompt }]
      })
    });
    // Parse and return response
  }
}
```

3. **Add to frontend platform types:**
```typescript
// frontend/src/store/taskStore.ts
export type AIPlatform = 'chatgpt' | 'gemini' | 'claude' | 'mcp';
```

### Creating a New Template

1. **Create template in database:**
```javascript
// backend/create-your-template.js
const template = await db.insert(tasks).values({
  user_id: userId,
  title: 'Your Template Name',
  description: 'What it does',
  status: 'completed',
  is_template: true,
  platforms: ['chatgpt', 'gemini'],
  metadata: {
    nodes: [
      {
        id: 'start',
        type: 'start',
        data: { label: 'Start', variables: ['input_var'] }
      },
      {
        id: 'node_1',
        type: 'aiNode',
        data: {
          label: 'AI Step 1',
          platform: 'chatgpt',
          prompt: 'Process {{input_var}}'
        }
      },
      // ... more nodes
    ],
    edges: [
      { id: 'e1', source: 'start', target: 'node_1' }
    ]
  }
});
```

2. **Test template:**
```bash
node create-your-template.js
```

3. **Template appears in gallery automatically**

---

## Deployment

### Production Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:pass@prod-db-host:5432/taskweave

# Security
JWT_SECRET=super-secret-production-key-min-32-chars
NODE_ENV=production

# API Keys
OPENAI_API_KEY=sk-proj-prod-key
GOOGLE_API_KEY=prod-google-key

# Server
PORT=3000
CORS_ORIGIN=https://yourdomain.com
```

### Docker Deployment

**Backend Dockerfile:**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["node", "dist/index.js"]
```

**Frontend Dockerfile:**
```dockerfile
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
```

### Health Checks

**Backend:**
- Endpoint: `GET /health`
- Returns: `{ "status": "ok", "timestamp": "..." }`

**Database:**
```bash
# Check PostgreSQL
docker exec taskweave-postgres psql -U taskweave_user -d taskweave_db -c "SELECT 1"
```

---

## Troubleshooting

### Common Issues

**1. Frontend shows "Network Error"**
- **Cause:** Backend not running or CORS issue
- **Fix:** Check backend is on port 3000, verify CORS_ORIGIN in .env

**2. Database connection failed**
- **Cause:** PostgreSQL not running
- **Fix:** `docker-compose up -d`

**3. Workflow execution fails**
- **Cause:** Invalid API key or rate limit
- **Fix:** Check API keys in Settings, verify balance

**4. Tasks stay "active" forever**
- **Cause:** Execution completed but status not updated
- **Fix:** Already fixed - markExecutionCompleted() updates both tables

**5. Markdown not rendering**
- **Cause:** Missing react-markdown dependencies
- **Fix:** Already fixed - installed with `--legacy-peer-deps`

**6. Buttons overlapping**
- **Cause:** Missing responsive classes
- **Fix:** Already fixed - added flex-wrap, proper spacing

### Debug Mode

**Backend:**
```bash
DEBUG=* npm run dev
```

**Frontend:**
Open browser DevTools → Console → Network tab

### Logs

**Backend logs:**
- Winston logs to console in development
- Check terminal running `npm run dev`

**Database logs:**
```bash
docker logs taskweave-postgres
```

---

## Changelog

### v2.0 (January 6, 2026)

**Major Changes:**
- ✅ Landing page rewritten to reflect actual functionality
- ✅ Removed false claims (extension, compression, version control)
- ✅ Added accurate features (workflow orchestration)
- ✅ Fixed all button layouts and responsive design
- ✅ Consolidated documentation into single file

**UI Improvements:**
- Fixed quick action button layouts (Share/Export/Continue)
- Improved responsive breakpoints (mobile/tablet/desktop)
- Added markdown rendering with syntax highlighting
- Fixed message content formatting
- Updated all CTAs from "Install Extension" to "Get Started"

**Features:**
- Hero: "Orchestrate Multiple AI Models in One Workflow"
- Features: Visual builder, multi-LLM, real-time execution
- How It Works: Choose → Configure → Execute
- FAQ: 8 workflow-focused questions

### v1.0 (November 2025)

**Initial Release:**
- Multi-LLM workflow orchestration
- OpenAI GPT-4 + Google Gemini integration
- 4 production templates
- Task management system
- Real-time WebSocket updates
- JWT authentication
- Template execution with variables
- Conversation tracking

**Tech Stack:**
- Backend: Node.js + Fastify + PostgreSQL
- Frontend: React + Vite + TailwindCSS
- Real-time: Socket.IO

---

## Support & Contributing

**Issues:** https://github.com/Abhinav-SU/task-weave/issues  
**Discussions:** https://github.com/Abhinav-SU/task-weave/discussions

**Contributing:**
1. Fork repository
2. Create feature branch
3. Make changes
4. Submit pull request

**License:** MIT

---

**Built with ❤️ for AI workflow automation**
