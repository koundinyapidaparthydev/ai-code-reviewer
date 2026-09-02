import { create } from 'zustand';
import { Repository, RepositorySettings } from '@/types';
import apiClient from '@/lib/api';

interface RepositoryStore {
  repositories: Repository[];
  loading: boolean;

  fetchRepositories: () => Promise<void>;
  connectRepository: (data: any) => Promise<void>;
  disconnectRepository: (id: string) => Promise<void>;
  updateSettings: (id: string, settings: Partial<RepositorySettings>) => Promise<void>;
  testWebhook: (id: string) => Promise<void>;
}

export const useRepositoryStore = create<RepositoryStore>((set, get) => ({
  repositories: [],
  loading: false,

  fetchRepositories: async () => {
    set({ loading: true });
    try {
      const data = await apiClient.getRepositories();
      set({ repositories: data });
    } finally {
      set({ loading: false });
    }
  },

  connectRepository: async (data: any) => {
    set({ loading: true });
    try {
      await apiClient.connectRepository(data);
      await get().fetchRepositories();
    } finally {
      set({ loading: false });
    }
  },

  disconnectRepository: async (id: string) => {
    set({ loading: true });
    try {
      await apiClient.disconnectRepository(id);
      set((state) => ({
        repositories: state.repositories.filter((r) => r.id !== id),
      }));
    } finally {
      set({ loading: false });
    }
  },

  updateSettings: async (id: string, settings: Partial<RepositorySettings>) => {
    set({ loading: true });
    try {
      await apiClient.updateRepositorySettings(id, settings);
      await get().fetchRepositories();
    } finally {
      set({ loading: false });
    }
  },

  testWebhook: async (id: string) => {
    await apiClient.testWebhook(id);
  },
}));
