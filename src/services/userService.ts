import api, { handleApiError } from './api';
import ENDPOINTS from './endpoints';
import { AxiosResponse } from 'axios';
import { User } from './authService';

// Type definitions for user-related data
export interface UserProfile extends User {
  favorites_count?: number;
  ratings_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface UpdateProfileData {
  display_name?: string;
}

export interface ChangePasswordData {
  current_password: string;
  new_password: string;
}

export interface FavoriteProduct {
  id: string;
  name: string;
  price: number;
  image_url?: string;
  category?: string;
  brand?: string;
  stores_count?: number;
}

// User Service - handles user profile and favorites
export const userService = {
  /**
   * Get user profile
   */
  async getProfile(): Promise<UserProfile> {
    try {
      const response: AxiosResponse<any> = await api.get(
        ENDPOINTS.USERS.PROFILE
      );
      
      const responseData = response.data;
      
      // Handle different response structures
      // Format 1: { success: true, data: {...} }
      if (responseData?.data && typeof responseData.data === 'object') {
        return responseData.data;
      }
      
      // Format 2: { success: true, profile: {...} }
      if (responseData?.profile && typeof responseData.profile === 'object') {
        return responseData.profile;
      }
      
      // Format 3: { success: true, user: {...} }
      if (responseData?.user && typeof responseData.user === 'object') {
        return responseData.user;
      }
      
      // Format 4: User object directly (not wrapped in success/data)
      if (responseData && typeof responseData === 'object' && 'id' in responseData && !('success' in responseData)) {
        return responseData as UserProfile;
      }
      
      // Format 5: Check if responseData itself has user properties (even if it has success)
      if (responseData && typeof responseData === 'object' && 'id' in responseData && ('email' in responseData || 'display_name' in responseData)) {
        // If it has both success and user properties, prefer user properties
        if ('success' in responseData && 'profile' in responseData) {
          // This shouldn't happen as we checked profile above, but just in case
          return responseData.profile;
        }
        return responseData as UserProfile;
      }
      
      // If we get here, the structure is unexpected
      console.error('Invalid profile response structure. Received:', JSON.stringify(responseData, null, 2));
      throw new Error(`Invalid profile response structure. Expected one of: {data: {...}}, {profile: {...}}, {user: {...}}, or user object directly. Got: ${JSON.stringify(responseData)}`);
    } catch (error: any) {
      // If it's our custom error, re-throw it as-is
      if (error.message && error.message.includes('Invalid profile response structure')) {
        throw error;
      }
      // Provide more detailed error information for API errors
      const errorMessage = handleApiError(error);
      console.error('getProfile API error:', {
        message: errorMessage,
        status: error?.response?.status,
        data: error?.response?.data,
        originalError: error
      });
      throw new Error(errorMessage);
    }
  },

  /**
   * Update user profile
   */
  async updateProfile(data: UpdateProfileData): Promise<UserProfile> {
    try {
      const response: AxiosResponse<{ success: boolean; data: UserProfile }> = await api.put(
        ENDPOINTS.USERS.UPDATE_PROFILE,
        data
      );
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Change password
   */
  async changePassword(data: ChangePasswordData): Promise<void> {
    try {
      await api.put(ENDPOINTS.AUTH.PASSWORD, data);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Get user's favorite products
   */
  async getFavorites(): Promise<FavoriteProduct[]> {
    try {
      const response: AxiosResponse<any> = await api.get(
        ENDPOINTS.USERS.FAVORITES
      );
      // Use data.products for compatibility with backend
      if (response.data && Array.isArray(response.data.products)) {
        return response.data.products;
      }
      // Fallback for other formats
      if (response.data && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      return [];
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Add product to favorites
   * Note: Will return error if already favorited. Use checkFavorite() first or use toggleFavorite()
   */
  async addFavorite(productId: string): Promise<boolean> {
    try {
      await api.post(ENDPOINTS.USERS.ADD_FAVORITE(productId));
      return true;
    } catch (error: any) {
      console.error('Add favorite error:', error);
      // Check if it's the "already favorited" error
      const errorMsg = error?.response?.data?.error || '';
      if (errorMsg.includes('already in favorites')) {
        // Item is already favorited, return true (desired state achieved)
        console.warn(`Product ${productId} is already in favorites`);
        return true;
      }
      const finalErrorMsg = error?.response?.data?.error || error?.message || 'Failed to add to favorites';
      throw new Error(finalErrorMsg);
    }
  },

  /**
   * Remove product from favorites
   */
  async removeFavorite(productId: string): Promise<boolean> {
    try {
      await api.delete(ENDPOINTS.USERS.REMOVE_FAVORITE(productId));
      return true;
    } catch (error: any) {
      console.error('Remove favorite error:', error);
      const errorMsg = error?.response?.data?.error || error?.message || 'Failed to remove from favorites';
      throw new Error(errorMsg);
    }
  },

  /**
   * Toggle favorite status (add if not favorited, remove if already favorited)
   * Checks current status first to avoid "already favorited" errors
   * Returns the new status and a message
   */
  async toggleFavorite(productId: string): Promise<{ is_favorited: boolean; message: string }> {
    try {
      // Check current favorite status first
      const checkResult = await this.checkFavorite(productId);
      
      // Ensure checkResult is valid
      if (!checkResult || typeof checkResult.is_favorited !== 'boolean') {
        console.error('Invalid checkFavorite response:', checkResult);
        throw new Error('Failed to check favorite status');
      }
      
      const isFavorited = checkResult.is_favorited;

      if (isFavorited) {
        // Remove from favorites
        await this.removeFavorite(productId);
        return {
          is_favorited: false,
          message: 'Removed from favorites'
        };
      } else {
        // Add to favorites
        await this.addFavorite(productId);
        return {
          is_favorited: true,
          message: 'Added to favorites'
        };
      }
    } catch (error: any) {
      console.error('Toggle favorite error:', error);
      const errorMessage = error?.message || error?.response?.data?.error || 'Failed to update favorites';
      throw new Error(errorMessage);
    }
  },

  /**
   * Check if product is in favorites
   */
  async isFavorite(productId: string): Promise<boolean> {
    try {
      const favorites = await this.getFavorites();
      return favorites?.some((fav) => fav.id === productId) || false;
    } catch (error) {
      console.error('Error checking favorite status:', error);
      return false;
    }
  },

  /**
   * Check if product is favorited (more efficient than getting all favorites)
   */
  async checkFavorite(productId: string): Promise<{ is_favorited: boolean; favorite_id: string | null }> {
    try {
      const response: AxiosResponse<any> = await api.get(
        ENDPOINTS.USERS.CHECK_FAVORITE(productId)
      );
      
      // Handle different response formats
      if (response.data?.data) {
        return response.data.data;
      } else if (response.data?.is_favorited !== undefined) {
        return response.data;
      } else {
        return { is_favorited: false, favorite_id: null };
      }
    } catch (error: any) {
      // Don't log 401 errors - they're expected when not authenticated
      const is401 = error?.response?.status === 401 || error?.message?.includes('401') || error?.message?.includes('Unauthorized');
      if (!is401) {
        console.error('Error checking favorite status:', error);
      }
      return { is_favorited: false, favorite_id: null };
    }
  },

  /**
   * Get user statistics
   */
  async getStats(): Promise<{ favorites_count: number; ratings_count: number; account_created_at: string }> {
    try {
      const response: AxiosResponse<{ success: boolean; data: any }> = await api.get(
        ENDPOINTS.USERS.STATS
      );
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Update display name
   */
  async updateDisplayName(displayName: string): Promise<UserProfile> {
    try {
      const response: AxiosResponse<{ success: boolean; data: UserProfile }> = await api.put(
        ENDPOINTS.USERS.DISPLAY_NAME,
        { display_name: displayName }
      );
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Update bio
   */
  async updateBio(bio: string): Promise<UserProfile> {
    try {
      const response: AxiosResponse<{ success: boolean; data: UserProfile }> = await api.put(
        ENDPOINTS.USERS.BIO,
        { bio }
      );
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Update avatar
   */
  async updateAvatar(avatarUrl: string): Promise<UserProfile> {
    try {
      const response: AxiosResponse<{ success: boolean; data: UserProfile }> = await api.put(
        ENDPOINTS.USERS.AVATAR,
        { avatar_url: avatarUrl }
      );
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};

export default userService;
