/**
 * LocalStorage cleanup utility
 * Removes invalid or corrupted data from localStorage
 */

import { getValidGuestFavorites, clearGuestFavorites } from '@/services/guestFavorites';
import { logError, logInfo, logWarn } from '@/services/logger';
import { safeGetItem, safeRemoveItem, isBrowser, getMatchingKeys } from '@/utils/safeStorage';

/**
 * Clean up localStorage from invalid data
 */
export function cleanupLocalStorage(): void {
  if (!isBrowser()) return;

  try {
    // Clean guest favorites with force cleanup
    clearGuestFavorites();
    const validFavorites = getValidGuestFavorites();

    // Only log if there are favorites or if in development
    if (validFavorites.length > 0 || process.env.NODE_ENV === 'development') {
      logInfo(`Cleaned guest favorites. Valid: ${validFavorites.length}`, {
        component: 'localStorageCleanup',
        action: 'CLEAN_FAVORITES',
      });
    }

    // Clean up other potentially corrupted data
    const keysToCheck = ['user', 'wearsearch.auth', 'access_token', 'preferredCurrency'];

    keysToCheck.forEach(key => {
      try {
        const value = safeGetItem<string>(key, null);
        if (value && key === 'user') {
          // Validate user data
          const parsed = JSON.parse(value);
          if (!parsed || typeof parsed !== 'object') {
            safeRemoveItem(key);
            logWarn(`Removed invalid ${key} data`, {
              component: 'localStorageCleanup',
              action: 'REMOVE_INVALID',
              metadata: { key },
            });
          }
        }
      } catch (error) {
        safeRemoveItem(key);
        logWarn(`Removed corrupted ${key} data`, {
          component: 'localStorageCleanup',
          action: 'REMOVE_CORRUPTED',
          metadata: { key, error },
        });
      }
    });
  } catch (error) {
    logError('Error during localStorage cleanup', {
      component: 'localStorageCleanup',
      action: 'CLEANUP',
      metadata: { error },
    });
  }
}

/**
 * Reset all localStorage data (for debugging)
 */
export function resetLocalStorage(): void {
  if (!isBrowser()) return;

  const wearsearchKeys = getMatchingKeys(/wearsearch|guest/);
  const additionalKeys = ['user', 'access_token', 'preferredCurrency'];
  const allKeys = [...new Set([...wearsearchKeys, ...additionalKeys])];

  allKeys.forEach(key => {
    safeRemoveItem(key);
  });

  logInfo(`Reset ${allKeys.length} localStorage keys`, {
    component: 'localStorageCleanup',
    action: 'RESET',
  });
}
