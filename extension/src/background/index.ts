// Background service worker for TaskWeave extension
// Handles WebSocket connections, message passing, and background tasks

import browser from 'webextension-polyfill';
import { Storage } from '../utils/storage';
import { Api } from '../utils/api';
import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

console.log('🚀 TaskWeave background service worker started');

// Initialize WebSocket connection
async function initializeWebSocket() {
  const token = await Storage.getAuthToken();
  const apiUrl = await Storage.getApiUrl();

  if (!token) {
    console.log('⚠️  No auth token, skipping WebSocket connection');
    return;
  }

  try {
    socket = io(apiUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      console.log('✅ WebSocket connected');
      socket!.emit('connection:init');
    });

    socket.on('disconnect', (reason) => {
      console.log(`🔌 WebSocket disconnected: ${reason}`);
    });

    socket.on('connect_error', (error) => {
      console.error('❌ WebSocket connection error:', error.message);
    });

    // Task updates
    socket.on('task:updated', (data) => {
      console.log('📋 Task updated:', data.taskId);
      // Notify popup/content scripts
      broadcastToTabs({ type: 'task:updated', payload: data });
    });

    // Conversation updates
    socket.on('conversation:added', (data) => {
      console.log('💬 Conversation added:', data.conversationId);
      broadcastToTabs({ type: 'conversation:added', payload: data });
    });

    // Message updates
    socket.on('message:added', (data) => {
      console.log('💬 Message added:', data.messageId);
      broadcastToTabs({ type: 'message:added', payload: data });
    });

  } catch (error) {
    console.error('Failed to initialize WebSocket:', error);
  }
}

// Broadcast message to all tabs
async function broadcastToTabs(message: any) {
  try {
    const tabs = await browser.tabs.query({});
    tabs.forEach(tab => {
      if (tab.id) {
        browser.tabs.sendMessage(tab.id, message).catch(() => {
          // Silently ignore errors (tab might not have content script)
        });
      }
    });
  } catch (error) {
    console.error('Failed to broadcast to tabs:', error);
  }
}

// Handle messages from content scripts and popup
browser.runtime.onMessage.addListener((message, sender) => {
  console.log('📨 Message received:', message.type);

  switch (message.type) {
    case 'authenticate':
      return handleAuthenticate(message.payload);
    
    case 'logout':
      return handleLogout();
    
    case 'capture-conversation':
      return handleCaptureConversation(message.payload);
    
    case 'create-task':
      return handleCreateTask(message.payload);
    
    case 'get-tasks':
      return handleGetTasks();
    
    case 'websocket-emit':
      return handleWebSocketEmit(message.payload);
    
    default:
      console.warn('Unknown message type:', message.type);
      return Promise.resolve({ success: false, error: 'Unknown message type' });
  }
});

// Authentication handler
async function handleAuthenticate(payload: { email: string; password: string }) {
  try {
    const response = await Api.login(payload.email, payload.password);
    
    if (response.success) {
      // Initialize WebSocket after successful login
      await initializeWebSocket();
    }
    
    return response;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Authentication failed',
    };
  }
}

// Logout handler
async function handleLogout() {
  try {
    // Disconnect WebSocket
    if (socket) {
      socket.disconnect();
      socket = null;
    }
    
    // Clear storage and call API
    await Api.logout();
    
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Logout failed',
    };
  }
}

// Capture conversation handler
async function handleCaptureConversation(payload: {
  taskId: string;
  platform: string;
  title: string;
  messages: Array<{ sender: string; content: string }>;
}) {
  try {
    // Create conversation
    const convResponse = await Api.createConversation({
      task_id: payload.taskId,
      platform: payload.platform,
      title: payload.title,
    });

    if (!convResponse.success || !convResponse.data) {
      return convResponse;
    }

    const conversationId = convResponse.data.id;

    // Add messages
    for (const msg of payload.messages) {
      await Api.addMessage(conversationId, msg);
    }

    // Emit WebSocket event
    if (socket && socket.connected) {
      socket.emit('conversation:add', {
        taskId: payload.taskId,
        conversationId,
        title: payload.title,
        platform: payload.platform,
      });
    }

    return { success: true, data: { conversationId } };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to capture conversation',
    };
  }
}

// Create task handler
async function handleCreateTask(payload: { title: string; description?: string; tags?: string[] }) {
  try {
    return await Api.createTask(payload);
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create task',
    };
  }
}

// Get tasks handler
async function handleGetTasks() {
  try {
    return await Api.getTasks();
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get tasks',
    };
  }
}

// WebSocket emit handler
async function handleWebSocketEmit(payload: { event: string; data: any }) {
  try {
    if (!socket || !socket.connected) {
      return { success: false, error: 'WebSocket not connected' };
    }

    socket.emit(payload.event, payload.data);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to emit event',
    };
  }
}

// Initialize on extension startup
browser.runtime.onInstalled.addListener(async (details) => {
  console.log('🎉 TaskWeave extension installed:', details.reason);
  
  if (details.reason === 'install') {
    // First install - open welcome page
    browser.tabs.create({
      url: browser.runtime.getURL('welcome.html'),
    });
  }

  // Initialize WebSocket if already authenticated
  const isAuth = await Storage.isAuthenticated();
  if (isAuth) {
    await initializeWebSocket();
  }
});

// Reconnect WebSocket when browser starts
browser.runtime.onStartup.addListener(async () => {
  console.log('🌅 Browser started, reconnecting WebSocket...');
  const isAuth = await Storage.isAuthenticated();
  if (isAuth) {
    await initializeWebSocket();
  }
});

// Handle extension icon click
browser.action.onClicked.addListener(async (tab) => {
  console.log('🔘 Extension icon clicked');
  // Popup will open automatically (defined in manifest)
});

// Keep service worker alive with periodic heartbeat
setInterval(() => {
  console.log('💓 Heartbeat');
}, 30000); // Every 30 seconds

