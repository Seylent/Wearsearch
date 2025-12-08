import api, { handleApiError } from './api';
import ENDPOINTS from './endpoints';
import { AxiosResponse } from 'axios';

export interface Rating {
  id: string;
  store_id: string;
  product_id: string;
  user_id: string;
  rating: number;
  comment?: string;
  created_at?: string;
  updated_at?: string;
}

export interface RatingResponse {
  success: boolean;
  message?: string;
  data?: Rating;
  error?: string;
  details?: any;
}

export const ratingsService = {
  /**
   * Add a rating for a store/product
   */
  async addRating(data: {
    store_id: string;
    product_id: string;
    user_id: string;
    rating: number;
    comment?: string;
  }): Promise<RatingResponse> {
    try {
      const response: AxiosResponse<RatingResponse> = await api.post(
        ENDPOINTS.RATINGS.ADD,
        data
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Get ratings for a store
   */
  async getStoreRatings(storeId: string): Promise<{ success: boolean; count: number; data: Rating[] }> {
    try {
      const response: AxiosResponse<{ success: boolean; count: number; data: Rating[] }> = await api.get(
        ENDPOINTS.RATINGS.BY_STORE(storeId)
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Get ratings for a user
   */
  async getUserRatings(userId: string): Promise<{ success: boolean; count: number; data: Rating[] }> {
    try {
      const response: AxiosResponse<{ success: boolean; count: number; data: Rating[] }> = await api.get(
        ENDPOINTS.RATINGS.BY_USER(userId)
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Delete a rating
   */
  async deleteRating(ratingId: string, userId: string): Promise<{ success: boolean; message: string }> {
    try {
      const response: AxiosResponse<{ success: boolean; message: string }> = await api.delete(
        ENDPOINTS.RATINGS.DELETE(ratingId),
        { data: { user_id: userId } }
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};

export default ratingsService;
