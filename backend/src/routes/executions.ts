import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { WorkflowExecutionService } from '../services/WorkflowExecutionService';

// Schema for inline template data (for client-side templates)
const templateDataSchema = z.object({
  name: z.string().optional(),
  nodes: z.array(z.any()),
  edges: z.array(z.any()),
});

// Schema can accept either templateId (UUID) OR templateData (inline definition)
const executeWorkflowSchema = z.object({
  templateId: z.string().uuid('Invalid template ID').optional(),
  templateData: templateDataSchema.optional(),
  taskId: z.string().uuid('Invalid task ID'),
  variables: z.record(z.any()).default({}),
}).refine(
  data => data.templateId || data.templateData,
  { message: 'Either templateId or templateData must be provided' }
);

const executionIdSchema = z.object({
  id: z.string().uuid('Invalid execution ID'),
});

const taskIdSchema = z.object({
  taskId: z.string().uuid('Invalid task ID'),
});

export default async function executionRoutes(fastify: FastifyInstance) {
  const executionService = new WorkflowExecutionService();

  // Execute a workflow template
  fastify.post('/execute', {
    onRequest: [fastify.authenticate],
  }, async (request, reply) => {
    try {
      const { userId } = request.user as { userId: string };

      const body = executeWorkflowSchema.parse(request.body);
      const { templateId, templateData, taskId, variables } = body;

      request.log.info({ templateId, taskId, hasTemplateData: !!templateData }, 'Starting workflow execution');

      const execution = await executionService.executeWorkflow(
        templateId || null,
        taskId,
        userId,
        variables,
        templateData // Pass inline template data
      );

      reply.code(201).send(execution);
    } catch (error: any) {
      request.log.error({ error }, 'Failed to execute workflow');
      
      if (error instanceof z.ZodError) {
        return reply.code(400).send({ error: 'Validation error', details: error.errors });
      }

      reply.code(500).send({ 
        error: 'Failed to execute workflow', 
        message: error.message 
      });
    }
  });

  // Get execution status by ID
  fastify.get('/:id', {
    onRequest: [fastify.authenticate],
  }, async (request, reply) => {
    try {
      const { userId } = request.user as { userId: string };

      const params = executionIdSchema.parse(request.params);
      const { id } = params;

      const execution = await executionService.getExecutionById(id, userId);

      if (!execution) {
        return reply.code(404).send({ error: 'Execution not found' });
      }

      reply.send(execution);
    } catch (error: any) {
      request.log.error({ error }, 'Failed to get execution');
      
      if (error instanceof z.ZodError) {
        return reply.code(400).send({ error: 'Validation error', details: error.errors });
      }

      reply.code(500).send({ 
        error: 'Failed to get execution', 
        message: error.message 
      });
    }
  });

  // Cancel an execution
  fastify.post('/:id/cancel', {
    onRequest: [fastify.authenticate],
  }, async (request, reply) => {
    try {
      const { userId } = request.user as { userId: string };

      const params = executionIdSchema.parse(request.params);
      const { id } = params;

      request.log.info({ executionId: id }, 'Cancelling workflow execution');

      await executionService.cancelExecution(id, userId);

      reply.code(204).send();
    } catch (error: any) {
      request.log.error({ error }, 'Failed to cancel execution');
      
      if (error instanceof z.ZodError) {
        return reply.code(400).send({ error: 'Validation error', details: error.errors });
      }

      reply.code(500).send({ 
        error: 'Failed to cancel execution', 
        message: error.message 
      });
    }
  });

  // List executions for a specific task
  fastify.get('/task/:taskId', {
    onRequest: [fastify.authenticate],
  }, async (request, reply) => {
    try {
      const { userId } = request.user as { userId: string };

      const params = taskIdSchema.parse(request.params);
      const { taskId } = params;

      const executions = await executionService.listExecutionsForTask(taskId, userId);

      reply.send({ executions });
    } catch (error: any) {
      request.log.error({ error }, 'Failed to list executions');
      
      if (error instanceof z.ZodError) {
        return reply.code(400).send({ error: 'Validation error', details: error.errors });
      }

      reply.code(500).send({ 
        error: 'Failed to list executions', 
        message: error.message 
      });
    }
  });
}
