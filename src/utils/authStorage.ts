/**
 * Unified Authentication Storage Module
 * Centralized token management for the entire application
 *
 * 🔥 CLIENT-ONLY MODULE - DO NOT IMPORT ON SERVER
 * This module accesses localStorage and should only run in browser
 */

import { logError } from '@/services/logger';

const AUTH_TOKEN_KEY = 'wearsearch.auth';
const COOKIE_AUTH_MODE = process.env.NEXT_PUBLIC_AUTH_COOKIE_MODE === 'true';
let cookieSessionActive = false;

export const isCookieAuthMode = (): boolean => COOKIE_AUTH_MODE;
export const setCookieSessionActive = (active: boolean): void => {
  cookieSessionActive = active;
};

export interface AuthData {
  token: string;
  userId?: string;
  expiresAt?: number;
}

/**
 * Store authentication data
 */
export const setAuth = (token: string, userId?: string, expiresAt?: number): void => {
  if (COOKIE_AUTH_MODE) return;
  const authData: AuthData = {
    token,
    userId,
    expiresAt,
  };

  localStorage.setItem(AUTH_TOKEN_KEY, JSON.stringify(authData));

  // Also set the legacy key for backward compatibility during transition
  localStorage.setItem('access_token', token);
};

/**
 * Get authentication token
 */
export const getAuth = (): string | null => {
  if (COOKIE_AUTH_MODE) return null;
  if (globalThis.window === undefined) return null;
  try {
    const authDataStr = localStorage.getItem(AUTH_TOKEN_KEY);
    if (authDataStr) {
      const authData: AuthData = JSON.parse(authDataStr);

      // Check if token is expired
      if (authData.expiresAt) {
        const now = Date.now();
        const isExpired = now > authData.expiresAt;

        if (isExpired) {
          console.warn('⏰ Token expired:', {
            expiresAt: new Date(authData.expiresAt).toISOString(),
            now: new Date(now).toISOString(),
            expiredAgo: `${Math.round((now - authData.expiresAt) / 1000)}s ago`,
          });
          clearAuth();
          return null;
        }

        const timeLeft = authData.expiresAt - now;
        if (timeLeft < 5 * 60 * 1000) {
          // Less than 5 minutes
          console.log('⚠️ Token expires soon:', {
            expiresIn: `${Math.round(timeLeft / 1000)}s`,
          });
        }
      }

      return authData.token;
    }

    // Fallback to legacy token (silent - don't spam console)
    const legacyToken = localStorage.getItem('access_token');
    return legacyToken;
  } catch (error) {
    console.error('❌ Error getting auth token:', error);
    logError(error as Error, { component: 'authStorage', action: 'GET_AUTH' });
    return null;
  }
};

/**
 * Get full authentication data
 */
export const getAuthData = (): AuthData | null => {
  if (COOKIE_AUTH_MODE) return null;
  try {
    const authDataStr = localStorage.getItem(AUTH_TOKEN_KEY);
    if (authDataStr) {
      const authData: AuthData = JSON.parse(authDataStr);

      // Check if token is expired
      if (authData.expiresAt && Date.now() > authData.expiresAt) {
        clearAuth();
        return null;
      }

      return authData;
    }

    // Fallback: create from legacy token
    const legacyToken = localStorage.getItem('access_token');
    if (legacyToken) {
      return { token: legacyToken };
    }

    return null;
  } catch (error) {
    logError(error as Error, { component: 'authStorage', action: 'GET_AUTH_DATA' });
    return null;
  }
};

/**
 * Clear authentication data
 */
export const clearAuth = (): void => {
  cookieSessionActive = false;
  if (process.env.NODE_ENV === 'development') {
    console.log('🧹 Clearing authentication data');
  }

  // Log what's being cleared for debugging
  const hadAuth = !!localStorage.getItem(AUTH_TOKEN_KEY);
  const hadLegacy = !!localStorage.getItem('access_token');

  if (hadAuth || hadLegacy) {
    console.log('Clearing auth tokens:', { hadAuth, hadLegacy });
  }

  if (globalThis.window === undefined) return;

  localStorage.removeItem(AUTH_TOKEN_KEY);

  // Also clear legacy keys and user data
  localStorage.removeItem('access_token');
  localStorage.removeItem('authToken');
  localStorage.removeItem('user_id');
  localStorage.removeItem('user');
  localStorage.removeItem('refresh_token');

  // Dispatch event to notify components about logout
  globalThis.window.dispatchEvent(new Event('authChange'));
  globalThis.window.dispatchEvent(new Event('auth:logout'));
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  if (COOKIE_AUTH_MODE) return cookieSessionActive;
  return getAuth() !== null;
};
