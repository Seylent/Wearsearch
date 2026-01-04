/**
 * Product Sort Hook
 * Manages sorting logic for products
 */

import { useState, useMemo } from 'react';
import type { Product } from '@/types';

export type SortOption = 'default' | 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc';

export const useProductSort = (products: Product[]) => {
  const [sortBy, setSortBy] = useState<SortOption>('default');

  const sortedProducts = useMemo(() => {
    if (sortBy === 'default') {
      return products;
    }

    const sorted = [...products];
    const [field, order] = sortBy.split('-') as [string, 'asc' | 'desc'];

    sorted.sort((a, b) => {
      const aVal = (a as Record<string, string | number | undefined>)[field] || '';
      const bVal = (b as Record<string, string | number | undefined>)[field] || '';

      if (order === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    return sorted;
  }, [products, sortBy]);

  return {
    sortBy,
    setSortBy,
    sortedProducts,
  };
};
