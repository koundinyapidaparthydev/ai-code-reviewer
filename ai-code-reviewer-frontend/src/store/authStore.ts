import { create } from 'zustand';
import { User, AuthState } from '@/types';
import apiClient from '@/lib/api';
import wsClient from '@/lib/websocket';

interface AuthStore extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  updateUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,

  login: async (email: string, password: string) => {
    const data = await apiClient.login(email, password);
    set({
      user: data.user,
      token: data.token,
      isAuthenticated: true,
    });
    wsClient.connect(data.token);
  },

  signup: async (name: string, email: string, password: string) => {
    const data = await apiClient.signup(name, email, password);
    set({
      user: data.user,
      token: data.token,
      isAuthenticated: true,
    });
    wsClient.connect(data.token);
  },

  logout: async () => {
    await apiClient.logout();
    set({
      user: null,
      token: null,
      isAuthenticated: false,
    });
    wsClient.disconnect();
  },

  checkAuth: async () => {
    try {
      const data = await apiClient.getCurrentUser();
      set({
        user: data.user,
        isAuthenticated: true,
      });
      wsClient.connect();
    } catch (error) {
      set({
        user: null,
        token: null,
        isAuthenticated: false,
      });
    }
  },

  updateUser: (userData: Partial<User>) => {
    const currentUser = get().user;
    if (currentUser) {
      set({
        user: { ...currentUser, ...userData },
      });
    }
  },
}));
