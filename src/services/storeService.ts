import api, { handleApiError } from './api';
import ENDPOINTS from './endpoints';
import { AxiosResponse } from 'axios';

// Type definitions for stores
export interface Store {
  id: string;
  name: string;
  telegram_url?: string | null;
  instagram_url?: string | null;
  shipping_info?: string | null;
  logo_url?: string | null;
  created_at?: string;
  updated_at?: string;
  // Optional metadata that may be returned by the API
  is_verified?: boolean;
  is_recommended?: boolean;
  product_count?: number;
  brand_count?: number;
  average_rating?: number;
  total_ratings?: number;
}

export interface CreateStoreData {
  name: string;
  telegram_url?: string | null;
  instagram_url?: string | null;
  shipping_info?: string | null;
  logo_url?: string | null;
}

export interface UpdateStoreData {
  name?: string;
  telegram_url?: string | null;
  instagram_url?: string | null;
  shipping_info?: string | null;
  logo_url?: string | null;
}

// Store Service - handles all store-related API calls
export const storeService = {
  /**
   * Get all stores
   */
  async getAllStores(): Promise<Store[]> {
    try {
      const response: AxiosResponse<Store[] | { success: boolean; data: Store[] }> = await api.get(
        ENDPOINTS.STORES.LIST
      );
      
      if (Array.isArray(response.data)) {
        return response.data;
      }
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      return [];
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Get store by ID
   */
  async getStoreById(id: string | number): Promise<Store> {
    try {
      const response: AxiosResponse<Store> = await api.get(
        ENDPOINTS.STORES.DETAIL(id)
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Create a new store (admin only)
   */
  async createStore(data: CreateStoreData): Promise<Store> {
    try {
      const response: AxiosResponse<Store> = await api.post(
        ENDPOINTS.STORES.CREATE,
        data
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Update a store (admin only)
   */
  async updateStore(id: string | number, data: UpdateStoreData): Promise<Store> {
    try {
      const response: AxiosResponse<Store> = await api.put(
        ENDPOINTS.STORES.UPDATE(id),
        data
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Delete a store (admin only)
   */
  async deleteStore(id: string | number): Promise<{ message: string }> {
    try {
      const response: AxiosResponse<{ message: string }> = await api.delete(
        ENDPOINTS.STORES.DELETE(id)
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};

export default storeService;

