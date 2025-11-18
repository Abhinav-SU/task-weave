# TaskWeave WebSocket API Documentation

## Overview

TaskWeave uses Socket.IO for real-time bidirectional communication between clients and the server. WebSocket connections enable instant updates for tasks, conversations, and messages across all connected clients.

## Connection

### Endpoint
```
ws://localhost:3000
```

### Authentication

WebSocket connections require JWT authentication. Include the token in the connection handshake:

**JavaScript Client:**
```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000', {
  auth: {
    token: 'your-jwt-token-here'
  }
});
```

**Alternative (Authorization Header):**
```javascript
const socket = io('http://localhost:3000', {
  extraHeaders: {
    authorization: 'Bearer your-jwt-token-here'
  }
});
```

### Connection Events

#### `connect`
Emitted when connection is established.

```javascript
socket.on('connect', () => {
  console.log('Connected:', socket.id);
});
```

#### `disconnect`
Emitted when connection is closed.

```javascript
socket.on('disconnect', (reason) => {
  console.log('Disconnected:', reason);
});
```

#### `connect_error`
Emitted when connection fails (authentication, network, etc.).

```javascript
socket.on('connect_error', (error) => {
  console.error('Connection error:', error.message);
});
```

---

## Events

### Connection Management

#### `connection:init` (Client → Server)
Initialize connection and receive user's active tasks.

**Emit:**
```javascript
socket.emit('connection:init');
```

**Response:**
```javascript
socket.on('connection:init', (data) => {
  // data = {
  //   success: true,
  //   userId: "user_123",
  //   activeTasks: [
  //     { id: "task_1", title: "Research AI models", status: "active" },
  //     { id: "task_2", title: "Write documentation", status: "active" }
  //   ],
  //   timestamp: "2024-01-15T10:30:00.000Z"
  // }
});
```

#### `reconnect` (Client → Server)
Rejoin previously subscribed task rooms after reconnection.

**Emit:**
```javascript
socket.emit('reconnect', {
  taskIds: ['task_1', 'task_2']
});
```

**Response:**
```javascript
socket.on('reconnect', (data) => {
  // data = {
  //   success: true,
  //   rejoinedTasks: ["task_1", "task_2"],
  //   timestamp: "2024-01-15T10:30:00.000Z"
  // }
});
```

#### `ping` / `pong`
Heartbeat mechanism to keep connection alive.

**Emit:**
```javascript
socket.emit('ping');
```

**Response:**
```javascript
socket.on('pong', (data) => {
  // data = { timestamp: "2024-01-15T10:30:00.000Z" }
});
```

---

### Task Events

#### `task:subscribe` (Client → Server)
Subscribe to real-time updates for a specific task.

**Emit:**
```javascript
socket.emit('task:subscribe', {
  taskId: 'task_123'
});
```

**Response:**
```javascript
socket.on('task:subscribe', (data) => {
  // data = {
  //   success: true,
  //   taskId: "task_123",
  //   timestamp: "2024-01-15T10:30:00.000Z"
  // }
});
```

**Error Response:**
```javascript
socket.on('error', (error) => {
  // error = {
  //   event: "task:subscribe",
  //   message: "Task not found or access denied",
  //   taskId: "task_123"
  // }
});
```

#### `task:unsubscribe` (Client → Server)
Unsubscribe from task updates.

**Emit:**
```javascript
socket.emit('task:unsubscribe', {
  taskId: 'task_123'
});
```

**Response:**
```javascript
socket.on('task:unsubscribe', (data) => {
  // data = {
  //   success: true,
  //   taskId: "task_123",
  //   timestamp: "2024-01-15T10:30:00.000Z"
  // }
});
```

#### `task:update` (Client → Server)
Update a task and broadcast to all subscribers.

**Emit:**
```javascript
socket.emit('task:update', {
  taskId: 'task_123',
  updates: {
    title: 'Updated Task Title',
    status: 'completed',
    tags: ['ai', 'research']
  }
});
```

#### `task:updated` (Server → Client)
Broadcast when a task is updated (received by all subscribers).

**Listen:**
```javascript
socket.on('task:updated', (data) => {
  // data = {
  //   taskId: "task_123",
  //   task: {
  //     id: "task_123",
  //     title: "Updated Task Title",
  //     status: "completed",
  //     tags: ["ai", "research"],
  //     updated_at: "2024-01-15T10:30:00.000Z"
  //   },
  //   updatedBy: {
  //     userId: "user_456",
  //     email: "user@example.com"
  //   },
  //   timestamp: "2024-01-15T10:30:00.000Z"
  // }
});
```

---

### Conversation Events

#### `conversation:add` (Client → Server)
Notify that a new conversation was added to a task.

**Emit:**
```javascript
socket.emit('conversation:add', {
  taskId: 'task_123',
  conversationId: 'conv_456',
  title: 'ChatGPT Discussion',
  platform: 'chatgpt'
});
```

#### `conversation:added` (Server → Client)
Broadcast when a conversation is added to a task.

**Listen:**
```javascript
socket.on('conversation:added', (data) => {
  // data = {
  //   taskId: "task_123",
  //   conversation: {
  //     id: "conv_456",
  //     title: "ChatGPT Discussion",
  //     platform: "chatgpt",
  //     messages: [ /* last 10 messages */ ]
  //   },
  //   addedBy: {
  //     userId: "user_456",
  //     email: "user@example.com"
  //   },
  //   timestamp: "2024-01-15T10:30:00.000Z"
  // }
});
```

---

### Message Events

#### `message:add` (Client → Server)
Notify that a new message was added to a conversation.

**Emit:**
```javascript
socket.emit('message:add', {
  conversationId: 'conv_456',
  messageId: 'msg_789',
  sender: 'user',
  content: 'What are the best practices for prompt engineering?',
  contentType: 'text'
});
```

#### `message:added` (Server → Client)
Broadcast when a message is added to a conversation.

**Listen:**
```javascript
socket.on('message:added', (data) => {
  // data = {
  //   conversationId: "conv_456",
  //   taskId: "task_123",
  //   message: {
  //     id: "msg_789",
  //     sender: "user",
  //     content: "What are the best practices for prompt engineering?",
  //     contentType: "text",
  //     created_at: "2024-01-15T10:30:00.000Z"
  //   },
  //   addedBy: {
  //     userId: "user_456",
  //     email: "user@example.com"
  //   },
  //   timestamp: "2024-01-15T10:30:00.000Z"
  // }
});
```

---

### Typing Indicators

#### `typing:start` (Client → Server)
Indicate that user is typing in a conversation.

**Emit:**
```javascript
socket.emit('typing:start', {
  conversationId: 'conv_456'
});
```

#### `typing:start` (Server → Client)
Broadcast when a user starts typing.

**Listen:**
```javascript
socket.on('typing:start', (data) => {
  // data = {
  //   conversationId: "conv_456",
  //   user: {
  //     userId: "user_456",
  //     email: "user@example.com"
  //   },
  //   timestamp: "2024-01-15T10:30:00.000Z"
  // }
});
```

#### `typing:stop` (Client → Server)
Indicate that user stopped typing.

**Emit:**
```javascript
socket.emit('typing:stop', {
  conversationId: 'conv_456'
});
```

#### `typing:stop` (Server → Client)
Broadcast when a user stops typing.

**Listen:**
```javascript
socket.on('typing:stop', (data) => {
  // data = {
  //   conversationId: "conv_456",
  //   user: {
  //     userId: "user_456",
  //     email: "user@example.com"
  //   },
  //   timestamp: "2024-01-15T10:30:00.000Z"
  // }
});
```

---

### Error Events

#### `error` (Server → Client)
Emitted when an error occurs processing a client event.

**Listen:**
```javascript
socket.on('error', (error) => {
  // error = {
  //   event: "task:subscribe",
  //   message: "Task not found or access denied",
  //   taskId: "task_123"
  // }
  
  console.error(`Error in ${error.event}:`, error.message);
});
```

---

## Usage Patterns

### Basic Connection Flow

```javascript
import { io } from 'socket.io-client';

// 1. Connect with authentication
const socket = io('http://localhost:3000', {
  auth: { token: jwtToken }
});

// 2. Handle connection events
socket.on('connect', () => {
  console.log('Connected!');
  
  // 3. Initialize connection
  socket.emit('connection:init');
});

// 4. Listen for initialization data
socket.on('connection:init', (data) => {
  console.log('Active tasks:', data.activeTasks);
  
  // 5. Subscribe to specific tasks
  data.activeTasks.forEach(task => {
    socket.emit('task:subscribe', { taskId: task.id });
  });
});

// 6. Listen for real-time updates
socket.on('task:updated', (data) => {
  console.log('Task updated:', data.task);
  // Update UI with new task data
});

socket.on('message:added', (data) => {
  console.log('New message:', data.message);
  // Add message to conversation UI
});
```

### Reconnection Handling

```javascript
let subscribedTasks = [];

socket.on('task:subscribe', (data) => {
  if (data.success) {
    subscribedTasks.push(data.taskId);
  }
});

socket.on('disconnect', () => {
  console.log('Connection lost...');
});

socket.on('connect', () => {
  console.log('Reconnected!');
  
  // Rejoin previous subscriptions
  if (subscribedTasks.length > 0) {
    socket.emit('reconnect', { taskIds: subscribedTasks });
  }
});
```

### React Hook Example

```typescript
import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export function useWebSocket(token: string) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const newSocket = io('http://localhost:3000', {
      auth: { token }
    });

    newSocket.on('connect', () => {
      setConnected(true);
      newSocket.emit('connection:init');
    });

    newSocket.on('disconnect', () => {
      setConnected(false);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [token]);

  return { socket, connected };
}

// Usage in component:
function TaskDashboard() {
  const { socket, connected } = useWebSocket(authToken);

  useEffect(() => {
    if (!socket) return;

    socket.on('task:updated', (data) => {
      // Handle task update
      updateTaskInState(data.task);
    });

    return () => {
      socket.off('task:updated');
    };
  }, [socket]);

  const subscribeToTask = (taskId: string) => {
    socket?.emit('task:subscribe', { taskId });
  };

  return <div>...</div>;
}
```

---

## Testing

Use the provided HTML test client (`test-websocket.html`) to test WebSocket functionality:

1. Start the backend server: `npm run dev`
2. Open `backend/test-websocket.html` in a browser
3. Enter JWT token (get from `/api/auth/login`)
4. Click "Connect"
5. Test various events (subscribe, update, messages, typing)

---

## Security

### Authentication
- All WebSocket connections MUST include a valid JWT token
- Tokens are verified on connection and before processing events
- Invalid tokens result in connection rejection

### Authorization
- Users can only subscribe to their own tasks
- Task ownership is verified before broadcasting updates
- Conversation access is checked against task ownership

### Rate Limiting (Future)
- Consider implementing rate limiting for message events
- Prevent spam/abuse of typing indicators
- Throttle reconnection attempts

---

## Performance Considerations

### Rooms
- Tasks use Socket.IO rooms for efficient broadcasting
- Only subscribed clients receive updates
- Format: `task:${taskId}`

### Message Limits
- Conversation initialization sends last 10 messages only
- Fetch older messages via REST API
- Consider pagination for large conversations

### Connection Management
- Ping/pong heartbeat every 25 seconds
- 60-second timeout for inactive connections
- Automatic reconnection with exponential backoff

---

## Error Handling

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `Authentication token required` | Missing JWT token | Include token in `auth` or `authorization` |
| `Invalid or expired token` | Token is invalid/expired | Refresh token via `/api/auth/refresh` |
| `Task not found or access denied` | Invalid task ID or not owned by user | Verify task ID and ownership |
| `Conversation not found` | Invalid conversation ID | Verify conversation exists |
| `Access denied` | User doesn't own the resource | Check task/conversation ownership |

### Client-Side Error Handling

```javascript
socket.on('error', (error) => {
  switch (error.event) {
    case 'task:subscribe':
      console.error('Failed to subscribe:', error.message);
      // Retry or notify user
      break;
    case 'task:update':
      console.error('Failed to update task:', error.message);
      // Revert UI changes
      break;
    default:
      console.error('WebSocket error:', error);
  }
});

socket.on('connect_error', (error) => {
  if (error.message === 'Invalid or expired token') {
    // Redirect to login
    window.location.href = '/login';
  }
});
```

---

## Next Steps

- Implement Redis adapter for horizontal scaling
- Add presence tracking (online users)
- Implement read receipts for messages
- Add WebSocket connection metrics
- Create monitoring dashboard

