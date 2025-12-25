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
};

// Products
export const useProducts = (options?: UseQueryOptions<any>) => {
  return useQuery({
    queryKey: queryKeys.products,
    queryFn: async () => {
      const response = await api.get('/items');
      console.log('🔍 API Response from /items:', {
        firstProduct: response.data?.[0] || response.data?.data?.[0] || response.data?.products?.[0],
        structure: Array.isArray(response.data) ? 'array' : typeof response.data
      });
      return response.data;
    },
    staleTime: 30 * 60 * 1000, // 30 minutes - increased to reduce refetches
    gcTime: 60 * 60 * 1000, // 1 hour
    refetchOnWindowFocus: false, // Don't refetch on tab focus
    refetchOnMount: false, // Use cache if available
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
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
};

export const useStoreProducts = (
  storeId: string, 
  params?: { category?: string; page?: number; limit?: number },
  options?: UseQueryOptions<any>
) => {
  return useQuery({
    queryKey: ['storeProducts', storeId, params],
    queryFn: async () => {
      const response = await api.get(`/stores/${storeId}/products`, {
        params: {
          ...(params?.category && { category: params.category }),
          ...(params?.page && { page: params.page }),
          ...(params?.limit && { limit: params.limit }),
        },
      });
      return response.data;
    },
    enabled: !!storeId,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    ...options,
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
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
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
    staleTime: 60 * 60 * 1000, // 1 hour - hero images rarely change
    gcTime: 2 * 60 * 60 * 1000, // 2 hours
    refetchOnWindowFocus: false,
    refetchOnMount: false,
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
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
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
    staleTime: 5 * 60 * 1000, // 5 minutes - increased from 2
    gcTime: 30 * 60 * 1000,
    retry: 1,
    refetchOnMount: true,
    refetchOnWindowFocus: false, // Don't refetch on tab focus
    refetchOnReconnect: false,
    // Only fetch if user is authenticated
    enabled: typeof window !== 'undefined' && !!getAuth(),
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
