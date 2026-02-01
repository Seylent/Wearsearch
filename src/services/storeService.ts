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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function hasItems(value: unknown): value is { items: Store[] } {
  return isRecord(value) && Array.isArray((value as { items?: unknown }).items);
}

function hasSuccessData(value: unknown): value is { success: true; data: Store[] } {
  return (
    isRecord(value) && value.success === true && Array.isArray((value as { data?: unknown }).data)
  );
}

// Store Service - handles all store-related API calls
export const storeService = {
  /**
   * Get all stores
   */
  async getAllStores(): Promise<Store[]> {
    try {
      console.log('[StoreService] Fetching all stores...');
      const response: AxiosResponse<
        Store[] | { success: boolean; data: Store[] } | { items: Store[] }
      > = await api.get(ENDPOINTS.STORES.LIST);

      console.log('[StoreService] Response:', response.data);

      const payload = response.data;

      if (Array.isArray(payload)) {
        console.log('[StoreService] Returned array of stores:', payload.length);
        return payload;
      }

      // Check for items array format (FastAPI pagination format)
      if (hasItems(payload)) {
        console.log('[StoreService] Returned items array:', payload.items.length);
        return payload.items;
      }

      if (hasSuccessData(payload)) {
        console.log('[StoreService] Returned data.data stores:', payload.data.length);
        return payload.data;
      }

      console.warn('[StoreService] No stores found in response');
      return [];
    } catch (error) {
      console.error('[StoreService] Error fetching stores:', error);
      const apiError = handleApiError(error);
      throw new Error(apiError.message);
    }
  },

  /**
   * Get store by ID
   */
  async getStoreById(id: string | number): Promise<Store> {
    try {
      const response: AxiosResponse<Store> = await api.get(ENDPOINTS.STORES.DETAIL(id));
      return response.data;
    } catch (error) {
      const apiError = handleApiError(error);
      throw new Error(apiError.message);
    }
  },

  /**
   * Create a new store (admin only)
   */
  async createStore(data: CreateStoreData): Promise<Store> {
    try {
      const response: AxiosResponse<Store> = await api.post(ENDPOINTS.STORES.CREATE, data);
      return response.data;
    } catch (error) {
      const apiError = handleApiError(error);
      throw new Error(apiError.message);
    }
  },

  /**
   * Update a store (admin only)
   */
  async updateStore(id: string | number, data: UpdateStoreData): Promise<Store> {
    try {
      const response: AxiosResponse<Store> = await api.put(ENDPOINTS.STORES.UPDATE(id), data);
      return response.data;
    } catch (error) {
      const apiError = handleApiError(error);
      throw new Error(apiError.message);
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
      const apiError = handleApiError(error);
      throw new Error(apiError.message);
    }
  },
};

export default storeService;
