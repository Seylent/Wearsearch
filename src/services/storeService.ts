import api, { handleApiError } from './api';
import ENDPOINTS from './endpoints';
import { AxiosResponse } from 'axios';

// Type definitions for stores
export interface Store {
  id: string;
  name: string;
  telegram_url: string | null;
  instagram_url: string | null;
  shipping_info: string | null;
  average_rating: number;
  total_ratings: number;
  is_verified: boolean;
  created_at?: string;
  product_count?: number;
  brand_count?: number; // ✅ NEW: Number of unique brands
}

export interface StoreWithPrice extends Store {
  price: number;
}

export interface StoreFilters {
  search?: string;
  sort_by?: 'name' | 'price' | 'rating';
  order?: 'asc' | 'desc';
  min_rating?: number;
  max_rating?: number;
  min_price?: number;
  max_price?: number;
  page?: number;
  per_page?: number;
  verified_first?: boolean;
}

export interface CreateStoreData {
  name: string;
  telegram_url?: string;
  instagram_url?: string;
  shipping_info?: string;
  is_verified?: boolean;
}

export interface UpdateStoreData {
  name?: string;
  telegram_url?: string;
  instagram_url?: string;
  shipping_info?: string;
  is_verified?: boolean;
}

// Store Service - handles all store-related API calls
export const storeService = {
  /**
   * Get all stores (public)
   */
  async getAllStores(): Promise<Store[]> {
    try {
      const response: AxiosResponse<{ success: boolean; data: Store[] } | Store[]> = await api.get(
        ENDPOINTS.STORES.LIST
      );
      // Handle both response formats
      if (Array.isArray(response.data)) {
        return response.data;
      }
      return (response.data as { success: boolean; data: Store[] }).data || [];
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Get single store by ID
   */
  async getStoreById(id: string): Promise<Store> {
    try {
      const response: AxiosResponse<{ success: boolean; data: Store } | Store> = await api.get(
        ENDPOINTS.STORES.DETAIL(id)
      );
      // Handle both response formats
      if ('success' in response.data) {
        return (response.data as { success: boolean; data: Store }).data;
      }
      return response.data as Store;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Get stores for a product with filters (public)
   */
  async getProductStores(productId: string, filters?: StoreFilters): Promise<{
    success: boolean;
    product_id: string;
    product_name: string;
    stores_count: number;
    stores: StoreWithPrice[];
    pagination: {
      page: number;
      per_page: number;
      total_pages: number;
      total_stores: number;
      has_next: boolean;
      has_prev: boolean;
    };
  }> {
    try {
      const params = new URLSearchParams();
      if (filters?.search) params.append('search', filters.search);
      if (filters?.sort_by) params.append('sort_by', filters.sort_by);
      if (filters?.order) params.append('order', filters.order);
      if (filters?.min_rating !== undefined) params.append('min_rating', filters.min_rating.toString());
      if (filters?.max_rating !== undefined) params.append('max_rating', filters.max_rating.toString());
      if (filters?.min_price !== undefined) params.append('min_price', filters.min_price.toString());
      if (filters?.max_price !== undefined) params.append('max_price', filters.max_price.toString());
      if (filters?.page !== undefined) params.append('page', filters.page.toString());
      if (filters?.per_page !== undefined) params.append('per_page', filters.per_page.toString());
      if (filters?.verified_first !== undefined) params.append('verified_first', filters.verified_first.toString());

      const response: AxiosResponse<{
        success: boolean;
        product_id: string;
        product_name: string;
        stores_count: number;
        stores: StoreWithPrice[];
        pagination: {
          page: number;
          per_page: number;
          total_pages: number;
          total_stores: number;
          has_next: boolean;
          has_prev: boolean;
        };
      }> = await api.get(
        `${ENDPOINTS.PRODUCTS.STORES(productId)}?${params.toString()}`
      );
      
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // ========== ADMIN ENDPOINTS ==========

  /**
   * Get all stores (admin) with optional search
   */
  async getAdminStores(search?: string): Promise<Store[]> {
    try {
      const params = search ? `?search=${encodeURIComponent(search)}` : '';
      const response: AxiosResponse<{ success: boolean; count: number; data: Store[] }> = await api.get(
        `${ENDPOINTS.STORES.ADMIN_LIST}${params}`
      );
      return response.data.data || [];
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Create a new store (admin only)
   */
  async createStore(data: CreateStoreData): Promise<{ success: boolean; data: { id: string }; message: string }> {
    try {
      const response: AxiosResponse<{ success: boolean; data: { id: string }; message: string }> = await api.post(
        ENDPOINTS.STORES.CREATE,
        data
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Update an existing store (admin only)
   */
  async updateStore(id: string, data: UpdateStoreData): Promise<{ success: boolean; data: Store; message: string }> {
    try {
      const response: AxiosResponse<{ success: boolean; data: Store; message: string }> = await api.put(
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
  async deleteStore(id: string): Promise<{ success: boolean; message: string }> {
    try {
      const response: AxiosResponse<{ success: boolean; message: string }> = await api.delete(
        ENDPOINTS.STORES.DELETE(id)
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};

export default storeService;
