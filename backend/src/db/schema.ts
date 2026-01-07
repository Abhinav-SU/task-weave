import { pgTable, uuid, text, timestamp, jsonb, integer, decimal, boolean } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ============================================
// USERS
// ============================================
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  password: text('password'),
  google_id: text('google_id').unique(),
  name: text('name'),
  avatar_url: text('avatar_url'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// ============================================
// WORKFLOWS (DAG definitions)
// ============================================
export const workflows = pgTable('workflows', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_id: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  name: text('name').notNull(),
  description: text('description'),
  
  // DAG structure
  nodes: jsonb('nodes').$type<WorkflowNode[]>().notNull().default([]),
  edges: jsonb('edges').$type<WorkflowEdge[]>().notNull().default([]),
  
  // Input variables schema
  variables: jsonb('variables').$type<VariableDefinition[]>().notNull().default([]),
  
  // Metadata
  category: text('category'), // Research, Code, Content, Analysis, etc.
  icon: text('icon'),
  color: text('color'),
  
  // Visibility
  is_template: boolean('is_template').default(false), // Default template?
  is_public: boolean('is_public').default(false), // Can others see/use?
  
  // Stats
  run_count: integer('run_count').default(0),
  avg_duration_ms: integer('avg_duration_ms'),
  
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// ============================================
// WORKFLOW RUNS (Execution instances)
// ============================================
export const workflowRuns = pgTable('workflow_runs', {
  id: uuid('id').primaryKey().defaultRandom(),
  workflow_id: uuid('workflow_id').references(() => workflows.id, { onDelete: 'cascade' }).notNull(),
  user_id: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  
  // Status
  status: text('status').notNull().default('pending'), // pending, running, completed, failed, cancelled
  
  // Input/Output
  input_variables: jsonb('input_variables').$type<Record<string, any>>().notNull().default({}),
  final_output: jsonb('final_output').$type<any>(),
  
  // Execution tracking
  current_node_id: text('current_node_id'),
  completed_nodes: jsonb('completed_nodes').$type<string[]>().notNull().default([]),
  
  // Timing
  started_at: timestamp('started_at'),
  completed_at: timestamp('completed_at'),
  
  // Cost tracking
  total_tokens: integer('total_tokens').default(0),
  total_cost: decimal('total_cost', { precision: 10, scale: 6 }).default('0'),
  
  // Error handling
  error: text('error'),
  error_node_id: text('error_node_id'),
  
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// ============================================
// NODE EXECUTIONS (Individual node results)
// ============================================
export const nodeExecutions = pgTable('node_executions', {
  id: uuid('id').primaryKey().defaultRandom(),
  run_id: uuid('run_id').references(() => workflowRuns.id, { onDelete: 'cascade' }).notNull(),
  
  // Node identification
  node_id: text('node_id').notNull(), // ID within the DAG
  node_type: text('node_type').notNull(), // llm-openai, llm-claude, transform, etc.
  
  // Status
  status: text('status').notNull().default('pending'), // pending, running, completed, failed, skipped
  
  // Input/Output
  input: jsonb('input').$type<any>(),
  output: jsonb('output').$type<any>(),
  
  // LLM-specific data
  provider: text('provider'), // openai, anthropic, google, perplexity
  model: text('model'), // gpt-4, claude-3-opus, etc.
  prompt: text('prompt'), // Resolved prompt sent to LLM
  response: text('response'), // Raw response from LLM
  
  // Token tracking
  tokens_input: integer('tokens_input'),
  tokens_output: integer('tokens_output'),
  cost: decimal('cost', { precision: 10, scale: 6 }),
  
  // Timing
  started_at: timestamp('started_at'),
  completed_at: timestamp('completed_at'),
  duration_ms: integer('duration_ms'),
  
  // Error
  error: text('error'),
  
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// ============================================
// LLM PROVIDERS CONFIG (User API keys)
// ============================================
export const llmConfigs = pgTable('llm_configs', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_id: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  
  provider: text('provider').notNull(), // openai, anthropic, google, perplexity, deepseek
  api_key: text('api_key').notNull(), // Encrypted
  is_active: boolean('is_active').default(true),
  
  // Optional settings
  default_model: text('default_model'),
  max_tokens: integer('max_tokens'),
  
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// ============================================
// RELATIONS
// ============================================
export const usersRelations = relations(users, ({ many }) => ({
  workflows: many(workflows),
  workflowRuns: many(workflowRuns),
  llmConfigs: many(llmConfigs),
}));

export const workflowsRelations = relations(workflows, ({ one, many }) => ({
  user: one(users, {
    fields: [workflows.user_id],
    references: [users.id],
  }),
  runs: many(workflowRuns),
}));

export const workflowRunsRelations = relations(workflowRuns, ({ one, many }) => ({
  workflow: one(workflows, {
    fields: [workflowRuns.workflow_id],
    references: [workflows.id],
  }),
  user: one(users, {
    fields: [workflowRuns.user_id],
    references: [users.id],
  }),
  nodeExecutions: many(nodeExecutions),
}));

export const nodeExecutionsRelations = relations(nodeExecutions, ({ one }) => ({
  run: one(workflowRuns, {
    fields: [nodeExecutions.run_id],
    references: [workflowRuns.id],
  }),
}));

export const llmConfigsRelations = relations(llmConfigs, ({ one }) => ({
  user: one(users, {
    fields: [llmConfigs.user_id],
    references: [users.id],
  }),
}));

// ============================================
// TYPE DEFINITIONS
// ============================================

// Workflow Node Types
export interface WorkflowNode {
  id: string;
  type: NodeType;
  position: { x: number; y: number };
  data: NodeData;
}

export type NodeType = 
  | 'input'           // Start node - defines input variables
  | 'output'          // End node - final output
  | 'llm-openai'      // OpenAI (GPT-4, etc.)
  | 'llm-claude'      // Anthropic (Claude)
  | 'llm-gemini'      // Google (Gemini)
  | 'llm-perplexity'  // Perplexity
  | 'llm-deepseek'    // DeepSeek
  | 'llm-mistral'     // Mistral
  | 'condition'       // If/else branching
  | 'transform'       // Data transformation
  | 'merge'           // Merge multiple inputs
  | 'loop'            // Iterate over array
  | 'delay';          // Wait before continuing

export interface NodeData {
  label: string;
  
  // LLM node specific
  provider?: string;
  model?: string;
  prompt?: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
  
  // Condition node specific
  condition?: string;
  
  // Transform node specific
  transformType?: 'json-parse' | 'json-stringify' | 'extract' | 'format' | 'split' | 'join';
  transformConfig?: Record<string, any>;
  
  // Input node specific
  variables?: VariableDefinition[];
  
  // Output node specific
  outputFormat?: 'text' | 'json' | 'markdown';
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  label?: string;
  condition?: string; // For conditional edges
}

export interface VariableDefinition {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  description?: string;
  required?: boolean;
  default?: any;
}

// ============================================
// DATABASE TYPE EXPORTS
// ============================================
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Workflow = typeof workflows.$inferSelect;
export type NewWorkflow = typeof workflows.$inferInsert;

export type WorkflowRun = typeof workflowRuns.$inferSelect;
export type NewWorkflowRun = typeof workflowRuns.$inferInsert;

export type NodeExecution = typeof nodeExecutions.$inferSelect;
export type NewNodeExecution = typeof nodeExecutions.$inferInsert;

export type LLMConfig = typeof llmConfigs.$inferSelect;
export type NewLLMConfig = typeof llmConfigs.$inferInsert;


