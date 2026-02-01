/**
 * Server-side data fetching utilities
 * Uses Next.js native caching and revalidation
 */

import { API_CONFIG, getApiUrl } from '@/config/api.config';

const API_URL = getApiUrl();

export interface FetchOptions {
  revalidate?: number | false; // seconds or false for no caching
  tags?: string[]; // for revalidateTag
}

/**
 * Fetch with Next.js caching
 */
async function fetchWithCache<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { revalidate = 60, tags = [] } = options;

  const url = `${API_URL}${endpoint}`;
  const response = await fetch(url, {
    next: {
      revalidate,
      tags,
    },
  });

  // If v1 is not available in this environment, fall back to /api.
  if (!response.ok && endpoint.startsWith('/api/v1/')) {
    const legacyEndpoint = endpoint.replace('/api/v1/', '/api/');
    const legacyResponse = await fetch(`${API_URL}${legacyEndpoint}`, {
      next: {
        revalidate,
        tags,
      },
    });

    if (!legacyResponse.ok) {
      throw new Error(`API Error: ${legacyResponse.status} ${legacyResponse.statusText}`);
    }

    return legacyResponse.json();
  }

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

/**
 * Product API calls
 */
export const productApi = {
  // Get single product - cache for 1 hour
  async getProduct(id: string) {
    // Prefer v1, but keep /api as fallback in other modules.
    return fetchWithCache(`/api/v1/products/${id}`, {
      revalidate: API_CONFIG.CACHE.PRODUCT,
      tags: [`product-${id}`],
    });
  },

  // Get products list - cache for 5 minutes
  async getProducts(params?: Record<string, string>) {
    const queryString = params ? '?' + new URLSearchParams(params).toString() : '';

    return fetchWithCache(`/api/v1/products${queryString}`, {
      revalidate: API_CONFIG.CACHE.PRODUCTS,
      tags: ['products'],
    });
  },

  // Get featured products - cache for 30 minutes
  async getFeaturedProducts() {
    return fetchWithCache('/api/v1/products/featured', {
      revalidate: API_CONFIG.CACHE.FEATURED,
      tags: ['featured-products'],
    });
  },
};

/**
 * Store API calls
 */
export const storeApi = {
  // Get single store - cache for 1 hour
  async getStore(id: string) {
    return fetchWithCache(`/api/stores/${id}`, {
      revalidate: API_CONFIG.CACHE.STORE,
      tags: [`store-${id}`],
    });
  },

  // Get stores list - cache for 10 minutes
  async getStores() {
    return fetchWithCache('/api/stores', {
      revalidate: API_CONFIG.CACHE.STORES,
      tags: ['stores'],
    });
  },
};

/**
 * Category API calls
 */
export const categoryApi = {
  // Get categories - cache for 1 hour
  async getCategories() {
    return fetchWithCache('/api/categories', {
      revalidate: API_CONFIG.CACHE.CATEGORY,
      tags: ['categories'],
    });
  },
};

/**
 * Brand API calls
 */
export const brandApi = {
  // Get brands - cache for 1 hour
  async getBrands() {
    return fetchWithCache('/api/brands', {
      revalidate: API_CONFIG.CACHE.BRAND,
      tags: ['brands'],
    });
  },
};

/**
 * Homepage data - cache for 15 minutes
 */
export async function getHomepageData() {
  return fetchWithCache('/api/homepage', {
    revalidate: API_CONFIG.CACHE.HOMEPAGE,
    tags: ['homepage'],
  });
}

/**
 * SEO data - cache for 30 minutes
 */
export async function getSEOData(page: string) {
  return fetchWithCache(`/api/seo/${page}`, {
    revalidate: API_CONFIG.CACHE.SEO,
    tags: [`seo-${page}`],
  });
}
