import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { db } from '../db';
import { tasks } from '../db/schema-simple';
import { eq, and, desc, sql } from 'drizzle-orm';

// Validation schemas
const createTaskSchema = z.object({
  title: z.string().min(1).max(500),
  description: z.string().optional(),
  status: z.enum(['pending', 'active', 'in-progress', 'completed', 'archived']).optional().default('active'),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  platform: z.string().optional(),
  tags: z.array(z.string()).optional(),
  metadata: z.record(z.any()).optional(),
});

const updateTaskSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  description: z.string().optional(),
  status: z.enum(['pending', 'active', 'in-progress', 'completed', 'archived']).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  platform: z.string().optional(),
  tags: z.array(z.string()).optional(),
  metadata: z.record(z.any()).optional(),
});

const taskRoutes: FastifyPluginAsync = async (fastify) => {
  // Create task
  fastify.post('/', {
    onRequest: [fastify.authenticate],
  }, async (request, reply) => {
    try {
      const { userId } = request.user as { userId: string };
      const body = createTaskSchema.parse(request.body);

      // Map frontend status to backend status
      let status = body.status || 'active';
      if (status === 'in-progress') status = 'active';

      const [newTask] = await db
        .insert(tasks)
        .values({
          user_id: userId,
          title: body.title,
          description: body.description,
          status,
          platform: body.platform,
          tags: body.tags,
        })
        .returning();

      fastify.log.info(`✅ Task created: ${newTask.id} - ${newTask.title}`);
      return reply.code(201).send(newTask);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.code(400).send({ error: error.errors });
      }
      fastify.log.error('❌ Create task error:', error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });

  // List tasks
  fastify.get('/', {
    onRequest: [fastify.authenticate],
  }, async (request, reply) => {
    try {
      const { userId } = request.user as { userId: string };
      const { status, platform, limit = 50, offset = 0 } = request.query as {
        status?: string;
        platform?: string;
        limit?: number;
        offset?: number;
      };

      let conditions = [eq(tasks.user_id, userId)];

      if (status) {
        conditions.push(eq(tasks.status, status));
      }

      if (platform) {
        conditions.push(eq(tasks.platform, platform));
      }

      const tasksList = await db.query.tasks.findMany({
        where: and(...conditions),
        limit: Number(limit),
        offset: Number(offset),
        orderBy: desc(tasks.updated_at),
        with: {
          conversations: {
            limit: 5,
            orderBy: (conversations, { desc }) => [desc(conversations.updated_at)],
          },
        },
      });

      return reply.send({
        tasks: tasksList,
        pagination: {
          limit: Number(limit),
          offset: Number(offset),
        },
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });

  // Get task by ID
  fastify.get('/:id', {
    onRequest: [fastify.authenticate],
  }, async (request, reply) => {
    try {
      const { userId } = request.user as { userId: string };
      const { id } = request.params as { id: string };

      const task = await db.query.tasks.findFirst({
        where: and(eq(tasks.id, id), eq(tasks.user_id, userId)),
        with: {
          conversations: {
            with: {
              messages: {
                orderBy: (messages, { asc }) => [asc(messages.sequence_number)],
              },
            },
            orderBy: (conversations, { desc }) => [desc(conversations.updated_at)],
          },
        },
      });

      if (!task) {
        return reply.code(404).send({ error: 'Task not found' });
      }

      return reply.send(task);
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });

  // Update task
  fastify.patch('/:id', {
    onRequest: [fastify.authenticate],
  }, async (request, reply) => {
    try {
      const { userId } = request.user as { userId: string };
      const { id } = request.params as { id: string };
      const body = updateTaskSchema.parse(request.body);

      // Check if task exists and belongs to user
      const existingTask = await db.query.tasks.findFirst({
        where: and(eq(tasks.id, id), eq(tasks.user_id, userId)),
      });

      if (!existingTask) {
        return reply.code(404).send({ error: 'Task not found' });
      }

      // Map frontend status to backend status
      const updateData: any = { ...body, updated_at: new Date() };
      if (updateData.status === 'in-progress') {
        updateData.status = 'active';
      }

      const [updatedTask] = await db
        .update(tasks)
        .set(updateData)
        .where(eq(tasks.id, id))
        .returning();

      fastify.log.info(`✅ Task updated: ${updatedTask.id} - status: ${updatedTask.status}`);
      return reply.send(updatedTask);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.code(400).send({ error: error.errors });
      }
      fastify.log.error('❌ Update task error:', error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });

  // Delete task
  fastify.delete('/:id', {
    onRequest: [fastify.authenticate],
  }, async (request, reply) => {
    try {
      const { userId } = request.user as { userId: string };
      const { id } = request.params as { id: string };

      // Check if task exists and belongs to user
      const existingTask = await db.query.tasks.findFirst({
        where: and(eq(tasks.id, id), eq(tasks.user_id, userId)),
      });

      if (!existingTask) {
        fastify.log.warn(`❌ Delete failed: Task ${id} not found or doesn't belong to user`);
        return reply.code(404).send({ error: 'Task not found' });
      }

      await db.delete(tasks).where(eq(tasks.id, id));

      fastify.log.info(`✅ Task deleted: ${id} - ${existingTask.title}`);
      return reply.code(204).send();
    } catch (error) {
      fastify.log.error('❌ Delete task error:', error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });

  // Get task statistics
  fastify.get('/:id/stats', {
    onRequest: [fastify.authenticate],
  }, async (request, reply) => {
    try {
      const { userId } = request.user as { userId: string };
      const { id } = request.params as { id: string };

      // Check if task exists and belongs to user
      const task = await db.query.tasks.findFirst({
        where: and(eq(tasks.id, id), eq(tasks.user_id, userId)),
      });

      if (!task) {
        return reply.code(404).send({ error: 'Task not found' });
      }

      // Get statistics (you can enhance this with more complex queries)
      const conversationCount = await db.query.conversations.findMany({
        where: eq(tasks.id, id),
      });

      return reply.send({
        task_id: id,
        conversation_count: conversationCount.length,
        total_messages: conversationCount.reduce((sum, conv) => sum + (conv.message_count || 0), 0),
        total_tokens: conversationCount.reduce((sum, conv) => sum + (conv.token_count || 0), 0),
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Internal server error' });
    }
  });
};

export default taskRoutes;

