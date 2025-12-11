/**
 * Authentication Service
 * Refactored to use unified API and auth storage
 */

import { api, handleApiError } from './api';
import { setAuth, clearAuth, isAuthenticated } from '@/utils/authStorage';
import type { User, LoginCredentials, RegisterData, AuthResponse } from '@/types';

const ENDPOINTS = {
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  LOGOUT: '/auth/logout',
  ME: '/auth/me',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
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
   * Check if user is authenticated (synchronous)
   */
  isAuthenticated,
};
