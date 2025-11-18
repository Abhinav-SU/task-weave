import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AnalyticsData {
  totalTasks: number;
  activeTasks: number;
  contextSaved: number;
  avgCompletionTime: number;
  mostUsedPlatform: string;
  taskTrend: number;
  activeTrend: number;
}

export interface Goal {
  id: string;
  title: string;
  target: number;
  current: number;
  period: 'daily' | 'weekly' | 'monthly';
  achieved: boolean;
}

interface AnalyticsStore {
  dateRange: 'week' | 'month' | 'quarter' | 'all';
  selectedPlatforms: string[];
  goals: Goal[];
  setDateRange: (range: 'week' | 'month' | 'quarter' | 'all') => void;
  setSelectedPlatforms: (platforms: string[]) => void;
  addGoal: (goal: Omit<Goal, 'id' | 'achieved'>) => void;
  updateGoalProgress: (id: string, current: number) => void;
  deleteGoal: (id: string) => void;
}

export const useAnalyticsStore = create<AnalyticsStore>()(
  persist(
    (set) => ({
      dateRange: 'month',
      selectedPlatforms: [],
      goals: [
        {
          id: '1',
          title: 'Complete 20 tasks this month',
          target: 20,
          current: 12,
          period: 'monthly',
          achieved: false,
        },
        {
          id: '2',
          title: 'Use 3 different AI platforms',
          target: 3,
          current: 2,
          period: 'weekly',
          achieved: false,
        },
      ],
      setDateRange: (range) => set({ dateRange: range }),
      setSelectedPlatforms: (platforms) => set({ selectedPlatforms: platforms }),
      addGoal: (goal) => {
        const newGoal: Goal = {
          ...goal,
          id: Date.now().toString(),
          achieved: goal.current >= goal.target,
        };
        set((state) => ({ goals: [...state.goals, newGoal] }));
      },
      updateGoalProgress: (id, current) => {
        set((state) => ({
          goals: state.goals.map((goal) =>
            goal.id === id
              ? { ...goal, current, achieved: current >= goal.target }
              : goal
          ),
        }));
      },
      deleteGoal: (id) => {
        set((state) => ({
          goals: state.goals.filter((goal) => goal.id !== id),
        }));
      },
    }),
    {
      name: 'taskweave-analytics',
    }
  )
);
