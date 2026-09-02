import { create } from 'zustand';
import { Validation, ValidationDetail, ValidationStatistics, FilterParams } from '@/types';
import apiClient from '@/lib/api';
import { normalizeValidation, normalizeValidationDetail } from '@/lib/normalize';

interface ValidationStore {
  validations: Validation[];
  currentValidation: ValidationDetail | null;
  statistics: ValidationStatistics | null;
  loading: boolean;
  filters: FilterParams;
  pagination: {
    page: number;
    limit: number;
    total: number;
  };

  fetchValidations: (params?: any) => Promise<void>;
  fetchValidation: (id: string) => Promise<void>;
  fetchStatistics: () => Promise<void>;
  createManualValidation: (files: File[], options?: any) => Promise<string>;
  revalidate: (id: string) => Promise<void>;
  setFilters: (filters: Partial<FilterParams>) => void;
  setPage: (page: number) => void;
  addValidation: (validation: Validation) => void;
  updateValidation: (id: string, updates: Partial<Validation>) => void;
}

export const useValidationStore = create<ValidationStore>((set, get) => ({
  validations: [],
  currentValidation: null,
  statistics: null,
  loading: false,
  filters: {},
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
  },

  fetchValidations: async (params?: any) => {
    set({ loading: true });
    try {
      const { filters, pagination } = get();
      const data = await apiClient.getValidations({
        ...filters,
        page: pagination.page,
        limit: pagination.limit,
        ...params,
      });
      set({
        validations: (data.validations || []).map((item: Record<string, unknown>) =>
          normalizeValidation(item)
        ),
        pagination: {
          ...pagination,
          total: data.total,
        },
      });
    } finally {
      set({ loading: false });
    }
  },

  fetchValidation: async (id: string) => {
    set({ loading: true });
    try {
      const data = await apiClient.getValidation(id);
      set({ currentValidation: normalizeValidationDetail(data) });
    } finally {
      set({ loading: false });
    }
  },

  fetchStatistics: async () => {
    try {
      const data = await apiClient.getValidationStatistics();
      const total = data.totalValidations ?? data.total ?? 0;
      const completed = data.completed ?? 0;
      set({
        statistics: {
          totalValidations: total,
          successRate: data.successRate ?? (total ? Math.round((completed / total) * 100) : 0),
          failedValidations: data.failedValidations ?? data.failed ?? 0,
          pendingReviews: data.pendingReviews ?? data.pending ?? 0,
          averageScore: Number(data.averageScore || 0),
        } as ValidationStatistics,
      });
    } catch (error) {
      console.error('Failed to fetch statistics:', error);
    }
  },

  createManualValidation: async (files: File[], options?: any) => {
    set({ loading: true });
    try {
      const data = await apiClient.createManualValidation(files, options);
      return data.id;
    } finally {
      set({ loading: false });
    }
  },

  revalidate: async (id: string) => {
    set({ loading: true });
    try {
      await apiClient.revalidate(id);
      await get().fetchValidation(id);
    } finally {
      set({ loading: false });
    }
  },

  setFilters: (newFilters: Partial<FilterParams>) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
      pagination: { ...state.pagination, page: 1 },
    }));
    get().fetchValidations();
  },

  setPage: (page: number) => {
    set((state) => ({
      pagination: { ...state.pagination, page },
    }));
    get().fetchValidations();
  },

  addValidation: (validation: Validation) => {
    set((state) => ({
      validations: [validation, ...state.validations],
    }));
  },

  updateValidation: (id: string, updates: Partial<Validation>) => {
    set((state) => ({
      validations: state.validations.map((v) =>
        v.id === id ? { ...v, ...updates } : v
      ),
    }));
  },
}));
