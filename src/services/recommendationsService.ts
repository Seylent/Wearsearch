/**
 * Recommendations API Service
 * Handles personalized recommendations and similar products
 */

import api from './api';
import { Product } from './productService';

// Types
export type InteractionType = 'view' | 'favorite' | 'cart' | 'purchase';

export interface RecommendedProduct extends Product {
  reason?: 'based_on_favorites' | 'based_on_views' | 'trending' | 'similar_users';
  score?: number;
}

export interface SimilarProduct extends Product {
  similarityScore?: number;
}

// API functions
export const recommendationsService = {
  /**
   * Get personalized recommendations for the current user
   */
  async getRecommendations(limit: number = 10): Promise<RecommendedProduct[]> {
    try {
      const response = await api.get(`/recommendations?limit=${limit}`);
      const recommendations = response.data.recommendations || response.data || [];
      return recommendations.map(transformRecommendation);
    } catch (error) {
      console.warn('Failed to fetch recommendations:', error);
      return [];
    }
  },

  /**
   * Get similar products for a given product
   */
  async getSimilarProducts(productId: string | number, limit: number = 6): Promise<SimilarProduct[]> {
    try {
      const response = await api.get(`/items/${productId}/similar?limit=${limit}`);
      const products = response.data.products || response.data || [];
      return products.map(transformSimilarProduct);
    } catch (error) {
      console.warn('Failed to fetch similar products:', error);
      return [];
    }
  },

  /**
   * Track user interaction with a product
   */
  async trackInteraction(productId: string | number, type: InteractionType): Promise<void> {
    // Silent fail - tracking is not critical and should not show errors to user
    try {
      await api.post('/interactions', {
        product_id: productId,
        type,
      });
    } catch {
      // Silently ignore - this is analytics, not critical functionality
    }
  },
};

// Transform functions (backend → frontend)
function transformRecommendation(raw: Record<string, unknown>): RecommendedProduct {
  return {
    id: Number(raw.id || 0),
    name: typeof raw.name === 'string' ? raw.name : '',
    category: typeof raw.category === 'string' ? raw.category : '',
    price: typeof raw.price === 'string' || typeof raw.price === 'number' ? String(raw.price) : '0',
    image: raw.image as string | undefined,
    image_url: raw.image_url as string | undefined,
    images: raw.images as string[] | undefined,
    description: typeof raw.description === 'string' ? raw.description : '',
    color: typeof raw.color === 'string' ? raw.color : '',
    type: typeof raw.type === 'string' ? raw.type : '',
    brand: raw.brand as string | undefined,
    brand_id: raw.brand_id as number | undefined,
    gender: raw.gender as string | undefined,
    reason: raw.reason as RecommendedProduct['reason'],
    score: raw.score === undefined ? undefined : Number(raw.score),
  };
}

function transformSimilarProduct(raw: Record<string, unknown>): SimilarProduct {
  return {
    id: Number(raw.id || 0),
    name: typeof raw.name === 'string' ? raw.name : '',
    category: typeof raw.category === 'string' ? raw.category : '',
    price: typeof raw.price === 'string' ? raw.price : '0',
    image: raw.image as string | undefined,
    image_url: raw.image_url as string | undefined,
    images: raw.images as string[] | undefined,
    description: typeof raw.description === 'string' ? raw.description : '',
    color: typeof raw.color === 'string' ? raw.color : '',
    type: typeof raw.type === 'string' ? raw.type : '',
    brand: raw.brand as string | undefined,
    brand_id: raw.brand_id as number | undefined,
    gender: raw.gender as string | undefined,
    similarityScore: raw.similarity_score === undefined ? undefined : Number(raw.similarity_score),
  };
}

export default recommendationsService;
