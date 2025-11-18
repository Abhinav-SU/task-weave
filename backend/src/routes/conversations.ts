import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { db } from '../db';
import { conversations, messages, tasks } from '../db/schema-simple';
import { eq, and, desc } from 'drizzle-orm';

// Validation schemas
const createConversationSchema = z.object({
  task_id: z.string().uuid(),
  platform: z.string(),
  platform_conversation_id: z.string().optional(),
  title: z.string().optional(),
  parent_conversation_id: z.string().uuid().optional(),
});

const addMessageSchema = z.object({
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string(),
  token_count: z.number().optional(),
  sequence_number: z.number(),
  metadata: z.object({
    code_blocks: z.array(z.object({
      language: z.string(),
      content: z.string(),
    })).optional(),
    images: z.array(z.string()).optional(),
    artifacts: z.array(z.any()).optional(),
    model: z.string().optional(),
  }).optional(),
});

const conversationRoutes: FastifyPluginAsync = async (fastify) => {
  // Create conversation
  fastify.post('/', {
    onRequest: [fastify.authenticate],
  }, async (request, reply) => {
    try {
      const { userId } = request.user as { userId: string };
      const body = createConversationSchema.parse(request.body);

      // Verify task belongs to user
      const task = await db.query.tasks.findFirst({
        where: and(eq(tasks.id, body.task_id), eq(tasks.user_id, userId)),
      });

      if (!task) {
        return reply.code(404).send({ error: 'Task not found' });
      }

      const [newConversation] = await db
        .insert(conversations)
        .values(body)
        .returning();

      return reply.code(201).send(newConversation);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.code(400).send({ error: error.errors });
      }
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });

  // Get conversation by ID
  fastify.get('/:id', {
    onRequest: [fastify.authenticate],
  }, async (request, reply) => {
    try {
      const { userId } = request.user as { userId: string };
      const { id } = request.params as { id: string };

      const conversation = await db.query.conversations.findFirst({
        where: eq(conversations.id, id),
        with: {
          messages: {
            orderBy: (messages, { asc }) => [asc(messages.sequence_number)],
          },
          task: {
            where: eq(tasks.user_id, userId),
          },
        },
      });

      if (!conversation || !conversation.task) {
        return reply.code(404).send({ error: 'Conversation not found' });
      }

      return reply.send(conversation);
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });

  // Add message to conversation
  fastify.post('/:id/messages', {
    onRequest: [fastify.authenticate],
  }, async (request, reply) => {
    try {
      const { userId } = request.user as { userId: string };
      const { id } = request.params as { id: string };
      const body = addMessageSchema.parse(request.body);

      // Verify conversation belongs to user
      const conversation = await db.query.conversations.findFirst({
        where: eq(conversations.id, id),
        with: {
          task: {
            where: eq(tasks.user_id, userId),
          },
        },
      });

      if (!conversation || !conversation.task) {
        return reply.code(404).send({ error: 'Conversation not found' });
      }

      const [newMessage] = await db
        .insert(messages)
        .values({
          conversation_id: id,
          ...body,
        })
        .returning();

      // Update conversation stats
      await db
        .update(conversations)
        .set({
          message_count: (conversation.message_count || 0) + 1,
          token_count: (conversation.token_count || 0) + (body.token_count || 0),
          updated_at: new Date(),
        })
        .where(eq(conversations.id, id));

      return reply.code(201).send(newMessage);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.code(400).send({ error: error.errors });
      }
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });

  // Get conversation tree (for branching conversations)
  fastify.get('/:id/tree', {
    onRequest: [fastify.authenticate],
  }, async (request, reply) => {
    try {
      const { userId } = request.user as { userId: string };
      const { id } = request.params as { id: string };

      // Get root conversation
      const rootConversation = await db.query.conversations.findFirst({
        where: eq(conversations.id, id),
        with: {
          task: {
            where: eq(tasks.user_id, userId),
          },
        },
      });

      if (!rootConversation || !rootConversation.task) {
        return reply.code(404).send({ error: 'Conversation not found' });
      }

      // Get all conversations for this task
      const allConversations = await db.query.conversations.findMany({
        where: eq(conversations.task_id, rootConversation.task_id),
        with: {
          messages: {
            orderBy: (messages, { asc }) => [asc(messages.sequence_number)],
          },
        },
      });

      // Build tree structure
      const buildTree = (parentId: string | null) => {
        return allConversations
          .filter(conv => conv.parent_conversation_id === parentId)
          .map(conv => ({
            ...conv,
            children: buildTree(conv.id),
          }));
      };

      const tree = buildTree(null);

      return reply.send({
        root: rootConversation,
        tree,
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });

  // Delete conversation
  fastify.delete('/:id', {
    onRequest: [fastify.authenticate],
  }, async (request, reply) => {
    try {
      const { userId } = request.user as { userId: string };
      const { id } = request.params as { id: string };

      // Verify conversation belongs to user
      const conversation = await db.query.conversations.findFirst({
        where: eq(conversations.id, id),
        with: {
          task: {
            where: eq(tasks.user_id, userId),
          },
        },
      });

      if (!conversation || !conversation.task) {
        return reply.code(404).send({ error: 'Conversation not found' });
      }

      await db.delete(conversations).where(eq(conversations.id, id));

      return reply.code(204).send();
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });
};

export default conversationRoutes;

