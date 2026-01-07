import { LLMProvider, LLMCallParams, LLMResponse, LLMProviderInfo, getAllProviders, getProviderInfo } from './types';
import { OpenAIProvider } from './openai';
import { AnthropicProvider } from './anthropic';
import { GoogleProvider } from './google';
import { PerplexityProvider } from './perplexity';
import { DeepSeekProvider } from './deepseek';
import { MistralProvider } from './mistral';

/**
 * LLM Gateway - Unified interface for calling multiple LLM providers
 * 
 * Usage:
 *   const gateway = new LLMGateway();
 *   const response = await gateway.call('openai', params, apiKey);
 */
export class LLMGateway {
  private providers: Map<string, LLMProvider>;
  
  constructor() {
    this.providers = new Map();
    
    // Register all providers
    this.registerProvider(new OpenAIProvider());
    this.registerProvider(new AnthropicProvider());
    this.registerProvider(new GoogleProvider());
    this.registerProvider(new PerplexityProvider());
    this.registerProvider(new DeepSeekProvider());
    this.registerProvider(new MistralProvider());
  }
  
  /**
   * Register a new provider
   */
  registerProvider(provider: LLMProvider): void {
    this.providers.set(provider.id, provider);
  }
  
  /**
   * Get a provider by ID
   */
  getProvider(providerId: string): LLMProvider | undefined {
    return this.providers.get(providerId);
  }
  
  /**
   * Get all registered providers
   */
  getProviders(): LLMProvider[] {
    return Array.from(this.providers.values());
  }
  
  /**
   * Get provider info (models, pricing, etc.)
   */
  getProviderInfo(providerId: string): LLMProviderInfo | undefined {
    return getProviderInfo(providerId);
  }
  
  /**
   * Get all provider info
   */
  getAllProviderInfo(): LLMProviderInfo[] {
    return getAllProviders();
  }
  
  /**
   * Check if a provider is configured with a valid API key
   */
  isProviderConfigured(providerId: string, apiKey?: string): boolean {
    const provider = this.getProvider(providerId);
    return provider?.isConfigured(apiKey) ?? false;
  }
  
  /**
   * Call an LLM provider
   */
  async call(
    providerId: string, 
    params: LLMCallParams, 
    apiKey: string
  ): Promise<LLMResponse> {
    const provider = this.getProvider(providerId);
    
    if (!provider) {
      throw new Error(`Unknown provider: ${providerId}`);
    }
    
    if (!provider.isConfigured(apiKey)) {
      throw new Error(`Provider ${providerId} is not configured. Check your API key.`);
    }
    
    return provider.call(params, apiKey);
  }
  
  /**
   * Estimate cost for a call
   */
  estimateCost(
    providerId: string,
    modelId: string,
    inputTokens: number,
    outputTokens: number
  ): number {
    const provider = this.getProvider(providerId);
    return provider?.estimateCost(inputTokens, outputTokens, modelId) ?? 0;
  }
  
  /**
   * Count tokens in text (approximate)
   */
  countTokens(providerId: string, text: string): number {
    const provider = this.getProvider(providerId);
    return provider?.countTokens(text) ?? Math.ceil(text.length / 4);
  }
  
  /**
   * Get the best model for a specific capability
   */
  getRecommendedModel(capability: string): { providerId: string; modelId: string } | null {
    // Recommendations based on capability
    const recommendations: Record<string, { providerId: string; modelId: string }> = {
      'reasoning': { providerId: 'anthropic', modelId: 'claude-3-5-sonnet-20241022' },
      'code': { providerId: 'anthropic', modelId: 'claude-3-5-sonnet-20241022' },
      'creative': { providerId: 'anthropic', modelId: 'claude-3-5-sonnet-20241022' },
      'analysis': { providerId: 'openai', modelId: 'gpt-4o' },
      'web-search': { providerId: 'perplexity', modelId: 'llama-3.1-sonar-large-128k-online' },
      'fast': { providerId: 'google', modelId: 'gemini-1.5-flash' },
      'long-context': { providerId: 'google', modelId: 'gemini-1.5-pro' },
      'vision': { providerId: 'openai', modelId: 'gpt-4o' },
      'chat': { providerId: 'openai', modelId: 'gpt-4o-mini' },
    };
    
    return recommendations[capability] || null;
  }
}

// Singleton instance
let gatewayInstance: LLMGateway | null = null;

export function getLLMGateway(): LLMGateway {
  if (!gatewayInstance) {
    gatewayInstance = new LLMGateway();
  }
  return gatewayInstance;
}


