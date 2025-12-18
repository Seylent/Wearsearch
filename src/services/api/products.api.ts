/**
 * Products API Service
 * Handles all product-related API calls
 */

import { api } from '../api';
import type { Product, ProductsResponse } from '@/types';

export interface ProductFilters {
  page?: number;
  limit?: number;
  search?: string;
  color?: string;
  category?: string;
  sort?: string;
}

export const productsApi = {
  /**
   * Get all products with optional filters
   */
  getAll: async (filters?: ProductFilters): Promise<ProductsResponse> => {
    try {
      const response = await api.get('/items', { params: filters });
      return response.data;
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
      return response.data;
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
      const response = await api.get(`/items/${productId}/related`);
      return response.data;
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
};
