import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { db } from '../db';
import { llmConfigs } from '../db/schema';
import { eq, and } from 'drizzle-orm';
import { getLLMGateway, getAllProviders, getProviderInfo } from '../llm-providers';

// Validation schemas
const callLLMSchema = z.object({
  provider: z.string(),
  model: z.string(),
  messages: z.array(z.object({
    role: z.enum(['system', 'user', 'assistant']),
    content: z.string(),
  })),
  temperature: z.number().min(0).max(2).optional(),
  maxTokens: z.number().min(1).max(100000).optional(),
});

const saveLLMConfigSchema = z.object({
  provider: z.string(),
  api_key: z.string().min(1),
  default_model: z.string().optional(),
  max_tokens: z.number().optional(),
});

export default async function llmRoutes(fastify: FastifyInstance) {
  const gateway = getLLMGateway();

  // Apply authentication to all routes
  fastify.addHook('preHandler', async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.code(401).send({ error: 'Unauthorized' });
    }
  });

  // ============================================
  // GET ALL PROVIDERS INFO
  // ============================================
  fastify.get('/providers', async (request: FastifyRequest, reply: FastifyReply) => {
    const providers = getAllProviders();
    return { providers };
  });

  // ============================================
  // GET SINGLE PROVIDER INFO
  // ============================================
  fastify.get('/providers/:id', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const { id } = request.params;
    const provider = getProviderInfo(id);
    
    if (!provider) {
      return reply.code(404).send({ error: 'Provider not found' });
    }
    
    return provider;
  });

  // ============================================
  // GET USER'S CONFIGURED PROVIDERS
  // ============================================
  fastify.get('/configs', async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user as { id: string };
    
    try {
      const configs = await db
        .select({
          id: llmConfigs.id,
          provider: llmConfigs.provider,
          is_active: llmConfigs.is_active,
          default_model: llmConfigs.default_model,
          max_tokens: llmConfigs.max_tokens,
          created_at: llmConfigs.created_at,
          // Don't return API key!
        })
        .from(llmConfigs)
        .where(eq(llmConfigs.user_id, user.id));
      
      // Add provider info to each config
      const configsWithInfo = configs.map(config => ({
        ...config,
        provider_info: getProviderInfo(config.provider),
      }));
      
      return { configs: configsWithInfo };
    } catch (error: any) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to fetch configs' });
    }
  });

  // ============================================
  // SAVE/UPDATE PROVIDER CONFIG
  // ============================================
  fastify.post('/configs', async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user as { id: string };
    
    try {
      const body = saveLLMConfigSchema.parse(request.body);
      
      // Check if provider is valid
      if (!getProviderInfo(body.provider)) {
        return reply.code(400).send({ error: 'Invalid provider' });
      }
      
      // Check if config already exists for this provider
      const [existing] = await db
        .select()
        .from(llmConfigs)
        .where(
          and(
            eq(llmConfigs.user_id, user.id),
            eq(llmConfigs.provider, body.provider)
          )
        );
      
      if (existing) {
        // Update existing
        const [updated] = await db
          .update(llmConfigs)
          .set({
            api_key: body.api_key,
            default_model: body.default_model,
            max_tokens: body.max_tokens,
            is_active: true,
            updated_at: new Date(),
          })
          .where(eq(llmConfigs.id, existing.id))
          .returning({
            id: llmConfigs.id,
            provider: llmConfigs.provider,
            is_active: llmConfigs.is_active,
            default_model: llmConfigs.default_model,
            created_at: llmConfigs.created_at,
          });
        
        return { message: 'Config updated', config: updated };
      } else {
        // Create new
        const [created] = await db
          .insert(llmConfigs)
          .values({
            user_id: user.id,
            provider: body.provider,
            api_key: body.api_key,
            default_model: body.default_model,
            max_tokens: body.max_tokens,
          })
          .returning({
            id: llmConfigs.id,
            provider: llmConfigs.provider,
            is_active: llmConfigs.is_active,
            default_model: llmConfigs.default_model,
            created_at: llmConfigs.created_at,
          });
        
        return reply.code(201).send({ message: 'Config created', config: created });
      }
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return reply.code(400).send({ error: 'Validation error', details: error.errors });
      }
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to save config' });
    }
  });

  // ============================================
  // DELETE PROVIDER CONFIG
  // ============================================
  fastify.delete('/configs/:provider', async (request: FastifyRequest<{ Params: { provider: string } }>, reply: FastifyReply) => {
    const user = request.user as { id: string };
    const { provider } = request.params;
    
    try {
      await db
        .delete(llmConfigs)
        .where(
          and(
            eq(llmConfigs.user_id, user.id),
            eq(llmConfigs.provider, provider)
          )
        );
      
      return reply.code(204).send();
    } catch (error: any) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to delete config' });
    }
  });

  // ============================================
  // TEST PROVIDER CONNECTION
  // ============================================
  fastify.post('/test', async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user as { id: string };
    
    try {
      const body = z.object({
        provider: z.string(),
        api_key: z.string().optional(),
      }).parse(request.body);
      
      // Get API key from body or from saved config
      let apiKey = body.api_key;
      
      if (!apiKey) {
        const [config] = await db
          .select()
          .from(llmConfigs)
          .where(
            and(
              eq(llmConfigs.user_id, user.id),
              eq(llmConfigs.provider, body.provider)
            )
          );
        
        if (!config) {
          return reply.code(400).send({ error: 'No API key provided or saved' });
        }
        
        apiKey = config.api_key;
      }
      
      // Make a simple test call
      const providerInfo = getProviderInfo(body.provider);
      if (!providerInfo) {
        return reply.code(400).send({ error: 'Invalid provider' });
      }
      
      const testModel = providerInfo.models[providerInfo.models.length - 1].id; // Use cheapest model
      
      const response = await gateway.call(body.provider, {
        model: testModel,
        messages: [{ role: 'user', content: 'Hello! Please respond with just "OK".' }],
        maxTokens: 10,
      }, apiKey);
      
      return {
        success: true,
        message: 'Connection successful',
        response: response.content,
        tokens_used: response.tokens.total,
        cost: response.cost,
        latency_ms: response.latencyMs,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message,
      };
    }
  });

  // ============================================
  // CALL LLM
  // ============================================
  fastify.post('/call', async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user as { id: string };
    
    try {
      const body = callLLMSchema.parse(request.body);
      
      // Get API key from saved config
      const [config] = await db
        .select()
        .from(llmConfigs)
        .where(
          and(
            eq(llmConfigs.user_id, user.id),
            eq(llmConfigs.provider, body.provider)
          )
        );
      
      if (!config) {
        return reply.code(400).send({ 
          error: 'Provider not configured',
          message: `Please add your ${body.provider} API key in settings.`,
        });
      }
      
      const response = await gateway.call(body.provider, {
        model: body.model,
        messages: body.messages,
        temperature: body.temperature,
        maxTokens: body.maxTokens,
      }, config.api_key);
      
      return response;
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return reply.code(400).send({ error: 'Validation error', details: error.errors });
      }
      fastify.log.error(error);
      return reply.code(500).send({ error: error.message });
    }
  });

  // ============================================
  // GET RECOMMENDATIONS
  // ============================================
  fastify.get('/recommend/:capability', async (request: FastifyRequest<{ Params: { capability: string } }>, reply: FastifyReply) => {
    const { capability } = request.params;
    
    const recommendation = gateway.getRecommendedModel(capability);
    
    if (!recommendation) {
      return reply.code(404).send({ error: 'No recommendation for this capability' });
    }
    
    const providerInfo = getProviderInfo(recommendation.providerId);
    const modelInfo = providerInfo?.models.find(m => m.id === recommendation.modelId);
    
    return {
      capability,
      recommendation: {
        provider: providerInfo,
        model: modelInfo,
      },
    };
  });
}


