/**
 * Product Search Hook
 * Encapsulates search logic and debouncing
 */

import { useState, useEffect, useMemo } from 'react';
import { useProducts } from '@/hooks/useApi';

export interface SearchResult {
  id: string;
  name: string;
  category?: string;
  brand?: string;
  image?: string;
  price?: string;
}

export const useProductSearch = () => {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Fetch products once - React Query caches it
  const { data: productsData, isLoading } = useProducts();

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Filter and limit results
  const results = useMemo((): SearchResult[] => {
    if (debouncedQuery.trim().length < 2 || !productsData) {
      return [];
    }

    const products = Array.isArray(productsData) ? productsData : productsData.products || [];
    const searchTerm = debouncedQuery.toLowerCase();

    return products
      .filter((product: any) => {
        const name = product.name?.toLowerCase() || '';
        const category = product.type?.toLowerCase() || product.category?.toLowerCase() || '';
        const brand = product.brand?.toLowerCase() || '';

        return name.includes(searchTerm) || category.includes(searchTerm) || brand.includes(searchTerm);
      })
      .slice(0, 5) // Limit to 5 results
      .map((product: any) => ({
        id: product.id,
        name: product.name,
        category: product.type || product.category,
        brand: product.brand,
        image: product.image_url || product.image,
        price: product.price ? String(product.price) : undefined,
      }));
  }, [debouncedQuery, productsData]);

  const hasQuery = debouncedQuery.trim().length >= 2;
  const hasResults = results.length > 0;
  const showNoResults = hasQuery && !isLoading && !hasResults;

  return {
    query,
    setQuery,
    results,
    isLoading,
    hasQuery,
    hasResults,
    showNoResults,
  };
};
