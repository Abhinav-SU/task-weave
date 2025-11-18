// WebSocket event types and interfaces

export interface SocketUser {
  userId: string;
  email: string;
}

export interface TaskUpdatePayload {
  taskId: string;
  updates: {
    title?: string;
    description?: string;
    status?: string;
    tags?: string[];
  };
}

export interface ConversationAddPayload {
  taskId: string;
  conversationId: string;
  title?: string;
  platform: string;
}

export interface MessageAddPayload {
  conversationId: string;
  messageId: string;
  sender: string;
  content: string;
  contentType?: string;
}

export interface TypingPayload {
  conversationId: string;
  userId: string;
  userName?: string;
}

export interface SubscriptionPayload {
  taskId: string;
}

// WebSocket event names
export enum SocketEvents {
  // Connection events
  CONNECTION_INIT = 'connection:init',
  RECONNECT = 'reconnect',
  PING = 'ping',
  PONG = 'pong',
  
  // Task events
  TASK_SUBSCRIBE = 'task:subscribe',
  TASK_UNSUBSCRIBE = 'task:unsubscribe',
  TASK_UPDATE = 'task:update',
  TASK_UPDATED = 'task:updated',
  TASK_DELETED = 'task:deleted',
  
  // Conversation events
  CONVERSATION_ADD = 'conversation:add',
  CONVERSATION_ADDED = 'conversation:added',
  CONVERSATION_UPDATE = 'conversation:update',
  CONVERSATION_UPDATED = 'conversation:updated',
  
  // Message events
  MESSAGE_ADD = 'message:add',
  MESSAGE_ADDED = 'message:added',
  
  // Typing events
  TYPING_START = 'typing:start',
  TYPING_STOP = 'typing:stop',
  
  // Error events
  ERROR = 'error',
}

