/**
 * Stores API Service
 * Handles all store-related API calls
 */

import { api } from '../api';
import type { Store, StoresResponse, Product, ProductsResponse } from '@/types';

export interface StoreProductsParams {
  category?: string;
  page?: number;
  limit?: number;
}

export const storesApi = {
  /**
   * Get all stores
   */
  getAll: async (): Promise<StoresResponse> => {
    try {
      const response = await api.get('/stores');
      return response.data;
    } catch (error) {
      console.error('[Stores API] Failed to fetch stores:', error);
      throw error;
    }
  },

  /**
   * Get a single store by ID (UUID)
   */
  getById: async (id: string): Promise<Store> => {
    try {
      const response = await api.get(`/stores/${id}`);
      return response.data;
    } catch (error) {
      console.error(`[Stores API] Failed to fetch store ${id}:`, error);
      throw error;
    }
  },

  /**
   * Get products from a specific store
   * @param storeId - Store UUID (not slug!)
   * @param params - Optional filters (category, page, limit)
   */
  getProducts: async (storeId: string, params?: StoreProductsParams): Promise<ProductsResponse> => {
    try {
      const response = await api.get(`/stores/${storeId}/products`, { params });
      return response.data;
    } catch (error) {
      console.error(`[Stores API] Failed to fetch products for store ${storeId}:`, error);
      throw error;
    }
  },

  /**
   * Admin: Create a new store
   */
  create: async (storeData: Partial<Store>): Promise<Store> => {
    try {
      const response = await api.post('/admin/stores', storeData);
      return response.data;
    } catch (error) {
      console.error('[Stores API] Failed to create store:', error);
      throw error;
    }
  },

  /**
   * Admin: Update a store
   */
  update: async (id: string, storeData: Partial<Store>): Promise<Store> => {
    try {
      const response = await api.put(`/admin/stores/${id}`, storeData);
      return response.data;
    } catch (error) {
      console.error(`[Stores API] Failed to update store ${id}:`, error);
      throw error;
    }
  },

  /**
   * Admin: Delete a store
   */
  delete: async (id: string): Promise<void> => {
    try {
      await api.delete(`/admin/stores/${id}`);
    } catch (error) {
      console.error(`[Stores API] Failed to delete store ${id}:`, error);
      throw error;
    }
  },
};
