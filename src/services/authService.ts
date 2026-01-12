/**
 * Authentication Service
 * Refactored to use unified API and auth storage
 */

import { api, apiLegacy } from './api';
import { setAuth, clearAuth, isAuthenticated } from '@/utils/authStorage';
import { getValidGuestFavorites, clearGuestFavorites } from './guestFavorites';
import { logAuthError } from './logger';
import type { User, LoginCredentials, RegisterData, AuthResponse } from '@/types';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function asError(value: unknown): Error {
  if (value instanceof Error) return value;
  if (typeof value === 'string') return new Error(value);
  if (value && typeof value === 'object') return new Error(JSON.stringify(value));
  return new Error(value instanceof Error ? value.message : JSON.stringify(value));
}

function getErrorStatus(error: unknown): number | undefined {
  if (!isRecord(error)) return undefined;

  const status = error.status;
  if (typeof status === 'number') return status;

  const response = error.response;
  if (isRecord(response) && typeof response.status === 'number') return response.status;

  return undefined;
}

// Request deduplication for getCurrentUser
let currentUserPromise: Promise<User> | null = null;

function getResponseData(error: unknown): Record<string, unknown> | undefined {
  if (!isRecord(error)) return undefined;
  const response = error.response;
  if (!isRecord(response)) return undefined;
  const data = response.data;
  return isRecord(data) ? data : undefined;
}

const ENDPOINTS = {
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  LOGOUT: '/auth/logout',
  ME: '/auth/me', // GET for current user, PUT for profile update
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
  CHANGE_PASSWORD: '/auth/password',
};

const ENABLE_LEGACY_FALLBACK = process.env.NEXT_PUBLIC_ENABLE_LEGACY_FALLBACK === 'true';

export const authService = {
  isNotFound(error: unknown): boolean {
    return getErrorStatus(error) === 404;
  },

  /**
   * Login user with email/username and password
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      console.log('🔐 Attempting login...');
      const response = await api.post(ENDPOINTS.LOGIN, credentials);
      const data = response.data;
      console.log('✅ Login response received:', { 
        hasToken: !!(data.access_token || data.token),
        hasUser: !!data.user,
        userId: data.user?.id 
      });

      // Store auth token
      if (data.access_token || data.token) {
        const token = data.access_token || data.token;
        const userId = data.user?.id;
        const expiresIn = data.expires_in;
        const expiresAt = expiresIn ? Date.now() + expiresIn * 1000 : undefined;

        console.log('💾 Storing auth data:', { 
          tokenLength: token.length,
          userId,
          expiresIn,
          expiresAt: expiresAt ? new Date(expiresAt).toISOString() : 'no expiration'
        });

        setAuth(token, userId, expiresAt);
        
        // Store user data for profile display
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
        }

        // Sync guest favorites after successful login
        await this.syncGuestFavorites(token);
        
        console.log('✅ Login completed successfully');
      } else {
        console.error('❌ No token received from login response');
      }

      return data;
    } catch (error) {
      if (ENABLE_LEGACY_FALLBACK && this.isNotFound(error)) {
        try {
          console.warn('⚠️ v1 login route not found, falling back to legacy /api');
          const legacyResponse = await apiLegacy.post(ENDPOINTS.LOGIN, credentials);
          return legacyResponse.data;
        } catch (legacyError) {
          console.error('❌ Legacy login failed:', legacyError);
          throw asError(legacyError);
        }
      }

      console.error('❌ Login failed:', error);
      throw asError(error);
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
      if (ENABLE_LEGACY_FALLBACK && this.isNotFound(error)) {
        try {
          console.warn('⚠️ v1 register route not found, falling back to legacy /api');
          const legacyResponse = await apiLegacy.post(ENDPOINTS.REGISTER, registerData);
          return legacyResponse.data;
        } catch (legacyError) {
          throw asError(legacyError);
        }
      }

      throw asError(error);
    }
  },

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      await api.post(ENDPOINTS.LOGOUT);
    } catch (error) {
      if (ENABLE_LEGACY_FALLBACK && this.isNotFound(error)) {
        try {
          await apiLegacy.post(ENDPOINTS.LOGOUT);
          return;
        } catch (legacyError) {
          logAuthError(asError(legacyError), 'LOGOUT');
        }
      }
      logAuthError(asError(error), 'LOGOUT');
    } finally {
      clearAuth();
    }
  },

  /**
   * Get current user
   */
  async getCurrentUser(): Promise<User> {
    // Return existing promise if already fetching
    if (currentUserPromise !== null) {
      return currentUserPromise;
    }

    currentUserPromise = fetchCurrentUserInternal();
    
    try {
      const result = await currentUserPromise;
      return result;
    } finally {
      // Clear promise after completion (success or failure)
      currentUserPromise = null;
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
      if (ENABLE_LEGACY_FALLBACK && this.isNotFound(error)) {
        const legacyResponse = await apiLegacy.post(ENDPOINTS.FORGOT_PASSWORD, { email });
        return legacyResponse.data;
      }
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
      if (ENABLE_LEGACY_FALLBACK && this.isNotFound(error)) {
        const legacyResponse = await apiLegacy.post(ENDPOINTS.RESET_PASSWORD, {
          token,
          newPassword,
        });
        return legacyResponse.data;
      }
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
    } catch (error: unknown) {
      // Handle specific password change errors
      const responseData = getResponseData(error);
      const passwordError = responseData?.error;
      if (typeof passwordError === 'string' && passwordError.length > 0) {
        throw new Error(passwordError);
      }

      if (ENABLE_LEGACY_FALLBACK && this.isNotFound(error)) {
        const legacyResponse = await apiLegacy.put(ENDPOINTS.CHANGE_PASSWORD, data);
        return legacyResponse.data;
      }

      const apiError = handleApiError(error);
      throw new Error(apiError.message);
    }
  },

  /**
   * Update user profile (display_name, username)
   * Canonical v1: PUT /api/v1/auth/me
   */
  async updateProfile(data: { display_name?: string; username?: string }): Promise<User> {
    try {
      // Canonical v1 endpoint: PUT /auth/me (not /auth/profile)
      const response = await api.put(ENDPOINTS.ME, data);
      const user = response.data.user || response.data;
      
      // Update cached user data
      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
        // Notify other components of auth change
        globalThis.dispatchEvent(new Event('authChange'));
      }
      
      return user;
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
    } catch {
      return false;
    }
  },

  /**

  /**
   * Sync guest favorites after login/register
   */
  async syncGuestFavorites(_token: string): Promise<void> {
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
    } catch (error: unknown) {
      logAuthError(asError(error), 'SYNC_GUEST_FAVORITES');
      
      // Show detailed error message
      const responseData = getResponseData(error);
      const details = responseData?.error;
      if (typeof details === 'string' && details.length > 0) {
        console.error('Error details:', details);
      }
      
      // Keep guest favorites in localStorage for retry - don't clear on error
    }
  },

  /**
   * Check if user is authenticated (synchronous)
   */
  isAuthenticated,
};

/**
 * Internal function to fetch current user
 */
async function fetchCurrentUserInternal(): Promise<User> {
  try {
    const response = await api.get(ENDPOINTS.ME);
    return response.data;
  } catch (error) {
    const status = getErrorStatus(error);
    if (ENABLE_LEGACY_FALLBACK && status === 404) {
      try {
        const legacyResponse = await apiLegacy.get(ENDPOINTS.ME);
        return legacyResponse.data;
      } catch (legacyError) {
        const legacyApiError = handleApiError(legacyError);
        throw new Error(legacyApiError.message);
      }
    }

    const apiError = handleApiError(error);
    throw new Error(apiError.message);
  }
}
