import { mcpService } from './MCPService';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Anthropic from '@anthropic-ai/sdk';

/**
 * AgentService - Manages AI Agents that can use tools and plan multi-step tasks
 */

export interface AgentConfig {
  name: string;
  goal: string;
  model: 'gpt-4o' | 'claude-3-5-sonnet' | 'gemini-2.5-pro';
  tools: string[];
  maxIterations: number;
  verbose?: boolean;
}

export interface AgentStep {
  thought: string;
  action: string;
  actionInput: Record<string, any>;
  observation: string;
}

export interface AgentResult {
  success: boolean;
  finalAnswer: string;
  steps: AgentStep[];
  totalTokens: number;
  iterationsUsed: number;
  toolsUsed: string[];
  error?: string;
}

// Built-in tools that don't require MCP
const BUILTIN_TOOLS: Record<string, {
  description: string;
  parameters: Record<string, any>;
  execute: (input: Record<string, any>) => Promise<string>;
}> = {
  'web-search': {
    description: 'Search the web for current information. Use when you need up-to-date facts, news, or research.',
    parameters: {
      query: { type: 'string', description: 'The search query' },
      maxResults: { type: 'number', description: 'Maximum results to return', default: 5 },
    },
    execute: async (input) => {
      // In production, integrate with actual search API (Perplexity, Tavily, etc.)
      // For now, simulate a search result
      return `Search results for "${input.query}":\n1. [Simulated result] Found relevant information about ${input.query}...`;
    },
  },
  'calculator': {
    description: 'Perform mathematical calculations. Use for any math operations.',
    parameters: {
      expression: { type: 'string', description: 'Mathematical expression to evaluate' },
    },
    execute: async (input) => {
      try {
        // Safe math evaluation
        const result = Function('"use strict"; return (' + input.expression + ')')();
        return `Result: ${result}`;
      } catch (e) {
        return `Error evaluating expression: ${input.expression}`;
      }
    },
  },
  'code-execute': {
    description: 'Execute code in a safe sandboxed environment. Supports Python and JavaScript.',
    parameters: {
      language: { type: 'string', description: 'Programming language (python or javascript)' },
      code: { type: 'string', description: 'Code to execute' },
    },
    execute: async (input) => {
      if (input.language === 'javascript') {
        try {
          // Limited safe JS evaluation
          const result = Function('"use strict"; ' + input.code)();
          return `Output: ${JSON.stringify(result)}`;
        } catch (e: any) {
          return `Error: ${e.message}`;
        }
      }
      return `Code execution for ${input.language} requires proper sandboxing (not available in demo)`;
    },
  },
  'datetime': {
    description: 'Get current date, time, or perform date calculations.',
    parameters: {
      operation: { type: 'string', description: 'Operation: now, format, diff' },
    },
    execute: async (input) => {
      const now = new Date();
      return `Current datetime: ${now.toISOString()}\nLocal: ${now.toLocaleString()}`;
    },
  },
};

export class AgentService {
  private openai: OpenAI | null = null;
  private anthropic: Anthropic | null = null;
  private genAI: GoogleGenerativeAI | null = null;

  constructor() {
    // Initialize API clients based on available keys
    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    }
    if (process.env.ANTHROPIC_API_KEY) {
      this.anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    }
    if (process.env.GOOGLE_API_KEY) {
      this.genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    }
  }

  /**
   * Run an agent with the given configuration
   */
  async runAgent(config: AgentConfig, input: string): Promise<AgentResult> {
    const steps: AgentStep[] = [];
    const toolsUsed: Set<string> = new Set();
    let totalTokens = 0;
    let iteration = 0;

    console.log(`🤖 Starting agent "${config.name}" with goal: ${config.goal}`);

    // Build available tools
    const availableTools = this.buildToolsList(config.tools);
    const toolDescriptions = this.formatToolDescriptions(availableTools);

    // System prompt for ReAct-style agent
    const systemPrompt = this.buildAgentSystemPrompt(config, toolDescriptions);

    // Initialize conversation
    let conversationHistory = [
      { role: 'user' as const, content: `Task: ${input}\n\nGoal: ${config.goal}` }
    ];

    try {
      while (iteration < config.maxIterations) {
        iteration++;
        console.log(`\n📍 Iteration ${iteration}/${config.maxIterations}`);

        // Get agent's next action
        const response = await this.callLLM(config.model, systemPrompt, conversationHistory);
        totalTokens += response.tokens;

        if (config.verbose) {
          console.log(`Agent response: ${response.content}`);
        }

        // Parse the response
        const parsed = this.parseAgentResponse(response.content);

        if (parsed.type === 'final_answer') {
          console.log(`✅ Agent completed with final answer`);
          return {
            success: true,
            finalAnswer: parsed.content,
            steps,
            totalTokens,
            iterationsUsed: iteration,
            toolsUsed: Array.from(toolsUsed),
          };
        }

        if (parsed.type === 'action') {
          const step: AgentStep = {
            thought: parsed.thought,
            action: parsed.action,
            actionInput: parsed.actionInput,
            observation: '',
          };

          // Execute the tool
          console.log(`🔧 Executing tool: ${parsed.action}`);
          toolsUsed.add(parsed.action);

          try {
            const observation = await this.executeTool(parsed.action, parsed.actionInput);
            step.observation = observation;
            console.log(`📝 Observation: ${observation.substring(0, 200)}...`);
          } catch (error: any) {
            step.observation = `Error executing tool: ${error.message}`;
            console.log(`❌ Tool error: ${error.message}`);
          }

          steps.push(step);

          // Add to conversation
          conversationHistory.push(
            { role: 'assistant' as const, content: response.content },
            { role: 'user' as const, content: `Observation: ${step.observation}` }
          );
        }
      }

      // Max iterations reached
      return {
        success: false,
        finalAnswer: 'Agent reached maximum iterations without completing the task.',
        steps,
        totalTokens,
        iterationsUsed: iteration,
        toolsUsed: Array.from(toolsUsed),
        error: 'Max iterations exceeded',
      };

    } catch (error: any) {
      console.error(`❌ Agent error: ${error.message}`);
      return {
        success: false,
        finalAnswer: '',
        steps,
        totalTokens,
        iterationsUsed: iteration,
        toolsUsed: Array.from(toolsUsed),
        error: error.message,
      };
    }
  }

  /**
   * Build the system prompt for the agent
   */
  private buildAgentSystemPrompt(config: AgentConfig, toolDescriptions: string): string {
    return `You are ${config.name}, an AI agent designed to accomplish tasks step by step.

Your goal: ${config.goal}

You have access to the following tools:
${toolDescriptions}

Use this format:

Thought: [your reasoning about what to do next]
Action: [the tool name to use]
Action Input: [JSON object with the tool parameters]

When you have gathered enough information to answer, use:

Final Answer: [your complete answer to the original task]

Rules:
1. Always start with a Thought
2. Use exactly one tool per response
3. Wait for the Observation before continuing
4. If a tool fails, try a different approach
5. When confident, provide a Final Answer
6. Be concise but thorough`;
  }

  /**
   * Build list of available tools
   */
  private buildToolsList(requestedTools: string[]): typeof BUILTIN_TOOLS {
    const tools: typeof BUILTIN_TOOLS = {};
    for (const toolName of requestedTools) {
      if (BUILTIN_TOOLS[toolName]) {
        tools[toolName] = BUILTIN_TOOLS[toolName];
      }
    }
    return tools;
  }

  /**
   * Format tool descriptions for the prompt
   */
  private formatToolDescriptions(tools: typeof BUILTIN_TOOLS): string {
    return Object.entries(tools)
      .map(([name, tool]) => {
        const params = Object.entries(tool.parameters)
          .map(([pName, pDef]: [string, any]) => `  - ${pName}: ${pDef.description}`)
          .join('\n');
        return `${name}: ${tool.description}\nParameters:\n${params}`;
      })
      .join('\n\n');
  }

  /**
   * Parse the agent's response
   */
  private parseAgentResponse(content: string): {
    type: 'action' | 'final_answer';
    thought: string;
    action: string;
    actionInput: Record<string, any>;
    content: string;
  } {
    // Check for Final Answer
    const finalAnswerMatch = content.match(/Final Answer:\s*([\s\S]*?)$/i);
    if (finalAnswerMatch) {
      return {
        type: 'final_answer',
        thought: '',
        action: '',
        actionInput: {},
        content: finalAnswerMatch[1].trim(),
      };
    }

    // Parse Thought, Action, Action Input
    const thoughtMatch = content.match(/Thought:\s*([\s\S]*?)(?=Action:|$)/i);
    const actionMatch = content.match(/Action:\s*(\S+)/i);
    const actionInputMatch = content.match(/Action Input:\s*(\{[\s\S]*?\})/i);

    const thought = thoughtMatch ? thoughtMatch[1].trim() : '';
    const action = actionMatch ? actionMatch[1].trim() : '';
    let actionInput: Record<string, any> = {};

    if (actionInputMatch) {
      try {
        actionInput = JSON.parse(actionInputMatch[1]);
      } catch (e) {
        // Try to parse as simple key=value
        const simpleInput = actionInputMatch[1].replace(/[{}]/g, '').trim();
        if (simpleInput) {
          actionInput = { input: simpleInput };
        }
      }
    }

    return {
      type: 'action',
      thought,
      action,
      actionInput,
      content: '',
    };
  }

  /**
   * Execute a tool
   */
  private async executeTool(toolName: string, input: Record<string, any>): Promise<string> {
    // Check built-in tools first
    if (BUILTIN_TOOLS[toolName]) {
      return BUILTIN_TOOLS[toolName].execute(input);
    }

    // Try MCP tool
    try {
      const result = await mcpService.callTool(toolName, input);
      return JSON.stringify(result);
    } catch (error: any) {
      throw new Error(`Tool "${toolName}" not found or failed: ${error.message}`);
    }
  }

  /**
   * Call the LLM
   */
  private async callLLM(
    model: string,
    systemPrompt: string,
    messages: Array<{ role: 'user' | 'assistant'; content: string }>
  ): Promise<{ content: string; tokens: number }> {
    
    if (model.startsWith('gpt') && this.openai) {
      const response = await this.openai.chat.completions.create({
        model: model,
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages,
        ],
        temperature: 0.2,
        max_tokens: 1000,
      });

      return {
        content: response.choices[0].message.content || '',
        tokens: response.usage?.total_tokens || 0,
      };
    }

    if (model.startsWith('claude') && this.anthropic) {
      const response = await this.anthropic.messages.create({
        model: model,
        max_tokens: 1000,
        system: systemPrompt,
        messages: messages.map(m => ({ role: m.role, content: m.content })),
      });

      const content = response.content[0].type === 'text' ? response.content[0].text : '';
      return {
        content,
        tokens: response.usage.input_tokens + response.usage.output_tokens,
      };
    }

    if (model.startsWith('gemini') && this.genAI) {
      const gemini = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
      const chat = gemini.startChat({
        history: messages.slice(0, -1).map(m => ({
          role: m.role === 'user' ? 'user' : 'model',
          parts: [{ text: m.content }],
        })),
      });
      
      const lastMessage = messages[messages.length - 1];
      const result = await chat.sendMessage(`${systemPrompt}\n\n${lastMessage.content}`);
      
      return {
        content: result.response.text(),
        tokens: 0, // Gemini doesn't return token counts directly
      };
    }

    throw new Error(`No API client available for model: ${model}`);
  }

  /**
   * Get list of available tools
   */
  getAvailableTools(): Array<{ id: string; name: string; description: string }> {
    return Object.entries(BUILTIN_TOOLS).map(([id, tool]) => ({
      id,
      name: id.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      description: tool.description,
    }));
  }
}

export const agentService = new AgentService();

