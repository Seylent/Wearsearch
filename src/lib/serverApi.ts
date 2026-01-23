/**
 * Server-side data fetching utilities
 * Uses Next.js native caching and revalidation
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || process.env.BACKEND_URL || 'http://localhost:3000';

export interface FetchOptions {
  revalidate?: number | false; // seconds or false for no caching
  tags?: string[]; // for revalidateTag
}

/**
 * Fetch with Next.js caching
 */
async function fetchWithCache<T>(
  endpoint: string, 
  options: FetchOptions = {}
): Promise<T> {
  const { revalidate = 60, tags = [] } = options;

  const url = `${API_URL}${endpoint}`;
  const response = await fetch(url, {
    next: { 
      revalidate,
      tags 
    }
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
      revalidate: 3600,
      tags: [`product-${id}`]
    });
  },

  // Get products list - cache for 5 minutes
  async getProducts(params?: Record<string, string>) {
    const queryString = params 
      ? '?' + new URLSearchParams(params).toString() 
      : '';
    
    return fetchWithCache(`/api/v1/products${queryString}`, {
      revalidate: 300,
      tags: ['products']
    });
  },

  // Get featured products - cache for 30 minutes
  async getFeaturedProducts() {
    return fetchWithCache('/api/v1/products/featured', {
      revalidate: 1800,
      tags: ['featured-products']
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
      revalidate: 3600,
      tags: [`store-${id}`]
    });
  },

  // Get stores list - cache for 10 minutes
  async getStores() {
    return fetchWithCache('/api/stores', {
      revalidate: 600,
      tags: ['stores']
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
      revalidate: 3600,
      tags: ['categories']
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
      revalidate: 3600,
      tags: ['brands']
    });
  },
};

/**
 * Homepage data - cache for 15 minutes
 */
export async function getHomepageData() {
  return fetchWithCache('/api/homepage', {
    revalidate: 900,
    tags: ['homepage']
  });
}

/**
 * SEO data - cache for 30 minutes
 */
export async function getSEOData(page: string) {
  return fetchWithCache(`/api/seo/${page}`, {
    revalidate: 1800,
    tags: [`seo-${page}`]
  });
}
