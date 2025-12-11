/**
 * React Query API Hooks
 * Centralized API hooks using React Query
 */

import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { api } from '@/services/api';
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
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
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

// Stores
export const useStores = () => {
  return useQuery({
    queryKey: queryKeys.stores,
    queryFn: async () => {
      const response = await api.get('/stores');
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
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
    staleTime: 5 * 60 * 1000,
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
        const response = await api.get('/stats');
        return response.data;
      } catch (error) {
        console.log('Stats endpoint not available, returning defaults');
        return { brands: 0, products: 0, stores: 0 };
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
        
        // Normalize response to always have favorites array
        if (Array.isArray(data)) {
          return { favorites: data };
        } else if (data?.favorites && Array.isArray(data.favorites)) {
          return data;
        } else if (data?.data && Array.isArray(data.data)) {
          return { favorites: data.data };
        }
        
        return { favorites: [] };
      } catch (error: any) {
        if (error?.response?.status === 401 || error?.response?.status === 404) {
          console.log('User not authenticated or no favorites, returning empty');
          return { favorites: [] };
        }
        throw error;
      }
    },
    staleTime: 1 * 60 * 1000,
    retry: false,
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
      const response = await api.post('/user/favorites', { productId });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.favorites });
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
      queryClient.invalidateQueries({ queryKey: queryKeys.favorites });
    },
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
