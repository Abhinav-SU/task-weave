# TaskWeave

<div align="center">

![TaskWeave Logo](https://img.shields.io/badge/TaskWeave-Multi--LLM%20Orchestration-6366f1?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PHBhdGggZD0iTTEyIDJ2NGw0LTQiLz48cGF0aCBkPSJNMTIgMnY0bC00LTQiLz48cGF0aCBkPSJNMTIgMjJ2LTRsNC00Ii8+PHBhdGggZD0iTTEyIDIydi00bC00IDQiLz48cGF0aCBkPSJNMjIgMTJoLTRsNC00Ii8+PHBhdGggZD0iTTIyIDEyaC00bDQgNCIvPjxwYXRoIGQ9Ik0yIDEyaDRsLTQtNCIvPjxwYXRoIGQ9Ik0yIDEyaDRsLTQgNCIvPjwvc3ZnPg==)

### **Intelligent Multi-LLM Workflow Orchestration Platform**

Build powerful AI workflows by chaining multiple LLMs together. Use the **right model** for each step - optimized for cost and quality.

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

[Features](#-features) • [Demo](#-demo) • [Quick Start](#-quick-start) • [Templates](#-templates) • [Documentation](#-documentation)

</div>

---

## 🎬 Demo

<div align="center">

<a href="https://www.youtube.com/watch?v=RxV2DxpXp8Q" target="_blank">
  <img src="https://img.youtube.com/vi/RxV2DxpXp8Q/0.jpg" alt="TaskWeave Demo Video" style="max-width:100%; border-radius:8px;">
</a>

### 🎥 [Watch Demo Video](https://www.youtube.com/watch?v=RxV2DxpXp8Q)

*1:30 min • 4K Quality • Full Platform Walkthrough*

</div>

**Demo showcases:**
- 🏠 Landing page & login flow
- 📊 Dashboard overview
- 📚 11 cost-optimized multi-LLM templates
- ▶️ Running a workflow with live execution
- 📝 Viewing AI conversations & results
- 🎨 Visual Template Builder with drag-and-drop
- 📋 Task management & history

---

## 🎯 What is TaskWeave?

TaskWeave lets you create visual workflows that chain multiple AI models together, using the **best model for each task**:

```
┌───────────────┐      ┌───────────────┐      ┌───────────────┐
│  Gemini 2.5   │─────▶│    GPT-4o     │─────▶│  Gemini 2.5   │
│   (Research)  │      │  (Validate)   │      │   (Report)    │
│   💰 $0.001   │      │   💵 $0.01    │      │   💰 $0.002   │
└───────────────┘      └───────────────┘      └───────────────┘
```

**Why Multi-LLM?**
- 🎯 **Right tool for the job** - Gemini for bulk processing, GPT-4 for precision
- 💰 **Cost optimization** - Use efficient models for 80% of work, premium for critical steps
- ⚡ **Better results** - Each model contributes its strengths

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🎨 **Visual Workflow Builder** | Drag-and-drop nodes to create AI workflows |
| 🔗 **Multi-LLM Chaining** | Connect GPT-4, Gemini, Claude in sequence |
| 💰 **Cost-Optimized Templates** | Pre-built workflows balanced for quality & cost |
| 📊 **LLM Suggestions** | AI recommends the best model for each task |
| ⚡ **Real-time Execution** | Watch workflows execute step-by-step via WebSocket |
| 🧩 **Pre-built Blocks** | Drag common patterns like "Research & Summarize" |
| 📝 **Variable System** | Pass outputs between nodes with `{{variable}}` syntax |
| 🤖 **AI Agents** | Autonomous agents with tool access (coming soon) |
| 🔌 **MCP Integration** | Model Context Protocol server support |

---

## 📚 Templates

TaskWeave includes **11 production-ready, cost-optimized templates**:

### Research & Analysis
| Template | LLMs Used | Est. Cost |
|----------|-----------|-----------|
| 🔬 **Deep Research Report** | Gemini → GPT-4 → Gemini | $0.03 - $0.08 |
| 📊 **Competitive Analysis** | Gemini → GPT-4 → Gemini | $0.04 - $0.10 |
| 📈 **Market Research** | Gemini → GPT-4 → Gemini | $0.03 - $0.08 |

### Development
| Template | LLMs Used | Est. Cost |
|----------|-----------|-----------|
| 💻 **Code Review Pipeline** | Gemini → GPT-4 → Gemini | $0.02 - $0.05 |
| 🐛 **Bug Analysis & Fix** | Gemini → GPT-4 → Gemini | $0.02 - $0.06 |

### Content & Writing
| Template | LLMs Used | Est. Cost |
|----------|-----------|-----------|
| ✍️ **Blog Post Generator** | Gemini → GPT-4 → Gemini | $0.02 - $0.05 |
| 📧 **Email Campaign** | Gemini → GPT-4 | $0.01 - $0.03 |

### Data & Analysis
| Template | LLMs Used | Est. Cost |
|----------|-----------|-----------|
| 📉 **Data Insights** | Gemini → GPT-4 → Gemini | $0.02 - $0.06 |
| 🎯 **Decision Analysis** | Gemini → GPT-4 → Gemini | $0.03 - $0.08 |

### Productivity
| Template | LLMs Used | Est. Cost |
|----------|-----------|-----------|
| 📝 **Meeting Summary** | Gemini → GPT-4 | $0.01 - $0.03 |
| 👔 **Interview Prep** | Gemini → GPT-4 → Gemini | $0.02 - $0.05 |

---

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+**
- **Docker** (for PostgreSQL)
- **API Keys:**
  - [OpenAI](https://platform.openai.com/api-keys) (GPT-4)
  - [Google AI Studio](https://aistudio.google.com/app/apikey) (Gemini)

### Installation

```bash
# Clone repository
git clone https://github.com/YOUR_USERNAME/TaskWeave.git
cd TaskWeave

# Install dependencies
cd backend && npm install
cd ../frontend/taskweave-flow-main && npm install
```

### Configuration

```bash
# Copy environment template
cp backend/env.example backend/.env
```

Edit `backend/.env`:

```env
DATABASE_URL=postgresql://taskweave_user:taskweave_pass@localhost:5444/taskweave_db
JWT_SECRET=your-super-secret-jwt-key-change-this
OPENAI_API_KEY=sk-proj-your-key
GOOGLE_API_KEY=your-google-ai-studio-key
PORT=3000
```

### Run

```bash
# Terminal 1: Start PostgreSQL
docker-compose up -d

# Terminal 2: Start Backend (http://localhost:3000)
cd backend && npm run dev

# Terminal 3: Start Frontend (http://localhost:8080)
cd frontend/taskweave-flow-main && npm run dev
```

### Access

🌐 Open **http://localhost:8080**

**Demo Account:**
- Email: `demo@taskweave.com`
- Password: `Demo1234!`

---

## 🏗️ Architecture

```
TaskWeave/
├── backend/                    # Node.js + Fastify API
│   ├── src/
│   │   ├── routes/            # API endpoints
│   │   │   ├── auth.ts        # Authentication
│   │   │   ├── tasks.ts       # Task management
│   │   │   ├── templates.ts   # Template CRUD
│   │   │   ├── executions.ts  # Workflow execution
│   │   │   ├── agents.ts      # AI Agents
│   │   │   └── mcp.ts         # MCP integration
│   │   ├── services/
│   │   │   ├── WorkflowExecutionService.ts  # Core orchestration
│   │   │   ├── AgentService.ts              # AI agents
│   │   │   └── MCPService.ts                # MCP tools
│   │   ├── llm-providers/     # LLM integrations
│   │   │   ├── openai.ts
│   │   │   ├── google.ts
│   │   │   ├── anthropic.ts
│   │   │   └── gateway.ts     # Unified LLM gateway
│   │   └── db/                # Drizzle ORM schemas
│   └── migrations/
│
├── frontend/                   # React + TypeScript
│   └── taskweave-flow-main/
│       ├── src/
│       │   ├── pages/
│       │   │   ├── Dashboard.tsx
│       │   │   ├── Templates.tsx
│       │   │   ├── TemplateBuilder.tsx  # Visual workflow builder
│       │   │   └── TaskDetail.tsx
│       │   ├── components/
│       │   │   ├── landing/   # Landing page sections
│       │   │   └── template-builder/
│       │   │       ├── AINode.tsx
│       │   │       ├── AgentNode.tsx
│       │   │       ├── MCPToolNode.tsx
│       │   │       ├── NodePalette.tsx
│       │   │       └── PropertyPanel.tsx
│       │   └── store/
│       │       └── templateStore.ts  # 11 pre-built templates
│       └── public/
│
├── docs/                       # Documentation
└── docker-compose.yml          # PostgreSQL + Redis
```

---

## 🛠️ Tech Stack

<table>
<tr>
<td valign="top">

### Backend
- **Runtime:** Node.js 18+
- **Framework:** Fastify
- **Database:** PostgreSQL
- **ORM:** Drizzle
- **Auth:** JWT
- **Real-time:** Socket.IO

</td>
<td valign="top">

### Frontend
- **Framework:** React 18
- **Build:** Vite
- **Styling:** TailwindCSS
- **UI:** shadcn/ui
- **State:** Zustand
- **Flow:** React Flow

</td>
<td valign="top">

### AI Integration
- **OpenAI** GPT-4o, GPT-3.5
- **Google** Gemini 2.5 Flash
- **Anthropic** Claude 3.5
- **Gateway:** Unified API
- **MCP:** Tool integration

</td>
</tr>
</table>

---

## 📖 Documentation

| Document | Description |
|----------|-------------|
| 📘 [Documentation](docs/DOCUMENTATION.md) | Complete guide |
| 🔒 [Security Checklist](docs/SECURITY_CHECKLIST.md) | Pre-deployment audit |
| 🚀 [Production Guide](docs/PRODUCTION_READINESS.md) | Deployment steps |

---

## 📊 Project Status

| Milestone | Status |
|-----------|--------|
| Multi-LLM Orchestration | ✅ Complete |
| Visual Workflow Builder | ✅ Complete |
| 11 Cost-Optimized Templates | ✅ Complete |
| Real-time Execution | ✅ Complete |
| AI Agent Support | 🔄 In Progress |
| MCP Tool Integration | 🔄 In Progress |
| Claude Integration | 📋 Planned |
| Team Collaboration | 📋 Planned |

---

## 🤝 Contributing

Contributions welcome! Please read our contributing guidelines first.

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Fastify](https://www.fastify.io/) - Fast and low overhead web framework
- [shadcn/ui](https://ui.shadcn.com/) - Beautiful UI components
- [React Flow](https://reactflow.dev/) - Node-based workflow builder
- [OpenAI](https://openai.com/) & [Google AI](https://ai.google/) - LLM providers

---

<div align="center">

**Built with ❤️ for intelligent AI workflow automation**

[⬆ Back to top](#taskweave)

</div>
