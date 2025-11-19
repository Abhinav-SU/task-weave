import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import { config } from 'dotenv';
import { db } from './db';
import authRoutes from './routes/auth';
import taskRoutes from './routes/tasks';
import conversationRoutes from './routes/conversations';
import templateRoutes from './routes/templates';
import { setupWebSocket } from './websocket';

// Load environment variables
config();

const PORT = parseInt(process.env.PORT || '3000');
const HOST = process.env.HOST || 'localhost';

// Create Fastify instance
const app = Fastify({
  logger: {
    transport: {
      target: 'pino-pretty',
      options: {
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname',
      },
    },
  },
});

// Register plugins
async function registerPlugins() {
  // CORS
  await app.register(cors, {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
  });

  // JWT
  await app.register(jwt, {
    secret: process.env.JWT_SECRET || 'your-secret-key-change-this',
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
}

// Start server
async function start() {
  try {
    await registerPlugins();
    await registerRoutes();

    // Setup WebSocket server
    const io = setupWebSocket(app);

    await app.listen({ port: PORT, host: HOST });
    
    console.log(`
🚀 TaskWeave Backend Server Started
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📡 HTTP Server: http://${HOST}:${PORT}
🔌 WebSocket: ws://${HOST}:${PORT}
🏥 Health: http://${HOST}:${PORT}/health
🔐 Auth API: http://${HOST}:${PORT}/api/auth
📋 Tasks API: http://${HOST}:${PORT}/api/tasks
💬 Conversations API: http://${HOST}:${PORT}/api/conversations
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Environment: ${process.env.NODE_ENV || 'development'}
    `);
  } catch (err) {
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

