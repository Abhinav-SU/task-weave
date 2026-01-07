import { GoogleGenerativeAI } from '@google/generative-ai';
import { LLMProvider, LLMCallParams, LLMResponse, ModelInfo, PROVIDER_INFO, calculateCost } from './types';

export class GoogleProvider implements LLMProvider {
  id = 'google';
  name = 'Google';
  
  private getClient(apiKey: string): GoogleGenerativeAI {
    return new GoogleGenerativeAI(apiKey);
  }
  
  isConfigured(apiKey?: string): boolean {
    return !!apiKey && apiKey.length > 10;
  }
  
  getModels(): ModelInfo[] {
    return PROVIDER_INFO.google.models;
  }
  
  async call(params: LLMCallParams, apiKey: string): Promise<LLMResponse> {
    const client = this.getClient(apiKey);
    const startTime = Date.now();
    
    try {
      const model = client.getGenerativeModel({ 
        model: params.model,
        generationConfig: {
          temperature: params.temperature ?? 0.7,
          maxOutputTokens: params.maxTokens ?? 4096,
          topP: params.topP,
          stopSequences: params.stop,
        },
      });
      
      // Build the prompt from messages
      const systemMessage = params.messages.find(m => m.role === 'system');
      const chatMessages = params.messages.filter(m => m.role !== 'system');
      
      // For Gemini, we need to format as a chat
      const history = chatMessages.slice(0, -1).map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }],
      }));
      
      const lastMessage = chatMessages[chatMessages.length - 1];
      
      const chat = model.startChat({
        history: history as any,
        systemInstruction: systemMessage ? { parts: [{ text: systemMessage.content }] } : undefined,
      });
      
      const result = await chat.sendMessage(lastMessage.content);
      const response = result.response;
      
      const latencyMs = Date.now() - startTime;
      
      // Get token counts from usage metadata
      const usageMetadata = response.usageMetadata;
      const inputTokens = usageMetadata?.promptTokenCount ?? this.countTokens(
        params.messages.map(m => m.content).join(' ')
      );
      const outputTokens = usageMetadata?.candidatesTokenCount ?? this.countTokens(
        response.text()
      );
      
      return {
        content: response.text(),
        model: params.model,
        provider: this.id,
        tokens: {
          input: inputTokens,
          output: outputTokens,
          total: inputTokens + outputTokens,
        },
        cost: calculateCost(this.id, params.model, inputTokens, outputTokens),
        latencyMs,
        finishReason: this.mapFinishReason(response.candidates?.[0]?.finishReason),
      };
    } catch (error: any) {
      throw new Error(`Google AI API error: ${error.message}`);
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
      case 'STOP': return 'stop';
      case 'MAX_TOKENS': return 'length';
      case 'SAFETY': return 'content_filter';
      default: return 'stop';
    }
  }
}


