// Storage utility for browser extension
// Handles authentication token and settings persistence

import browser from 'webextension-polyfill';

export interface StorageData {
  authToken?: string;
  apiUrl?: string;
  userId?: string;
  userEmail?: string;
  settings?: {
    autoCapture?: boolean;
    showNotifications?: boolean;
    theme?: 'light' | 'dark' | 'auto';
  };
}

export class Storage {
  // Get item from storage
  static async get<K extends keyof StorageData>(key: K): Promise<StorageData[K] | null> {
    try {
      const result = await browser.storage.local.get(key);
      return result[key] ?? null;
    } catch (error) {
      console.error(`Failed to get ${key} from storage:`, error);
      return null;
    }
  }

  // Set item in storage
  static async set<K extends keyof StorageData>(key: K, value: StorageData[K]): Promise<void> {
    try {
      await browser.storage.local.set({ [key]: value });
    } catch (error) {
      console.error(`Failed to set ${key} in storage:`, error);
      throw error;
    }
  }

  // Remove item from storage
  static async remove(key: keyof StorageData): Promise<void> {
    try {
      await browser.storage.local.remove(key);
    } catch (error) {
      console.error(`Failed to remove ${key} from storage:`, error);
      throw error;
    }
  }

  // Clear all storage
  static async clear(): Promise<void> {
    try {
      await browser.storage.local.clear();
    } catch (error) {
      console.error('Failed to clear storage:', error);
      throw error;
    }
  }

  // Get all storage data
  static async getAll(): Promise<StorageData> {
    try {
      return (await browser.storage.local.get()) as StorageData;
    } catch (error) {
      console.error('Failed to get all storage:', error);
      return {};
    }
  }

  // Authentication helpers
  static async getAuthToken(): Promise<string | null> {
    return this.get('authToken');
  }

  static async setAuthToken(token: string): Promise<void> {
    await this.set('authToken', token);
  }

  static async removeAuthToken(): Promise<void> {
    await this.remove('authToken');
  }

  static async isAuthenticated(): Promise<boolean> {
    const token = await this.getAuthToken();
    return !!token;
  }

  // API URL helpers
  static async getApiUrl(): Promise<string> {
    const url = await this.get('apiUrl');
    return url || 'http://localhost:3000';
  }

  static async setApiUrl(url: string): Promise<void> {
    await this.set('apiUrl', url);
  }

  // User info helpers
  static async getUserInfo(): Promise<{ userId?: string; userEmail?: string }> {
    const userId = await this.get('userId');
    const userEmail = await this.get('userEmail');
    return { userId: userId ?? undefined, userEmail: userEmail ?? undefined };
  }

  static async setUserInfo(userId: string, userEmail: string): Promise<void> {
    await this.set('userId', userId);
    await this.set('userEmail', userEmail);
  }

  static async removeUserInfo(): Promise<void> {
    await this.remove('userId');
    await this.remove('userEmail');
  }

  // Settings helpers
  static async getSettings(): Promise<StorageData['settings']> {
    const settings = await this.get('settings');
    return settings || {
      autoCapture: true,
      showNotifications: true,
      theme: 'auto',
    };
  }

  static async updateSettings(updates: Partial<StorageData['settings']>): Promise<void> {
    const current = await this.getSettings();
    await this.set('settings', { ...current, ...updates });
  }

  // Logout helper (clears all auth data)
  static async logout(): Promise<void> {
    await this.removeAuthToken();
    await this.removeUserInfo();
  }
}

