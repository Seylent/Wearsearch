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
}

export interface CreateStoreData {
  name: string;
  telegram_url?: string | null;
  instagram_url?: string | null;
  tiktok_url?: string | null;
  shipping_info?: string | null;
  logo_url?: string | null;
  is_recommended?: boolean;
}

export interface UpdateStoreData {
  name?: string;
  telegram_url?: string | null;
  instagram_url?: string | null;
  tiktok_url?: string | null;
  shipping_info?: string | null;
  logo_url?: string | null;
  is_recommended?: boolean;
}

// Store Service - handles all store-related API calls
export const storeService = {
  /**
   * Get all stores
   */
  async getAllStores(): Promise<Store[]> {
    try {
      console.log('[StoreService] Fetching all stores...');
      const response: AxiosResponse<Store[] | { success: boolean; data: Store[] } | { items: Store[] }> = await api.get(
        ENDPOINTS.STORES.LIST
      );
      
      console.log('[StoreService] Response:', response.data);
      
      if (Array.isArray(response.data)) {
        console.log('[StoreService] Returned array of stores:', response.data.length);
        return response.data;
      }
      
      // Check for items array format (FastAPI pagination format)
      if ('items' in response.data && Array.isArray(response.data.items)) {
        console.log('[StoreService] Returned items array:', response.data.items.length);
        return response.data.items;
      }
      
      if (response.data.success && response.data.data) {
        console.log('[StoreService] Returned data.data stores:', response.data.data.length);
        return response.data.data;
      }
      
      console.warn('[StoreService] No stores found in response');
      return [];
    } catch (error) {
      console.error('[StoreService] Error fetching stores:', error);
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

