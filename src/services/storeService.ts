import api, { handleApiError } from './api';
import { logError, logInfo, logWarn } from './logger';
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
      logInfo('Fetching all stores', {
        component: 'storeService',
        action: 'FETCH_ALL',
      });
      const response: AxiosResponse<
        Store[] | { success: boolean; data: Store[] } | { items: Store[] }
      > = await api.get(ENDPOINTS.STORES.LIST);

      logInfo('Stores response received', {
        component: 'storeService',
        action: 'FETCH_ALL_RESPONSE',
      });

      const payload = response.data;

      if (Array.isArray(payload)) {
        logInfo(`Returned array of stores: ${payload.length}`, {
          component: 'storeService',
          action: 'FETCH_ALL_ARRAY',
        });
        return payload;
      }

      // Check for items array format (FastAPI pagination format)
      if (hasItems(payload)) {
        logInfo(`Returned items array: ${payload.items.length}`, {
          component: 'storeService',
          action: 'FETCH_ALL_ITEMS',
        });
        return payload.items;
      }

      if (hasSuccessData(payload)) {
        logInfo(`Returned data stores: ${payload.data.length}`, {
          component: 'storeService',
          action: 'FETCH_ALL_DATA',
        });
        return payload.data;
      }

      logWarn('No stores found in response', {
        component: 'storeService',
        action: 'FETCH_ALL_EMPTY',
      });
      return [];
    } catch (error) {
      logError('Error fetching stores', {
        component: 'storeService',
        action: 'FETCH_ALL_ERROR',
        metadata: { error },
      });
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
