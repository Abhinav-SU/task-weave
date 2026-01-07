import { FastifyInstance } from 'fastify';
import { db } from '../db';
import { tasks, conversations, messages } from '../db/schema-simple';
import { eq, and, desc } from 'drizzle-orm';
import { z } from 'zod';

// Templates are stored as special tasks with metadata
// We'll use the existing tasks table but with a special marker

const templateSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  category: z.string().default('General'),
  tags: z.array(z.string()).default([]),
  icon: z.string().default('📋'),
  isPublic: z.boolean().default(false),
  estimatedTime: z.number().default(30),
  nodes: z.any(),  // Workflow nodes (JSON)
  edges: z.any(),  // Workflow edges (JSON)
});

export default async function templateRoutes(fastify: FastifyInstance) {
  // Get all templates for current user
  fastify.get('/', {
    onRequest: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      const { userId } = request.user as { userId: string };
      
      // Fetch tasks marked as templates
      const templates = await db
        .select()
        .from(tasks)
        .where(
          and(
            eq(tasks.user_id, userId),
            eq(tasks.is_template, 'yes') // Use is_template field
          )
        )
        .orderBy(desc(tasks.updated_at));

      // Transform to template format
      const formattedTemplates = templates.map(task => ({
        id: task.id,
        name: task.title,
        description: task.description,
        category: task.metadata?.category || 'General',
        tags: task.tags || [],
        icon: task.metadata?.icon || '📋',
        isPublic: task.metadata?.isPublic || false,
        estimatedTime: task.metadata?.estimatedTime || 30,
        nodes: task.metadata?.nodes || [],
        edges: task.metadata?.edges || [],
        variables: task.metadata?.variables || {},
        createdAt: task.created_at,
        updatedAt: task.updated_at,
      }));

      reply.send({ templates: formattedTemplates });
    } catch (error) {
      request.log.error(error);
      reply.status(500).send({ error: 'Failed to fetch templates' });
    }
  });

  // Get single template
  fastify.get('/:id', {
    onRequest: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const { userId } = request.user as { userId: string };

      const [task] = await db
        .select()
        .from(tasks)
        .where(
          and(
            eq(tasks.id, id),
            eq(tasks.user_id, userId)
          )
        );

      if (!task) {
        return reply.status(404).send({ error: 'Template not found' });
      }

      const template = {
        id: task.id,
        name: task.title,
        description: task.description,
        category: task.metadata?.category || 'General',
        tags: task.tags || [],
        icon: task.metadata?.icon || '📋',
        isPublic: task.metadata?.isPublic || false,
        estimatedTime: task.metadata?.estimatedTime || 30,
        nodes: task.metadata?.nodes || [],
        edges: task.metadata?.edges || [],
        createdAt: task.created_at,
        updatedAt: task.updated_at,
      };

      reply.send(template);
    } catch (error) {
      request.log.error(error);
      reply.status(500).send({ error: 'Failed to fetch template' });
    }
  });

  // Create template
  fastify.post('/', {
    onRequest: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      const { userId } = request.user as { userId: string };
      const data = templateSchema.parse(request.body);

      const [template] = await db
        .insert(tasks)
        .values({
          user_id: userId,
          title: data.name,
          description: data.description || '',
          status: 'archived', // Templates are not active tasks
          platform: 'workflow', // Mark as workflow template
          tags: data.tags,
          is_template: 'true', // Mark this as a template
          metadata: {
            category: data.category,
            icon: data.icon,
            isPublic: data.isPublic,
            estimatedTime: data.estimatedTime,
            nodes: data.nodes,
            edges: data.edges,
          },
        })
        .returning();

      const formattedTemplate = {
        id: template.id,
        name: template.title,
        description: template.description,
        category: data.category,
        tags: template.tags || [],
        icon: data.icon,
        isPublic: data.isPublic,
        estimatedTime: data.estimatedTime,
        nodes: data.nodes,
        edges: data.edges,
        createdAt: template.created_at,
        updatedAt: template.updated_at,
      };

      reply.status(201).send(formattedTemplate);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: 'Validation error', details: error.errors });
      }
      request.log.error('Template creation error:', error);
      console.error('Template creation error:', error);
      reply.status(500).send({ 
        error: 'Failed to create template', 
        message: error.message,
        details: error.toString()
      });
    }
  });

  // Update template
  fastify.patch('/:id', {
    onRequest: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const { userId } = request.user as { userId: string };
      const updates = templateSchema.partial().parse(request.body);

      // Verify ownership
      const [existing] = await db
        .select()
        .from(tasks)
        .where(and(eq(tasks.id, id), eq(tasks.user_id, userId)));

      if (!existing) {
        return reply.status(404).send({ error: 'Template not found' });
      }

      // Update task with template data
      const [updated] = await db
        .update(tasks)
        .set({
          title: updates.name || existing.title,
          description: updates.description !== undefined ? updates.description : existing.description,
          tags: updates.tags || existing.tags,
          metadata: {
            ...existing.metadata,
            category: updates.category || existing.metadata?.category,
            icon: updates.icon || existing.metadata?.icon,
            isPublic: updates.isPublic !== undefined ? updates.isPublic : existing.metadata?.isPublic,
            estimatedTime: updates.estimatedTime || existing.metadata?.estimatedTime,
            nodes: updates.nodes || existing.metadata?.nodes,
            edges: updates.edges || existing.metadata?.edges,
          },
          updated_at: new Date(),
        })
        .where(eq(tasks.id, id))
        .returning();

      const formattedTemplate = {
        id: updated.id,
        name: updated.title,
        description: updated.description,
        category: updated.metadata?.category || 'General',
        tags: updated.tags || [],
        icon: updated.metadata?.icon || '📋',
        isPublic: updated.metadata?.isPublic || false,
        estimatedTime: updated.metadata?.estimatedTime || 30,
        nodes: updated.metadata?.nodes || [],
        edges: updated.metadata?.edges || [],
        createdAt: updated.created_at,
        updatedAt: updated.updated_at,
      };

      reply.send(formattedTemplate);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ error: 'Validation error', details: error.errors });
      }
      request.log.error(error);
      reply.status(500).send({ error: 'Failed to update template' });
    }
  });

  // Delete template
  fastify.delete('/:id', {
    onRequest: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const { userId } = request.user as { userId: string };

      const [deleted] = await db
        .delete(tasks)
        .where(and(eq(tasks.id, id), eq(tasks.user_id, userId)))
        .returning();

      if (!deleted) {
        return reply.status(404).send({ error: 'Template not found' });
      }

      reply.status(204).send();
    } catch (error) {
      request.log.error(error);
      reply.status(500).send({ error: 'Failed to delete template' });
    }
  });
}

