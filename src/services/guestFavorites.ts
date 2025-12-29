/**
 * Guest Favorites Service
 * Manages favorites in localStorage before user login
 */

import { logError } from './logger';

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
    console.warn('Invalid product ID format:', productId);
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
  try {
    const stored = localStorage.getItem(GUEST_FAVORITES_KEY);
    if (!stored) return [];
    
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    logError(error as Error, { component: 'guestFavorites', action: 'LOAD' });
    return [];
  }
}

/**
 * Get only valid UUID guest favorites (for sync)
 */
export function getValidGuestFavorites(): string[] {
  const allFavorites = getGuestFavorites();
  const validFavorites = allFavorites.filter(isValidUUID);
  
  // Clean up invalid favorites from localStorage
  if (validFavorites.length !== allFavorites.length) {
    console.warn(`Removed ${allFavorites.length - validFavorites.length} invalid favorite IDs`);
    saveGuestFavorites(validFavorites);
  }
  
  return validFavorites;
}

/**
 * Clear all guest favorites (after sync)
 */
export function clearGuestFavorites(): void {
  try {
    localStorage.removeItem(GUEST_FAVORITES_KEY);
  } catch (error) {
    logError(error as Error, { component: 'guestFavorites', action: 'CLEAR' });
  }
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
  try {
    localStorage.setItem(GUEST_FAVORITES_KEY, JSON.stringify(favorites));
  } catch (error) {
    logError(error as Error, { component: 'guestFavorites', action: 'SAVE' });
  }
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
