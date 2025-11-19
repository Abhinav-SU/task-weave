// API Client for TaskWeave Backend
import { config } from './config';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = config.apiUrl;
  }

  private getAuthToken(): string | null {
    // Get token from Zustand persist storage
    const authData = localStorage.getItem('taskweave-auth');
    if (authData) {
      try {
        const parsed = JSON.parse(authData);
        return parsed.state?.token || null;
      } catch {
        return null;
      }
    }
    // Fallback to direct token storage
    return localStorage.getItem('authToken');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getAuthToken();
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: response.statusText }));
      throw new Error(error.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    // Handle 204 No Content (DELETE operations)
    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  // Authentication
  async register(email: string, password: string, name?: string) {
    const response = await this.request<{ user: any; token: string }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
    
    // Don't manually set localStorage - let authStore handle it via persist
    return response;
  }

  async login(email: string, password: string) {
    const response = await this.request<{ user: any; token: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    // Don't manually set localStorage - let authStore handle it via persist
    return response;
  }

  async logout() {
    try {
      await this.request('/api/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout API error:', error);
      // Continue with local cleanup even if API fails
    }
    // Don't manually remove localStorage - let authStore handle it via persist
  }

  async getCurrentUser() {
    return this.request('/api/auth/me');
  }

  // Tasks
  async getTasks(params?: { status?: string; search?: string; tags?: string }) {
    const query = new URLSearchParams(params as any).toString();
    return this.request(`/api/tasks${query ? `?${query}` : ''}`);
  }

  async getTask(taskId: string) {
    return this.request(`/api/tasks/${taskId}`);
  }

  async createTask(data: {
    title: string;
    description?: string;
    status?: string;
    priority?: string;
    tags?: string[];
  }) {
    return this.request('/api/tasks', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTask(taskId: string, updates: any) {
    return this.request(`/api/tasks/${taskId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async deleteTask(taskId: string) {
    return this.request(`/api/tasks/${taskId}`, {
      method: 'DELETE',
    });
  }

  async searchTasks(query: string) {
    return this.request(`/api/tasks/search?q=${encodeURIComponent(query)}`);
  }

  // Conversations
  async getConversations(taskId: string) {
    return this.request(`/api/conversations?taskId=${taskId}`);
  }

  async getConversation(conversationId: string) {
    return this.request(`/api/conversations/${conversationId}`);
  }

  async createConversation(data: {
    task_id: string;
    platform: string;
    title?: string;
    external_id?: string;
  }) {
    return this.request('/api/conversations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async addMessage(conversationId: string, data: {
    sender: string;
    content: string;
    contentType?: string;
  }) {
    return this.request(`/api/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Health check
  async healthCheck() {
    return this.request('/health');
  }
}

export const api = new ApiClient();

