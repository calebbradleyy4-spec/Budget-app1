import { create } from 'zustand';
import * as authApi from '../api/auth';
import { saveTokens, getAccessToken, getRefreshToken, clearTokens, saveUser, getUser, clearUser } from '../utils/storage';
import type { UserDTO } from '../types/shared';

interface AuthState {
  user: UserDTO | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  initialize: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  initialize: async () => {
    try {
      const token = await getAccessToken();
      const user = await getUser<UserDTO>();
      if (token && user) {
        set({ user, isAuthenticated: true, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const res = await authApi.login(email, password);
      await saveTokens(res.accessToken, res.refreshToken);
      await saveUser(res.user);
      set({ user: res.user, isAuthenticated: true, isLoading: false });
    } catch (err: any) {
      const message = err?.response?.data?.error || err?.message || 'Login failed';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  register: async (email, password, name) => {
    set({ isLoading: true, error: null });
    try {
      const res = await authApi.register(email, password, name);
      await saveTokens(res.accessToken, res.refreshToken);
      await saveUser(res.user);
      set({ user: res.user, isAuthenticated: true, isLoading: false });
    } catch (err: any) {
      const message = err?.response?.data?.error || err?.message || 'Registration failed';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  logout: async () => {
    try {
      const refreshToken = await getRefreshToken();
      if (refreshToken) await authApi.logout(refreshToken);
    } catch { /* ignore logout errors */ }
    await clearTokens();
    await clearUser();
    set({ user: null, isAuthenticated: false });
  },

  clearError: () => set({ error: null }),
}));
