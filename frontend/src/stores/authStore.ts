import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '../types';
import apiClient from '../lib/api';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  fetchMe: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,

      setAuth: (user, token) => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('everythinganything_token', token);
        }
        set({ user, token });
      },

      logout: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('everythinganything_token');
        }
        set({ user: null, token: null });
      },

      fetchMe: async () => {
        const currentToken = get().token;
        if (!currentToken) return;

        set({ isLoading: true });
        try {
          const res = await apiClient.get<{ success: boolean; data: User }>('/auth/me');
          if (res.data?.data) {
            set({ user: res.data.data, isLoading: false });
          }
        } catch {
          get().logout();
          set({ isLoading: false });
        }
      },
    }),
    {
      name: 'everythinganything_auth',
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
);

