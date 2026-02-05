/**
 * Authentication Service
 * Refactored to use unified API and auth storage
 */

import { api, apiLegacy, handleApiError } from './api';
import {
  setAuth,
  clearAuth,
  isAuthenticated,
  getAuth,
  isCookieAuthMode,
  setCookieSessionActive,
} from '@/utils/authStorage';
import { getValidGuestFavorites, clearGuestFavorites } from './guestFavorites';
import { logAuthError, logError, logInfo, logWarn } from './logger';
import type { User, LoginCredentials, RegisterData, AuthResponse } from '@/types';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function asError(value: unknown): Error {
  if (value instanceof Error) return value;
  if (typeof value === 'string') return new Error(value);
  if (value && typeof value === 'object') {
    // Try to extract message from error-like objects
    const errorObj = value as Record<string, unknown>;
    const message =
      typeof errorObj.message === 'string'
        ? errorObj.message
        : typeof errorObj.error === 'string'
          ? errorObj.error
          : 'Unknown error';
    return new Error(message);
  }
  return new Error('Unknown error');
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
  LOGIN: '/api/v1/auth/login',
  REGISTER: '/api/v1/auth/register',
  LOGOUT: '/api/v1/auth/logout',
  ME: '/api/v1/auth/me', // GET for current user
  FORGOT_PASSWORD: '/api/v1/auth/forgot-password',
  RESET_PASSWORD: '/api/v1/auth/reset-password',
  CHANGE_PASSWORD: '/api/v1/auth/password',
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
      logInfo('Attempting login', { component: 'authService', action: 'LOGIN' });
      const response = await api.post(ENDPOINTS.LOGIN, credentials);
      const data = response.data;
      logInfo('Login response received', {
        component: 'authService',
        action: 'LOGIN_RESPONSE',
        metadata: {
          hasToken: !!(data.access_token || data.token),
          hasUser: !!data.user,
          userId: data.user?.id,
        },
      });

      // Store auth token
      if (data.access_token || data.token) {
        const token = data.access_token || data.token;
        const userId = data.user?.id;
        const expiresIn = data.expires_in;
        const expiresAt = expiresIn ? Date.now() + expiresIn * 1000 : undefined;

        logInfo('Storing auth data', {
          component: 'authService',
          action: 'STORE_AUTH',
          metadata: {
            tokenLength: token.length,
            tokenPreview: token.substring(0, 30) + '...',
            userId,
            expiresIn,
            expiresAt: expiresAt ? new Date(expiresAt).toISOString() : 'no expiration',
          },
        });

        setAuth(token, userId, expiresAt);

        // Verify token was stored
        const storedToken = getAuth();
        logInfo('Token verification', {
          component: 'authService',
          action: 'VERIFY_TOKEN',
          metadata: {
            stored: !!storedToken,
            matches: storedToken === token,
            storedPreview: storedToken ? storedToken.substring(0, 30) + '...' : 'none',
          },
        });

        // Store user data for profile display
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
        }

        // Sync guest favorites after successful login
        await this.syncGuestFavorites();

        if (isCookieAuthMode()) {
          setCookieSessionActive();
        }
        if (globalThis.window !== undefined) {
          globalThis.window.dispatchEvent(new Event('auth:login'));
        }
        logInfo('Login completed successfully', {
          component: 'authService',
          action: 'LOGIN_SUCCESS',
        });
      } else {
        logError('No token received from login response', {
          component: 'authService',
          action: 'LOGIN_NO_TOKEN',
        });
        if (isCookieAuthMode()) {
          setCookieSessionActive();
          if (globalThis.window !== undefined) {
            globalThis.window.dispatchEvent(new Event('auth:login'));
          }
        }
      }

      return data;
    } catch (error) {
      if (ENABLE_LEGACY_FALLBACK && this.isNotFound(error)) {
        try {
          logWarn('v1 login route not found, falling back to legacy /api', {
            component: 'authService',
            action: 'LOGIN_FALLBACK',
          });
          const legacyResponse = await apiLegacy.post(ENDPOINTS.LOGIN, credentials);
          return legacyResponse.data;
        } catch (legacyError) {
          logError('Legacy login failed', {
            component: 'authService',
            action: 'LOGIN_FALLBACK_ERROR',
            metadata: { legacyError },
          });
          throw asError(legacyError);
        }
      }

      logError('Login failed', {
        component: 'authService',
        action: 'LOGIN_ERROR',
        metadata: { error },
      });
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
        await this.syncGuestFavorites();
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
        }
        if (isCookieAuthMode()) {
          setCookieSessionActive();
        }
        if (globalThis.window !== undefined) {
          globalThis.window.dispatchEvent(new Event('auth:login'));
        }
      } else if (isCookieAuthMode()) {
        setCookieSessionActive();
        if (globalThis.window !== undefined) {
          globalThis.window.dispatchEvent(new Event('auth:login'));
        }
      }

      return data;
    } catch (error) {
      if (ENABLE_LEGACY_FALLBACK && this.isNotFound(error)) {
        try {
          logWarn('v1 register route not found, falling back to legacy /api', {
            component: 'authService',
            action: 'REGISTER_FALLBACK',
          });
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
  async changePassword(data: {
    current_password: string;
    new_password: string;
  }): Promise<{ success: boolean; message: string }> {
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
  async syncGuestFavorites(): Promise<void> {
    try {
      // Get only valid UUID favorites
      const guestFavorites = getValidGuestFavorites();

      // Skip if no guest favorites
      if (guestFavorites.length === 0) {
        logInfo('No guest favorites to sync', {
          component: 'authService',
          action: 'SYNC_FAVORITES_SKIP',
        });
        return;
      }

      logInfo(`Syncing ${guestFavorites.length} valid guest favorites`, {
        component: 'authService',
        action: 'SYNC_FAVORITES_START',
      });

      const response = await api.post('/api/v1/favorites/sync', { guestFavorites });
      const result = response.data;

      if (result.success !== false) {
        logInfo(`Synced ${result.added || 0} favorites. Total: ${result.total || 0}`, {
          component: 'authService',
          action: 'SYNC_FAVORITES_SUCCESS',
        });

        // Clear guest favorites after successful sync
        clearGuestFavorites();
      }
    } catch (error: unknown) {
      logAuthError(asError(error), 'SYNC_GUEST_FAVORITES');

      // Show detailed error message
      const responseData = getResponseData(error);
      const details = responseData?.error;
      if (typeof details === 'string' && details.length > 0) {
        logError('Sync favorites error details', {
          component: 'authService',
          action: 'SYNC_FAVORITES_ERROR',
          metadata: { details },
        });
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
    // Skip retry on rate limit for auth endpoint to prevent spam
    const response = await api.get(ENDPOINTS.ME, {
      headers: { 'X-Skip-Retry': 'true' },
    });
    const body = response.data as unknown;
    if (isRecord(body)) {
      const nestedUser = isRecord(body.user) ? (body.user as unknown as User) : undefined;
      const nestedData = isRecord(body.data) ? (body.data as Record<string, unknown>) : undefined;
      const nestedDataUser =
        nestedData && isRecord(nestedData.user) ? (nestedData.user as unknown as User) : undefined;
      return nestedUser ?? nestedDataUser ?? (body as unknown as User);
    }
    return response.data;
  } catch (error) {
    const status = getErrorStatus(error);

    // Don't throw on 429, just return error to let React Query handle it
    if (status === 429) {
      logWarn('Auth check rate limited, backing off', {
        component: 'authService',
        action: 'RATE_LIMIT',
      });
      throw new Error('Unauthorized');
    }

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
