/**
 * React Query API Hooks
 * Centralized API hooks using React Query
 */

import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { api } from '@/services/api';
import { getAuth } from '@/utils/authStorage';
import type {
  Product,
  ProductsResponse,
  Store,
  StoresResponse,
  Brand,
  BrandsResponse,
  HeroImage,
  HeroImagesResponse,
  SiteStats,
  Favorite,
  FavoritesResponse,
} from '@/types';

// Query keys
export const queryKeys = {
  products: ['products'] as const,
  product: (id: string) => ['product', id] as const,
  relatedProducts: (id: string) => ['relatedProducts', id] as const,
  stores: ['stores'] as const,
  store: (id: string) => ['store', id] as const,
  brands: ['brands'] as const,
  brand: (id: string) => ['brand', id] as const,
  heroImages: ['heroImages'] as const,
  stats: ['stats'] as const,
  favorites: ['favorites'] as const,
  contacts: ['contacts'] as const,
  storeRatings: (storeId: string) => ['storeRatings', storeId] as const,
  userStoreRating: (userId: string, storeId: string) => ['userStoreRating', userId, storeId] as const,
  userRatings: (userId: string) => ['userRatings', userId] as const,
};

// Products
export const useProducts = (options?: UseQueryOptions<any>) => {
  return useQuery({
    queryKey: queryKeys.products,
    queryFn: async () => {
      const response = await api.get('/items');
      return response.data;
    },
    staleTime: 15 * 60 * 1000, // 15 minutes
    gcTime: 30 * 60 * 1000,
    ...options,
  });
};

export const useProduct = (id: string) => {
  return useQuery({
    queryKey: queryKeys.product(id),
    queryFn: async () => {
      const response = await api.get(`/items/${id}`);
      return response.data;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

// Related Products
export const useRelatedProducts = (productId: string) => {
  return useQuery({
    queryKey: queryKeys.relatedProducts(productId),
    queryFn: async () => {
      const response = await api.get(`/items/${productId}/related`);
      return response.data;
    },
    enabled: !!productId,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000,
  });
};

// Stores
export const useStores = () => {
  return useQuery({
    queryKey: queryKeys.stores,
    queryFn: async () => {
      const response = await api.get('/stores');
      return response.data;
    },
    staleTime: 15 * 60 * 1000, // 15 minutes
    gcTime: 30 * 60 * 1000,
  });
};

export const useStore = (id: string) => {
  return useQuery({
    queryKey: queryKeys.store(id),
    queryFn: async () => {
      const response = await api.get(`/stores/${id}`);
      return response.data;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

// Brands
export const useBrands = () => {
  return useQuery({
    queryKey: queryKeys.brands,
    queryFn: async () => {
      const response = await api.get('/brands');
      let brandsData = response.data;
      
      // Handle multiple response formats
      let brandsArray = [];
      if (Array.isArray(brandsData)) {
        brandsArray = brandsData;
      } else if (brandsData?.data?.brands && Array.isArray(brandsData.data.brands)) {
        brandsArray = brandsData.data.brands;
      } else if (brandsData?.brands && Array.isArray(brandsData.brands)) {
        brandsArray = brandsData.brands;
      } else if (brandsData?.data && Array.isArray(brandsData.data)) {
        brandsArray = brandsData.data;
      }
      
      return brandsArray;
    },
    staleTime: 15 * 60 * 1000, // 15 minutes
    gcTime: 30 * 60 * 1000,
  });
};

export const useBrand = (id: string) => {
  return useQuery({
    queryKey: queryKeys.brand(id),
    queryFn: async () => {
      const response = await api.get(`/brands/${id}`);
      return response.data;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

// Hero Images
export const useHeroImages = () => {
  return useQuery({
    queryKey: queryKeys.heroImages,
    queryFn: async () => {
      const response = await api.get('/hero-images');
      return response.data;
    },
    staleTime: 10 * 60 * 1000,
  });
};

// Stats
export const useStats = () => {
  return useQuery({
    queryKey: queryKeys.stats,
    queryFn: async () => {
      try {
        const response = await api.get('/statistics');
        const data = response.data;
        
        // Backend returns: { success: true, data: { total_products, total_stores, total_brands, satisfaction_rate } }
        if (data?.data) {
          return {
            products: data.data.total_products || 0,
            stores: data.data.total_stores || 0,
            brands: data.data.total_brands || 0,
            satisfaction_rate: data.data.satisfaction_rate || 0
          };
        }
        
        // Fallback for old format
        return {
          products: data?.products || data?.total_products || 0,
          stores: data?.stores || data?.total_stores || 0,
          brands: data?.brands || data?.total_brands || 0,
          satisfaction_rate: data?.satisfaction_rate || 0
        };
      } catch (error) {
        console.log('Stats endpoint not available, returning defaults');
        return { products: 0, stores: 0, brands: 0, satisfaction_rate: 0 };
      }
    },
    staleTime: 2 * 60 * 1000,
    retry: false,
  });
};

// Favorites
export const useFavorites = () => {
  return useQuery({
    queryKey: queryKeys.favorites,
    queryFn: async () => {
      try {
        const response = await api.get('/user/favorites');
        const data = response.data;
        
        // Backend returns: { favorites: [...], total: number }
        if (data?.favorites && Array.isArray(data.favorites)) {
          return data;
        } else if (Array.isArray(data)) {
          return { favorites: data, total: data.length };
        }
        
        return { favorites: [], total: 0 };
      } catch (error: any) {
        console.error('Favorites fetch error:', error);
        // Return empty array for auth errors or not found
        if (error?.response?.status === 401 || error?.response?.status === 404) {
          return { favorites: [], total: 0 };
        }
        throw error;
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 30 * 60 * 1000,
    retry: 1,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    // Only fetch if user is authenticated
    enabled: typeof window !== 'undefined' && !!getAuth(),
  });
};

// Store Ratings
export const useStoreRatings = (storeId: string, options?: UseQueryOptions<any>) => {
  return useQuery({
    queryKey: queryKeys.storeRatings(storeId),
    queryFn: async () => {
      const response = await api.get(`/ratings/store/${storeId}`);
      const data = response.data;
      
      // Backend returns: { success: true, data: [...], average: 4.5, count: 10 }
      if (data?.average !== undefined && data?.count !== undefined) {
        return { average: Number(data.average.toFixed(1)), count: data.count };
      } else if (data?.data && Array.isArray(data.data)) {
        // Fallback: calculate from ratings array
        const ratings = data.data.map((r: any) => r.rating);
        const avg = ratings.length > 0 
          ? ratings.reduce((sum: number, r: number) => sum + r, 0) / ratings.length 
          : 0;
        return { average: Number(avg.toFixed(1)), count: ratings.length };
      }
      return { average: 0, count: 0 };
    },
    staleTime: 10 * 60 * 1000,
    gcTime: 20 * 60 * 1000,
    enabled: !!storeId,
    ...options,
  });
};

export const useUserStoreRating = (userId: string | undefined, storeId: string) => {
  return useQuery({
    queryKey: queryKeys.userStoreRating(userId || '', storeId),
    queryFn: async () => {
      if (!userId) return null;
      
      try {
        const response = await api.get(`/ratings/user/${userId}/store/${storeId}`);
        const data = response.data;
        
        // Backend returns: { success: true, data: { rating, comment, ... } }
        if (data?.data && data.data.rating) {
          return data.data.rating;
        } else if (data && data.rating) {
          return data.rating;
        }
        return null;
      } catch (error: any) {
        // Backend returns 500 if multiple ratings exist - ignore
        if (error.response?.status === 500) {
          return null;
        }
        throw error;
      }
    },
    staleTime: 10 * 60 * 1000,
    gcTime: 20 * 60 * 1000,
    enabled: !!userId && !!storeId,
  });
};

// User Ratings
export const useUserRatings = (userId: string) => {
  return useQuery({
    queryKey: queryKeys.userRatings(userId),
    queryFn: async () => {
      const response = await api.get(`/ratings/user/${userId}`);
      const data = response.data;
      
      // Backend returns: { success: true, count: number, data: Rating[] }
      if (data?.data && Array.isArray(data.data)) {
        return data.data;
      } else if (Array.isArray(data)) {
        return data;
      }
      return [];
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    enabled: !!userId,
  });
};

// Delete Rating Mutation
export const useDeleteRating = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ ratingId, userId }: { ratingId: string; userId: string }) => {
      const response = await api.delete(`/ratings/${ratingId}`, { data: { user_id: userId } });
      return response.data;
    },
    onSuccess: (data, variables) => {
      // Invalidate user ratings to refresh the list
      queryClient.invalidateQueries({ queryKey: queryKeys.userRatings(variables.userId) });
      // Also invalidate store ratings if needed
      queryClient.invalidateQueries({ queryKey: ['storeRatings'] });
    },
  });
};

// Contacts
export const useContacts = () => {
  return useQuery({
    queryKey: queryKeys.contacts,
    queryFn: async () => {
      const response = await api.get('/contacts');
      return response.data;
    },
    staleTime: 30 * 60 * 1000,
  });
};

// Mutations
export const useAddFavorite = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (productId: string) => {
      const response = await api.post(`/user/favorites/${productId}`);
      return response.data;
    },
    onSuccess: () => {
      // Refetch favorites immediately
      queryClient.invalidateQueries({ queryKey: queryKeys.favorites, refetchType: 'active' });
    },
    onError: (error: any) => {
      console.error('Add favorite failed:', error.response?.data || error.message);
      throw error;
    },
  });
};

export const useRemoveFavorite = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (productId: string) => {
      const response = await api.delete(`/user/favorites/${productId}`);
      return response.data;
    },
    onSuccess: () => {
      // Refetch favorites immediately
      queryClient.invalidateQueries({ queryKey: queryKeys.favorites, refetchType: 'active' });
    },
    onError: (error: any) => {
      console.error('Remove favorite failed:', error.response?.data || error.message);
      throw error;
    },
  });
};

// Sync guest favorites after login
export const useSyncGuestFavorites = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (guestFavorites: string[]) => {
      const response = await api.post('/favorites/sync', { guestFavorites });
      return response.data;
    },
    onSuccess: (data) => {
      // Invalidate favorites cache to refresh with merged data
      queryClient.invalidateQueries({ queryKey: queryKeys.favorites, refetchType: 'active' });
      console.log(`✅ Synced ${data.added} favorites. Total: ${data.total}`);
      return data;
    },
    onError: (error: any) => {
      console.error('❌ Failed to sync guest favorites:', error.response?.data || error.message);
      throw error;
    },
  });
};

// Check if product is favorited (optional - can use useFavorites instead)
export const useCheckFavorite = (productId: string, enabled = true) => {
  return useQuery({
    queryKey: ['checkFavorite', productId],
    queryFn: async () => {
      try {
        const response = await api.get(`/user/favorites/${productId}/check`);
        return response.data;
      } catch (error) {
        return { is_favorited: false };
      }
    },
    enabled: enabled && !!productId && !!getAuth(),
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (productData: any) => {
      const response = await api.post('/admin/products', productData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products });
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await api.put(`/admin/products/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products });
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/admin/products/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products });
    },
  });
};
