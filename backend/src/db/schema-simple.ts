import { pgTable, uuid, text, timestamp, jsonb } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Users table - matches init.sql
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

// Tasks table - matches init.sql
export const tasks = pgTable('tasks', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_id: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  title: text('title').notNull(),
  description: text('description'),
  status: text('status').notNull().default('active'), // Changed from 'pending' to 'active'
  platform: text('platform'),
  tags: jsonb('tags').$type<string[]>(),
  embedding: text('embedding'),
  metadata: jsonb('metadata').$type<Record<string, any>>(),
  is_template: text('is_template'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Conversations table - matches init.sql
export const conversations = pgTable('conversations', {
  id: uuid('id').primaryKey().defaultRandom(),
  task_id: uuid('task_id').references(() => tasks.id, { onDelete: 'cascade' }).notNull(),
  parent_id: uuid('parent_id').references(() => conversations.id, { onDelete: 'set null' }),
  title: text('title'),
  platform: text('platform').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Messages table - matches init.sql
export const messages = pgTable('messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  conversation_id: uuid('conversation_id').references(() => conversations.id, { onDelete: 'cascade' }).notNull(),
  sender: text('sender').notNull(),
  content: text('content').notNull(),
  content_type: text('content_type').notNull().default('text'),
  embedding: text('embedding'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Workflow Executions table
export const workflowExecutions = pgTable('workflow_executions', {
  id: uuid('id').primaryKey().defaultRandom(),
  template_id: uuid('template_id').references(() => tasks.id, { onDelete: 'set null' }),  // Made nullable for inline templates
  task_id: uuid('task_id').references(() => tasks.id, { onDelete: 'cascade' }).notNull(),
  user_id: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  status: text('status').notNull().default('pending'),
  current_node: text('current_node'),
  variables: jsonb('variables').$type<Record<string, any>>().notNull().default({}),
  results: jsonb('results').$type<Record<string, any>>().notNull().default({}),
  started_at: timestamp('started_at').defaultNow(),
  completed_at: timestamp('completed_at'),
  error: text('error'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Context Compressions table
export const contextCompressions = pgTable('context_compressions', {
  id: uuid('id').primaryKey().defaultRandom(),
  conversation_id: uuid('conversation_id').references(() => conversations.id, { onDelete: 'cascade' }).notNull(),
  summary: text('summary').notNull(),
  compressed_content: text('compressed_content').notNull(),
  strategy: text('strategy').notNull(),
  token_count: text('token_count'),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  tasks: many(tasks),
}));

export const tasksRelations = relations(tasks, ({ one, many }) => ({
  user: one(users, {
    fields: [tasks.user_id],
    references: [users.id],
  }),
  conversations: many(conversations),
  executions: many(workflowExecutions),
}));

export const conversationsRelations = relations(conversations, ({ one, many }) => ({
  task: one(tasks, {
    fields: [conversations.task_id],
    references: [tasks.id],
  }),
  parent: one(conversations, {
    fields: [conversations.parent_id],
    references: [conversations.id],
  }),
  children: many(conversations),
  messages: many(messages),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  conversation: one(conversations, {
    fields: [messages.conversation_id],
    references: [conversations.id],
  }),
}));

export const workflowExecutionsRelations = relations(workflowExecutions, ({ one }) => ({
  template: one(tasks, {
    fields: [workflowExecutions.template_id],
    references: [tasks.id],
  }),
  task: one(tasks, {
    fields: [workflowExecutions.task_id],
    references: [tasks.id],
  }),
  user: one(users, {
    fields: [workflowExecutions.user_id],
    references: [users.id],
  }),
}));

// Type exports
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;
export type Conversation = typeof conversations.$inferSelect;
export type NewConversation = typeof conversations.$inferInsert;
export type Message = typeof messages.$inferSelect;
export type NewMessage = typeof messages.$inferInsert;
export type WorkflowExecution = typeof workflowExecutions.$inferSelect;
export type NewWorkflowExecution = typeof workflowExecutions.$inferInsert;
export type ContextCompression = typeof contextCompressions.$inferSelect;
export type NewContextCompression = typeof contextCompressions.$inferInsert;

