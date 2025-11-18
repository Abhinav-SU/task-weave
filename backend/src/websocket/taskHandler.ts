import { Server as SocketIOServer, Socket } from 'socket.io';
import { SocketEvents, SocketUser, TaskUpdatePayload, SubscriptionPayload } from './types';
import { db } from '../db';
import { tasks } from '../db/schema-simple';
import { eq, and } from 'drizzle-orm';

export function registerTaskHandlers(io: SocketIOServer, socket: Socket) {
  const user = socket.data.user as SocketUser;

  // Subscribe to task updates
  socket.on(SocketEvents.TASK_SUBSCRIBE, async (data: SubscriptionPayload) => {
    try {
      const { taskId } = data;

      // Verify user owns this task
      const task = await db.query.tasks.findFirst({
        where: and(
          eq(tasks.id, taskId),
          eq(tasks.user_id, user.userId)
        ),
      });

      if (!task) {
        socket.emit(SocketEvents.ERROR, {
          event: SocketEvents.TASK_SUBSCRIBE,
          message: 'Task not found or access denied',
          taskId,
        });
        return;
      }

      // Join task room
      socket.join(`task:${taskId}`);
      
      socket.emit(SocketEvents.TASK_SUBSCRIBE, {
        success: true,
        taskId,
        timestamp: new Date().toISOString(),
      });

      console.log(`✓ User ${user.email} subscribed to task ${taskId}`);
    } catch (error) {
      console.error('Task subscribe error:', error);
      socket.emit(SocketEvents.ERROR, {
        event: SocketEvents.TASK_SUBSCRIBE,
        message: 'Failed to subscribe to task',
      });
    }
  });

  // Unsubscribe from task updates
  socket.on(SocketEvents.TASK_UNSUBSCRIBE, (data: SubscriptionPayload) => {
    try {
      const { taskId } = data;
      socket.leave(`task:${taskId}`);
      
      socket.emit(SocketEvents.TASK_UNSUBSCRIBE, {
        success: true,
        taskId,
        timestamp: new Date().toISOString(),
      });

      console.log(`✓ User ${user.email} unsubscribed from task ${taskId}`);
    } catch (error) {
      console.error('Task unsubscribe error:', error);
      socket.emit(SocketEvents.ERROR, {
        event: SocketEvents.TASK_UNSUBSCRIBE,
        message: 'Failed to unsubscribe from task',
      });
    }
  });

  // Handle task updates
  socket.on(SocketEvents.TASK_UPDATE, async (data: TaskUpdatePayload) => {
    try {
      const { taskId, updates } = data;

      // Verify user owns this task
      const task = await db.query.tasks.findFirst({
        where: and(
          eq(tasks.id, taskId),
          eq(tasks.user_id, user.userId)
        ),
      });

      if (!task) {
        socket.emit(SocketEvents.ERROR, {
          event: SocketEvents.TASK_UPDATE,
          message: 'Task not found or access denied',
          taskId,
        });
        return;
      }

      // Update task in database
      const [updatedTask] = await db
        .update(tasks)
        .set({
          ...updates,
          updated_at: new Date(),
        })
        .where(eq(tasks.id, taskId))
        .returning();

      // Broadcast to all subscribers in the task room
      io.to(`task:${taskId}`).emit(SocketEvents.TASK_UPDATED, {
        taskId,
        task: updatedTask,
        updatedBy: {
          userId: user.userId,
          email: user.email,
        },
        timestamp: new Date().toISOString(),
      });

      console.log(`✓ Task ${taskId} updated by ${user.email}`);
    } catch (error) {
      console.error('Task update error:', error);
      socket.emit(SocketEvents.ERROR, {
        event: SocketEvents.TASK_UPDATE,
        message: 'Failed to update task',
      });
    }
  });

  console.log(`✓ Task handlers registered for user ${user.email}`);
}

