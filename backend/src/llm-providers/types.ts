// ============================================
// LLM PROVIDER TYPES
// ============================================

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMCallParams {
  model: string;
  messages: LLMMessage[];
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  stop?: string[];
}

export interface LLMResponse {
  content: string;
  model: string;
  provider: string;
  tokens: {
    input: number;
    output: number;
    total: number;
  };
  cost: number;
  latencyMs: number;
  finishReason: 'stop' | 'length' | 'content_filter' | 'error';
}

export interface LLMProviderInfo {
  id: string;
  name: string;
  icon: string;
  color: string;
  models: ModelInfo[];
  supportsStreaming: boolean;
  supportsVision: boolean;
  requiresApiKey: boolean;
}

export interface ModelInfo {
  id: string;
  name: string;
  description: string;
  contextWindow: number;
  maxOutput: number;
  inputPrice: number;  // per 1M tokens
  outputPrice: number; // per 1M tokens
  capabilities: ModelCapability[];
}

export type ModelCapability = 
  | 'chat'
  | 'code'
  | 'reasoning'
  | 'creative'
  | 'analysis'
  | 'vision'
  | 'web-search'
  | 'long-context'
  | 'fast';

export interface LLMProvider {
  id: string;
  name: string;
  
  // Check if provider is configured (has API key)
  isConfigured(apiKey?: string): boolean;
  
  // Get available models
  getModels(): ModelInfo[];
  
  // Call the LLM
  call(params: LLMCallParams, apiKey: string): Promise<LLMResponse>;
  
  // Estimate cost before calling
  estimateCost(inputTokens: number, outputTokens: number, model: string): number;
  
  // Count tokens (approximate)
  countTokens(text: string): number;
}

// ============================================
// PROVIDER CONFIGURATIONS
// ============================================

export const PROVIDER_INFO: Record<string, LLMProviderInfo> = {
  openai: {
    id: 'openai',
    name: 'OpenAI',
    icon: '🤖',
    color: '#10a37f',
    supportsStreaming: true,
    supportsVision: true,
    requiresApiKey: true,
    models: [
      {
        id: 'gpt-4o',
        name: 'GPT-4o',
        description: 'Most capable model, great for complex tasks',
        contextWindow: 128000,
        maxOutput: 4096,
        inputPrice: 2.50,
        outputPrice: 10.00,
        capabilities: ['chat', 'code', 'reasoning', 'creative', 'analysis', 'vision'],
      },
      {
        id: 'gpt-4o-mini',
        name: 'GPT-4o Mini',
        description: 'Fast and cost-effective for simpler tasks',
        contextWindow: 128000,
        maxOutput: 16384,
        inputPrice: 0.15,
        outputPrice: 0.60,
        capabilities: ['chat', 'code', 'fast'],
      },
      {
        id: 'gpt-4-turbo',
        name: 'GPT-4 Turbo',
        description: 'Powerful model with vision capabilities',
        contextWindow: 128000,
        maxOutput: 4096,
        inputPrice: 10.00,
        outputPrice: 30.00,
        capabilities: ['chat', 'code', 'reasoning', 'creative', 'analysis', 'vision'],
      },
    ],
  },
  
  anthropic: {
    id: 'anthropic',
    name: 'Anthropic',
    icon: '🧠',
    color: '#d4a574',
    supportsStreaming: true,
    supportsVision: true,
    requiresApiKey: true,
    models: [
      {
        id: 'claude-3-5-sonnet-20241022',
        name: 'Claude 3.5 Sonnet',
        description: 'Best balance of intelligence and speed',
        contextWindow: 200000,
        maxOutput: 8192,
        inputPrice: 3.00,
        outputPrice: 15.00,
        capabilities: ['chat', 'code', 'reasoning', 'creative', 'analysis', 'vision', 'long-context'],
      },
      {
        id: 'claude-3-opus-20240229',
        name: 'Claude 3 Opus',
        description: 'Most powerful for complex reasoning',
        contextWindow: 200000,
        maxOutput: 4096,
        inputPrice: 15.00,
        outputPrice: 75.00,
        capabilities: ['chat', 'code', 'reasoning', 'creative', 'analysis', 'vision', 'long-context'],
      },
      {
        id: 'claude-3-haiku-20240307',
        name: 'Claude 3 Haiku',
        description: 'Fastest and most compact',
        contextWindow: 200000,
        maxOutput: 4096,
        inputPrice: 0.25,
        outputPrice: 1.25,
        capabilities: ['chat', 'code', 'fast', 'long-context'],
      },
    ],
  },
  
  google: {
    id: 'google',
    name: 'Google',
    icon: '✨',
    color: '#4285f4',
    supportsStreaming: true,
    supportsVision: true,
    requiresApiKey: true,
    models: [
      {
        id: 'gemini-1.5-pro',
        name: 'Gemini 1.5 Pro',
        description: 'Advanced reasoning with 1M context',
        contextWindow: 1000000,
        maxOutput: 8192,
        inputPrice: 1.25,
        outputPrice: 5.00,
        capabilities: ['chat', 'code', 'reasoning', 'analysis', 'vision', 'long-context'],
      },
      {
        id: 'gemini-1.5-flash',
        name: 'Gemini 1.5 Flash',
        description: 'Fast and efficient',
        contextWindow: 1000000,
        maxOutput: 8192,
        inputPrice: 0.075,
        outputPrice: 0.30,
        capabilities: ['chat', 'code', 'fast', 'vision', 'long-context'],
      },
      {
        id: 'gemini-2.0-flash-exp',
        name: 'Gemini 2.0 Flash',
        description: 'Latest experimental model',
        contextWindow: 1000000,
        maxOutput: 8192,
        inputPrice: 0.10,
        outputPrice: 0.40,
        capabilities: ['chat', 'code', 'reasoning', 'fast', 'vision', 'long-context'],
      },
    ],
  },
  
  perplexity: {
    id: 'perplexity',
    name: 'Perplexity',
    icon: '🔍',
    color: '#20b2aa',
    supportsStreaming: true,
    supportsVision: false,
    requiresApiKey: true,
    models: [
      {
        id: 'llama-3.1-sonar-large-128k-online',
        name: 'Sonar Large Online',
        description: 'Web search with citations',
        contextWindow: 128000,
        maxOutput: 4096,
        inputPrice: 1.00,
        outputPrice: 1.00,
        capabilities: ['chat', 'web-search', 'analysis'],
      },
      {
        id: 'llama-3.1-sonar-small-128k-online',
        name: 'Sonar Small Online',
        description: 'Fast web search',
        contextWindow: 128000,
        maxOutput: 4096,
        inputPrice: 0.20,
        outputPrice: 0.20,
        capabilities: ['chat', 'web-search', 'fast'],
      },
    ],
  },
  
  deepseek: {
    id: 'deepseek',
    name: 'DeepSeek',
    icon: '🔮',
    color: '#6366f1',
    supportsStreaming: true,
    supportsVision: false,
    requiresApiKey: true,
    models: [
      {
        id: 'deepseek-chat',
        name: 'DeepSeek Chat',
        description: 'General purpose chat model',
        contextWindow: 64000,
        maxOutput: 4096,
        inputPrice: 0.14,
        outputPrice: 0.28,
        capabilities: ['chat', 'code', 'reasoning'],
      },
      {
        id: 'deepseek-reasoner',
        name: 'DeepSeek Reasoner',
        description: 'Advanced reasoning and math',
        contextWindow: 64000,
        maxOutput: 8192,
        inputPrice: 0.55,
        outputPrice: 2.19,
        capabilities: ['reasoning', 'code', 'analysis'],
      },
    ],
  },
  
  mistral: {
    id: 'mistral',
    name: 'Mistral',
    icon: '🌪️',
    color: '#ff7000',
    supportsStreaming: true,
    supportsVision: false,
    requiresApiKey: true,
    models: [
      {
        id: 'mistral-large-latest',
        name: 'Mistral Large',
        description: 'Most capable Mistral model',
        contextWindow: 128000,
        maxOutput: 4096,
        inputPrice: 2.00,
        outputPrice: 6.00,
        capabilities: ['chat', 'code', 'reasoning', 'analysis'],
      },
      {
        id: 'mistral-small-latest',
        name: 'Mistral Small',
        description: 'Fast and efficient',
        contextWindow: 32000,
        maxOutput: 4096,
        inputPrice: 0.20,
        outputPrice: 0.60,
        capabilities: ['chat', 'code', 'fast'],
      },
    ],
  },
};

// Helper to get all providers
export function getAllProviders(): LLMProviderInfo[] {
  return Object.values(PROVIDER_INFO);
}

// Helper to get provider by ID
export function getProviderInfo(providerId: string): LLMProviderInfo | undefined {
  return PROVIDER_INFO[providerId];
}

// Helper to get model info
export function getModelInfo(providerId: string, modelId: string): ModelInfo | undefined {
  const provider = PROVIDER_INFO[providerId];
  return provider?.models.find(m => m.id === modelId);
}

// Calculate cost
export function calculateCost(
  providerId: string, 
  modelId: string, 
  inputTokens: number, 
  outputTokens: number
): number {
  const model = getModelInfo(providerId, modelId);
  if (!model) return 0;
  
  const inputCost = (inputTokens / 1_000_000) * model.inputPrice;
  const outputCost = (outputTokens / 1_000_000) * model.outputPrice;
  
  return inputCost + outputCost;
}


