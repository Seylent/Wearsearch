/**
 * Product Search Hook
 * Encapsulates search logic and debouncing
 * Supports searching both products and stores
 */

import { useState, useEffect, useMemo } from 'react';
import { useProductsPageData, useStoresPageData } from '@/hooks/useAggregatedData';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const toOptionalString = (value: unknown): string | undefined => {
  if (typeof value === 'string') return value;
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  return undefined;
};

const toStringOrEmpty = (value: unknown): string => {
  if (typeof value === 'string') return value;
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  return '';
};

const toOptionalNumber = (value: unknown): number | undefined => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  const num = typeof value === 'string' ? Number(value) : Number.NaN;
  return Number.isFinite(num) ? num : undefined;
};

export interface SearchResult {
  id: string;
  name: string;
  type: 'product' | 'store'; // Added type discriminator
  category?: string;
  brand?: string;
  image?: string;
  price?: string;
  // Store-specific fields
  logo_url?: string;
  product_count?: number;
}

export const useProductSearch = () => {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const hasQuery = debouncedQuery.trim().length >= 2;
  const apiFilters = useMemo(
    () => ({
      page: 1,
      limit: 5,
      search: debouncedQuery,
    }),
    [debouncedQuery]
  );

  // Reuse the canonical /pages/products hook (single source of truth)
  const { data: pageData, isLoading: isLoadingProducts } = useProductsPageData(apiFilters, {
    enabled: hasQuery,
    staleTime: 2 * 60 * 1000, // Increased for search results
    gcTime: 10 * 60 * 1000, // Longer cache
    refetchOnWindowFocus: false,
    refetchOnMount: false, // Don't refetch on mount
  });

  const storeSearchParams = useMemo(
    () => ({ page: 1, limit: 3, search: debouncedQuery }),
    [debouncedQuery]
  );

  // Search stores via server-side filtering to avoid fetching full catalog
  const { data: storesPageData, isLoading: isLoadingStores } = useStoresPageData(
    storeSearchParams,
    {
      enabled: hasQuery,
      staleTime: 5 * 60 * 1000, // 5 minutes for stores
      gcTime: 15 * 60 * 1000, // 15 minutes cache
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    }
  );

  const serverResults = useMemo(() => {
    const productsData = isRecord(pageData) ? pageData.products : undefined;
    const items: unknown[] = Array.isArray(productsData) ? productsData : [];

    return items
      .map((product): SearchResult | null => {
        if (!isRecord(product)) return null;

        const id = toStringOrEmpty(product.id);
        const name = toStringOrEmpty(product.name);
        if (!id || !name) return null;

        const category = toOptionalString(product.type) ?? toOptionalString(product.category);
        const brand = toOptionalString(product.brand);
        const image = toOptionalString(product.image_url) ?? toOptionalString(product.image);
        const price = toOptionalString(product.price);

        return {
          id,
          name,
          type: 'product',
          category,
          brand,
          image,
          price,
        };
      })
      .filter((item): item is SearchResult => item !== null);
  }, [pageData]);

  const storeResults = useMemo(() => {
    const storesData = isRecord(storesPageData) ? storesPageData.stores : undefined;
    if (!Array.isArray(storesData)) return [];

    return storesData
      .map((store): SearchResult | null => {
        if (!isRecord(store)) return null;

        const id = toStringOrEmpty(store.id);
        const name = toStringOrEmpty(store.name);
        if (!id || !name) return null;

        const logoUrl = toOptionalString(store.logo_url);
        const productCount = toOptionalNumber(store.product_count);

        return {
          id,
          name,
          type: 'store',
          logo_url: logoUrl,
          product_count: productCount,
          image: logoUrl, // For compatibility with UI
        };
      })
      .filter((item): item is SearchResult => item !== null);
  }, [storesPageData]);

  // Combine results: stores first, then products
  const finalResults = useMemo(() => {
    return [...storeResults, ...serverResults];
  }, [storeResults, serverResults]);

  const isLoading = isLoadingProducts || isLoadingStores;
  const hasResults = finalResults.length > 0;
  const showNoResults = hasQuery && !isLoading && !hasResults;

  return {
    query,
    setQuery,
    results: finalResults,
    isLoading,
    hasQuery,
    hasResults,
    showNoResults,
  };
};
