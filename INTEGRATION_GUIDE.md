# TaskWeave Integration Guide

## Overview

This guide explains how to integrate your existing frontend (from GitHub) with the TaskWeave backend and browser extension.

## Current Status

### ✅ Completed Components

1. **Backend API** - Fully functional at `http://localhost:3000`
   - Authentication (JWT)
   - Task management (CRUD + search + filtering)
   - Conversation management (CRUD + branching)
   - Context compression (OpenAI integration)
   - WebSocket real-time updates

2. **WebSocket Server** - Real-time communication at `ws://localhost:3000`
   - Connection management
   - Task subscriptions
   - Conversation updates
   - Message broadcasting
   - Typing indicators

3. **Browser Extension** - Built and ready to load
   - Background service worker
   - ChatGPT content injector
   - Claude content injector
   - Popup UI
   - API client utilities

4. **Frontend** - Already built (in GitHub repository)
   - Needs integration with backend

---

## Integration Steps

### Step 1: Clone Your Frontend Repository

```bash
cd D:\03_Projects\TaskWeave
git clone <your-frontend-repo-url> frontend

# OR if you already have it locally:
# Copy your frontend code to: D:\03_Projects\TaskWeave\frontend
```

### Step 2: Configure Frontend API Endpoint

Update your frontend's API configuration to point to the TaskWeave backend:

**Option A: Environment Variables (Recommended)**

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:3000
VITE_WS_URL=ws://localhost:3000
```

Or for Create React App:

```env
REACT_APP_API_URL=http://localhost:3000
REACT_APP_WS_URL=ws://localhost:3000
```

**Option B: Config File**

Create/update `frontend/src/config.ts`:

```typescript
export const config = {
  apiUrl: process.env.VITE_API_URL || 'http://localhost:3000',
  wsUrl: process.env.VITE_WS_URL || 'ws://localhost:3000',
};
```

### Step 3: Install Frontend Dependencies

```bash
cd frontend
npm install
```

### Step 4: Add WebSocket Client (if not already present)

```bash
npm install socket.io-client
```

### Step 5: Update API Client

Your frontend should use these endpoints:

**Authentication:**
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

**Tasks:**
- `GET /api/tasks` - List tasks (with filtering)
- `GET /api/tasks/:id` - Get task details
- `POST /api/tasks` - Create task
- `PATCH /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `GET /api/tasks/search` - Search tasks

**Conversations:**
- `GET /api/conversations?taskId=:id` - List conversations for task
- `GET /api/conversations/:id` - Get conversation details
- `POST /api/conversations` - Create conversation
- `POST /api/conversations/:id/messages` - Add message

**Headers:**
```javascript
{
  'Content-Type': 'application/json',
  'Authorization': 'Bearer <jwt-token>'
}
```

### Step 6: Integrate WebSocket

Example WebSocket integration (React):

```typescript
import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export function useWebSocket(token: string) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!token) return;

    const newSocket = io('http://localhost:3000', {
      auth: { token },
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      setConnected(true);
      newSocket.emit('connection:init');
    });

    newSocket.on('disconnect', () => {
      setConnected(false);
    });

    // Listen for task updates
    newSocket.on('task:updated', (data) => {
      console.log('Task updated:', data);
      // Update your state/cache here
    });

    // Listen for conversation updates
    newSocket.on('conversation:added', (data) => {
      console.log('Conversation added:', data);
      // Update your state/cache here
    });

    // Listen for message updates
    newSocket.on('message:added', (data) => {
      console.log('Message added:', data);
      // Update your state/cache here
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [token]);

  return { socket, connected };
}
```

### Step 7: Update Extension Popup Dashboard URL

Update `extension/src/popup/popup.ts` line ~175:

```typescript
function openDashboard(path: string = '') {
  const apiUrl = 'http://localhost:5173'; // Change to your frontend URL
  browser.tabs.create({ url: `${apiUrl}${path}` });
}
```

### Step 8: Start Everything

**Terminal 1 - Backend:**
```bash
cd D:\03_Projects\TaskWeave\backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd D:\03_Projects\TaskWeave\frontend
npm run dev  # or npm start
```

**Terminal 3 - Extension (watch mode):**
```bash
cd D:\03_Projects\TaskWeave\extension
npm run dev
```

### Step 9: Load Extension in Chrome

1. Open Chrome: `chrome://extensions/`
2. Enable "Developer mode" (top right)
3. Click "Load unpacked"
4. Select `D:\03_Projects\TaskWeave\extension\dist`

### Step 10: Test Integration

1. **Test Authentication:**
   - Register/login via frontend
   - Verify token is stored
   - Check that API requests include Authorization header

2. **Test WebSocket:**
   - Open browser console
   - Look for "WebSocket connected" messages
   - Create/update a task and verify real-time updates

3. **Test Extension:**
   - Click the TaskWeave extension icon
   - Sign in
   - Go to ChatGPT or Claude
   - Look for the 📋 capture button (bottom right)
   - Capture a conversation

---

## API Authentication Flow

```typescript
// Login
const response = await fetch('http://localhost:3000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});

const { user, token } = await response.json();

// Store token (localStorage, Redux, Zustand, etc.)
localStorage.setItem('authToken', token);

// Use token in subsequent requests
const tasksResponse = await fetch('http://localhost:3000/api/tasks', {
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }
});
```

---

## Common Integration Issues

### CORS Errors

If you get CORS errors, the backend is already configured to allow `http://localhost:5173` (Vite default).

If your frontend runs on a different port, update `backend/.env`:

```env
CORS_ORIGIN=http://localhost:YOUR_PORT
```

### WebSocket Connection Failed

- Verify backend is running on port 3000
- Check that JWT token is valid
- Ensure token is passed in `auth` or `authorization` header
- Check browser console for specific error messages

### Extension Can't Connect

- Verify backend is running
- Check that you're signed in to the extension
- Open the extension's background service worker console:
  - Go to `chrome://extensions/`
  - Click "Service worker" link under TaskWeave
  - Check for error messages

### Conversations Not Capturing

- Verify you're on ChatGPT or Claude
- Refresh the page after loading the extension
- Check the content script loaded (Console → look for "TaskWeave injector loaded")
- Try clicking the capture button multiple times

---

## Production Deployment

### Backend

```bash
# Build
cd backend
npm run build

# Set production environment
export NODE_ENV=production
export DATABASE_URL=postgresql://user:pass@host:5432/taskweave
export JWT_SECRET=your-secure-secret-key
export CORS_ORIGIN=https://your-frontend-domain.com

# Start
npm start
```

### Frontend

```bash
# Update .env.production
VITE_API_URL=https://api.your-domain.com
VITE_WS_URL=wss://api.your-domain.com

# Build
npm run build

# Deploy dist/ to your hosting (Vercel, Netlify, etc.)
```

### Extension

```bash
# Build for production
cd extension
NODE_ENV=production npm run build

# Update manifest.json version
# Package: Zip the dist/ folder
# Submit to Chrome Web Store
```

---

## Next Steps

After integration:

1. **Test all features end-to-end**
   - User registration/login
   - Task CRUD operations
   - Conversation capture from ChatGPT/Claude
   - Real-time updates via WebSocket
   - Search and filtering

2. **Implement missing features** (from original plan):
   - Context compression UI
   - Conversation branching visualization
   - Task analytics/stats
   - Export functionality

3. **Improve UX**
   - Loading states
   - Error handling
   - Notifications
   - Keyboard shortcuts

4. **Add tests**
   - Frontend unit tests (Jest, Vitest)
   - Integration tests (Playwright, Cypress)
   - E2E tests

5. **Optimize performance**
   - Lazy loading
   - Code splitting
   - Caching strategies
   - Debouncing/throttling

6. **Documentation**
   - User guide
   - API documentation
   - Developer docs
   - Contributing guide

---

## Support

For issues or questions:

1. Check `PROGRESS_REPORT.md` for known issues
2. Review `WEBSOCKET_API.md` for WebSocket documentation
3. Check backend logs: `backend/npm run dev`
4. Check extension console: `chrome://extensions/` → Service worker

---

## Quick Reference

**Backend API:** `http://localhost:3000`
**Frontend:** `http://localhost:5173` (or your port)
**WebSocket:** `ws://localhost:3000`
**Extension dist:** `extension/dist/`

**Key Files:**
- Backend config: `backend/.env`
- Frontend config: `frontend/.env` or `frontend/src/config.ts`
- Extension manifest: `extension/manifest.json`
- API routes: `backend/src/routes/`
- WebSocket handlers: `backend/src/websocket/`

