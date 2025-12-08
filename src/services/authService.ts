import api, { handleApiError } from './api';
import ENDPOINTS from './endpoints';
import { AxiosResponse } from 'axios';

// Type definitions for authentication
export interface User {
  id: string;
  email: string;
  username?: string; // NEW: Support for username
  display_name?: string;
  role?: 'user' | 'admin';
  created_at?: string;
  updated_at?: string;
}

export interface LoginCredentials {
  identifier?: string; // Email OR Username
  email?: string; // Backward compatibility
  password: string;
}

export interface RegisterData {
  email: string;
  username?: string; // NEW: Optional username during registration
  password: string;
  display_name?: string;
}

export interface AuthResponse {
  success: boolean;
  access_token: string;
  refresh_token?: string;
  token_type?: string;
  expires_in?: number;
  user: User;
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
   * Login user with email/username and password
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      // Prepare payload - use identifier if provided, otherwise use email for backward compatibility
      const payload = {
        identifier: credentials.identifier || credentials.email,
        password: credentials.password
      };

      const response: AxiosResponse<AuthResponse> = await api.post(
        ENDPOINTS.AUTH.LOGIN,
        payload
      );
      
      // Store token in localStorage
      if (response.data.access_token) {
        localStorage.setItem('access_token', response.data.access_token);
        if (response.data.refresh_token) {
          localStorage.setItem('refresh_token', response.data.refresh_token);
        }
      }
      
      // Dispatch auth change event
      window.dispatchEvent(new Event('authChange'));
      
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Register a new user
   */
  async register(data: RegisterData): Promise<{ success: boolean; user: User }> {
    try {
      const response: AxiosResponse<{ success: boolean; user: User }> = await api.post(
        ENDPOINTS.AUTH.REGISTER,
        data
      );
      
      // Note: Registration doesn't return tokens - user needs to login
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
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      
      // Dispatch auth change event
      window.dispatchEvent(new Event('authChange'));
    }
  },

  /**
   * Get current user profile
   */
  async getCurrentUser(): Promise<User> {
    try {
      const response: AxiosResponse<User> = await api.get(ENDPOINTS.AUTH.ME);
      // Backend returns user object directly (no wrapper)
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
    return !!localStorage.getItem('access_token');
  },

  /**
   * Get stored auth token
   */
  getToken(): string | null {
    return localStorage.getItem('access_token');
  },
};

export default authService;
