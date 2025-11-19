# TaskWeave - Complete Testing Guide

**Last Updated:** November 18, 2025  
**Purpose:** Step-by-step guide to test the entire TaskWeave system

---

## 📋 Pre-Testing Checklist

### ✅ Files & Configuration

| Component | File | Status | Action if Missing |
|-----------|------|--------|-------------------|
| Backend Env | `backend/.env` | ✅ Exists | Copy from `backend/env.example` |
| Frontend Env | `frontend/taskweave-flow-main/.env` | ✅ Exists | Create with API URLs |
| Docker Compose | `docker-compose.yml` | ✅ Exists | - |
| Extension Built | `extension/dist/` | ✅ Exists | Run `npm run build` |

### ⚙️ Required Configuration Updates

**Backend `.env` - Update These:**
```env
# ✅ Already correct for local development
DATABASE_URL=postgresql://postgres:password@localhost:5444/taskweave

# ⚠️ OPTIONAL: Add OpenAI key for context compression
OPENAI_API_KEY=sk-your-key-here  # Get from https://platform.openai.com/api-keys

# ✅ Already correct
JWT_SECRET=your-super-secret-jwt-key-change-in-production
CORS_ORIGIN=http://localhost:5173
```

**Frontend `.env` - Already Correct:**
```env
VITE_API_URL=http://localhost:3000
VITE_WS_URL=ws://localhost:3000
```

---

## 🚀 Step-by-Step Testing

### STEP 1: Start Docker Containers

**Action:**
```bash
cd D:\03_Projects\TaskWeave
docker-compose up -d
```

**Expected Output:**
```
✅ Container taskweave-postgres    Started
✅ Container taskweave-redis       Started
```

**Verify:**
```bash
docker ps
```

Should show 2 containers running.

**❌ Troubleshooting:**
- If PostgreSQL fails: `docker-compose down -v` then `docker-compose up -d`
- If port 5444 in use: Stop other PostgreSQL services or change port in `docker-compose.yml`

---

### STEP 2: Start Backend Server

**Action:**
```bash
cd D:\03_Projects\TaskWeave\backend
npm run dev
```

**Expected Output:**
```
🚀 TaskWeave Backend Server Started
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📡 HTTP Server: http://localhost:3000
🔌 WebSocket: ws://localhost:3000
🏥 Health: http://localhost:3000/health
...
✅ Database connected successfully
🚀 WebSocket server initialized
```

**Test Health Check:**
Open browser: `http://localhost:3000/health`

Should see:
```json
{"status":"ok","timestamp":"2025-11-18T..."}
```

**❌ Troubleshooting:**
- `DATABASE_URL not set`: Check `backend/.env` exists
- `Database connection error`: Wait 10 seconds after starting Docker
- Port 3000 in use: Change `PORT` in `backend/.env`

---

### STEP 3: Test Backend API

**Quick Test (Terminal):**
```bash
cd D:\03_Projects\TaskWeave\backend
node test-final.js
```

**Expected:**
```
✅ Database connection successful
✅ Health check passed
✅ All tests passed
```

**Full API Test:**
```bash
node test-api-direct.js
```

Should test:
- ✅ Register user
- ✅ Login user
- ✅ Create task
- ✅ Get tasks
- ✅ Update task
- ✅ Delete task

**❌ Troubleshooting:**
- `401 Unauthorized`: JWT secret might be wrong
- `500 Server error`: Check backend terminal for stack trace
- `Connection refused`: Backend not running

---

### STEP 4: Test WebSocket

**Option A - Browser Test:**
1. Open `backend/test-websocket.html` in Chrome
2. Click "Connect"
3. Should see "✅ WebSocket connected"

**Option B - Node Test:**
```bash
cd D:\03_Projects\TaskWeave\backend
node test-websocket.js
```

**Expected:**
```
📝 Step 1: Logging in...
✅ Logged in successfully
🔌 Step 2: Connecting to WebSocket...
✅ WebSocket connected!
🏓 Step 4: Testing ping/pong...
✅ Pong received!
✨ All WebSocket tests passed!
```

**❌ Troubleshooting:**
- Connection timeout: Backend not running or WebSocket not initialized
- Auth error: Create a test user first via `/api/auth/register`

---

### STEP 5: Start Frontend

**Action:**
```bash
cd D:\03_Projects\TaskWeave\frontend\taskweave-flow-main
npm run dev
```

**Expected Output:**
```
VITE v5.x.x ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

**Verify:**
Open browser: `http://localhost:5173`

Should see:
- ✅ Beautiful landing page
- ✅ No console errors
- ✅ "Get Started" button visible

**❌ Troubleshooting:**
- `Module not found`: Run `npm install --legacy-peer-deps`
- Port 5173 in use: Will auto-assign different port
- Blank page: Check browser console for errors

---

### STEP 6: Test Authentication Flow

**6.1 - Register New User**

1. Navigate to `http://localhost:5173`
2. Click "Get Started" or navigate to `/login`
3. Click "Sign up" tab
4. Fill in:
   - Email: `test@taskweave.com`
   - Password: `password123`
   - Name: `Test User` (optional)
5. Click "Create Account"

**Expected:**
- ✅ Redirects to `/dashboard`
- ✅ See welcome message
- ✅ Console shows "WebSocket connected"

**6.2 - Verify Auth Token**

Open browser DevTools → Application → Local Storage → `http://localhost:5173`

Should see:
- ✅ `authToken`: `eyJhbG...` (JWT token)
- ✅ `taskweave-auth`: User data

**6.3 - Test Logout**

1. Find user menu/logout button in dashboard
2. Click "Sign Out" or "Logout"
3. Should redirect to `/login`
4. Try accessing `/dashboard` → should redirect to `/login`

**6.4 - Test Login**

1. Go to `/login`
2. Enter same credentials
3. Should successfully log in
4. Check console for WebSocket connection

**❌ Troubleshooting:**
- `Failed to fetch`: Backend not running
- `500 error`: Check backend terminal logs
- `Invalid credentials`: Double-check email/password
- Doesn't redirect: Check browser console for errors

---

### STEP 7: Test Task Management

**7.1 - Create Task**

1. In dashboard, click "New Task" or "+ Create Task"
2. Fill in:
   - Title: `Test AI Research`
   - Description: `Testing task creation`
   - Tags: `test`, `ai` (press Enter after each)
3. Click "Create"

**Expected:**
- ✅ Task appears in dashboard
- ✅ Shows in task list
- ✅ No errors in console

**Check Backend:**
Look at backend terminal - should see:
```
POST /api/tasks 201
```

**7.2 - View Task Details**

1. Click on the task card
2. Should navigate to `/dashboard/tasks/[task-id]`
3. Should see:
   - ✅ Task title
   - ✅ Description
   - ✅ Tags
   - ✅ Status
   - ✅ Empty conversations list

**7.3 - Update Task**

1. Edit task title or description
2. Save changes
3. Should see updated immediately

**7.4 - Search Tasks**

1. Use global search (top bar)
2. Type part of task name
3. Should filter tasks

**❌ Troubleshooting:**
- Task doesn't appear: Check Network tab for API errors
- 401 error: Token expired - logout and login again
- UI doesn't update: Refresh page manually (real-time sync needs WebSocket listeners)

---

### STEP 8: Load Browser Extension

**8.1 - Load in Chrome**

1. Open Chrome
2. Go to `chrome://extensions/`
3. Enable "Developer mode" (top right toggle)
4. Click "Load unpacked"
5. Select folder: `D:\03_Projects\TaskWeave\extension\dist`

**Expected:**
- ✅ Extension appears in list
- ✅ TaskWeave icon shows in toolbar
- ✅ No errors

**8.2 - Sign In to Extension**

1. Click TaskWeave icon in toolbar
2. Should see popup with login form
3. Enter same credentials: `test@taskweave.com` / `password123`
4. Click "Sign In"

**Expected:**
- ✅ Shows dashboard view
- ✅ Active task count (should show 1 from previous test)
- ✅ Green connection indicator
- ✅ No errors in console

**Check Service Worker Console:**
1. Go to `chrome://extensions/`
2. Find TaskWeave extension
3. Click "Service worker" link
4. Should see:
```
✅ WebSocket connected
✓ Connection initialized for user test@taskweave.com
```

**❌ Troubleshooting:**
- Extension won't load: Rebuild with `npm run build`
- Login fails: Check service worker console for errors
- WebSocket not connecting: Backend not running

---

### STEP 9: Test Conversation Capture (ChatGPT)

**9.1 - Go to ChatGPT**

1. Navigate to `https://chat.openai.com/` or `https://chatgpt.com/`
2. Have a short conversation (2-3 messages):
   - You: "What is machine learning?"
   - ChatGPT: (responds)
   - You: "Give me 3 examples"
   - ChatGPT: (responds)

**9.2 - Capture Conversation**

1. Look for floating 📋 button (bottom-right corner)
2. If not visible: Refresh page and wait 2 seconds
3. Click the 📋 button

**Expected:**
- ✅ Beautiful capture dialog appears
- ✅ Shows message count: "X messages will be captured"
- ✅ Task dropdown loads with your tasks

**9.3 - Save to Task**

1. Enter title: `ML Research - ChatGPT`
2. Select task: `Test AI Research` (from dropdown)
3. Click "Save to TaskWeave"

**Expected:**
- ✅ Green success notification: "Conversation captured successfully!"
- ✅ Dialog closes
- ✅ Check backend terminal - should see:
```
POST /api/conversations 201
POST /api/conversations/[id]/messages 201
```

**9.4 - Verify in Dashboard**

1. Go back to `http://localhost:5173/dashboard/tasks/[task-id]`
2. Should now see:
   - ✅ Conversation titled "ML Research - ChatGPT"
   - ✅ Platform badge: "ChatGPT"
   - ✅ Message count
   - ✅ Click to expand and see messages

**❌ Troubleshooting:**
- Button doesn't appear: Check extension is loaded and page is refreshed
- Capture fails: Check service worker console
- Tasks not loading: Check extension is signed in
- Conversation doesn't appear in dashboard: Refresh dashboard page

---

### STEP 10: Test Conversation Capture (Claude)

**10.1 - Go to Claude**

1. Navigate to `https://claude.ai/`
2. Have a short conversation:
   - You: "Explain neural networks"
   - Claude: (responds)

**10.2 - Capture**

1. Look for 📋 button
2. Click it
3. Enter title: `Neural Networks - Claude`
4. Select same task or create new
5. Save

**10.3 - Verify**

1. Check dashboard
2. Should now have 2 conversations under the task
3. One from ChatGPT, one from Claude

**Expected:**
- ✅ Both conversations visible
- ✅ Different platform badges
- ✅ Both expandable with messages

---

### STEP 11: Test Real-Time Updates

**11.1 - Open Dashboard in Two Windows**

1. Window 1: Dashboard at `http://localhost:5173/dashboard`
2. Window 2: Same dashboard URL

**11.2 - Create Task in Window 1**

1. Create new task: "Real-Time Test"
2. Watch Window 2

**Current State:**
⚠️ **Note**: The frontend task store still uses mock data. Real-time updates via WebSocket need to be connected to the UI components. This is documented in `frontend/taskweave-flow-main/INTEGRATION_COMPLETE.md` under "Step 2: Add WebSocket Listeners".

**What SHOULD Happen (after full integration):**
- ✅ Task appears in Window 2 automatically
- ✅ No refresh needed

**What Currently Happens:**
- ⏳ Need to refresh to see updates
- Backend + WebSocket work correctly
- Frontend needs WebSocket listener integration

---

### STEP 12: Test Analytics (if available)

1. Go to `/dashboard/analytics`
2. Should see:
   - ✅ Task activity charts
   - ✅ Productivity metrics
   - ✅ Platform usage stats
   - ✅ Completion trends

**Note:** Analytics currently use mock data from the store.

---

## 📊 Full System Test Checklist

After completing all steps above, verify:

- [ ] ✅ Docker containers running (PostgreSQL + Redis)
- [ ] ✅ Backend server running on port 3000
- [ ] ✅ Frontend running on port 5173
- [ ] ✅ Extension loaded in Chrome
- [ ] ✅ Can register/login via frontend
- [ ] ✅ Can create/view/update tasks
- [ ] ✅ Extension popup shows tasks
- [ ] ✅ Can sign in to extension
- [ ] ✅ Can capture ChatGPT conversations
- [ ] ✅ Can capture Claude conversations
- [ ] ✅ Captured conversations appear in dashboard
- [ ] ✅ WebSocket connection established (check console)
- [ ] ✅ No errors in any console

---

## 🔍 Advanced Testing

### Test Context Compression (Requires OpenAI Key)

1. Add OpenAI key to `backend/.env`:
```env
OPENAI_API_KEY=sk-your-actual-key-here
```

2. Capture a long conversation (10+ messages)
3. Backend should automatically compress context
4. Check backend logs for compression activity

### Test OAuth (Future)

Currently OAuth is structured but not implemented. To test:
1. Set up Google OAuth credentials
2. Add to `backend/.env`
3. Test Google Sign-In button (when implemented)

### Load Testing

Test with multiple users:
1. Register 5-10 users
2. Create tasks for each
3. Capture multiple conversations
4. Check database: `docker exec -it taskweave-postgres psql -U postgres taskweave`
5. Run: `SELECT COUNT(*) FROM tasks;`

---

## 🐛 Common Issues & Solutions

### Issue: Backend Won't Start
**Symptoms:** Error connecting to database  
**Solution:**
```bash
cd D:\03_Projects\TaskWeave
docker-compose down -v
docker-compose up -d
# Wait 10 seconds
cd backend
npm run dev
```

### Issue: Extension Capture Button Not Showing
**Symptoms:** No 📋 button on ChatGPT/Claude  
**Solution:**
1. Refresh the page
2. Check extension is loaded: `chrome://extensions/`
3. Check service worker console for errors
4. Rebuild: `cd extension && npm run build`
5. Reload extension in Chrome

### Issue: WebSocket Not Connecting
**Symptoms:** Console shows "WebSocket connection failed"  
**Solution:**
1. Check backend is running
2. Logout and login again (token might be expired)
3. Clear localStorage and re-login
4. Check backend logs for WebSocket errors

### Issue: Tasks Not Loading in Frontend
**Symptoms:** Empty dashboard or errors  
**Solution:**
1. Check browser Network tab - look for failed API calls
2. Verify backend is running
3. Check CORS settings in `backend/.env`
4. Logout and login again

### Issue: Can't Sign In to Extension
**Symptoms:** "Authentication failed" error  
**Solution:**
1. Make sure backend is running
2. Check you're using the same credentials as frontend
3. Check service worker console for specific error
4. Try signing in to frontend first to verify credentials work

---

## 📞 Getting Help

**Logs to Check:**
1. **Backend:** Terminal running `npm run dev`
2. **Frontend:** Browser DevTools → Console
3. **Extension:** `chrome://extensions/` → Service Worker
4. **Database:** `docker logs taskweave-postgres`

**Key Documentation:**
- `INTEGRATION_GUIDE.md` - Frontend setup
- `WEBSOCKET_API.md` - WebSocket events
- `PROJECT_STATUS.md` - Project overview
- `FINAL_PROJECT_SUMMARY.md` - Complete summary
- `extension/README.md` - Extension guide

---

## 🎯 Success Criteria

**You've successfully tested everything when:**

1. ✅ All 3 services running (Backend, Frontend, Docker)
2. ✅ Can register and login via frontend
3. ✅ Can create and manage tasks
4. ✅ Extension loads without errors
5. ✅ Can sign into extension
6. ✅ Can capture conversations from ChatGPT
7. ✅ Can capture conversations from Claude
8. ✅ Captured conversations appear in dashboard
9. ✅ WebSocket shows "connected" in console
10. ✅ No errors in any console

---

**🎉 If all tests pass, TaskWeave is fully operational!**

---

*Testing Guide v1.0.0*  
*Last Updated: November 18, 2025*

