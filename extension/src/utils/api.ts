// API client for TaskWeave backend
// Handles all HTTP requests with authentication

import { Storage } from './storage';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export class Api {
  private static async getHeaders(): Promise<HeadersInit> {
    const token = await Storage.getAuthToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  private static async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const apiUrl = await Storage.getApiUrl();
      const headers = await this.getHeaders();

      const response = await fetch(`${apiUrl}${endpoint}`, {
        ...options,
        headers: {
          ...headers,
          ...options.headers,
        },
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: response.statusText }));
        return {
          success: false,
          error: error.error || `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      const data = await response.json();
      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error('API request failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  // Authentication
  static async login(email: string, password: string): Promise<ApiResponse<{ user: any; token: string }>> {
    const response = await this.request<{ user: any; token: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (response.success && response.data) {
      await Storage.setAuthToken(response.data.token);
      await Storage.setUserInfo(response.data.user.id, response.data.user.email);
    }

    return response;
  }

  static async register(email: string, password: string, name?: string): Promise<ApiResponse<{ user: any; token: string }>> {
    const response = await this.request<{ user: any; token: string }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });

    if (response.success && response.data) {
      await Storage.setAuthToken(response.data.token);
      await Storage.setUserInfo(response.data.user.id, response.data.user.email);
    }

    return response;
  }

  static async logout(): Promise<void> {
    await this.request('/api/auth/logout', { method: 'POST' });
    await Storage.logout();
  }

  static async getCurrentUser(): Promise<ApiResponse> {
    return this.request('/api/auth/me');
  }

  // Tasks
  static async getTasks(params?: { status?: string; search?: string }): Promise<ApiResponse> {
    const query = new URLSearchParams(params as any).toString();
    return this.request(`/api/tasks${query ? `?${query}` : ''}`);
  }

  static async getTask(taskId: string): Promise<ApiResponse> {
    return this.request(`/api/tasks/${taskId}`);
  }

  static async createTask(data: {
    title: string;
    description?: string;
    tags?: string[];
  }): Promise<ApiResponse> {
    return this.request('/api/tasks', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async updateTask(taskId: string, updates: any): Promise<ApiResponse> {
    return this.request(`/api/tasks/${taskId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  static async deleteTask(taskId: string): Promise<ApiResponse> {
    return this.request(`/api/tasks/${taskId}`, {
      method: 'DELETE',
    });
  }

  // Conversations
  static async getConversations(taskId: string): Promise<ApiResponse> {
    return this.request(`/api/conversations?taskId=${taskId}`);
  }

  static async getConversation(conversationId: string): Promise<ApiResponse> {
    return this.request(`/api/conversations/${conversationId}`);
  }

  static async createConversation(data: {
    task_id: string;
    platform: string;
    title?: string;
    external_id?: string;
  }): Promise<ApiResponse> {
    return this.request('/api/conversations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async addMessage(conversationId: string, data: {
    sender: string;
    content: string;
    contentType?: string;
  }): Promise<ApiResponse> {
    return this.request(`/api/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Health check
  static async healthCheck(): Promise<ApiResponse> {
    return this.request('/health');
  }
}

