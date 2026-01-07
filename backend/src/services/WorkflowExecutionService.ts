import { db } from '../db';
import { workflowExecutions, tasks, conversations, messages } from '../db/schema-simple';
import { eq, and } from 'drizzle-orm';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Anthropic from '@anthropic-ai/sdk';

// Types for workflow nodes
export interface WorkflowNode {
  id: string;
  type: 'startNode' | 'aiNode' | 'conditionNode' | 'transformNode' | 'endNode' | 'mcpNode';
  position: { x: number; y: number };
  data: {
    label?: string;
    platform?: string;
    prompt?: string;
    model?: string;
    condition?: string;
    transform?: string;
    mcpTool?: string;
    mcpArgs?: Record<string, any>;
    [key: string]: any;
  };
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  description?: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}

export interface WorkflowExecution {
  id: string;
  template_id: string | null;  // null for inline/client-side templates
  task_id: string;
  user_id: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  current_node: string | null;
  variables: Record<string, any>;
  results: Record<string, any>;
  started_at: Date | null;
  completed_at: Date | null;
  error: string | null;
  created_at: Date;
  updated_at: Date;
}

export class WorkflowExecutionService {
  /**
   * Execute a workflow template
   * @param templateId - UUID of database template (optional if templateData provided)
   * @param taskId - UUID of task to associate with
   * @param userId - UUID of user
   * @param inputVariables - Input variables for workflow
   * @param templateData - Inline template data (optional, for client-side templates)
   */
  async executeWorkflow(
    templateId: string | null,
    taskId: string,
    userId: string,
    inputVariables: Record<string, any>,
    templateData?: { name?: string; nodes: any[]; edges: any[] }
  ): Promise<WorkflowExecution> {
    let template: WorkflowTemplate;

    // 1. Get template - either from inline data or database
    if (templateData) {
      // Use inline template data (for client-side templates)
      console.log(`📋 Using inline template data with ${templateData.nodes.length} nodes`);
      template = {
        id: 'inline-template',
        name: templateData.name || 'Inline Workflow',
        nodes: templateData.nodes,
        edges: templateData.edges,
      };
    } else if (templateId) {
      // Load from database
      const dbTemplate = await this.loadTemplate(templateId, userId);
      if (!dbTemplate) {
        throw new Error('Template not found or access denied');
      }
      template = dbTemplate;
    } else {
      throw new Error('Either templateId or templateData must be provided');
    }

    // 2. Create execution record
    // For inline templates, template_id is null. For database templates, it's the UUID.
    const [execution] = await db
      .insert(workflowExecutions)
      .values({
        template_id: templateId || null,  // null for inline templates
        task_id: taskId,
        user_id: userId,
        status: 'running',
        variables: inputVariables,
        results: {},
      })
      .returning();

    // 3. Start execution (async - don't wait)
    this.runWorkflowAsync(execution as WorkflowExecution, template).catch(err => {
      console.error('Workflow execution failed:', err);
      this.markExecutionFailed(execution.id, err.message);
    });

    return execution as WorkflowExecution;
  }

  /**
   * Load template from database
   */
  private async loadTemplate(templateId: string, userId: string): Promise<WorkflowTemplate | null> {
    const [task] = await db
      .select()
      .from(tasks)
      .where(and(
        eq(tasks.id, templateId),
        eq(tasks.user_id, userId)
      ))
      .limit(1);

    if (!task || !task.metadata) {
      return null;
    }

    return {
      id: task.id,
      name: task.title,
      description: task.description || undefined,
      nodes: task.metadata.nodes || [],
      edges: task.metadata.edges || [],
    };
  }

  /**
   * Run workflow asynchronously
   */
  private async runWorkflowAsync(
    execution: WorkflowExecution,
    template: WorkflowTemplate
  ): Promise<void> {
    try {
      console.log(`Starting workflow execution ${execution.id}`);

      // Validate node types before execution
      const invalidNodes = template.nodes.filter(n => 
        !['startNode', 'aiNode', 'conditionNode', 'transformNode', 'endNode', 'mcpNode'].includes(n.type)
      );
      
      if (invalidNodes.length > 0) {
        const invalidTypes = invalidNodes.map(n => `${n.id}:${n.type}`).join(', ');
        throw new Error(`Invalid node types found: ${invalidTypes}. Valid types are: startNode, aiNode, conditionNode, transformNode, endNode, mcpNode`);
      }

      // Find start node OR use first aiNode if no startNode exists (backward compatibility)
      let startNode = template.nodes.find(n => n.type === 'startNode');
      
      if (!startNode) {
        // If no startNode, use first aiNode (for simple single-node templates)
        startNode = template.nodes.find(n => n.type === 'aiNode');
        
        if (!startNode) {
          throw new Error('No start node or AI node found in template. Templates must have at least one node of type "startNode" or "aiNode".');
        }
        
        console.log(`⚠️  No startNode found, using first aiNode: ${startNode.id}`);
      }

      // Execute nodes in order
      let currentNode: WorkflowNode | null = startNode;
      let nodeCount = 0;
      const maxNodes = 50; // Safety limit to prevent infinite loops

      while (currentNode && nodeCount < maxNodes) {
        console.log(`Executing node: ${currentNode.id} (${currentNode.type})`);

        // Update current node
        await this.updateCurrentNode(execution.id, currentNode.id);

        // Execute node based on type
        const result = await this.executeNode(execution, currentNode, template);

        // Store result
        execution.results[currentNode.id] = result;
        await this.saveExecutionResults(execution.id, execution.results);

        console.log(`Node ${currentNode.id} completed with result:`, result);

        // Get next node
        currentNode = await this.getNextNode(execution, currentNode, template);
        nodeCount++;
      }

      if (nodeCount >= maxNodes) {
        throw new Error('Workflow execution exceeded maximum node limit (possible infinite loop)');
      }

      // Mark as completed
      await this.markExecutionCompleted(execution.id, execution.results);
      console.log(`Workflow execution ${execution.id} completed successfully`);
    } catch (error: any) {
      console.error(`Workflow execution ${execution.id} failed:`, error);
      await this.markExecutionFailed(execution.id, error.message);
      throw error;
    }
  }

  /**
   * Execute a single node
   */
  private async executeNode(
    execution: WorkflowExecution,
    node: WorkflowNode,
    template: WorkflowTemplate
  ): Promise<any> {
    switch (node.type) {
      case 'startNode':
        return this.executeStartNode(execution, node);
      case 'aiNode':
        return this.executeAINode(execution, node);
      case 'mcpNode':
        return this.executeMCPNode(execution, node);
      case 'conditionNode':
        return this.executeConditionNode(execution, node);
      case 'transformNode':
        return this.executeTransformNode(execution, node);
      case 'endNode':
        return this.executeEndNode(execution, node);
      default:
        throw new Error(`Unknown node type: ${node.type}`);
    }
  }

  /**
   * Execute start node (just returns input variables)
   */
  private async executeStartNode(execution: WorkflowExecution, node: WorkflowNode): Promise<any> {
    return execution.variables;
  }

  /**
   * Execute AI node (calls AI platform API)
   */
  private async executeAINode(execution: WorkflowExecution, node: WorkflowNode): Promise<string> {
    // 1. Resolve variables in prompt
    const prompt = this.resolveVariables(
      node.data.prompt || '',
      execution.variables,
      execution.results
    );

    console.log(`AI Node prompt: ${prompt}`);

    // 2. Create conversation in database
    const conversationTitle = node.data.label || 'Workflow Execution';
    const [conversation] = await db
      .insert(conversations)
      .values({
        task_id: execution.task_id,
        title: conversationTitle,
        platform: node.data.platform || 'chatgpt',
      })
      .returning();

    // 3. Add user message
    await db.insert(messages).values({
      conversation_id: conversation.id,
      sender: 'user',
      content: prompt,
      content_type: 'text',
    });

    // 4. Call AI platform
    const response = await this.callAIPlatform(
      node.data.platform || 'chatgpt',
      prompt,
      node.data.model
    );

    // 5. Store AI response as message
    await db.insert(messages).values({
      conversation_id: conversation.id,
      sender: 'assistant',
      content: response,
      content_type: 'text',
    });

    // 6. Return response
    return response;
  }

  /**
   * Execute condition node (evaluates boolean condition)
   */
  private async executeConditionNode(execution: WorkflowExecution, node: WorkflowNode): Promise<boolean> {
    const condition = node.data.condition || 'true';
    
    // Simple condition evaluation
    // This is a placeholder - in production, use a safe eval library
    try {
      // Replace variables
      const resolvedCondition = this.resolveVariables(
        condition,
        execution.variables,
        execution.results
      );

      // Simple boolean evaluation
      return resolvedCondition === 'true' || resolvedCondition === true;
    } catch (error) {
      console.error('Condition evaluation error:', error);
      return false;
    }
  }

  /**
   * Execute transform node (transforms data)
   */
  private async executeTransformNode(execution: WorkflowExecution, node: WorkflowNode): Promise<any> {
    const transform = node.data.transform || 'value';
    
    // This is a placeholder - in production, use a safe transformation library
    const resolved = this.resolveVariables(
      transform,
      execution.variables,
      execution.results
    );

    return resolved;
  }

  /**
   * Execute end node (collects final outputs)
   */
  private async executeEndNode(execution: WorkflowExecution, node: WorkflowNode): Promise<any> {
    // Return just a simple completion marker, don't include the full results to avoid circular references
    return {
      completed: true,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Resolve variables in templates (replace {{variable}} with actual values)
   */
  private resolveVariables(
    template: string,
    variables: Record<string, any>,
    results: Record<string, any>
  ): string {
    let resolved = template;

    // Find all {{variable}} patterns
    const matches = template.match(/\{\{([^}]+)\}\}/g) || [];

    for (const match of matches) {
      const varName = match.slice(2, -2).trim();

      // Check variables first
      if (variables[varName] !== undefined) {
        const value = typeof variables[varName] === 'object' 
          ? JSON.stringify(variables[varName])
          : String(variables[varName]);
        resolved = resolved.replace(match, value);
      }
      // Check for node_X_output pattern (e.g., node_1_output)
      else if (varName.match(/^node_(\w+)_output$/)) {
        const nodeId = varName.replace(/^node_(\w+)_output$/, '$1');
        if (results[nodeId] !== undefined) {
          const value = typeof results[nodeId] === 'object'
            ? JSON.stringify(results[nodeId])
            : String(results[nodeId]);
          resolved = resolved.replace(match, value);
        }
      }
      // Then check results by exact name
      else if (results[varName] !== undefined) {
        const value = typeof results[varName] === 'object'
          ? JSON.stringify(results[varName])
          : String(results[varName]);
        resolved = resolved.replace(match, value);
      }
    }

    return resolved;
  }

  /**
   * Call AI platform API - NOW WITH REAL API INTEGRATION!
   */
  private async callAIPlatform(
    platform: string,
    prompt: string,
    model?: string
  ): Promise<string> {
    console.log(`🤖 Calling REAL ${platform} API with prompt: ${prompt.substring(0, 100)}...`);

    try {
      switch (platform.toLowerCase()) {
        case 'chatgpt':
          return await this.callOpenAI(prompt, model);
        
        case 'gemini':
          return await this.callGemini(prompt, model);
        
        case 'claude':
          return await this.callClaude(prompt, model);
        
        case 'perplexity':
          // Perplexity not implemented yet - return simulated response
          console.log('⚠️  Perplexity API not configured, using simulated response');
          return `[Perplexity AI - Simulated]\n\nQuery: "${prompt}"\n\nThis is a simulated response. Add PERPLEXITY_API_KEY to .env to use real Perplexity API.`;
        
        default:
          throw new Error(`Unsupported AI platform: ${platform}`);
      }
    } catch (error: any) {
      console.error(`❌ Error calling ${platform} API:`, error.message);
      throw new Error(`Failed to call ${platform} API: ${error.message}`);
    }
  }

  /**
   * Call OpenAI ChatGPT API - REAL IMPLEMENTATION
   */
  private async callOpenAI(prompt: string, model?: string): Promise<string> {
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY not found in environment variables');
    }

    const openai = new OpenAI({ apiKey });
    
    console.log(`📡 Making REAL call to OpenAI ${model || 'gpt-3.5-turbo'}...`);
    
    const response = await openai.chat.completions.create({
      model: model || 'gpt-3.5-turbo',
      messages: [
        { role: 'user', content: prompt }
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    const content = response.choices[0]?.message?.content || '';
    console.log(`✅ Received ${content.length} characters from OpenAI`);
    
    return content;
  }

  /**
   * Call Anthropic Claude API - REAL IMPLEMENTATION
   */
  private async callClaude(prompt: string, model?: string): Promise<string> {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY not found in environment variables');
    }

    const anthropic = new Anthropic({ apiKey });
    
    // Default to claude-3-5-sonnet (latest stable model)
    const modelName = model || 'claude-3-5-sonnet-20241022';
    
    console.log(`📡 Making REAL call to Anthropic ${modelName}...`);
    
    const response = await anthropic.messages.create({
      model: modelName,
      max_tokens: 1024,
      messages: [
        { role: 'user', content: prompt }
      ],
    });

    const content = response.content[0]?.type === 'text' ? response.content[0].text : '';
    console.log(`✅ Received ${content.length} characters from Claude`);
    
    return content;
  }

  /**
   * Call Google Gemini API - REAL IMPLEMENTATION
   * Using REST API directly for better compatibility
   */
  private async callGemini(prompt: string, model?: string): Promise<string> {
    const apiKey = process.env.GOOGLE_API_KEY;
    
    if (!apiKey) {
      throw new Error('GOOGLE_API_KEY not found in environment variables');
    }

    // Try models in order of preference until one works
    // Always include fallbacks in case the specified model isn't available
    // Updated 2025: Using gemini-2.5-flash as it's the current stable model
    const requestedModel = model ? model.replace(/^models\//, '') : null;
    const fallbackModels = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-pro'];
    const modelsToTry = requestedModel 
      ? [requestedModel, ...fallbackModels.filter(m => m !== requestedModel)]
      : fallbackModels;
    
    let lastError: Error | null = null;
    
    for (const modelName of modelsToTry) {
      // Try v1 first, then v1beta
      for (const apiVersion of ['v1', 'v1beta']) {
        const url = `https://generativelanguage.googleapis.com/${apiVersion}/models/${modelName}:generateContent?key=${apiKey}`;
        
        console.log(`📡 Trying Gemini ${modelName} via ${apiVersion}...`);
        
        try {
          const response = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contents: [{
                parts: [{
                  text: prompt
                }]
              }]
            })
          });

          if (!response.ok) {
            const errorText = await response.text();
            console.log(`⚠️  ${modelName} via ${apiVersion} failed: ${response.status}`);
            lastError = new Error(`Gemini API error (${response.status}): ${errorText.substring(0, 200)}`);
            continue; // Try next model/version
          }

          const data = await response.json();
          const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
          
          if (!content) {
            console.log(`⚠️  ${modelName} via ${apiVersion}: No content in response`);
            continue;
          }
          
          console.log(`✅ Received ${content.length} characters from Gemini (${modelName} via ${apiVersion})`);
          return content;
        } catch (error: any) {
          console.log(`⚠️  ${modelName} via ${apiVersion} error: ${error.message}`);
          lastError = error;
          continue;
        }
      }
    }
    
    // If all REST attempts fail, try SDK as final fallback
    console.log(`⚠️  All REST attempts failed, trying SDK...`);
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      // Try gemini-2.5-flash with SDK as it's the current stable model
      const geminiModel = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
      const result = await geminiModel.generateContent(prompt);
      const response = await result.response;
      const content = response.text();
      console.log(`✅ Received ${content.length} characters from Gemini (via SDK)`);
      return content;
    } catch (sdkError: any) {
      throw new Error(`Gemini API failed (all models tried): ${lastError?.message || sdkError.message}`);
    }
  }

  /**
   * Get next node in workflow
   */
  private async getNextNode(
    execution: WorkflowExecution,
    currentNode: WorkflowNode,
    template: WorkflowTemplate
  ): Promise<WorkflowNode | null> {
    // Find outgoing edges from current node
    const outgoingEdges = template.edges.filter(e => e.source === currentNode.id);

    if (outgoingEdges.length === 0) {
      return null; // End of workflow
    }

    // For condition nodes, check the result and follow the appropriate edge
    if (currentNode.type === 'conditionNode') {
      const result = execution.results[currentNode.id];
      const targetHandle = result ? 'true' : 'false';
      
      const edge = outgoingEdges.find(e => e.sourceHandle === targetHandle);
      if (!edge) {
        console.warn(`No edge found for condition result: ${targetHandle}`);
        return null;
      }

      return template.nodes.find(n => n.id === edge.target) || null;
    }

    // For other nodes, take the first edge
    const edge = outgoingEdges[0];
    return template.nodes.find(n => n.id === edge.target) || null;
  }

  /**
   * Update current node in execution
   */
  private async updateCurrentNode(executionId: string, nodeId: string): Promise<void> {
    await db
      .update(workflowExecutions)
      .set({
        current_node: nodeId,
        updated_at: new Date(),
      })
      .where(eq(workflowExecutions.id, executionId));
  }

  /**
   * Save execution results
   */
  private async saveExecutionResults(executionId: string, results: Record<string, any>): Promise<void> {
    await db
      .update(workflowExecutions)
      .set({
        results,
        updated_at: new Date(),
      })
      .where(eq(workflowExecutions.id, executionId));
  }

  /**
   * Mark execution as completed
   */
  private async markExecutionCompleted(
    executionId: string,
    results: Record<string, any>
  ): Promise<void> {
    // Get the execution to find the task_id
    const [execution] = await db
      .select()
      .from(workflowExecutions)
      .where(eq(workflowExecutions.id, executionId))
      .limit(1);

    // Update execution status
    await db
      .update(workflowExecutions)
      .set({
        status: 'completed',
        results,
        completed_at: new Date(),
        updated_at: new Date(),
        current_node: null,
      })
      .where(eq(workflowExecutions.id, executionId));

    // Update task status to completed
    if (execution) {
      await db
        .update(tasks)
        .set({
          status: 'completed',
          updated_at: new Date(),
        })
        .where(eq(tasks.id, execution.task_id));
    }
  }

  /**
   * Mark execution as failed
   */
  private async markExecutionFailed(executionId: string, error: string): Promise<void> {
    // Get the execution to find the task_id
    const [execution] = await db
      .select()
      .from(workflowExecutions)
      .where(eq(workflowExecutions.id, executionId))
      .limit(1);

    // Update execution status
    await db
      .update(workflowExecutions)
      .set({
        status: 'failed',
        error,
        completed_at: new Date(),
        updated_at: new Date(),
      })
      .where(eq(workflowExecutions.id, executionId));

    // Update task status to failed
    if (execution) {
      await db
        .update(tasks)
        .set({
          status: 'failed',
          updated_at: new Date(),
        })
        .where(eq(tasks.id, execution.task_id));
    }
  }

  /**
   * Execute MCP node (calls MCP tools like filesystem, web search, etc)
   */
  private async executeMCPNode(execution: WorkflowExecution, node: WorkflowNode): Promise<any> {
    const toolName = node.data.mcpTool || 'filesystem_read';
    const args = node.data.mcpArgs || {};
    
    // Resolve variables in args
    const resolvedArgs: Record<string, any> = {};
    for (const [key, value] of Object.entries(args)) {
      if (typeof value === 'string') {
        resolvedArgs[key] = this.resolveVariables(value, execution.variables, execution.results);
      } else {
        resolvedArgs[key] = value;
      }
    }

    console.log(`🔧 MCP Tool: ${toolName} with args:`, resolvedArgs);

    // Simulated MCP tool execution (in production, use real MCP SDK)
    switch (toolName) {
      case 'filesystem_read':
        return `[MCP: Filesystem Read]\nFile: ${resolvedArgs.path}\nContent: (simulated file content)`;
      
      case 'web_search':
        return `[MCP: Web Search]\nQuery: ${resolvedArgs.query}\nResults:\n1. Example result 1\n2. Example result 2`;
      
      case 'database_query':
        return `[MCP: Database Query]\nQuery: ${resolvedArgs.sql}\nResults: (simulated query results)`;
      
      default:
        return `[MCP: ${toolName}]\nExecuted with args: ${JSON.stringify(resolvedArgs)}`;
    }
  }

  /**
   * Get execution by ID
   */
  async getExecutionById(executionId: string, userId: string): Promise<WorkflowExecution | null> {
    const [execution] = await db
      .select()
      .from(workflowExecutions)
      .where(and(
        eq(workflowExecutions.id, executionId),
        eq(workflowExecutions.user_id, userId)
      ))
      .limit(1);

    return execution as WorkflowExecution || null;
  }

  /**
   * List executions for a task
   */
  async listExecutionsForTask(taskId: string, userId: string): Promise<WorkflowExecution[]> {
    const executions = await db
      .select()
      .from(workflowExecutions)
      .where(and(
        eq(workflowExecutions.task_id, taskId),
        eq(workflowExecutions.user_id, userId)
      ))
      .orderBy(workflowExecutions.created_at);

    return executions as WorkflowExecution[];
  }

  /**
   * Cancel execution
   */
  async cancelExecution(executionId: string, userId: string): Promise<void> {
    await db
      .update(workflowExecutions)
      .set({
        status: 'cancelled',
        completed_at: new Date(),
        updated_at: new Date(),
      })
      .where(and(
        eq(workflowExecutions.id, executionId),
        eq(workflowExecutions.user_id, userId)
      ));
  }
}

