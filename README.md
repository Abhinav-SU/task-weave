# TaskWeave - Universal AI Task Continuity System

TaskWeave is a comprehensive system for managing AI conversations across multiple platforms (ChatGPT, Claude, Gemini, etc.) with intelligent context compression and seamless conversation migration.

## 🏗️ Project Structure

```
TaskWeave/
├── backend/                # Node.js + TypeScript + Fastify API
│   ├── src/
│   │   ├── db/            # Database schema & migrations
│   │   ├── routes/        # API routes (auth, tasks, conversations)
│   │   ├── services/      # Business logic services
│   │   ├── middleware/    # Custom middleware
│   │   ├── websocket/     # WebSocket handlers
│   │   └── utils/         # Utility functions
│   ├── package.json
│   └── tsconfig.json
├── frontend/              # React + TypeScript dashboard
└── extension/             # Browser extension (Manifest V3)
```

## 🚀 Features

### Backend (✅ Completed)
- **Authentication System**
  - JWT-based authentication
  - Refresh token rotation
  - OAuth 2.0 ready (Google integration prepared)
  - Secure password hashing with bcrypt

- **Task Management API**
  - Create, read, update, delete tasks
  - Filter by status, platform, tags
  - Pagination support
  - Task statistics endpoint

- **Conversation Management API**
  - Create conversations linked to tasks
  - Branch conversations (parent-child relationships)
  - Add messages with metadata (code blocks, images, artifacts)
  - Conversation tree generation
  - Token counting and statistics

- **Database Schema** (Drizzle ORM + PostgreSQL)
  - Users table with OAuth support
  - Tasks with flexible metadata
  - Conversations with branching support
  - Messages with embeddings (pgvector)
  - Context compressions for optimization
  - Refresh tokens for secure auth

### In Progress
- WebSocket real-time updates
- Context compression service
- Browser extension foundation
- React dashboard

## 📋 Prerequisites

- Node.js 18+ and npm/yarn
- PostgreSQL 14+ with pgvector extension
- Redis (for caching and WebSocket)
- OpenAI API key (for context compression)

## 🛠️ Installation

### 1. Clone Repository

```bash
git clone <repository-url>
cd TaskWeave
```

### 2. Backend Setup

```bash
cd backend
npm install
```

### 3. Environment Configuration

Copy the environment template:

```bash
cp env.example .env
```

Edit `.env` with your configuration:

```env
# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/taskweave

# JWT Secrets (change these!)
JWT_SECRET=your-secret-key-here
JWT_REFRESH_SECRET=your-refresh-secret-here

# OpenAI (for context compression)
OPENAI_API_KEY=your-openai-api-key

# OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### 4. Database Setup

**Option A: Using Docker (Recommended)**

```bash
docker-compose up -d
```

**Option B: Manual Setup**

```bash
# Create database
createdb taskweave

# Install pgvector extension
psql taskweave -c "CREATE EXTENSION vector;"
```

### 5. Run Migrations

```bash
npm run db:migrate
```

### 6. Seed Database (Optional)

```bash
npm run db:seed
```

## 🏃 Running the Application

### Development Mode

```bash
cd backend
npm run dev
```

The server will start on `http://localhost:3000`

### Production Mode

```bash
npm run build
npm start
```

## 📡 API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Tasks

- `POST /api/tasks` - Create task
- `GET /api/tasks` - List tasks (with filters)
- `GET /api/tasks/:id` - Get task by ID
- `PATCH /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `GET /api/tasks/:id/stats` - Get task statistics

### Conversations

- `POST /api/conversations` - Create conversation
- `GET /api/conversations/:id` - Get conversation
- `POST /api/conversations/:id/messages` - Add message
- `GET /api/conversations/:id/tree` - Get conversation tree
- `DELETE /api/conversations/:id` - Delete conversation

## 🔒 Authentication

All API endpoints (except `/api/auth/register` and `/api/auth/login`) require authentication.

Include the JWT token in the Authorization header:

```
Authorization: Bearer <your-access-token>
```

## 📊 Database Schema

### Key Tables

- **users** - User accounts with OAuth support
- **tasks** - Main task entities
- **conversations** - AI conversations linked to tasks
- **messages** - Individual messages in conversations
- **context_compressions** - Compressed conversation states
- **refresh_tokens** - Secure token storage

## 🧪 Testing

```bash
npm test              # Run tests
npm run test:coverage # Run with coverage
```

## 📝 API Examples

### Register User

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securePassword123",
    "name": "John Doe"
  }'
```

### Create Task

```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-token>" \
  -d '{
    "title": "Implement user authentication",
    "description": "Build complete auth system",
    "platform": "chatgpt",
    "tags": ["backend", "security"]
  }'
```

### Add Conversation

```bash
curl -X POST http://localhost:3000/api/conversations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-token>" \
  -d '{
    "task_id": "task-uuid-here",
    "platform": "chatgpt",
    "title": "Auth implementation discussion"
  }'
```

## 🔄 Development Workflow

1. **Backend Development** [[memory:5499774]]
   ```bash
   cd backend
   npm run dev
   ```

2. **Watch Mode** - Changes auto-reload with `tsx watch`

3. **Database Changes**
   ```bash
   npm run db:generate  # Generate migrations
   npm run db:push      # Push to database
   ```

## 🎯 Roadmap

### Phase 1: Foundation (Current)
- ✅ Project structure
- ✅ Database schema
- ✅ Authentication system
- ✅ Task management API
- ✅ Conversation management API

### Phase 2: Core Features (Next)
- ⏳ Context compression service
- ⏳ WebSocket real-time updates
- ⏳ Browser extension foundation
- ⏳ ChatGPT injector
- ⏳ Claude injector

### Phase 3: Dashboard
- ⏳ React frontend setup
- ⏳ Task list view
- ⏳ Conversation viewer
- ⏳ Settings panel

### Phase 4: Advanced Features
- ⏳ Gemini support
- ⏳ Perplexity support
- ⏳ Export/import functionality
- ⏳ Analytics dashboard

## 🤝 Contributing

This is a personal project, but feedback and suggestions are welcome!

## 📄 License

MIT License - See LICENSE file for details

## 🙏 Acknowledgments

- Built with Fastify, Drizzle ORM, and PostgreSQL
- Inspired by the need for universal AI task continuity
- Uses OpenAI for intelligent context compression

