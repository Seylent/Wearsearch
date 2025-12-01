import api, { handleApiError } from './api';
import ENDPOINTS from './endpoints';
import { AxiosResponse } from 'axios';

// Type definitions for authentication
export interface User {
  id: string | number;
  email: string;
  displayName?: string;
  username?: string;
  role?: 'user' | 'admin';
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  displayName?: string;
  username?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken?: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  token: string;
  newPassword: string;
}

// Authentication Service - handles all auth-related API calls
export const authService = {
  /**
   * Login user with email and password
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response: AxiosResponse<AuthResponse> = await api.post(
        ENDPOINTS.AUTH.LOGIN,
        credentials
      );
      
      // Store token in localStorage
      if (response.data.token) {
        localStorage.setItem('authToken', response.data.token);
        if (response.data.refreshToken) {
          localStorage.setItem('refreshToken', response.data.refreshToken);
        }
      }
      
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Register a new user
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const response: AxiosResponse<AuthResponse> = await api.post(
        ENDPOINTS.AUTH.REGISTER,
        data
      );
      
      // Store token in localStorage
      if (response.data.token) {
        localStorage.setItem('authToken', response.data.token);
        if (response.data.refreshToken) {
          localStorage.setItem('refreshToken', response.data.refreshToken);
        }
      }
      
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Logout current user
   */
  async logout(): Promise<void> {
    try {
      await api.post(ENDPOINTS.AUTH.LOGOUT);
    } catch (error) {
      console.error('Logout error:', handleApiError(error));
    } finally {
      // Always clear tokens from localStorage
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
    }
  },

  /**
   * Get current user profile
   */
  async getCurrentUser(): Promise<User> {
    try {
      const response: AxiosResponse<User> = await api.get(ENDPOINTS.AUTH.ME);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Refresh authentication token
   */
  async refreshToken(): Promise<{ token: string }> {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      const response: AxiosResponse<{ token: string }> = await api.post(
        ENDPOINTS.AUTH.REFRESH,
        { refreshToken }
      );
      
      // Update token in localStorage
      if (response.data.token) {
        localStorage.setItem('authToken', response.data.token);
      }
      
      return response.data;
    } catch (error) {
      // If refresh fails, clear tokens and redirect to login
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Send password reset email
   */
  async forgotPassword(data: ForgotPasswordData): Promise<{ message: string }> {
    try {
      const response: AxiosResponse<{ message: string }> = await api.post(
        ENDPOINTS.AUTH.FORGOT_PASSWORD,
        data
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Reset password with token
   */
  async resetPassword(data: ResetPasswordData): Promise<{ message: string }> {
    try {
      const response: AxiosResponse<{ message: string }> = await api.post(
        ENDPOINTS.AUTH.RESET_PASSWORD,
        data
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Update user profile (display name)
   */
  async updateProfile(data: { display_name: string }): Promise<User> {
    try {
      const response: AxiosResponse<User> = await api.put(
        ENDPOINTS.AUTH.PROFILE,
        data
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Change user password
   */
  async changePassword(data: { current_password: string; new_password: string }): Promise<{ message: string }> {
    try {
      const response: AxiosResponse<{ message: string }> = await api.put(
        ENDPOINTS.AUTH.PASSWORD,
        data
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem('authToken');
  },

  /**
   * Get stored auth token
   */
  getToken(): string | null {
    return localStorage.getItem('authToken');
  },
};

export default authService;
