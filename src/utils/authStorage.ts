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
      if (authData.expiresAt) {
        const now = Date.now();
        const isExpired = now > authData.expiresAt;
        
        if (isExpired) {
          console.warn('⏰ Token expired:', {
            expiresAt: new Date(authData.expiresAt).toISOString(),
            now: new Date(now).toISOString(),
            expiredAgo: `${Math.round((now - authData.expiresAt) / 1000)}s ago`
          });
          clearAuth();
          return null;
        }
        
        const timeLeft = authData.expiresAt - now;
        if (timeLeft < 5 * 60 * 1000) { // Less than 5 minutes
          console.log('⚠️ Token expires soon:', {
            expiresIn: `${Math.round(timeLeft / 1000)}s`
          });
        }
      }
      
      return authData.token;
    }
    
    // Fallback to legacy token
    const legacyToken = localStorage.getItem('access_token');
    if (legacyToken) {
      console.log('ℹ️ Using legacy token from access_token');
    }
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
  console.log('🧹 Clearing authentication data');
  
  // Log what's being cleared for debugging
  const hadAuth = !!localStorage.getItem(AUTH_TOKEN_KEY);
  const hadLegacy = !!localStorage.getItem('access_token');
  
  if (hadAuth || hadLegacy) {
    console.log('Clearing auth tokens:', { hadAuth, hadLegacy });
  }
  
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
