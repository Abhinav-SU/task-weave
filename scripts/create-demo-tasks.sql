-- Create a completed demo task with conversations and results
DO $$
DECLARE
  demo_user_id uuid;
  demo_task_id uuid;
  demo_conv_id uuid;
BEGIN
  -- Get first user
  SELECT id INTO demo_user_id FROM users LIMIT 1;
  
  -- Create a completed task
  INSERT INTO tasks (user_id, title, description, status, platform, tags, metadata)
  VALUES (
    demo_user_id,
    'React Hooks Performance Analysis',
    'Deep analysis of React hooks optimization techniques in authentication system',
    'completed',
    'chatgpt,gemini',
    '["react", "performance", "hooks"]'::jsonb,
    '{"completedAt": "2026-01-06T10:30:00Z", "duration": "5m 32s"}'::jsonb
  )
  RETURNING id INTO demo_task_id;
  
  -- Create a conversation for this task
  INSERT INTO conversations (task_id, title, platform)
  VALUES (
    demo_task_id,
    'Code Review Discussion',
    'chatgpt'
  )
  RETURNING id INTO demo_conv_id;
  
  -- Add messages to the conversation
  INSERT INTO messages (conversation_id, sender, content, created_at) VALUES
  (
    demo_conv_id,
    'user',
    'Analyze React hooks performance optimization in our authentication system',
    NOW() - INTERVAL '10 minutes'
  ),
  (
    demo_conv_id,
    'assistant',
    E'I''ll analyze the React hooks performance optimization for your authentication system. Here are the key findings:\n\n## Performance Analysis\n\n### 1. **useMemo and useCallback Usage**\n```javascript\n// ❌ Before: Re-creating function on every render\nconst handleLogin = () => { /* ... */ };\n\n// ✅ After: Memoized callback\nconst handleLogin = useCallback(() => {\n  // login logic\n}, [dependencies]);\n```\n\n### 2. **State Management**\n- Move auth state to Context API to prevent prop drilling\n- Use `useReducer` for complex state logic\n- Implement lazy initial state for expensive computations\n\n### 3. **Memory Leaks Prevention**\n```javascript\nuseEffect(() => {\n  const subscription = authService.subscribe();\n  return () => subscription.unsubscribe(); // Cleanup\n}, []);\n```\n\n### Recommendations:\n1. Implement React.memo for child components\n2. Use `useTransition` for non-urgent updates\n3. Consider `useDeferredValue` for search/filter operations\n4. Profile with React DevTools Profiler',
    NOW() - INTERVAL '8 minutes'
  ),
  (
    demo_conv_id,
    'user',
    'Can you provide a refactored example?',
    NOW() - INTERVAL '6 minutes'
  ),
  (
    demo_conv_id,
    'assistant',
    E'Here''s a refactored authentication hook:\n\n```typescript\nimport { useCallback, useMemo, useReducer, useEffect } from ''react'';\n\ninterface AuthState {\n  user: User | null;\n  isLoading: boolean;\n  error: string | null;\n}\n\ntype AuthAction = \n  | { type: ''LOGIN_START'' }\n  | { type: ''LOGIN_SUCCESS''; payload: User }\n  | { type: ''LOGIN_ERROR''; error: string }\n  | { type: ''LOGOUT'' };\n\nconst authReducer = (state: AuthState, action: AuthAction): AuthState => {\n  switch (action.type) {\n    case ''LOGIN_START'':\n      return { ...state, isLoading: true, error: null };\n    case ''LOGIN_SUCCESS'':\n      return { user: action.payload, isLoading: false, error: null };\n    case ''LOGIN_ERROR'':\n      return { ...state, isLoading: false, error: action.error };\n    case ''LOGOUT'':\n      return { user: null, isLoading: false, error: null };\n    default:\n      return state;\n  }\n};\n\nexport const useAuth = () => {\n  const [state, dispatch] = useReducer(authReducer, {\n    user: null,\n    isLoading: false,\n    error: null\n  });\n\n  const login = useCallback(async (email: string, password: string) => {\n    dispatch({ type: ''LOGIN_START'' });\n    try {\n      const user = await authService.login(email, password);\n      dispatch({ type: ''LOGIN_SUCCESS'', payload: user });\n    } catch (error) {\n      dispatch({ type: ''LOGIN_ERROR'', error: error.message });\n    }\n  }, []);\n\n  const logout = useCallback(() => {\n    dispatch({ type: ''LOGOUT'' });\n    authService.logout();\n  }, []);\n\n  const contextValue = useMemo(\n    () => ({ ...state, login, logout }),\n    [state, login, logout]\n  );\n\n  return contextValue;\n};\n```\n\n### Performance Improvements:\n✅ Single useReducer replaces multiple useState calls\n✅ Memoized callbacks prevent unnecessary re-renders\n✅ useMemo for context value prevents cascading updates\n✅ Proper cleanup in useEffect\n\n### Before/After Metrics:\n- Initial render: 45ms → 12ms (73% faster)\n- Re-render on state change: 28ms → 8ms (71% faster)\n- Memory usage: -35% reduction',
    NOW() - INTERVAL '4 minutes'
  );
  
  -- Create another completed task
  INSERT INTO tasks (user_id, title, description, status, platform, tags, metadata)
  VALUES (
    demo_user_id,
    'API Security Best Practices',
    'Research on modern API security patterns and implementation strategies',
    'completed',
    'gemini',
    '["security", "api", "backend"]'::jsonb,
    '{"completedAt": "2026-01-05T14:20:00Z", "duration": "3m 45s"}'::jsonb
  );
  
  -- Create an active task
  INSERT INTO tasks (user_id, title, description, status, platform, tags)
  VALUES (
    demo_user_id,
    'Database Migration Strategy',
    'Planning PostgreSQL to MongoDB migration for microservices',
    'active',
    'chatgpt',
    '["database", "migration", "planning"]'::jsonb
  );
  
END $$;

-- Verify created tasks
SELECT id, title, status, platform FROM tasks WHERE is_template IS NULL OR is_template != 'yes' ORDER BY created_at DESC;
