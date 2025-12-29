/**
 * Unified Authentication Storage Module
 * Centralized token management for the entire application
 */

import { logError } from '@/services/logger';

const AUTH_TOKEN_KEY = 'wearsearch.auth';

export interface AuthData {
  token: string;
  userId?: string;
  expiresAt?: number;
}

/**
 * Store authentication data
 */
export const setAuth = (token: string, userId?: string, expiresAt?: number): void => {
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
  try {
    const authDataStr = localStorage.getItem(AUTH_TOKEN_KEY);
    if (authDataStr) {
      const authData: AuthData = JSON.parse(authDataStr);
      
      // Check if token is expired
      if (authData.expiresAt && Date.now() > authData.expiresAt) {
        clearAuth();
        return null;
      }
      
      return authData.token;
    }
    
    // Fallback to legacy token
    return localStorage.getItem('access_token');
  } catch (error) {
    logError(error as Error, { component: 'authStorage', action: 'GET_AUTH' });
    return null;
  }
};

/**
 * Get full authentication data
 */
export const getAuthData = (): AuthData | null => {
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
  localStorage.removeItem(AUTH_TOKEN_KEY);
  
  // Also clear legacy keys and user data
  localStorage.removeItem('access_token');
  localStorage.removeItem('authToken');
  localStorage.removeItem('user_id');
  localStorage.removeItem('user');
  localStorage.removeItem('refresh_token');
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  return getAuth() !== null;
};
