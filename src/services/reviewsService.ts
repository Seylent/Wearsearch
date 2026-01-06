/**
 * Reviews API Service
 * Handles product reviews API calls
 */

import api, { handleApiError } from './api';

// Types
export interface ProductReview {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  title?: string;
  text: string;
  helpfulCount: number;
  isVerifiedPurchase: boolean;
  createdAt: string;
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

export interface ReviewsResponse {
  reviews: ProductReview[];
  stats: ReviewStats;
  total: number;
}

export type ReviewSortOption = 'newest' | 'oldest' | 'highest' | 'lowest' | 'helpful';

// API functions
export const reviewsService = {
  /**
   * Get reviews for a product
   */
  async getProductReviews(
    productId: string | number,
    options?: {
      sort?: ReviewSortOption;
      limit?: number;
      offset?: number;
    }
  ): Promise<ReviewsResponse> {
    try {
      const params = new URLSearchParams();
      if (options?.sort) params.append('sort', options.sort);
      if (options?.limit) params.append('limit', options.limit.toString());
      if (options?.offset) params.append('offset', options.offset.toString());

      const query = params.toString();
      const url = `/items/${productId}/reviews${query ? `?${query}` : ''}`;
      
      const response = await api.get(url);
      
      // Transform backend response to frontend format
      const data = response.data;
      return {
        reviews: (data.reviews || []).map(transformReview),
        stats: transformStats(data.stats),
        total: data.total || 0,
      };
    } catch (error) {
      // If 404 or no reviews, return empty response instead of throwing
      console.warn('Failed to fetch reviews:', error);
      return {
        reviews: [],
        stats: {
          averageRating: 0,
          totalReviews: 0,
          ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        },
        total: 0,
      };
    }
  },

  /**
   * Submit a new review
   */
  async submitReview(
    productId: string | number,
    review: {
      rating: number;
      title?: string;
      text?: string;
    }
  ): Promise<ProductReview> {
    try {
      const response = await api.post(`/items/${productId}/reviews`, review);
      return transformReview(response.data.review || response.data);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Toggle helpful on a review
   */
  async toggleHelpful(reviewId: string | number): Promise<{ helpfulCount: number }> {
    try {
      const response = await api.post(`/reviews/${reviewId}/helpful`);
      return {
        helpfulCount: response.data.helpful_count || response.data.helpfulCount || 0,
      };
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Delete a review
   */
  async deleteReview(reviewId: string | number): Promise<void> {
    try {
      await api.delete(`/reviews/${reviewId}`);
    } catch (error) {
      throw handleApiError(error);
    }
  },
};

// Transform functions (backend → frontend)
function transformReview(raw: Record<string, unknown>): ProductReview {
  return {
    id: String(raw.id || ''),
    productId: String(raw.product_id || raw.productId || ''),
    userId: String(raw.user_id || raw.userId || ''),
    userName: String(raw.user_name || raw.userName || 'Anonymous'),
    userAvatar: raw.user_avatar as string | undefined || raw.userAvatar as string | undefined,
    rating: Number(raw.rating || 0),
    title: raw.title as string | undefined,
    text: String(raw.text || raw.content || ''),
    helpfulCount: Number(raw.helpful_count || raw.helpfulCount || raw.helpful || 0),
    isVerifiedPurchase: Boolean(raw.is_verified_purchase || raw.isVerifiedPurchase || raw.verified),
    createdAt: String(raw.created_at || raw.createdAt || new Date().toISOString()),
  };
}

function transformStats(raw: Record<string, unknown> | undefined): ReviewStats {
  if (!raw) {
    return {
      averageRating: 0,
      totalReviews: 0,
      ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    };
  }

  const distribution = (raw.rating_distribution || raw.ratingDistribution || {}) as Record<string, number>;
  
  return {
    averageRating: Number(raw.average_rating || raw.averageRating || 0),
    totalReviews: Number(raw.total_reviews || raw.totalReviews || 0),
    ratingDistribution: {
      5: Number(distribution['5'] || 0),
      4: Number(distribution['4'] || 0),
      3: Number(distribution['3'] || 0),
      2: Number(distribution['2'] || 0),
      1: Number(distribution['1'] || 0),
    },
  };
}

export default reviewsService;
