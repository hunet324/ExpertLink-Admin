import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface AppState {
  user: {
    id: string | null;
    name: string | null;
    email: string | null;
  };
  theme: 'light' | 'dark';
  isLoading: boolean;
  setUser: (user: { id: string; name: string; email: string }) => void;
  clearUser: () => void;
  toggleTheme: () => void;
  setLoading: (loading: boolean) => void;
}

export const useStore = create<AppState>()(
  devtools((set) => ({
    user: {
      id: null,
      name: null,
      email: null,
    },
    theme: 'light',
    isLoading: false,
    setUser: (user) => set({ user }),
    clearUser: () => set({ user: { id: null, name: null, email: null } }),
    toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
    setLoading: (isLoading) => set({ isLoading }),
  }))
);