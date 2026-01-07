import OpenAI from 'openai';
import { LLMProvider, LLMCallParams, LLMResponse, ModelInfo, PROVIDER_INFO, calculateCost } from './types';

export class OpenAIProvider implements LLMProvider {
  id = 'openai';
  name = 'OpenAI';
  
  private getClient(apiKey: string): OpenAI {
    return new OpenAI({ apiKey });
  }
  
  isConfigured(apiKey?: string): boolean {
    return !!apiKey && apiKey.startsWith('sk-');
  }
  
  getModels(): ModelInfo[] {
    return PROVIDER_INFO.openai.models;
  }
  
  async call(params: LLMCallParams, apiKey: string): Promise<LLMResponse> {
    const client = this.getClient(apiKey);
    const startTime = Date.now();
    
    try {
      const response = await client.chat.completions.create({
        model: params.model,
        messages: params.messages,
        temperature: params.temperature ?? 0.7,
        max_tokens: params.maxTokens ?? 4096,
        top_p: params.topP,
        frequency_penalty: params.frequencyPenalty,
        presence_penalty: params.presencePenalty,
        stop: params.stop,
      });
      
      const latencyMs = Date.now() - startTime;
      const usage = response.usage;
      
      const inputTokens = usage?.prompt_tokens ?? 0;
      const outputTokens = usage?.completion_tokens ?? 0;
      
      return {
        content: response.choices[0]?.message?.content ?? '',
        model: params.model,
        provider: this.id,
        tokens: {
          input: inputTokens,
          output: outputTokens,
          total: inputTokens + outputTokens,
        },
        cost: calculateCost(this.id, params.model, inputTokens, outputTokens),
        latencyMs,
        finishReason: this.mapFinishReason(response.choices[0]?.finish_reason),
      };
    } catch (error: any) {
      throw new Error(`OpenAI API error: ${error.message}`);
    }
  }
  
  estimateCost(inputTokens: number, outputTokens: number, model: string): number {
    return calculateCost(this.id, model, inputTokens, outputTokens);
  }
  
  countTokens(text: string): number {
    // Rough estimate: ~4 chars per token for English
    return Math.ceil(text.length / 4);
  }
  
  private mapFinishReason(reason: string | undefined): LLMResponse['finishReason'] {
    switch (reason) {
      case 'stop': return 'stop';
      case 'length': return 'length';
      case 'content_filter': return 'content_filter';
      default: return 'stop';
    }
  }
}


