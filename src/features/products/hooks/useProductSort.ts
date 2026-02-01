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

    const getSortValue = (product: Product): string | number => {
      if (field === 'price') {
        const raw =
          product.price ??
          product.price_min ??
          product.min_price ??
          product.max_price ??
          product.maxPrice;
        const numeric = typeof raw === 'number' ? raw : Number.parseFloat(String(raw));
        return Number.isFinite(numeric) ? numeric : 0;
      }
      if (field === 'name') {
        return String(product.name ?? '');
      }
      return '';
    };

    sorted.sort((a, b) => {
      const aVal = getSortValue(a);
      const bVal = getSortValue(b);

      if (order === 'asc') {
        return aVal > bVal ? 1 : -1;
      }
      return aVal < bVal ? 1 : -1;
    });

    return sorted;
  }, [products, sortBy]);

  return {
    sortBy,
    setSortBy,
    sortedProducts,
  };
};
