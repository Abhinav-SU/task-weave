import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import authRoutes from './routes/auth';
import taskRoutes from './routes/tasks';
import conversationRoutes from './routes/conversations';
import templateRoutes from './routes/templates';
import executionRoutes from './routes/executions';
import { agentRoutes } from './routes/agents';
import { mcpRoutes } from './routes/mcp';
import { setupWebSocket } from './websocket';
import { env, isProduction } from './config/env';

const PORT = env.PORT;
const HOST = env.HOST;
const JWT_SECRET = env.JWT_SECRET;

// Create Fastify instance
const app = Fastify({
  logger: {
    ...(isProduction
      ? {}
      : {
          transport: {
            target: 'pino-pretty',
            options: {
              translateTime: 'HH:MM:ss Z',
              ignore: 'pid,hostname',
            },
          },
        }),
  },
});

// Register plugins
async function registerPlugins() {
  // CORS
  await app.register(cors, {
    origin: env.CORS_ORIGIN,
    credentials: true,
  });

  // JWT
  await app.register(jwt, {
    secret: JWT_SECRET,
  });

  // JWT verification decorator
  app.decorate('authenticate', async function (request, reply) {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.code(401).send({ error: 'Unauthorized' });
    }
  });
}

// Register routes
async function registerRoutes() {
  // Health check
  app.get('/health', async () => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  });

  // API routes
  await app.register(authRoutes, { prefix: '/api/auth' });
  await app.register(taskRoutes, { prefix: '/api/tasks' });
  await app.register(conversationRoutes, { prefix: '/api/conversations' });
  await app.register(templateRoutes, { prefix: '/api/templates' });
  await app.register(executionRoutes, { prefix: '/api/executions' });
  await app.register(agentRoutes, { prefix: '/api/agents' });
  await app.register(mcpRoutes, { prefix: '/api/mcp' });
}

// Start server
async function start() {
  try {
    await registerPlugins();
    await registerRoutes();

    // Setup WebSocket server
    setupWebSocket(app);

    await app.listen({ port: PORT, host: HOST });
    
    console.log(`
🚀 TaskWeave 2.0 - Multi-LLM Orchestration Platform
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📡 HTTP Server: http://${HOST}:${PORT}
🔌 WebSocket: ws://${HOST}:${PORT}
🏥 Health: http://${HOST}:${PORT}/health
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 API Endpoints:
   🔐 Auth:       /api/auth
   📋 Tasks:      /api/tasks
   💬 Conversations: /api/conversations
   📑 Templates:  /api/templates
   ▶️  Executions: /api/executions
   🤖 Agents:     /api/agents
   🔌 MCP:        /api/mcp
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Environment: ${env.NODE_ENV}
    `);
  } catch (err) {
    console.error('❌ Fatal error starting server:');
    console.error(err);
    app.log.error(err);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  await app.close();
  process.exit(0);
});

// Start the server
start();

