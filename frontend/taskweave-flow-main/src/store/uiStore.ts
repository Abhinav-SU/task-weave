import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIStore {
  sidebarOpen: boolean;
  detailsPanelOpen: boolean;
  theme: 'light' | 'dark';
  toggleSidebar: () => void;
  toggleDetailsPanel: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
}

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      detailsPanelOpen: false,
      theme: 'dark',
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      toggleDetailsPanel: () => set((state) => ({ detailsPanelOpen: !state.detailsPanelOpen })),
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'taskweave-ui',
    }
  )
);
