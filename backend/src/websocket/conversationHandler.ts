import { Server as SocketIOServer, Socket } from 'socket.io';
import { SocketEvents, SocketUser, ConversationAddPayload, MessageAddPayload, TypingPayload } from './types';
import { db } from '../db';
import { conversations, messages, tasks } from '../db/schema-simple';
import { eq, and } from 'drizzle-orm';

export function registerConversationHandlers(io: SocketIOServer, socket: Socket) {
  const user = socket.data.user as SocketUser;

  // Handle new conversation added
  socket.on(SocketEvents.CONVERSATION_ADD, async (data: ConversationAddPayload) => {
    try {
      const { taskId, conversationId, title, platform } = data;

      // Verify user owns the task
      const task = await db.query.tasks.findFirst({
        where: and(
          eq(tasks.id, taskId),
          eq(tasks.user_id, user.userId)
        ),
      });

      if (!task) {
        socket.emit(SocketEvents.ERROR, {
          event: SocketEvents.CONVERSATION_ADD,
          message: 'Task not found or access denied',
          taskId,
        });
        return;
      }

      // Fetch the conversation to get full details
      const conversation = await db.query.conversations.findFirst({
        where: eq(conversations.id, conversationId),
        with: {
          messages: {
            limit: 10,
            orderBy: (messages, { desc }) => [desc(messages.created_at)],
          },
        },
      });

      // Broadcast to task room
      io.to(`task:${taskId}`).emit(SocketEvents.CONVERSATION_ADDED, {
        taskId,
        conversation,
        addedBy: {
          userId: user.userId,
          email: user.email,
        },
        timestamp: new Date().toISOString(),
      });

      console.log(`✓ Conversation ${conversationId} added to task ${taskId} by ${user.email}`);
    } catch (error) {
      console.error('Conversation add error:', error);
      socket.emit(SocketEvents.ERROR, {
        event: SocketEvents.CONVERSATION_ADD,
        message: 'Failed to add conversation',
      });
    }
  });

  // Handle new message in conversation
  socket.on(SocketEvents.MESSAGE_ADD, async (data: MessageAddPayload) => {
    try {
      const { conversationId, messageId, sender, content, contentType } = data;

      // Fetch conversation to verify access
      const conversation = await db.query.conversations.findFirst({
        where: eq(conversations.id, conversationId),
        with: {
          task: true,
        },
      });

      if (!conversation) {
        socket.emit(SocketEvents.ERROR, {
          event: SocketEvents.MESSAGE_ADD,
          message: 'Conversation not found',
          conversationId,
        });
        return;
      }

      // Verify user owns the task
      if (conversation.task.user_id !== user.userId) {
        socket.emit(SocketEvents.ERROR, {
          event: SocketEvents.MESSAGE_ADD,
          message: 'Access denied',
          conversationId,
        });
        return;
      }

      // Fetch the message
      const message = await db.query.messages.findFirst({
        where: eq(messages.id, messageId),
      });

      // Broadcast to task room
      io.to(`task:${conversation.task_id}`).emit(SocketEvents.MESSAGE_ADDED, {
        conversationId,
        taskId: conversation.task_id,
        message,
        addedBy: {
          userId: user.userId,
          email: user.email,
        },
        timestamp: new Date().toISOString(),
      });

      console.log(`✓ Message added to conversation ${conversationId} by ${user.email}`);
    } catch (error) {
      console.error('Message add error:', error);
      socket.emit(SocketEvents.ERROR, {
        event: SocketEvents.MESSAGE_ADD,
        message: 'Failed to add message',
      });
    }
  });

  // Handle typing indicators
  socket.on(SocketEvents.TYPING_START, async (data: TypingPayload) => {
    try {
      const { conversationId } = data;

      // Fetch conversation to get task ID
      const conversation = await db.query.conversations.findFirst({
        where: eq(conversations.id, conversationId),
        with: {
          task: true,
        },
      });

      if (!conversation || conversation.task.user_id !== user.userId) {
        return; // Silently ignore invalid typing events
      }

      // Broadcast to task room (excluding sender)
      socket.to(`task:${conversation.task_id}`).emit(SocketEvents.TYPING_START, {
        conversationId,
        user: {
          userId: user.userId,
          email: user.email,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Typing start error:', error);
    }
  });

  socket.on(SocketEvents.TYPING_STOP, async (data: TypingPayload) => {
    try {
      const { conversationId } = data;

      // Fetch conversation to get task ID
      const conversation = await db.query.conversations.findFirst({
        where: eq(conversations.id, conversationId),
        with: {
          task: true,
        },
      });

      if (!conversation || conversation.task.user_id !== user.userId) {
        return; // Silently ignore invalid typing events
      }

      // Broadcast to task room (excluding sender)
      socket.to(`task:${conversation.task_id}`).emit(SocketEvents.TYPING_STOP, {
        conversationId,
        user: {
          userId: user.userId,
          email: user.email,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Typing stop error:', error);
    }
  });

  console.log(`✓ Conversation handlers registered for user ${user.email}`);
}

