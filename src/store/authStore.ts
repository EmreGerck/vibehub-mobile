import { create } from 'zustand';
import storage from '../utils/storage';
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from '../api/client';
import type { User } from '../types';

interface AuthStore {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;

  setAuth: (user: User, accessToken: string) => void;
  setAccessToken: (token: string) => void;
  clearAuth: () => void;
  hydrate: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  accessToken: null,
  isLoading: true,

  setAuth: (user, accessToken) => set({ user, accessToken }),

  setAccessToken: (token) => set({ accessToken: token }),

  clearAuth: () => set({ user: null, accessToken: null }),

  // Called once on app start to restore session from secure storage
  hydrate: async () => {
    try {
      const token = await storage.getItemAsync(ACCESS_TOKEN_KEY);
      if (!token) return;

      // Validate the stored token by fetching /auth/me
      const { default: api } = await import('../api/client');
      const { data } = await api.get<{ data: User }>('/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });

      set({ user: data.data, accessToken: token });
    } catch {
      await storage.deleteItemAsync(ACCESS_TOKEN_KEY);
      await storage.deleteItemAsync(REFRESH_TOKEN_KEY);
    } finally {
      set({ isLoading: false });
    }
  },
}));
