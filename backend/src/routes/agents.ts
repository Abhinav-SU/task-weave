import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { agentService, AgentConfig } from '../services/AgentService';

const runAgentSchema = z.object({
  name: z.string().optional().default('TaskWeave Agent'),
  goal: z.string().min(1, 'Goal is required'),
  model: z.enum(['gpt-4o', 'claude-3-5-sonnet', 'gemini-2.5-pro']).default('gpt-4o'),
  tools: z.array(z.string()).default(['web-search', 'calculator', 'datetime']),
  maxIterations: z.number().min(1).max(20).default(5),
  input: z.string().min(1, 'Input is required'),
  verbose: z.boolean().optional().default(false),
});

export async function agentRoutes(fastify: FastifyInstance) {
  // Run an agent
  fastify.post('/run', async (request, reply) => {
    try {
      const body = runAgentSchema.parse(request.body);

      const config: AgentConfig = {
        name: body.name,
        goal: body.goal,
        model: body.model,
        tools: body.tools,
        maxIterations: body.maxIterations,
        verbose: body.verbose,
      };

      console.log(`\n🤖 Running agent "${config.name}" with input: ${body.input.substring(0, 100)}...`);

      const result = await agentService.runAgent(config, body.input);

      return {
        success: result.success,
        finalAnswer: result.finalAnswer,
        steps: result.steps,
        stats: {
          totalTokens: result.totalTokens,
          iterationsUsed: result.iterationsUsed,
          toolsUsed: result.toolsUsed,
        },
        error: result.error,
      };
    } catch (error: any) {
      console.error('Agent error:', error);
      
      if (error.name === 'ZodError') {
        return reply.status(400).send({
          error: 'Validation error',
          details: error.errors,
        });
      }
      
      return reply.status(500).send({
        error: error.message || 'Agent execution failed',
      });
    }
  });

  // Get available tools
  fastify.get('/tools', async (request, reply) => {
    try {
      const tools = agentService.getAvailableTools();
      return { tools };
    } catch (error: any) {
      return reply.status(500).send({
        error: error.message || 'Failed to get tools',
      });
    }
  });

  // Get agent presets (pre-configured agents)
  fastify.get('/presets', async (request, reply) => {
    const presets = [
      {
        id: 'research-agent',
        name: 'Research Agent',
        description: 'Researches topics using web search and provides comprehensive summaries',
        icon: '🔬',
        config: {
          model: 'gpt-4o',
          tools: ['web-search', 'datetime'],
          maxIterations: 8,
        },
        suggestedGoals: [
          'Research and summarize the topic comprehensively',
          'Find recent developments and key facts',
          'Compare different perspectives on the topic',
        ],
      },
      {
        id: 'math-agent',
        name: 'Math Agent',
        description: 'Solves mathematical problems step by step',
        icon: '🧮',
        config: {
          model: 'gpt-4o',
          tools: ['calculator'],
          maxIterations: 5,
        },
        suggestedGoals: [
          'Solve this math problem step by step',
          'Calculate and explain the solution',
        ],
      },
      {
        id: 'code-agent',
        name: 'Code Agent',
        description: 'Writes and executes code to solve problems',
        icon: '💻',
        config: {
          model: 'gpt-4o',
          tools: ['code-execute', 'calculator'],
          maxIterations: 6,
        },
        suggestedGoals: [
          'Write code to solve this problem',
          'Implement and test the solution',
        ],
      },
      {
        id: 'analyst-agent',
        name: 'Analyst Agent',
        description: 'Analyzes data and provides insights',
        icon: '📊',
        config: {
          model: 'gpt-4o',
          tools: ['calculator', 'datetime', 'code-execute'],
          maxIterations: 10,
        },
        suggestedGoals: [
          'Analyze this data and provide insights',
          'Find patterns and trends',
        ],
      },
    ];

    return { presets };
  });
}

