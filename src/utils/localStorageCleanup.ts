/**
 * LocalStorage cleanup utility
 * Removes invalid or corrupted data from localStorage
 */

import { getValidGuestFavorites, clearGuestFavorites } from '@/services/guestFavorites';

/**
 * Clean up localStorage from invalid data
 */
export function cleanupLocalStorage(): void {
  try {
    // Clean guest favorites with force cleanup
    clearGuestFavorites();
    const validFavorites = getValidGuestFavorites();
    
    // Only log if there are favorites or if in development
    if (validFavorites.length > 0 || process.env.NODE_ENV === 'development') {
      console.log(`✅ Cleaned guest favorites. Valid: ${validFavorites.length}`);
    }

    // Clean up other potentially corrupted data
    const keysToCheck = [
      'user',
      'wearsearch.auth',
      'access_token',
      'preferredCurrency'
    ];

    keysToCheck.forEach(key => {
      try {
        const value = localStorage.getItem(key);
        if (value && key === 'user') {
          // Validate user data
          const parsed = JSON.parse(value);
          if (!parsed || typeof parsed !== 'object') {
            localStorage.removeItem(key);
            console.warn(`Removed invalid ${key} data`);
          }
        }
      } catch (error) {
        localStorage.removeItem(key);
        console.warn(`Removed corrupted ${key} data`);
      }
    });

  } catch (error) {
    console.error('Error during localStorage cleanup:', error);
  }
}

/**
 * Reset all localStorage data (for debugging)
 */
export function resetLocalStorage(): void {
  const keys = Object.keys(localStorage);
  const wearsearchKeys = keys.filter(key => 
    key.includes('wearsearch') || 
    key.includes('guest') || 
    key === 'user' || 
    key === 'access_token' ||
    key === 'preferredCurrency'
  );
  
  wearsearchKeys.forEach(key => {
    localStorage.removeItem(key);
  });
  
  console.log(`🧹 Reset ${wearsearchKeys.length} localStorage keys`);
}