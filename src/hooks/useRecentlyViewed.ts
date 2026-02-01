/**
 * Recently Viewed Products Hook
 * Tracks and manages recently viewed products in localStorage
 */

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/services/api';
import { safeGetItem, safeSetItem, safeRemoveItem } from '@/utils/safeStorage';
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
  currency?: string;
  category?: string;
  viewedAt: number;
}

/**
 * Get recently viewed products from localStorage
 */
const getStoredItems = (): RecentlyViewedItem[] => {
  return safeGetItem<RecentlyViewedItem[]>(STORAGE_KEY, []);
};

/**
 * Save recently viewed products to localStorage
 */
const saveItems = (items: RecentlyViewedItem[]): void => {
  safeSetItem(STORAGE_KEY, items);
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

    const rawPrice =
      product.price ??
      product.min_price ??
      (product as unknown as { price_min?: number | string }).price_min ??
      product.max_price ??
      (product as unknown as { price_max?: number | string }).price_max;
    const normalizedPrice =
      typeof rawPrice === 'number' || typeof rawPrice === 'string' ? rawPrice : undefined;

    setItems(prevItems => {
      // Remove if already exists
      const filtered = prevItems.filter(item => item.id !== String(product.id));

      // Create new item
      const newItem: RecentlyViewedItem = {
        id: String(product.id),
        name: product.name,
        image: product.image,
        image_url: product.image_url,
        brand: product.brand,
        price: normalizedPrice,
        currency: (product as unknown as { currency?: string }).currency ?? 'UAH',
        category: product.category || product.type,
        viewedAt: Date.now(),
      };

      // Add to beginning, limit to MAX_ITEMS
      const updated = [newItem, ...filtered].slice(0, MAX_ITEMS);
      saveItems(updated);
      return updated;
    });
  }, []);

  const refreshPrices = useCallback(async (currency: 'UAH' | 'USD') => {
    if (typeof window === 'undefined') return;

    const current = getStoredItems();
    if (current.length === 0) return;

    const updatedItems = await Promise.all(
      current.map(async item => {
        try {
          const response = await api.get(
            `/products/${item.id}/detail?currency=${encodeURIComponent(currency)}`
          );
          const body = response.data;
          const payload = body?.data ?? body?.item ?? body;
          const product = payload?.product ?? payload;
          const price =
            product?.price_min ??
            product?.price ??
            product?.min_price ??
            product?.price_min ??
            item.price;

          return {
            ...item,
            price,
            currency,
          };
        } catch {
          return item;
        }
      })
    );

    setItems(updatedItems);
    saveItems(updatedItems);
  }, []);

  /**
   * Remove a product from recently viewed
   */
  const removeItem = useCallback((productId: string) => {
    setItems(prevItems => {
      const updated = prevItems.filter(item => item.id !== productId);
      saveItems(updated);
      return updated;
    });
  }, []);

  /**
   * Clear all recently viewed products
   */
  const clearAll = useCallback(() => {
    setItems([]);
    safeRemoveItem(STORAGE_KEY);
  }, []);

  return {
    items,
    addItem,
    removeItem,
    clearAll,
    refreshPrices,
    count: items.length,
  };
};

export default useRecentlyViewed;
