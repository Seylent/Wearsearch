/**
 * Recently Viewed Products Hook
 * Tracks and manages recently viewed products in localStorage
 */

import { useState, useEffect, useCallback } from 'react';
import type { Product } from '@/types';

const STORAGE_KEY = 'wearsearch_recently_viewed';
const MAX_ITEMS = 20;

export interface RecentlyViewedItem {
  id: string;
  name: string;
  image?: string;
  image_url?: string;
  brand?: string;
  price?: number | string;
  category?: string;
  viewedAt: number;
}

/**
 * Get recently viewed products from localStorage
 */
const getStoredItems = (): RecentlyViewedItem[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch {
    return [];
  }
};

/**
 * Save recently viewed products to localStorage
 */
const saveItems = (items: RecentlyViewedItem[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // localStorage might be full or disabled
    console.warn('Failed to save recently viewed items');
  }
};

/**
 * Hook for managing recently viewed products
 */
export const useRecentlyViewed = () => {
  const [items, setItems] = useState<RecentlyViewedItem[]>([]);

  // Load items on mount
  useEffect(() => {
    setItems(getStoredItems());
  }, []);

  /**
   * Add a product to recently viewed
   */
  const addItem = useCallback((product: Product) => {
    if (!product?.id) return;

    setItems((prevItems) => {
      // Remove if already exists
      const filtered = prevItems.filter((item) => item.id !== String(product.id));

      // Create new item
      const newItem: RecentlyViewedItem = {
        id: String(product.id),
        name: product.name,
        image: product.image,
        image_url: product.image_url,
        brand: product.brand,
        price: product.price,
        category: product.category || product.type,
        viewedAt: Date.now(),
      };

      // Add to beginning, limit to MAX_ITEMS
      const updated = [newItem, ...filtered].slice(0, MAX_ITEMS);
      saveItems(updated);
      return updated;
    });
  }, []);

  /**
   * Remove a product from recently viewed
   */
  const removeItem = useCallback((productId: string) => {
    setItems((prevItems) => {
      const updated = prevItems.filter((item) => item.id !== productId);
      saveItems(updated);
      return updated;
    });
  }, []);

  /**
   * Clear all recently viewed products
   */
  const clearAll = useCallback(() => {
    setItems([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return {
    items,
    addItem,
    removeItem,
    clearAll,
    count: items.length,
  };
};

export default useRecentlyViewed;
