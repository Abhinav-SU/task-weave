import { Server as SocketIOServer, Socket } from 'socket.io';
import { SocketEvents, SocketUser } from './types';
import { db } from '../db';
import { tasks } from '../db/schema-simple';
import { eq } from 'drizzle-orm';

export function registerConnectionHandlers(io: SocketIOServer, socket: Socket) {
  const user = socket.data.user as SocketUser;

  // Connection initialization - send user's active tasks
  socket.on(SocketEvents.CONNECTION_INIT, async () => {
    try {
      // Fetch user's active tasks
      const userTasks = await db.query.tasks.findMany({
        where: eq(tasks.user_id, user.userId),
        limit: 100,
      });

      socket.emit(SocketEvents.CONNECTION_INIT, {
        success: true,
        userId: user.userId,
        activeTasks: userTasks.map(t => ({
          id: t.id,
          title: t.title,
          status: t.status,
        })),
        timestamp: new Date().toISOString(),
      });

      console.log(`✓ Connection initialized for user ${user.email}`);
    } catch (error) {
      console.error('Connection init error:', error);
      socket.emit(SocketEvents.ERROR, {
        event: SocketEvents.CONNECTION_INIT,
        message: 'Failed to initialize connection',
      });
    }
  });

  // Handle reconnection - rejoin previously subscribed rooms
  socket.on(SocketEvents.RECONNECT, async (data: { taskIds?: string[] }) => {
    try {
      if (data.taskIds && Array.isArray(data.taskIds)) {
        // Verify user owns these tasks before rejoining
        const userTasks = await db.query.tasks.findMany({
          where: eq(tasks.user_id, user.userId),
        });

        const validTaskIds = userTasks.map(t => t.id);
        const tasksToRejoin = data.taskIds.filter(id => validTaskIds.includes(id));

        tasksToRejoin.forEach(taskId => {
          socket.join(`task:${taskId}`);
        });

        socket.emit(SocketEvents.RECONNECT, {
          success: true,
          rejoinedTasks: tasksToRejoin,
          timestamp: new Date().toISOString(),
        });

        console.log(`✓ Reconnected user ${user.email} to ${tasksToRejoin.length} tasks`);
      }
    } catch (error) {
      console.error('Reconnection error:', error);
      socket.emit(SocketEvents.ERROR, {
        event: SocketEvents.RECONNECT,
        message: 'Failed to reconnect',
      });
    }
  });

  // Ping/Pong for heartbeat
  socket.on(SocketEvents.PING, () => {
    socket.emit(SocketEvents.PONG, {
      timestamp: new Date().toISOString(),
    });
  });

  // Handle disconnection
  socket.on('disconnect', (reason) => {
    console.log(`✗ User ${user.email} disconnected: ${reason}`);
  });

  // Log connection
  console.log(`✓ Connection handlers registered for user ${user.email}`);
}

