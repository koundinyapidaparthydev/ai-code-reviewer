import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import { toast } from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true, // For httpOnly cookies
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Token is handled via httpOnly cookies, but if you need to send it manually:
        const token = this.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        this.handleError(error);
        return Promise.reject(error);
      }
    );
  }

  private handleError(error: AxiosError) {
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data as any;

      switch (status) {
        case 401:
          // Unauthorized - redirect to login
          this.clearToken();
          if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
            window.location.href = '/login';
          }
          toast.error('Session expired. Please login again.');
          break;
        case 403:
          toast.error('Access forbidden.');
          break;
        case 404:
          toast.error('Resource not found.');
          break;
        case 500:
          toast.error('Server error. Please try again later.');
          break;
        default:
          toast.error(data?.message || 'An error occurred.');
      }
    } else if (error.request) {
      toast.error('Network error. Please check your connection.');
    } else {
      toast.error('An unexpected error occurred.');
    }
  }

  private getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  }

  private clearToken() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
  }

  public setToken(token: string) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
    }
  }

  // Auth endpoints
  async login(email: string, password: string) {
    const response = await this.client.post('/auth/login', { email, password });
    if (response.data.token) {
      this.setToken(response.data.token);
    }
    return response.data;
  }

  async signup(name: string, email: string, password: string) {
    const response = await this.client.post('/auth/signup', { name, email, password });
    if (response.data.token) {
      this.setToken(response.data.token);
    }
    return response.data;
  }

  async logout() {
    try {
      await this.client.post('/auth/logout');
    } finally {
      this.clearToken();
    }
  }

  async forgotPassword(email: string) {
    const response = await this.client.post('/auth/forgot-password', { email });
    return response.data;
  }

  async resetPassword(token: string, password: string) {
    const response = await this.client.post('/auth/reset-password', { token, password });
    return response.data;
  }

  async getCurrentUser() {
    const response = await this.client.get('/auth/me');
    return response.data;
  }

  // Validations endpoints
  async getValidations(params?: any) {
    const response = await this.client.get('/validations', { params });
    return response.data;
  }

  async getValidation(id: string) {
    const response = await this.client.get(`/validations/${id}`);
    return response.data;
  }

  async createManualValidation(files: File[], options?: any) {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    if (options) {
      formData.append('options', JSON.stringify(options));
    }

    const response = await this.client.post('/validations/manual', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  }

  async revalidate(id: string) {
    const response = await this.client.post(`/validations/${id}/revalidate`);
    return response.data;
  }

  async getValidationStatistics() {
    const response = await this.client.get('/validations/statistics');
    return response.data;
  }

  async getLastEvalReport() {
    const response = await this.client.get('/eval/last');
    return response.data;
  }

  // Repositories endpoints
  async getRepositories() {
    const response = await this.client.get('/repositories');
    return response.data;
  }

  async connectRepository(data: any) {
    const response = await this.client.post('/repositories/connect', data);
    return response.data;
  }

  async disconnectRepository(id: string) {
    const response = await this.client.delete(`/repositories/${id}`);
    return response.data;
  }

  async updateRepositorySettings(id: string, settings: any) {
    const response = await this.client.patch(`/repositories/${id}/settings`, settings);
    return response.data;
  }

  async testWebhook(id: string) {
    const response = await this.client.post(`/repositories/${id}/test-webhook`);
    return response.data;
  }

  // Notifications endpoints
  async getNotifications() {
    const response = await this.client.get('/notifications');
    return response.data;
  }

  async markNotificationAsRead(id: string) {
    const response = await this.client.patch(`/notifications/${id}/read`);
    return response.data;
  }

  async markAllNotificationsAsRead() {
    const response = await this.client.patch('/notifications/read-all');
    return response.data;
  }

  // Settings endpoints
  async getSettings() {
    const response = await this.client.get('/settings');
    return response.data;
  }

  async updateSettings(settings: any) {
    const response = await this.client.patch('/settings', settings);
    return response.data;
  }

  async updateProfile(data: any) {
    const response = await this.client.patch('/settings/profile', data);
    return response.data;
  }

  async changePassword(currentPassword: string, newPassword: string) {
    const response = await this.client.post('/settings/change-password', {
      currentPassword,
      newPassword,
    });
    return response.data;
  }

  async regenerateApiKey(type: string) {
    const response = await this.client.post(`/settings/regenerate-api-key/${type}`);
    return response.data;
  }
}

export const apiClient = new ApiClient();
export default apiClient;
