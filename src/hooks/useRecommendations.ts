/**
 * Recommendations Hook
 * Provides personalized product recommendations and similar products
 */

import { useQuery } from '@tanstack/react-query';
import { isAuthenticated } from '@/utils/authStorage';
import recommendationsService, {
  RecommendedProduct,
  SimilarProduct,
  InteractionType,
} from '@/services/recommendationsService';

/**
 * Hook for getting personalized recommendations
 */
export const useRecommendations = (limit: number = 10) => {
  const isLoggedIn = isAuthenticated();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['recommendations', limit],
    queryFn: () => recommendationsService.getRecommendations(limit),
    enabled: isLoggedIn,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  return {
    recommendations: data || [],
    isLoading,
    error,
    refetch,
    isEnabled: isLoggedIn,
  };
};

/**
 * Hook for getting similar products
 */
export const useSimilarProducts = (productId: string | number | undefined, limit: number = 6) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['similarProducts', productId, limit],
    queryFn: () => recommendationsService.getSimilarProducts(productId!, limit),
    enabled: !!productId,
    staleTime: 1000 * 60 * 15, // 15 minutes
  });

  return {
    similarProducts: data || [],
    isLoading,
    error,
  };
};

/**
 * Track product interaction (for improving recommendations)
 */
export const trackInteraction = async (
  productId: string | number,
  type: InteractionType
): Promise<void> => {
  // Only track if authenticated (recommendations work for logged-in users)
  if (!isAuthenticated()) return;
  
  await recommendationsService.trackInteraction(productId, type);
};

export type { RecommendedProduct, SimilarProduct, InteractionType };
