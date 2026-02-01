/**
 * Guest Favorites Service
 * Manages favorites in localStorage before user login
 */

import { logWarn } from './logger';
import { safeGetItem, safeSetItem, safeRemoveItem } from '@/utils/safeStorage';

const GUEST_FAVORITES_KEY = 'guestFavorites';

// UUID validation regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export interface GuestFavoritesService {
  add(productId: string): void;
  remove(productId: string): void;
  getAll(): string[];
  getValid(): string[];
  has(productId: string): boolean;
  clear(): void;
  count(): number;
}

/**
 * Validate if string is a valid UUID
 */
function isValidUUID(id: string): boolean {
  return UUID_REGEX.test(id);
}

/**
 * Add a product to guest favorites
 */
export function addGuestFavorite(productId: string): void {
  // Only add valid UUIDs
  if (!isValidUUID(productId)) {
    logWarn('Invalid product ID format', {
      component: 'guestFavorites',
      action: 'ADD_FAVORITE',
      metadata: { productId },
    });
    return;
  }

  const favorites = getGuestFavorites();
  if (!favorites.includes(productId)) {
    favorites.push(productId);
    saveGuestFavorites(favorites);
  }
}

/**
 * Remove a product from guest favorites
 */
export function removeGuestFavorite(productId: string): void {
  const favorites = getGuestFavorites();
  const filtered = favorites.filter(id => id !== productId);
  saveGuestFavorites(filtered);
}

/**
 * Check if a product is in guest favorites
 */
export function isGuestFavorite(productId: string): boolean {
  const favorites = getGuestFavorites();
  return favorites.includes(productId);
}

/**
 * Get all guest favorites
 */
export function getGuestFavorites(): string[] {
  const stored = safeGetItem<string[]>(GUEST_FAVORITES_KEY, []);
  return Array.isArray(stored) ? stored : [];
}

/**
 * Get only valid UUID guest favorites (for sync)
 */
export function getValidGuestFavorites(): string[] {
  const allFavorites = getGuestFavorites();
  const validFavorites = allFavorites.filter(isValidUUID);

  // Clean up invalid favorites from localStorage
  if (validFavorites.length !== allFavorites.length) {
    logWarn(`Removed ${allFavorites.length - validFavorites.length} invalid favorite IDs`, {
      component: 'guestFavorites',
      action: 'CLEAN_INVALID',
    });
    saveGuestFavorites(validFavorites);
  }

  return validFavorites;
}

/**
 * Clear all guest favorites (after sync)
 */
export function clearGuestFavorites(): void {
  safeRemoveItem(GUEST_FAVORITES_KEY);
}

/**
 * Get count of guest favorites
 */
export function getGuestFavoritesCount(): number {
  return getGuestFavorites().length;
}

/**
 * Save guest favorites to localStorage
 */
function saveGuestFavorites(favorites: string[]): void {
  safeSetItem(GUEST_FAVORITES_KEY, favorites);
}

/**
 * Export as a single service object
 */
export const guestFavoritesService: GuestFavoritesService = {
  add: addGuestFavorite,
  remove: removeGuestFavorite,
  getAll: getGuestFavorites,
  getValid: getValidGuestFavorites,
  has: isGuestFavorite,
  clear: clearGuestFavorites,
  count: getGuestFavoritesCount,
};
