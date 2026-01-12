/**
 * SEO Data Hooks with React Query caching
 * Replaces direct API calls with cached queries
 * 
 * Benefits:
 * - Automatic caching and deduplication
 * - Prevents duplicate requests when multiple components need SEO
 * - Automatic invalidation and refetching
 * - Built-in error handling and retry logic
 */

import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { api } from '@/services/api';
import i18n from '@/i18n';

export interface SEOData {
  meta_title: string;
  meta_description: string;
  canonical_url?: string;
  h1_title?: string;
  content_text?: string;
  keywords?: string;
}

export interface SEOResponse {
  success: boolean;
  item: SEOData;
}

type QueryOptions = Omit<UseQueryOptions<unknown, Error, unknown, readonly unknown[]>, 'queryKey' | 'queryFn'>;

const getCurrentLanguage = (): string => {
  return i18n.language || 'en';
};

const defaultSEO: SEOData = {
  meta_title: 'Wearsearch - Discover Exceptional Fashion',
  meta_description: 'Discover and shop the latest fashion trends. Find clothing, footwear, and accessories from top stores with worldwide shipping.',
  h1_title: 'Discover Exceptional Fashion',
};

/**
 * Hook for fetching homepage SEO data with caching
 */
export const useSEOHome = (options?: QueryOptions) => {
  return useQuery({
    queryKey: ['seo', 'home', getCurrentLanguage()],
    queryFn: async () => {
      try {
        const lang = getCurrentLanguage();
        const response = await api.get<SEOResponse>('/seo/home/home', {
          params: { lang }
        });
        return response.data.item || defaultSEO;
      } catch (error) {
        console.error('[SEO] Failed to fetch home SEO:', error);
        return defaultSEO;
      }
    },
    staleTime: 60 * 60 * 1000, // 1 hour - SEO data doesn't change often
    gcTime: 24 * 60 * 60 * 1000, // 24 hours
    retry: 1,
    ...options,
  });
};

/**
 * Hook for fetching category SEO data with caching
 */
export const useSEOCategory = (categorySlug: string, options?: QueryOptions) => {
  return useQuery({
    queryKey: ['seo', 'category', categorySlug, getCurrentLanguage()],
    queryFn: async () => {
      try {
        const lang = getCurrentLanguage();
        const response = await api.get<SEOResponse>(`/seo/category/${categorySlug}`, {
          params: { lang }
        });
        return response.data.item || {
          meta_title: `${categorySlug} - Wearsearch`,
          meta_description: `Browse our collection of ${categorySlug}. Find the perfect items for your style.`,
        };
      } catch (error) {
        console.error(`[SEO] Failed to fetch category SEO for ${categorySlug}:`, error);
        return {
          meta_title: `${categorySlug} - Wearsearch`,
          meta_description: `Browse our collection of ${categorySlug}. Find the perfect items for your style.`,
        };
      }
    },
    staleTime: 60 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
    retry: 1,
    enabled: !!categorySlug,
    ...options,
  });
};

/**
 * Hook for fetching color SEO data with caching
 */
export const useSEOColor = (colorSlug: string, options?: QueryOptions) => {
  return useQuery({
    queryKey: ['seo', 'color', colorSlug, getCurrentLanguage()],
    queryFn: async () => {
      try {
        const lang = getCurrentLanguage();
        const response = await api.get<SEOResponse>(`/seo/color/${colorSlug}`, {
          params: { lang }
        });
        return response.data.item || {
          meta_title: `${colorSlug} Products - Wearsearch`,
          meta_description: `Shop ${colorSlug} fashion items. Browse our curated collection of ${colorSlug} clothing and accessories.`,
        };
      } catch (error) {
        console.error(`[SEO] Failed to fetch color SEO for ${colorSlug}:`, error);
        return {
          meta_title: `${colorSlug} Products - Wearsearch`,
          meta_description: `Shop ${colorSlug} fashion items. Browse our curated collection of ${colorSlug} clothing and accessories.`,
        };
      }
    },
    staleTime: 60 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
    retry: 1,
    enabled: !!colorSlug,
    ...options,
  });
};

/**
 * Hook for fetching product SEO data with caching
 */
export const useSEOProduct = (productId: string, options?: QueryOptions) => {
  return useQuery({
    queryKey: ['seo', 'product', productId, getCurrentLanguage()],
    queryFn: async () => {
      try {
        const lang = getCurrentLanguage();
        const response = await api.get<SEOResponse>(`/seo/product/${productId}`, {
          params: { lang }
        });
        return response.data.item || {
          meta_title: 'Product - Wearsearch',
          meta_description: 'View this product on Wearsearch',
        };
      } catch (error) {
        console.error(`[SEO] Failed to fetch product SEO for ${productId}:`, error);
        return {
          meta_title: 'Product - Wearsearch',
          meta_description: 'View this product on Wearsearch',
        };
      }
    },
    staleTime: 60 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
    retry: 1,
    enabled: !!productId,
    ...options,
  });
};

/**
 * Hook for fetching brand SEO data with caching
 */
export const useSEOBrand = (brandSlug: string, options?: QueryOptions) => {
  return useQuery({
    queryKey: ['seo', 'brand', brandSlug, getCurrentLanguage()],
    queryFn: async () => {
      try {
        const lang = getCurrentLanguage();
        const response = await api.get<SEOResponse>(`/seo/brand/${brandSlug}`, {
          params: { lang }
        });
        return response.data.item || {
          meta_title: `${brandSlug} - Wearsearch`,
          meta_description: `Shop products from ${brandSlug} on Wearsearch`,
        };
      } catch (error) {
        console.error(`[SEO] Failed to fetch brand SEO for ${brandSlug}:`, error);
        return {
          meta_title: `${brandSlug} - Wearsearch`,
          meta_description: `Shop products from ${brandSlug} on Wearsearch`,
        };
      }
    },
    staleTime: 60 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
    retry: 1,
    enabled: !!brandSlug,
    ...options,
  });
};

/**
 * Hook for fetching store SEO data with caching
 */
export const useSEOStore = (storeSlug: string, options?: QueryOptions) => {
  return useQuery({
    queryKey: ['seo', 'store', storeSlug, getCurrentLanguage()],
    queryFn: async () => {
      try {
        const lang = getCurrentLanguage();
        const response = await api.get<SEOResponse>(`/seo/store/${storeSlug}`, {
          params: { lang }
        });
        return response.data.item || {
          meta_title: `${storeSlug} - Wearsearch`,
          meta_description: `Shop at ${storeSlug} on Wearsearch`,
        };
      } catch (error) {
        console.error(`[SEO] Failed to fetch store SEO for ${storeSlug}:`, error);
        return {
          meta_title: `${storeSlug} - Wearsearch`,
          meta_description: `Shop at ${storeSlug} on Wearsearch`,
        };
      }
    },
    staleTime: 60 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
    retry: 1,
    enabled: !!storeSlug,
    ...options,
  });
};
