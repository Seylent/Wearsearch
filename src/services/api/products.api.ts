/**
 * Products API Service
 * Handles all product-related API calls
 */

import { api } from '../api';
import type { Product, ProductsResponse } from '@/types';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function getRecord(value: unknown, key: string): Record<string, unknown> | undefined {
  if (!isRecord(value)) return undefined;
  const candidate = value[key];
  return isRecord(candidate) ? candidate : undefined;
}

function getArray(value: unknown, key: string): unknown[] | undefined {
  if (!isRecord(value)) return undefined;
  const candidate = value[key];
  return Array.isArray(candidate) ? candidate : undefined;
}

function toOptionalNumber(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const num = Number(value);
    return Number.isFinite(num) ? num : undefined;
  }
  return undefined;
}

export interface ProductFilters {
  page?: number;
  limit?: number;
  search?: string;
  color?: string;
  category?: string;
  sort?: string;
}

export interface PopularSavedOptions {
  limit?: number;
  noCache?: boolean;
}

export const productsApi = {
  /**
   * Get all products with optional filters
   */
  getAll: async (filters?: ProductFilters): Promise<ProductsResponse> => {
    try {
      const response = await api.get('/items', { params: filters });
      const body: unknown = response.data;
      // Canonical v1: { items, meta }. Legacy: { products, total }.
      const items = getArray(body, 'items');
      if (items) {
        const meta = getRecord(body, 'meta');
        return {
          products: items as Product[],
          total:
            toOptionalNumber(meta?.totalItems) ?? toOptionalNumber(meta?.total) ?? items.length,
          page: toOptionalNumber(meta?.currentPage) ?? 1,
          limit: toOptionalNumber(meta?.itemsPerPage) ?? items.length,
        } as ProductsResponse;
      }

      return body as ProductsResponse;
    } catch (error) {
      console.error('[Products API] Failed to fetch products:', error);
      throw error;
    }
  },

  /**
   * Get a single product by ID
   */
  getById: async (id: string): Promise<Product> => {
    try {
      const response = await api.get(`/items/${id}`);
      const body: unknown = response.data;
      if (isRecord(body)) {
        return (body.item ?? body.product ?? body) as Product;
      }
      return body as Product;
    } catch (error) {
      console.error(`[Products API] Failed to fetch product ${id}:`, error);
      throw error;
    }
  },

  /**
   * Get related products for a product
   */
  getRelated: async (productId: string): Promise<Product[]> => {
    try {
      const response = await api.get(`/pages/product/${productId}`);
      const body: unknown = response.data;
      const item = getRecord(body, 'item');
      const related = item ? item.relatedProducts : undefined;
      return Array.isArray(related) ? (related as Product[]) : [];
    } catch (error) {
      console.error(`[Products API] Failed to fetch related products for ${productId}:`, error);
      throw error;
    }
  },

  /**
   * Search products
   */
  search: async (query: string, filters?: ProductFilters): Promise<ProductsResponse> => {
    try {
      const response = await api.get('/items/search', {
        params: { q: query, ...filters },
      });
      return response.data;
    } catch (error) {
      console.error(`[Products API] Failed to search products:`, error);
      throw error;
    }
  },

  /**
   * Get products by category
   */
  getByCategory: async (category: string, filters?: ProductFilters): Promise<ProductsResponse> => {
    try {
      const response = await api.get(`/items/category/${category}`, { params: filters });
      return response.data;
    } catch (error) {
      console.error(`[Products API] Failed to fetch products for category ${category}:`, error);
      throw error;
    }
  },

  /**
   * Get top products by saves (wishlist + favorites)
   */
  getPopularSaved: async (options: PopularSavedOptions = {}): Promise<Product[]> => {
    try {
      const params: Record<string, string | number> = {};
      if (options.limit) params.limit = options.limit;
      if (options.noCache) params.no_cache = 1;

      const response = await api.get('/products/popular-saved', { params });
      const body: unknown = response.data;
      const items = getArray(body, 'items');
      if (items) return items as Product[];
      if (Array.isArray(body)) return body as Product[];
      const products = getArray(body, 'products');
      return products ? (products as Product[]) : [];
    } catch (error) {
      console.error('[Products API] Failed to fetch popular saved products:', error);
      throw error;
    }
  },
};
