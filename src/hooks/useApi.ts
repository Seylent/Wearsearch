import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

// Get auth token
const getToken = () => localStorage.getItem('access_token');

// Configure axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use((response) => {
  if (response.data?.data) {
    return { ...response, data: response.data.data };
  }
  return response;
});

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
export const useProducts = () => {
  return useQuery({
    queryKey: queryKeys.products,
    queryFn: async () => {
      const response = await api.get('/items');
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
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
    staleTime: 10 * 60 * 1000, // 10 minutes
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
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: false, // Don't retry if endpoint doesn't exist
  });
};

// Favorites
export const useFavorites = () => {
  return useQuery({
    queryKey: queryKeys.favorites,
    queryFn: async () => {
      try {
        const response = await api.get('/user/favorites');
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          console.log('User not authenticated, returning empty favorites');
          return [];
        }
        throw error;
      }
    },
    enabled: !!getToken(),
    staleTime: 1 * 60 * 1000, // 1 minute
    retry: false, // Don't retry auth failures
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
    staleTime: 30 * 60 * 1000, // 30 minutes
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
