/**
 * Safe LocalStorage Utilities
 * Provides SSR-safe localStorage operations with error handling
 */

import { logError, logWarn } from '@/services/logger';

/**
 * Check if code is running in browser environment
 */
export const isBrowser = (): boolean =>
  typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

/**
 * Safe localStorage getItem with SSR check and error handling
 */
export const safeGetItem = <T = string>(key: string, defaultValue: T | null = null): T | null => {
  if (!isBrowser()) return defaultValue;

  try {
    const item = localStorage.getItem(key);
    if (item === null) return defaultValue;

    // Try to parse as JSON
    try {
      return JSON.parse(item) as T;
    } catch {
      // Return as string if not valid JSON
      return item as unknown as T;
    }
  } catch (error) {
    logError(`Error reading localStorage key "${key}"`, {
      component: 'safeStorage',
      action: 'GET_ITEM',
      metadata: { error },
    });
    return defaultValue;
  }
};

/**
 * Safe localStorage setItem with SSR check and error handling
 */
export const safeSetItem = (key: string, value: unknown): boolean => {
  if (!isBrowser()) return false;

  try {
    const valueToStore = typeof value === 'string' ? value : JSON.stringify(value);
    localStorage.setItem(key, valueToStore);
    return true;
  } catch (error) {
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      logWarn(`localStorage quota exceeded for key "${key}"`, {
        component: 'safeStorage',
        action: 'SET_ITEM',
      });
    } else {
      logError(`Error writing localStorage key "${key}"`, {
        component: 'safeStorage',
        action: 'SET_ITEM',
        metadata: { error },
      });
    }
    return false;
  }
};

/**
 * Safe localStorage removeItem with SSR check
 */
export const safeRemoveItem = (key: string): boolean => {
  if (!isBrowser()) return false;

  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    logError(`Error removing localStorage key "${key}"`, {
      component: 'safeStorage',
      action: 'REMOVE_ITEM',
      metadata: { error },
    });
    return false;
  }
};

/**
 * Safe localStorage clear with SSR check
 */
export const safeClear = (): boolean => {
  if (!isBrowser()) return false;

  try {
    localStorage.clear();
    return true;
  } catch (error) {
    logError('Error clearing localStorage', {
      component: 'safeStorage',
      action: 'CLEAR',
      metadata: { error },
    });
    return false;
  }
};

/**
 * Get all keys matching a pattern
 */
export const getMatchingKeys = (pattern: string | RegExp): string[] => {
  if (!isBrowser()) return [];

  try {
    const keys = Object.keys(localStorage);
    if (typeof pattern === 'string') {
      return keys.filter(key => key.includes(pattern));
    }
    return keys.filter(key => pattern.test(key));
  } catch (error) {
    logError('Error getting localStorage keys', {
      component: 'safeStorage',
      action: 'GET_KEYS',
      metadata: { error },
    });
    return [];
  }
};
