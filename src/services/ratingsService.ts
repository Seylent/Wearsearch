import api, { handleApiError } from './api';
import { AxiosResponse } from 'axios';

// Type definitions for ratings
export interface Rating {
  id: string;
  store_id: string;
  product_id: string;
  user_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  user_display_name?: string;
  product_name?: string;
}

export interface CreateRatingData {
  store_id: string;
  product_id: string;
  rating: number;
  comment?: string;
}

export interface RatingsResponse {
  success: boolean;
  data: Rating[];
  average_rating: number;
  total_ratings: number;
}

// Ratings Service - handles all rating-related API calls
export const ratingsService = {
  /**
   * Create a new rating
   */
  async createRating(data: CreateRatingData): Promise<{ success: boolean; data: Rating }> {
    try {
      const response: AxiosResponse<{ success: boolean; data: Rating }> = await api.post(
        '/api/ratings',
        data
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Get all ratings for a store
   */
  async getStoreRatings(storeId: string): Promise<RatingsResponse> {
    try {
      const response: AxiosResponse<RatingsResponse> = await api.get(
        `/api/ratings/store/${storeId}`
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Get all ratings for a product
   */
  async getProductRatings(productId: string): Promise<RatingsResponse> {
    try {
      const response: AxiosResponse<RatingsResponse> = await api.get(
        `/api/ratings/product/${productId}`
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Get ratings by a specific user
   */
  async getUserRatings(userId: string): Promise<{ success: boolean; data: Rating[] }> {
    try {
      const response: AxiosResponse<{ success: boolean; data: Rating[] }> = await api.get(
        `/api/ratings/user/${userId}`
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Delete a rating
   */
  async deleteRating(ratingId: string): Promise<{ success: boolean; message: string }> {
    try {
      const response: AxiosResponse<{ success: boolean; message: string }> = await api.delete(
        `/api/ratings/${ratingId}`
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};

export default ratingsService;
