/**
 * Server-side data fetching utilities
 * Uses Next.js native caching and revalidation
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

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
  
  const response = await fetch(`${API_URL}${endpoint}`, {
    next: { 
      revalidate,
      tags 
    }
  });

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
    return fetchWithCache(`/api/products/${id}`, {
      revalidate: 3600,
      tags: [`product-${id}`]
    });
  },

  // Get products list - cache for 5 minutes
  async getProducts(params?: Record<string, string>) {
    const queryString = params 
      ? '?' + new URLSearchParams(params).toString() 
      : '';
    
    return fetchWithCache(`/api/products${queryString}`, {
      revalidate: 300,
      tags: ['products']
    });
  },

  // Get featured products - cache for 30 minutes
  async getFeaturedProducts() {
    return fetchWithCache('/api/products/featured', {
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
