import Anthropic from '@anthropic-ai/sdk';
import { LLMProvider, LLMCallParams, LLMResponse, ModelInfo, PROVIDER_INFO, calculateCost } from './types';

export class AnthropicProvider implements LLMProvider {
  id = 'anthropic';
  name = 'Anthropic';
  
  private getClient(apiKey: string): Anthropic {
    return new Anthropic({ apiKey });
  }
  
  isConfigured(apiKey?: string): boolean {
    return !!apiKey && apiKey.startsWith('sk-ant-');
  }
  
  getModels(): ModelInfo[] {
    return PROVIDER_INFO.anthropic.models;
  }
  
  async call(params: LLMCallParams, apiKey: string): Promise<LLMResponse> {
    const client = this.getClient(apiKey);
    const startTime = Date.now();
    
    // Extract system message if present
    const systemMessage = params.messages.find(m => m.role === 'system');
    const otherMessages = params.messages.filter(m => m.role !== 'system');
    
    try {
      const response = await client.messages.create({
        model: params.model,
        max_tokens: params.maxTokens ?? 4096,
        system: systemMessage?.content,
        messages: otherMessages.map(m => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        })),
        temperature: params.temperature ?? 0.7,
        top_p: params.topP,
        stop_sequences: params.stop,
      });
      
      const latencyMs = Date.now() - startTime;
      
      const inputTokens = response.usage.input_tokens;
      const outputTokens = response.usage.output_tokens;
      
      // Extract text content from response
      const textContent = response.content
        .filter(block => block.type === 'text')
        .map(block => (block as { type: 'text'; text: string }).text)
        .join('');
      
      return {
        content: textContent,
        model: params.model,
        provider: this.id,
        tokens: {
          input: inputTokens,
          output: outputTokens,
          total: inputTokens + outputTokens,
        },
        cost: calculateCost(this.id, params.model, inputTokens, outputTokens),
        latencyMs,
        finishReason: this.mapFinishReason(response.stop_reason),
      };
    } catch (error: any) {
      throw new Error(`Anthropic API error: ${error.message}`);
    }
  }
  
  estimateCost(inputTokens: number, outputTokens: number, model: string): number {
    return calculateCost(this.id, model, inputTokens, outputTokens);
  }
  
  countTokens(text: string): number {
    // Rough estimate: ~4 chars per token for English
    return Math.ceil(text.length / 4);
  }
  
  private mapFinishReason(reason: string | null): LLMResponse['finishReason'] {
    switch (reason) {
      case 'end_turn': return 'stop';
      case 'max_tokens': return 'length';
      case 'stop_sequence': return 'stop';
      default: return 'stop';
    }
  }
}


