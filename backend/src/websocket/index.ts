import { Server as SocketIOServer } from 'socket.io';
import { FastifyInstance } from 'fastify';
import { registerConnectionHandlers } from './connectionHandler';
import { registerTaskHandlers } from './taskHandler';
import { registerConversationHandlers } from './conversationHandler';

export function setupWebSocket(fastify: FastifyInstance): SocketIOServer {
  const io = new SocketIOServer(fastify.server, {
    cors: {
      origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
      credentials: true,
    },
    transports: ['websocket', 'polling'],
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');

      if (!token) {
        return next(new Error('Authentication token required'));
      }

      // Verify JWT token using Fastify's JWT instance
      try {
        const decoded = fastify.jwt.verify(token) as { userId: string; email: string };
        
        // Attach user data to socket
        socket.data.user = {
          userId: decoded.userId,
          email: decoded.email,
        };

        next();
      } catch (err) {
        return next(new Error('Invalid or expired token'));
      }
    } catch (error) {
      console.error('WebSocket authentication error:', error);
      next(new Error('Authentication failed'));
    }
  });

  // Handle new connections
  io.on('connection', (socket) => {
    const user = socket.data.user;
    console.log(`🔌 WebSocket connected: ${user.email} (${socket.id})`);

    // Register all event handlers
    registerConnectionHandlers(io, socket);
    registerTaskHandlers(io, socket);
    registerConversationHandlers(io, socket);

    // Handle errors
    socket.on('error', (error) => {
      console.error(`WebSocket error for ${user.email}:`, error);
    });
  });

  // Global error handler
  io.engine.on('connection_error', (err) => {
    console.error('WebSocket connection error:', err.message);
  });

  console.log('🚀 WebSocket server initialized');

  return io;
}

export { SocketEvents } from './types';

