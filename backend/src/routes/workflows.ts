import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { db } from '../db';
import { workflows, workflowRuns, nodeExecutions } from '../db/schema';
import { eq, desc, and, sql } from 'drizzle-orm';
import { WorkflowNode, WorkflowEdge, VariableDefinition } from '../db/schema';

// Validation schemas
const createWorkflowSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  nodes: z.array(z.any()).default([]),
  edges: z.array(z.any()).default([]),
  variables: z.array(z.object({
    name: z.string(),
    type: z.enum(['string', 'number', 'boolean', 'array', 'object']),
    description: z.string().optional(),
    required: z.boolean().optional(),
    default: z.any().optional(),
  })).default([]),
  category: z.string().optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
  is_public: z.boolean().optional(),
});

const updateWorkflowSchema = createWorkflowSchema.partial();

const runWorkflowSchema = z.object({
  variables: z.record(z.any()).default({}),
});

export default async function workflowRoutes(fastify: FastifyInstance) {
  // Apply authentication to all routes
  fastify.addHook('preHandler', async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.code(401).send({ error: 'Unauthorized' });
    }
  });

  // ============================================
  // LIST WORKFLOWS
  // ============================================
  fastify.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user as { id: string };
    
    try {
      const userWorkflows = await db
        .select()
        .from(workflows)
        .where(eq(workflows.user_id, user.id))
        .orderBy(desc(workflows.updated_at));
      
      return {
        workflows: userWorkflows,
        count: userWorkflows.length,
      };
    } catch (error: any) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to fetch workflows' });
    }
  });

  // ============================================
  // LIST TEMPLATES (Public workflows)
  // ============================================
  fastify.get('/templates', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const templates = await db
        .select()
        .from(workflows)
        .where(eq(workflows.is_template, true))
        .orderBy(desc(workflows.run_count));
      
      return {
        templates,
        count: templates.length,
      };
    } catch (error: any) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to fetch templates' });
    }
  });

  // ============================================
  // GET SINGLE WORKFLOW
  // ============================================
  fastify.get('/:id', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const user = request.user as { id: string };
    const { id } = request.params;
    
    try {
      const [workflow] = await db
        .select()
        .from(workflows)
        .where(
          and(
            eq(workflows.id, id),
            eq(workflows.user_id, user.id)
          )
        );
      
      if (!workflow) {
        return reply.code(404).send({ error: 'Workflow not found' });
      }
      
      return workflow;
    } catch (error: any) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to fetch workflow' });
    }
  });

  // ============================================
  // CREATE WORKFLOW
  // ============================================
  fastify.post('/', async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user as { id: string };
    
    try {
      const body = createWorkflowSchema.parse(request.body);
      
      const [workflow] = await db
        .insert(workflows)
        .values({
          user_id: user.id,
          name: body.name,
          description: body.description,
          nodes: body.nodes as WorkflowNode[],
          edges: body.edges as WorkflowEdge[],
          variables: body.variables as VariableDefinition[],
          category: body.category,
          icon: body.icon,
          color: body.color,
          is_public: body.is_public ?? false,
        })
        .returning();
      
      return reply.code(201).send(workflow);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return reply.code(400).send({ error: 'Validation error', details: error.errors });
      }
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to create workflow' });
    }
  });

  // ============================================
  // UPDATE WORKFLOW
  // ============================================
  fastify.patch('/:id', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const user = request.user as { id: string };
    const { id } = request.params;
    
    try {
      const body = updateWorkflowSchema.parse(request.body);
      
      // Check ownership
      const [existing] = await db
        .select()
        .from(workflows)
        .where(and(eq(workflows.id, id), eq(workflows.user_id, user.id)));
      
      if (!existing) {
        return reply.code(404).send({ error: 'Workflow not found' });
      }
      
      const updateData: any = { updated_at: new Date() };
      if (body.name !== undefined) updateData.name = body.name;
      if (body.description !== undefined) updateData.description = body.description;
      if (body.nodes !== undefined) updateData.nodes = body.nodes;
      if (body.edges !== undefined) updateData.edges = body.edges;
      if (body.variables !== undefined) updateData.variables = body.variables;
      if (body.category !== undefined) updateData.category = body.category;
      if (body.icon !== undefined) updateData.icon = body.icon;
      if (body.color !== undefined) updateData.color = body.color;
      if (body.is_public !== undefined) updateData.is_public = body.is_public;
      
      const [updated] = await db
        .update(workflows)
        .set(updateData)
        .where(eq(workflows.id, id))
        .returning();
      
      return updated;
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return reply.code(400).send({ error: 'Validation error', details: error.errors });
      }
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to update workflow' });
    }
  });

  // ============================================
  // DELETE WORKFLOW
  // ============================================
  fastify.delete('/:id', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const user = request.user as { id: string };
    const { id } = request.params;
    
    try {
      const [existing] = await db
        .select()
        .from(workflows)
        .where(and(eq(workflows.id, id), eq(workflows.user_id, user.id)));
      
      if (!existing) {
        return reply.code(404).send({ error: 'Workflow not found' });
      }
      
      await db.delete(workflows).where(eq(workflows.id, id));
      
      return reply.code(204).send();
    } catch (error: any) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to delete workflow' });
    }
  });

  // ============================================
  // CLONE WORKFLOW (from template or own workflow)
  // ============================================
  fastify.post('/:id/clone', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const user = request.user as { id: string };
    const { id } = request.params;
    
    try {
      // Get the source workflow (must be owned by user or be public/template)
      const [source] = await db
        .select()
        .from(workflows)
        .where(eq(workflows.id, id));
      
      if (!source) {
        return reply.code(404).send({ error: 'Workflow not found' });
      }
      
      // Check access: user owns it, or it's public/template
      if (source.user_id !== user.id && !source.is_public && !source.is_template) {
        return reply.code(403).send({ error: 'Access denied' });
      }
      
      // Clone it
      const [cloned] = await db
        .insert(workflows)
        .values({
          user_id: user.id,
          name: `${source.name} (Copy)`,
          description: source.description,
          nodes: source.nodes,
          edges: source.edges,
          variables: source.variables,
          category: source.category,
          icon: source.icon,
          color: source.color,
          is_public: false,
          is_template: false,
        })
        .returning();
      
      return reply.code(201).send(cloned);
    } catch (error: any) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to clone workflow' });
    }
  });

  // ============================================
  // GET WORKFLOW RUNS
  // ============================================
  fastify.get('/:id/runs', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const user = request.user as { id: string };
    const { id } = request.params;
    
    try {
      const runs = await db
        .select()
        .from(workflowRuns)
        .where(
          and(
            eq(workflowRuns.workflow_id, id),
            eq(workflowRuns.user_id, user.id)
          )
        )
        .orderBy(desc(workflowRuns.created_at))
        .limit(50);
      
      return {
        runs,
        count: runs.length,
      };
    } catch (error: any) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to fetch runs' });
    }
  });
}


