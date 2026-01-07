import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { db } from '../db';
import { workflows, workflowRuns, nodeExecutions } from '../db/schema';
import { eq, desc, and } from 'drizzle-orm';

// Validation schemas
const createRunSchema = z.object({
  workflow_id: z.string().uuid(),
  variables: z.record(z.any()).default({}),
});

export default async function runRoutes(fastify: FastifyInstance) {
  // Apply authentication to all routes
  fastify.addHook('preHandler', async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.code(401).send({ error: 'Unauthorized' });
    }
  });

  // ============================================
  // LIST ALL USER RUNS
  // ============================================
  fastify.get('/', async (request: FastifyRequest<{ 
    Querystring: { status?: string; limit?: string } 
  }>, reply: FastifyReply) => {
    const user = request.user as { id: string };
    const { status, limit = '50' } = request.query;
    
    try {
      let query = db
        .select({
          run: workflowRuns,
          workflow: {
            id: workflows.id,
            name: workflows.name,
            icon: workflows.icon,
          },
        })
        .from(workflowRuns)
        .leftJoin(workflows, eq(workflowRuns.workflow_id, workflows.id))
        .where(eq(workflowRuns.user_id, user.id))
        .orderBy(desc(workflowRuns.created_at))
        .limit(parseInt(limit));
      
      const runs = await query;
      
      // Filter by status if provided
      const filteredRuns = status 
        ? runs.filter(r => r.run.status === status)
        : runs;
      
      return {
        runs: filteredRuns.map(r => ({
          ...r.run,
          workflow: r.workflow,
        })),
        count: filteredRuns.length,
      };
    } catch (error: any) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to fetch runs' });
    }
  });

  // ============================================
  // GET SINGLE RUN WITH NODE EXECUTIONS
  // ============================================
  fastify.get('/:id', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const user = request.user as { id: string };
    const { id } = request.params;
    
    try {
      // Get the run
      const [run] = await db
        .select({
          run: workflowRuns,
          workflow: workflows,
        })
        .from(workflowRuns)
        .leftJoin(workflows, eq(workflowRuns.workflow_id, workflows.id))
        .where(
          and(
            eq(workflowRuns.id, id),
            eq(workflowRuns.user_id, user.id)
          )
        );
      
      if (!run) {
        return reply.code(404).send({ error: 'Run not found' });
      }
      
      // Get node executions
      const nodes = await db
        .select()
        .from(nodeExecutions)
        .where(eq(nodeExecutions.run_id, id))
        .orderBy(nodeExecutions.started_at);
      
      return {
        ...run.run,
        workflow: run.workflow,
        node_executions: nodes,
      };
    } catch (error: any) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to fetch run' });
    }
  });

  // ============================================
  // CREATE NEW RUN (Start workflow execution)
  // ============================================
  fastify.post('/', async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user as { id: string };
    
    try {
      const body = createRunSchema.parse(request.body);
      
      // Verify workflow exists and user has access
      const [workflow] = await db
        .select()
        .from(workflows)
        .where(eq(workflows.id, body.workflow_id));
      
      if (!workflow) {
        return reply.code(404).send({ error: 'Workflow not found' });
      }
      
      // Check access
      if (workflow.user_id !== user.id && !workflow.is_public && !workflow.is_template) {
        return reply.code(403).send({ error: 'Access denied' });
      }
      
      // Create the run
      const [run] = await db
        .insert(workflowRuns)
        .values({
          workflow_id: body.workflow_id,
          user_id: user.id,
          status: 'pending',
          input_variables: body.variables,
          started_at: new Date(),
        })
        .returning();
      
      // Update workflow run count
      await db
        .update(workflows)
        .set({ 
          run_count: (workflow.run_count || 0) + 1,
          updated_at: new Date(),
        })
        .where(eq(workflows.id, body.workflow_id));
      
      // TODO: Trigger actual workflow execution via WorkflowEngine
      // For now, we just create the run record
      // The WorkflowEngine will be called separately
      
      return reply.code(201).send({
        ...run,
        message: 'Run created. Execution will begin shortly.',
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return reply.code(400).send({ error: 'Validation error', details: error.errors });
      }
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to create run' });
    }
  });

  // ============================================
  // CANCEL RUN
  // ============================================
  fastify.post('/:id/cancel', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const user = request.user as { id: string };
    const { id } = request.params;
    
    try {
      const [run] = await db
        .select()
        .from(workflowRuns)
        .where(
          and(
            eq(workflowRuns.id, id),
            eq(workflowRuns.user_id, user.id)
          )
        );
      
      if (!run) {
        return reply.code(404).send({ error: 'Run not found' });
      }
      
      if (run.status === 'completed' || run.status === 'failed' || run.status === 'cancelled') {
        return reply.code(400).send({ error: 'Run already finished' });
      }
      
      const [updated] = await db
        .update(workflowRuns)
        .set({ 
          status: 'cancelled',
          completed_at: new Date(),
          updated_at: new Date(),
        })
        .where(eq(workflowRuns.id, id))
        .returning();
      
      return updated;
    } catch (error: any) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to cancel run' });
    }
  });

  // ============================================
  // GET NODE EXECUTION DETAILS
  // ============================================
  fastify.get('/:runId/nodes/:nodeId', async (request: FastifyRequest<{ 
    Params: { runId: string; nodeId: string } 
  }>, reply: FastifyReply) => {
    const user = request.user as { id: string };
    const { runId, nodeId } = request.params;
    
    try {
      // Verify user owns the run
      const [run] = await db
        .select()
        .from(workflowRuns)
        .where(
          and(
            eq(workflowRuns.id, runId),
            eq(workflowRuns.user_id, user.id)
          )
        );
      
      if (!run) {
        return reply.code(404).send({ error: 'Run not found' });
      }
      
      // Get the node execution
      const [nodeExec] = await db
        .select()
        .from(nodeExecutions)
        .where(
          and(
            eq(nodeExecutions.run_id, runId),
            eq(nodeExecutions.node_id, nodeId)
          )
        );
      
      if (!nodeExec) {
        return reply.code(404).send({ error: 'Node execution not found' });
      }
      
      return nodeExec;
    } catch (error: any) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to fetch node execution' });
    }
  });
}


