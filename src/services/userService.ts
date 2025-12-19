import api, { handleApiError } from './api';
import ENDPOINTS from './endpoints';
import { AxiosResponse } from 'axios';
import { User } from './authService';
import { Product } from './productService';

// Type definitions for user-related data
export interface UserProfile extends User {
  avatar?: string;
  bio?: string;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
  };
}

export interface UpdateProfileData {
  displayName?: string;
  username?: string;
  avatar?: string;
  bio?: string;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
  };
}

export interface FavoriteProduct {
  id: number;
  productId: number;
  userId: number;
  createdAt: string;
  product?: Product;
}

// User Service - handles user profile and favorites
export const userService = {
  /**
   * Get user profile
   */
  async getProfile(): Promise<UserProfile> {
    try {
      const response: AxiosResponse<UserProfile> = await api.get(
        ENDPOINTS.USERS.PROFILE
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Update user profile
   */
  async updateProfile(data: UpdateProfileData): Promise<UserProfile> {
    try {
      const response: AxiosResponse<UserProfile> = await api.put(
        ENDPOINTS.USERS.UPDATE_PROFILE,
        data
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Get user's favorite products
   */
  async getFavorites(): Promise<Product[]> {
    try {
      const response: AxiosResponse<Product[]> = await api.get(
        ENDPOINTS.USERS.FAVORITES
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Add product to favorites
   */
  async addFavorite(productId: string | number): Promise<{ message: string; favorite: FavoriteProduct }> {
    try {
      const response: AxiosResponse<{ message: string; favorite: FavoriteProduct }> = await api.post(
        ENDPOINTS.USERS.ADD_FAVORITE(productId)
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Remove product from favorites
   */
  async removeFavorite(productId: string | number): Promise<{ message: string }> {
    try {
      const response: AxiosResponse<{ message: string }> = await api.delete(
        ENDPOINTS.USERS.REMOVE_FAVORITE(productId)
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Check favorite status for a product
   */
  async checkFavorite(productId: string | number): Promise<{ is_favorited: boolean; favorite_id?: number }> {
    try {
      const response: AxiosResponse<{ is_favorited: boolean; favorite_id?: number }> = await api.get(
        ENDPOINTS.USERS.CHECK_FAVORITE(productId)
      );
      return response.data || { is_favorited: false };
    } catch (error) {
      // Fallback: determine by listing favorites
      const isFav = await this.isFavorite(productId);
      return { is_favorited: isFav };
    }
  },

  /**
   * Toggle favorite status (add if not favorited, remove if already favorited)
   * Returns an object with the final state and a message
   */
  async toggleFavorite(productId: string | number): Promise<{ is_favorited: boolean; message: string }> {
    try {
      const response: AxiosResponse<{ is_favorited: boolean; message: string }> = await api.post(
        ENDPOINTS.USERS.TOGGLE_FAVORITE,
        { product_id: productId }
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Check if product is in favorites
   */
  async isFavorite(productId: string | number): Promise<boolean> {
    try {
      const favorites = await this.getFavorites();
      return favorites.some((product) => product.id === Number(productId));
    } catch (error) {
      console.error('Error checking favorite status:', error);
      return false;
    }
  },

  /**
   * Delete user account
   * Requires password confirmation
   */
  async deleteAccount(password: string): Promise<{ success: boolean; message: string }> {
    try {
      const response: AxiosResponse<{ success: boolean; message: string }> = await api.delete(
        ENDPOINTS.USERS.DELETE_ACCOUNT,
        { data: { password } }
      );
      return response.data;
    } catch (error: any) {
      // Handle specific error messages from backend
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error(handleApiError(error));
    }
  },
};

export default userService;
