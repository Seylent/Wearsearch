/**
 * Recommendations Hook
 * Provides personalized product recommendations and similar products
 */

import { useQuery } from '@tanstack/react-query';
import { authService } from '@/services/authService';
import { useIsAuthenticated } from '@/hooks/useIsAuthenticated';
import recommendationsService, {
  RecommendedProduct,
  SimilarProduct,
  InteractionType,
} from '@/services/recommendationsService';

/**
 * Hook for getting personalized recommendations
 */
export const useRecommendations = (limit: number = 10) => {
  const isLoggedIn = useIsAuthenticated();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['recommendations', limit],
    queryFn: () => recommendationsService.getRecommendations(limit),
    enabled: isLoggedIn,
    staleTime: 1000 * 60 * 10, // 10 minutes
    retry: (failureCount, error: { status?: number; response?: { status?: number } }) => {
      const status = error?.status ?? error?.response?.status;
      if (status === 401 || status === 429) return false;
      return failureCount < 1;
    },
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
  if (!authService.isAuthenticated()) return;

  await recommendationsService.trackInteraction(productId, type);
};

export type { RecommendedProduct, SimilarProduct, InteractionType };
