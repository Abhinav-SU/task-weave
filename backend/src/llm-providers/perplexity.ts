import { LLMProvider, LLMCallParams, LLMResponse, ModelInfo, PROVIDER_INFO, calculateCost } from './types';

export class PerplexityProvider implements LLMProvider {
  id = 'perplexity';
  name = 'Perplexity';
  
  private baseUrl = 'https://api.perplexity.ai';
  
  isConfigured(apiKey?: string): boolean {
    return !!apiKey && apiKey.startsWith('pplx-');
  }
  
  getModels(): ModelInfo[] {
    return PROVIDER_INFO.perplexity.models;
  }
  
  async call(params: LLMCallParams, apiKey: string): Promise<LLMResponse> {
    const startTime = Date.now();
    
    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: params.model,
          messages: params.messages,
          temperature: params.temperature ?? 0.7,
          max_tokens: params.maxTokens ?? 4096,
          top_p: params.topP,
          frequency_penalty: params.frequencyPenalty,
          presence_penalty: params.presencePenalty,
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `HTTP ${response.status}`);
      }
      
      const data = await response.json();
      const latencyMs = Date.now() - startTime;
      
      const usage = data.usage;
      const inputTokens = usage?.prompt_tokens ?? 0;
      const outputTokens = usage?.completion_tokens ?? 0;
      
      return {
        content: data.choices[0]?.message?.content ?? '',
        model: params.model,
        provider: this.id,
        tokens: {
          input: inputTokens,
          output: outputTokens,
          total: inputTokens + outputTokens,
        },
        cost: calculateCost(this.id, params.model, inputTokens, outputTokens),
        latencyMs,
        finishReason: this.mapFinishReason(data.choices[0]?.finish_reason),
      };
    } catch (error: any) {
      throw new Error(`Perplexity API error: ${error.message}`);
    }
  }
  
  estimateCost(inputTokens: number, outputTokens: number, model: string): number {
    return calculateCost(this.id, model, inputTokens, outputTokens);
  }
  
  countTokens(text: string): number {
    // Rough estimate: ~4 chars per token
    return Math.ceil(text.length / 4);
  }
  
  private mapFinishReason(reason: string | undefined): LLMResponse['finishReason'] {
    switch (reason) {
      case 'stop': return 'stop';
      case 'length': return 'length';
      default: return 'stop';
    }
  }
}


