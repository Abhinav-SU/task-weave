# TaskWeave UI Audit Checklist

## 🎯 Purpose
Systematically verify every button and interactive element in the UI has:
1. ✅ Backend API endpoint
2. ✅ Working onClick handler
3. ✅ Expected behavior
4. ✅ Error handling

---

## 📄 Pages to Audit

### 1. Login Page (`/login`)
- [ ] Sign In button
- [ ] Sign Up button
- [ ] Create Account button
- [ ] Google Sign In button (if exists)

### 2. Dashboard Home (`/dashboard`)
- [ ] Create Task button
- [ ] Import button
- [ ] Templates button
- [ ] Task cards (click to view)
- [ ] Profile dropdown (header)
- [ ] Notifications bell (header)

### 3. All Tasks (`/dashboard/tasks`)
- [ ] View mode toggle (Grid/List)
- [ ] Search input
- [ ] Status filter dropdown
- [ ] Create Task button
- [ ] Task cards

### 4. Task Detail (`/dashboard/tasks/:id`)
- [ ] Edit task button
- [ ] Delete task button
- [ ] Add conversation button
- [ ] Status change buttons

### 5. Templates (`/dashboard/templates`)
- [ ] Template cards
- [ ] Create template button
- [ ] Use template button

### 6. Template Builder (`/dashboard/templates/builder`)
- [ ] Add node buttons
- [ ] Save template button
- [ ] Test template button

### 7. Analytics (`/dashboard/analytics`)
- [ ] Date range selector
- [ ] Platform filters
- [ ] Export button

---

## 🔍 Component Audit

### DashboardHeader
| Element | Has onClick | Calls API | Status | Notes |
|---------|-------------|-----------|--------|-------|
| Profile Button | ✅ | ❌ | ✅ | Opens dropdown |
| Notifications Bell | ✅ | ❌ | ⚠️ | Shows mock data |
| Profile → Profile | ✅ | ❌ | ⚠️ | Navigates (no page) |
| Profile → Settings | ✅ | ❌ | ⚠️ | Navigates (no page) |
| Profile → Help | ✅ | ❌ | ✅ | Opens external |
| Profile → Sign Out | ✅ | ✅ | ✅ | Calls logout API |

### TaskCard
| Element | Has onClick | Calls API | Status | Notes |
|---------|-------------|-----------|--------|-------|
| Card Click | ✅ | ❌ | ✅ | Navigates to detail |
| Continue Button | ✅ | ❌ | ✅ | Navigates to detail |
| Menu → Continue | ✅ | ❌ | ✅ | Navigates to detail |
| Menu → Create Branch | ✅ | ❌ | ⚠️ | Shows "coming soon" |
| Menu → Archive | ✅ | ✅ | ✅ | Calls update API |
| Menu → Delete | ✅ | ✅ | ✅ | Calls delete API |

### CreateTaskModal
| Element | Has onClick | Calls API | Status | Notes |
|---------|-------------|-----------|--------|-------|
| Create Button | ✅ | ✅ | ✅ | Creates task |
| Cancel Button | ✅ | ❌ | ✅ | Closes modal |
| Title Input | ✅ | ❌ | ✅ | Form input |
| Description Input | ✅ | ❌ | ✅ | Form input |
| Priority Select | ✅ | ❌ | ✅ | Form input |
| Tags Input | ✅ | ❌ | ✅ | Form input |

### GlobalSearch
| Element | Has onClick | Calls API | Status | Notes |
|---------|-------------|-----------|--------|-------|
| Search Input | ? | ? | ❓ | Need to check |
| Search Results | ? | ? | ❓ | Need to check |

### NotificationCenter
| Element | Has onClick | Calls API | Status | Notes |
|---------|-------------|-----------|--------|-------|
| Bell Icon | ✅ | ❌ | ✅ | Opens dropdown |
| Mark All Read | ✅ | ❌ | ⚠️ | No functionality |
| Notification Items | ❌ | ❌ | ❌ | No click handler |

### QuickActions
| Element | Has onClick | Calls API | Status | Notes |
|---------|-------------|-----------|--------|-------|
| Action Buttons | ? | ? | ❓ | Need to check |

---

## 🧪 Testing Plan

### Phase 1: Authentication
- [ ] Login with valid credentials
- [ ] Login with invalid credentials
- [ ] Register new user
- [ ] Logout
- [ ] Token persistence after refresh

### Phase 2: Task CRUD
- [ ] Create task
- [ ] View task list
- [ ] Update task (archive)
- [ ] Delete task
- [ ] Task persists after refresh

### Phase 3: Navigation
- [ ] All navigation links work
- [ ] Protected routes redirect to login
- [ ] Back button works correctly

### Phase 4: Error Handling
- [ ] Network error shows toast
- [ ] Invalid input shows validation
- [ ] API errors show user-friendly message

---

## ❌ Known Issues

1. **Profile/Settings Pages** - Don't exist yet
2. **Notifications** - Using mock data
3. **Create Branch** - Not implemented
4. **Import** - Not implemented
5. **Search** - Need to verify functionality
6. **Quick Actions** - Need to verify

---

## 🔄 Status Legend

- ✅ **Working** - Has handler, calls API, works correctly
- ⚠️ **Partial** - Has handler but no API or mock data
- ❌ **Broken** - No handler or doesn't work
- ❓ **Unknown** - Need to check
- 🚧 **Future** - Planned but not yet built

---

**Next Step:** Systematically check each element marked with ❓

