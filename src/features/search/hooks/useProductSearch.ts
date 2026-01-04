/**
 * Product Search Hook
 * Encapsulates search logic and debouncing
 * Supports searching both products and stores
 */

import { useState, useEffect, useMemo } from 'react';
import { useProductsPageData } from '@/hooks/useAggregatedData';
import { useQuery } from '@tanstack/react-query';
import { storeService, type Store } from '@/services/storeService';

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null;

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
  const num = typeof value === 'string' ? Number(value) : NaN;
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
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  // Search stores in parallel
  const { data: storesData, isLoading: isLoadingStores, error: storesError } = useQuery<Store[]>({
    queryKey: ['stores-search', debouncedQuery],
    queryFn: async () => {
      console.log('[Search] Starting stores fetch...');
      
      try {
        const allStores = await storeService.getAllStores();
        console.log('[Search] Stores fetched successfully:', allStores.length);
        
        const normalizedQuery = debouncedQuery.toLowerCase().trim();
        
        // Debug logging
        console.log('[Search] All stores:', allStores.length, allStores.map(s => s.name));
        console.log('[Search] Query:', normalizedQuery);
        
        // Filter stores by name (more flexible matching)
        const filtered = allStores.filter(store => {
          const storeName = store.name.toLowerCase().trim();
          // Remove spaces and special characters for better matching
          const normalizedStoreName = storeName.replace(/[^a-z0-9]/g, '');
          const normalizedQueryComparable = normalizedQuery.replace(/[^a-z0-9]/g, '');
          
          const match = storeName.includes(normalizedQuery) || normalizedStoreName.includes(normalizedQueryComparable);
          
          if (match) {
            console.log('[Search] ✓ Match found:', store.name, '| normalized:', normalizedStoreName);
          }
          
          return match;
        }).slice(0, 3); // Limit to 3 stores
        
        console.log('[Search] Filtered stores:', filtered.length, filtered.map(s => s.name));
        
        return filtered;
      } catch (error) {
        console.error('[Search] Error fetching stores:', error);
        throw error;
      }
    },
    enabled: hasQuery,
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
  
  // Log query errors
  if (storesError) {
    console.error('[Search] Stores query error:', storesError);
  }

  const serverResults = useMemo(() => {
    const items: unknown[] = Array.isArray(pageData?.products) ? pageData.products : [];

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
    if (!storesData) return [];
    
    return storesData
      .map((store): SearchResult | null => {
        const id = String(store.id);
        const name = store.name;
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
  }, [storesData]);

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
