import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../api/axios';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email, password) => {
        const { data } = await api.post('/auth/login', { email, password });
        set({ user: data.user, token: data.token, isAuthenticated: true });
        return data;
      },

      register: async (email, username, password) => {
        const { data } = await api.post('/auth/register', {
          email,
          username,
          password,
        });
        set({ user: data.user, token: data.token, isAuthenticated: true });
        return data;
      },

      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
      },

      fetchMe: async () => {
        const token = get().token;
        if (!token) return;

        set({ isLoading: true });
        try {
          const { data } = await api.get('/auth/me');
          set({ user: data.user, isAuthenticated: true });
        } catch {
          get().logout();
        } finally {
          set({ isLoading: false });
        }
      },

      updateUser: (user) => set({ user }),
    }),
    {
      name: 'socialsphere-auth',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
