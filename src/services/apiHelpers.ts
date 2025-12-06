/**
 * API Helper Utilities
 * Provides convenient wrappers for common API operations
 */

import { authService, userService, productService, storeService, ratingsService } from './index';

/**
 * Generic fetch with authentication helper
 */
export async function apiCall<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('access_token');
  
  const response = await fetch(`http://localhost:3000${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || error.message || 'Request failed');
  }

  return response.json();
}

/**
 * Quick API Examples - Ready-to-use functions
 */
export const quickAPI = {
  // ========== AUTH ==========
  
  async login(email: string, password: string) {
    return authService.login({ email, password });
  },

  async register(email: string, password: string, display_name?: string) {
    return authService.register({ email, password, display_name });
  },

  async logout() {
    return authService.logout();
  },

  async getCurrentUser() {
    return authService.getCurrentUser();
  },

  // ========== USER PROFILE ==========

  async getProfile() {
    return userService.getProfile();
  },

  async updateDisplayName(display_name: string) {
    return userService.updateDisplayName(display_name);
  },

  async updateBio(bio: string) {
    return userService.updateBio(bio);
  },

  async updateAvatar(avatar_url: string) {
    return userService.updateAvatar(avatar_url);
  },

  async changePassword(current_password: string, new_password: string) {
    return userService.changePassword({ current_password, new_password });
  },

  // ========== FAVORITES ==========

  async getFavorites() {
    return userService.getFavorites();
  },

  async addFavorite(productId: string) {
    return userService.addFavorite(productId);
  },

  async removeFavorite(productId: string) {
    return userService.removeFavorite(productId);
  },

  async checkFavorite(productId: string) {
    return userService.checkFavorite(productId);
  },

  async toggleFavorite(productId: string, isFavorited: boolean) {
    return userService.toggleFavorite(productId, isFavorited);
  },

  // ========== PRODUCTS ==========

  async getProducts(filters?: {
    name?: string;
    color?: string;
    type?: string;
    min_price?: number;
    max_price?: number;
    sort_by?: string;
    order?: 'asc' | 'desc';
  }) {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }
    
    return apiCall(`/api/items?${params.toString()}`);
  },

  async getProduct(productId: string) {
    return apiCall(`/api/items/${productId}`);
  },

  // ========== STORES ==========

  async getProductStores(productId: string, filters?: {
    search?: string;
    sort_by?: 'name' | 'price' | 'rating';
    order?: 'asc' | 'desc';
    min_rating?: number;
    max_rating?: number;
    min_price?: number;
    max_price?: number;
  }) {
    return storeService.getProductStores(productId, filters);
  },

  async searchAdminStores(search?: string) {
    return storeService.getAdminStores(search);
  },

  // ========== RATINGS ==========

  async createRating(store_id: string, product_id: string, rating: number, comment?: string) {
    return ratingsService.createRating({ store_id, product_id, rating, comment });
  },

  async getStoreRatings(storeId: string) {
    return ratingsService.getStoreRatings(storeId);
  },

  async getProductRatings(productId: string) {
    return ratingsService.getProductRatings(productId);
  },

  // ========== ADMIN ==========

  async createProduct(data: {
    name: string;
    color: string;
    type: string;
    price: number;
    description?: string;
    image_url?: string;
    store_ids: string[];
  }) {
    return apiCall('/api/admin/products', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateProduct(productId: string, data: any) {
    return apiCall(`/api/admin/products/${productId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteProduct(productId: string) {
    return apiCall(`/api/admin/products/${productId}`, {
      method: 'DELETE',
    });
  },

  async createStore(data: {
    name: string;
    telegram_url?: string;
    instagram_url?: string;
    shipping_info?: string;
    is_verified?: boolean;
  }) {
    return storeService.createStore(data);
  },

  async updateStore(storeId: string, data: any) {
    return storeService.updateStore(storeId, data);
  },

  async deleteStore(storeId: string) {
    return storeService.deleteStore(storeId);
  },
};

/**
 * Response type helpers
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  skip: number;
  limit: number;
}

/**
 * Error handling helper
 */
export function isApiError(error: any): error is { message: string; code?: string } {
  return error && typeof error.message === 'string';
}

export function getErrorMessage(error: unknown): string {
  if (isApiError(error)) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unexpected error occurred';
}
