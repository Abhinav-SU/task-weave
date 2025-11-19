// TaskWeave Task Store - Connected to Real API
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '../lib/api';
import { wsClient } from '../lib/websocket';

export type TaskStatus = 'in-progress' | 'completed' | 'archived';
export type AIPlatform = 'chatgpt' | 'claude' | 'gemini';
export type Priority = 'low' | 'medium' | 'high';

export interface Message {
  id: string;
  platform: AIPlatform;
  content: string;
  timestamp: Date;
  role: 'user' | 'assistant';
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: Priority;
  platforms: AIPlatform[];
  messages: Message[];
  branches: string[];
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  contextSize: number;
}

interface TaskStore {
  tasks: Task[];
  selectedTask: Task | null;
  viewMode: 'grid' | 'list';
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setViewMode: (mode: 'grid' | 'list') => void;
  fetchTasks: () => Promise<void>;
  fetchTask: (id: string) => Promise<void>;
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  selectTask: (id: string | null) => void;
  getTasks: (filters?: { status?: TaskStatus; platform?: AIPlatform }) => Task[];
  clearError: () => void;
  
  // WebSocket handlers
  handleTaskUpdated: (data: any) => void;
  handleConversationAdded: (data: any) => void;
}

export const useTaskStore = create<TaskStore>()(
  persist(
    (set, get) => ({
      tasks: [],
      selectedTask: null,
      viewMode: 'grid',
      isLoading: false,
      error: null,

      setViewMode: (mode) => set({ viewMode: mode }),

      fetchTasks: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.getTasks();
          
          // Backend returns { tasks: [...], pagination: {...} }
          const tasksList = response.tasks || response || [];
          
          // Transform backend data to match frontend interface
          const tasks = tasksList.map((task: any) => ({
            id: task.id,
            title: task.title,
            description: task.description || '',
            // Map backend status to frontend status
            status: task.status === 'active' ? 'in-progress' : 
                    task.status === 'pending' ? 'in-progress' :
                    task.status || 'in-progress',
            priority: task.priority || 'medium',
            platforms: task.platform ? [task.platform] : [],
            messages: task.messages || [],
            branches: task.branches || [],
            tags: Array.isArray(task.tags) ? task.tags : [],
            createdAt: new Date(task.created_at || task.createdAt),
            updatedAt: new Date(task.updated_at || task.updatedAt),
            contextSize: task.context_size || 0,
          }));

          console.log('✅ Fetched tasks from API:', tasks.length);
          set({ tasks, isLoading: false });
        } catch (error) {
          console.error('❌ Failed to fetch tasks:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Failed to fetch tasks',
            isLoading: false,
            tasks: [] // Clear tasks on error
          });
        }
      },

      fetchTask: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.getTask(id);
          const task = {
            id: response.id,
            title: response.title,
            description: response.description || '',
            status: response.status || 'in-progress',
            priority: response.priority || 'medium',
            platforms: response.platforms || [],
            messages: response.messages || [],
            branches: response.branches || [],
            tags: response.tags || [],
            createdAt: new Date(response.created_at),
            updatedAt: new Date(response.updated_at),
            contextSize: response.context_size || 0,
          };
          
          set({ selectedTask: task, isLoading: false });
        } catch (error) {
          console.error('Failed to fetch task:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Failed to fetch task',
            isLoading: false 
          });
        }
      },

      addTask: async (taskData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.createTask({
            title: taskData.title,
            description: taskData.description,
            // Don't send status to backend, it will default to 'pending'
            priority: taskData.priority,
            tags: taskData.tags,
            platform: taskData.platforms?.[0], // Send first platform if exists
          });

          const newTask: Task = {
            id: response.id,
            title: response.title,
            description: response.description || '',
            // Map backend status
            status: response.status === 'pending' || response.status === 'active' ? 'in-progress' : 
                    response.status || 'in-progress',
            priority: response.priority || 'medium',
            platforms: response.platform ? [response.platform] : [],
            messages: [],
            branches: [],
            tags: Array.isArray(response.tags) ? response.tags : [],
            createdAt: new Date(response.created_at || new Date()),
            updatedAt: new Date(response.updated_at || new Date()),
            contextSize: 0,
          };

          console.log('✅ Task created:', newTask);

          set((state) => ({ 
            tasks: [newTask, ...state.tasks], // Add to beginning
            isLoading: false 
          }));

          // Emit WebSocket event if connected
          if (wsClient.isConnected()) {
            wsClient.emit('task:update', {
              taskId: newTask.id,
              updates: newTask
            });
          }

          return newTask;
        } catch (error) {
          console.error('❌ Failed to create task:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Failed to create task',
            isLoading: false 
          });
          throw error;
        }
      },

      updateTask: async (id, updates) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.updateTask(id, updates);

          set((state) => ({
            tasks: state.tasks.map((task) =>
              task.id === id ? { 
                ...task, 
                ...updates, 
                updatedAt: new Date(response.updated_at) 
              } : task
            ),
            selectedTask: state.selectedTask?.id === id 
              ? { ...state.selectedTask, ...updates, updatedAt: new Date(response.updated_at) }
              : state.selectedTask,
            isLoading: false,
          }));

          // Emit WebSocket event if connected
          if (wsClient.isConnected()) {
            wsClient.emit('task:update', {
              taskId: id,
              updates
            });
          }
        } catch (error) {
          console.error('Failed to update task:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Failed to update task',
            isLoading: false 
          });
          throw error;
        }
      },

      deleteTask: async (id) => {
        set({ isLoading: true, error: null });
        try {
          // First delete from API
          await api.deleteTask(id);
          
          console.log('✅ Task deleted from database:', id);

          // Then remove from UI
          set((state) => ({
            tasks: state.tasks.filter((task) => task.id !== id),
            selectedTask: state.selectedTask?.id === id ? null : state.selectedTask,
            isLoading: false,
          }));
        } catch (error) {
          console.error('❌ Failed to delete task:', error);
          
          // Don't remove from UI if API call failed
          set({ 
            error: error instanceof Error ? error.message : 'Failed to delete task',
            isLoading: false 
          });
          throw error;
        }
      },

      selectTask: (id) => {
        if (!id) {
          set({ selectedTask: null });
          return;
        }
        
        const task = get().tasks.find((t) => t.id === id);
        if (task) {
          set({ selectedTask: task });
        } else {
          // If not in cache, fetch from API
          get().fetchTask(id);
        }
      },

      getTasks: (filters) => {
        let tasks = get().tasks;
        if (filters?.status) {
          tasks = tasks.filter((t) => t.status === filters.status);
        }
        if (filters?.platform) {
          tasks = tasks.filter((t) => t.platforms.includes(filters.platform));
        }
        return tasks;
      },

      clearError: () => set({ error: null }),

      // WebSocket event handlers
      handleTaskUpdated: (data) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === data.taskId ? { ...task, ...data.task } : task
          ),
          selectedTask: state.selectedTask?.id === data.taskId 
            ? { ...state.selectedTask, ...data.task }
            : state.selectedTask,
        }));
      },

      handleConversationAdded: (data) => {
        // Refresh the task to get updated conversation list
        const taskId = data.taskId;
        if (taskId) {
          get().fetchTask(taskId);
        }
      },
    }),
    {
      name: 'taskweave-storage',
      partialize: (state) => ({ 
        viewMode: state.viewMode,
        // Don't persist tasks - always fetch fresh from API
      }),
    }
  )
);

// Setup WebSocket listeners
export function setupTaskStoreWebSocket() {
  wsClient.on('task:updated', (data) => {
    useTaskStore.getState().handleTaskUpdated(data);
  });

  wsClient.on('conversation:added', (data) => {
    useTaskStore.getState().handleConversationAdded(data);
  });

  wsClient.on('message:added', (data) => {
    // Optionally refresh task conversations
    if (data.taskId) {
      useTaskStore.getState().fetchTask(data.taskId);
    }
  });
}

