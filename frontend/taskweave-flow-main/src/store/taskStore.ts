import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
  setViewMode: (mode: 'grid' | 'list') => void;
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  selectTask: (id: string | null) => void;
  getTasks: (filters?: { status?: TaskStatus; platform?: AIPlatform }) => Task[];
}

export const useTaskStore = create<TaskStore>()(
  persist(
    (set, get) => ({
      tasks: [
        {
          id: '1',
          title: 'Build React Dashboard',
          description: 'Create a comprehensive dashboard with data visualization',
          status: 'in-progress',
          priority: 'high',
          platforms: ['chatgpt', 'claude'],
          messages: [
            {
              id: 'm1',
              platform: 'chatgpt',
              content: 'I need to build a React dashboard with charts',
              timestamp: new Date(Date.now() - 3600000),
              role: 'user'
            },
            {
              id: 'm2',
              platform: 'chatgpt',
              content: 'I can help you build that. Let\'s start with the component structure...',
              timestamp: new Date(Date.now() - 3500000),
              role: 'assistant'
            }
          ],
          branches: [],
          tags: ['react', 'dashboard', 'development'],
          createdAt: new Date(Date.now() - 86400000),
          updatedAt: new Date(Date.now() - 3600000),
          contextSize: 1024
        },
        {
          id: '2',
          title: 'Write Blog Post on AI',
          description: 'Research and write a comprehensive blog post about AI trends',
          status: 'completed',
          priority: 'medium',
          platforms: ['claude', 'gemini'],
          messages: [],
          branches: [],
          tags: ['writing', 'ai', 'blog'],
          createdAt: new Date(Date.now() - 172800000),
          updatedAt: new Date(Date.now() - 86400000),
          contextSize: 2048
        },
        {
          id: '3',
          title: 'API Documentation',
          description: 'Document REST API endpoints and authentication',
          status: 'in-progress',
          priority: 'low',
          platforms: ['chatgpt'],
          messages: [],
          branches: [],
          tags: ['documentation', 'api'],
          createdAt: new Date(Date.now() - 259200000),
          updatedAt: new Date(Date.now() - 7200000),
          contextSize: 512
        }
      ],
      selectedTask: null,
      viewMode: 'grid',
      setViewMode: (mode) => set({ viewMode: mode }),
      addTask: (taskData) => {
        const newTask: Task = {
          ...taskData,
          id: Math.random().toString(36).substr(2, 9),
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        set((state) => ({ tasks: [...state.tasks, newTask] }));
      },
      updateTask: (id, updates) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id ? { ...task, ...updates, updatedAt: new Date() } : task
          ),
        }));
      },
      deleteTask: (id) => {
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== id),
        }));
      },
      selectTask: (id) => {
        const task = id ? get().tasks.find((t) => t.id === id) || null : null;
        set({ selectedTask: task });
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
    }),
    {
      name: 'taskweave-storage',
    }
  )
);
