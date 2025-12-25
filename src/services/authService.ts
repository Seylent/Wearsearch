/**
 * Authentication Service
 * Refactored to use unified API and auth storage
 */

import { api, handleApiError } from './api';
import { setAuth, clearAuth, isAuthenticated } from '@/utils/authStorage';
import { getValidGuestFavorites, clearGuestFavorites } from './guestFavorites';
import { getErrorMessage } from '@/utils/errorTranslation';
import type { User, LoginCredentials, RegisterData, AuthResponse } from '@/types';

const ENDPOINTS = {
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  LOGOUT: '/auth/logout',
  ME: '/auth/me',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
  CHANGE_PASSWORD: '/auth/password',
};

export const authService = {
  /**
   * Login user with email/username and password
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await api.post(ENDPOINTS.LOGIN, credentials);
      const data = response.data;

      // Store auth token
      if (data.access_token || data.token) {
        const token = data.access_token || data.token;
        const userId = data.user?.id;
        const expiresIn = data.expires_in;
        const expiresAt = expiresIn ? Date.now() + expiresIn * 1000 : undefined;

        setAuth(token, userId, expiresAt);
        
        // Store user data for profile display
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
        }

        // Sync guest favorites after successful login
        await this.syncGuestFavorites(token);
      }

      return data;
    } catch (error) {
      const apiError = handleApiError(error);
      throw new Error(apiError.message);
    }
  },

  /**
   * Register new user
   */
  async register(registerData: RegisterData): Promise<AuthResponse> {
    try {
      const response = await api.post(ENDPOINTS.REGISTER, registerData);
      const data = response.data;

      // Store auth token
      if (data.access_token || data.token) {
        const token = data.access_token || data.token;
        const userId = data.user?.id;
        const expiresIn = data.expires_in;
        const expiresAt = expiresIn ? Date.now() + expiresIn * 1000 : undefined;

        setAuth(token, userId, expiresAt);
        
        // Store user data for profile display

        // Sync guest favorites after successful registration
        await this.syncGuestFavorites(token);
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
        }
      }

      return data;
    } catch (error) {
      const apiError = handleApiError(error);
      throw new Error(apiError.message);
    }
  },

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      await api.post(ENDPOINTS.LOGOUT);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearAuth();
    }
  },

  /**
   * Get current user
   */
  async getCurrentUser(): Promise<User> {
    try {
      const response = await api.get(ENDPOINTS.ME);
      return response.data;
    } catch (error) {
      const apiError = handleApiError(error);
      throw new Error(apiError.message);
    }
  },

  /**
   * Request password reset
   */
  async forgotPassword(email: string): Promise<{ message: string }> {
    try {
      const response = await api.post(ENDPOINTS.FORGOT_PASSWORD, { email });
      return response.data;
    } catch (error) {
      const apiError = handleApiError(error);
      throw new Error(apiError.message);
    }
  },

  /**
   * Reset password with token
   */
  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    try {
      const response = await api.post(ENDPOINTS.RESET_PASSWORD, {
        token,
        newPassword,
      });
      return response.data;
    } catch (error) {
      const apiError = handleApiError(error);
      throw new Error(apiError.message);
    }
  },

  /**
   * Change password for authenticated user
   */
  async changePassword(data: { current_password: string; new_password: string }): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.put(ENDPOINTS.CHANGE_PASSWORD, data);
      return response.data;
    } catch (error: any) {
      // Handle specific password change errors
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      const apiError = handleApiError(error);
      throw new Error(apiError.message);
    }
  },

  /**
   * Update user profile
   */
  async updateProfile(data: { display_name?: string }): Promise<User> {
    try {
      const response = await api.put(ENDPOINTS.ME, data);
      
      // Update cached user data
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      return response.data.user || response.data;
    } catch (error) {
      const apiError = handleApiError(error);
      throw new Error(apiError.message);
    }
  },

  /**
   * Check if user is admin
   */
  async checkAdmin(): Promise<boolean> {
    try {
      const user = await this.getCurrentUser();
      return user.role === 'admin';
    } catch (error) {
      return false;
    }
  },

  /**

  /**
   * Sync guest favorites after login/register
   */
  async syncGuestFavorites(token: string): Promise<void> {
    try {
      // Get only valid UUID favorites
      const guestFavorites = getValidGuestFavorites();
      
      // Skip if no guest favorites
      if (guestFavorites.length === 0) {
        console.log('ℹ️ No guest favorites to sync');
        return;
      }

      console.log(`🔄 Syncing ${guestFavorites.length} valid guest favorites...`);

      const response = await api.post('/favorites/sync', { guestFavorites });
      const result = response.data;

      if (result.success !== false) {
        console.log(`✅ Synced ${result.added || 0} favorites. Total: ${result.total || 0}`);
        
        // Clear guest favorites after successful sync
        clearGuestFavorites();
      }
    } catch (error: any) {
      console.error('❌ Failed to sync guest favorites:', error);
      
      // Show detailed error message
      if (error.response?.data?.error) {
        console.error('Error details:', error.response.data.error);
      }
      
      // Keep guest favorites in localStorage for retry - don't clear on error
    }
  },

  /**
   * Check if user is authenticated (synchronous)
   */
  isAuthenticated,
};
