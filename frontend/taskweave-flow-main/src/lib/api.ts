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

  // Workflow Executions
  async executeWorkflow(
    taskId: string,
    variables: Record<string, any>,
    options: { templateId?: string; templateData?: { name?: string; nodes: any[]; edges: any[] } }
  ) {
    return this.request('/api/executions/execute', {
      method: 'POST',
      body: JSON.stringify({ 
        templateId: options.templateId,
        templateData: options.templateData,
        taskId, 
        variables 
      }),
    });
  }

  async getExecution(executionId: string) {
    return this.request(`/api/executions/${executionId}`);
  }

  async listExecutions(taskId: string) {
    return this.request(`/api/executions/task/${taskId}`);
  }

  async cancelExecution(executionId: string) {
    return this.request(`/api/executions/${executionId}/cancel`, {
      method: 'POST',
    });
  }

  // Templates (fetch tasks marked as templates)
  async getTemplates() {
    try {
      const response = await this.getTasks();
      
      // Handle both array and object responses
      const tasks = Array.isArray(response) ? response : (response.tasks || []);
      
      // Filter tasks that are templates (check is_template field OR metadata.isTemplate)
      const templates = tasks
        .filter((task: any) => task.is_template === 'yes' || task.metadata?.isTemplate === true)
        .map((task: any) => ({
          id: task.id,
          name: task.title,
          description: task.description || '',
          category: task.metadata?.category || 'General',
          tags: Array.isArray(task.tags) ? task.tags : (task.metadata?.tags || []),
          icon: task.metadata?.icon || '📋',
          isPublic: false,
          estimatedTime: task.metadata?.estimatedTime || 5,
          createdAt: new Date(task.created_at),
          updatedAt: new Date(task.updated_at),
          nodes: task.metadata?.nodes || [],
          edges: task.metadata?.edges || [],
          metadata: task.metadata, // Keep full metadata for RunTemplateDialog
        }));
      
      return { templates };
    } catch (error) {
      console.error('Failed to fetch templates:', error);
      return { templates: [] };
    }
  }

  async createTemplate(template: any) {
    const task = {
      title: template.name,
      description: template.description,
      status: 'active',
      metadata: {
        isTemplate: true,
        category: template.category,
        tags: template.tags,
        icon: template.icon,
        estimatedTime: template.estimatedTime,
        nodes: template.nodes,
        edges: template.edges,
      },
    };
    return this.createTask(task);
  }

  async updateTemplate(id: string, template: any) {
    const task = {
      title: template.name,
      description: template.description,
      metadata: {
        isTemplate: true,
        category: template.category,
        tags: template.tags,
        icon: template.icon,
        estimatedTime: template.estimatedTime,
        nodes: template.nodes,
        edges: template.edges,
      },
    };
    return this.updateTask(id, task);
  }

  async deleteTemplate(id: string) {
    return this.deleteTask(id);
  }

  // Health check
  async healthCheck() {
    return this.request('/health');
  }
}

export const api = new ApiClient();

