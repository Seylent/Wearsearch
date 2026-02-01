/**
 * useUserContext Hook
 * Хук для отримання контексту користувача та визначення типу дашборду
 * Використовує новий endpoint GET /api/v1/users/me/context
 */

import { useQuery } from '@tanstack/react-query';
import { userContextApi, type UserContext } from '@/services/api/userContext.api';

const USER_CONTEXT_QUERY_KEY = ['user', 'context'];

export const useUserContext = () => {
  const {
    data: context,
    isLoading,
    error,
    refetch,
  } = useQuery<UserContext | null>({
    queryKey: USER_CONTEXT_QUERY_KEY,
    queryFn: async () => {
      try {
        return await userContextApi.getContext();
      } catch (error) {
        console.error('Failed to fetch user context:', error);
        return null;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 хвилин
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  // Helper properties
  const isSuperAdmin = context?.dashboard_type === 'super_admin';
  const isBrandOwner = context?.dashboard_type === 'brand_owner';
  const isStoreOwner = context?.dashboard_type === 'store_owner';
  const isStoreManager = context?.dashboard_type === 'store_manager';
  const isRegularUser = context?.dashboard_type === 'user';

  // Check if user has multiple stores/brands
  const hasMultipleStores = (context?.stores.all.length || 0) > 1;
  const hasMultipleBrands = (context?.brands.owned.length || 0) > 1;
  const hasStoreSelector = hasMultipleStores;
  const hasBrandSelector = hasMultipleBrands;

  // Get primary store/brand (first owned)
  const primaryStore = context?.stores.owned[0] || context?.stores.managed[0] || null;
  const primaryBrand = context?.brands.owned[0] || context?.brands.managed[0] || null;

  return {
    // Raw context data
    context,
    isLoading,
    error,
    refetch,

    // Dashboard type detection
    dashboardType: context?.dashboard_type,
    isSuperAdmin,
    isBrandOwner,
    isStoreOwner,
    isStoreManager,
    isRegularUser,

    // Multi-entity flags
    hasMultipleStores,
    hasMultipleBrands,
    hasStoreSelector,
    hasBrandSelector,

    // Primary entities
    primaryStore,
    primaryBrand,
    stores: context?.stores || { owned: [], managed: [], all: [] },
    brands: context?.brands || { owned: [], managed: [] },

    // Team management helpers
    canManageStoreTeam: isStoreOwner || isSuperAdmin,
    canManageBrandTeam: isBrandOwner || isSuperAdmin,
  };
};

export default useUserContext;
