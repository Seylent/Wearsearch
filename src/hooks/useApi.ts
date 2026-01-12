/**
 * React Query API Hooks
 * Centralized API hooks using React Query
 */

import { useQuery, useMutation, useQueryClient, UseQueryOptions, keepPreviousData } from '@tanstack/react-query';
import { api, apiLegacy } from '@/services/api';
import { getAuth } from '@/utils/authStorage';
import type {
  Product,
  Brand,
  FavoritesResponse,
} from '@/types';

// Helper type for optional query options
type QueryOptions = Omit<UseQueryOptions<unknown, Error, unknown, readonly unknown[]>, 'queryKey' | 'queryFn'>;

type PaginationInfo = {
  page: number;
  totalPages: number;
  totalItems: number;
  hasNext: boolean;
  hasPrev: boolean;
  limit?: number;
};

const asNumber = (value: unknown, fallback: number): number => {
  const num = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(num) ? num : fallback;
};

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null;

const getRecord = (value: unknown, key: string): Record<string, unknown> | undefined => {
  if (!isRecord(value)) return undefined;
  const nested = value[key];
  return isRecord(nested) ? nested : undefined;
};

const getArray = (value: unknown, key: string): unknown[] | undefined => {
  if (!isRecord(value)) return undefined;
  const nested = value[key];
  return Array.isArray(nested) ? nested : undefined;
};

const getErrorStatus = (error: unknown): number | undefined => {
  if (!isRecord(error)) return undefined;
  const response = error.response;
  return isRecord(response) && typeof response.status === 'number' ? response.status : undefined;
};

const formatErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message || 'Unknown error';
  if (typeof error === 'string') return error;
  if (error && typeof error === 'object') {
    try {
      return JSON.stringify(error);
    } catch {
      return 'Unknown error';
    }
  }
  return 'Unknown error';
}

// Query keys
export const queryKeys = {
  products: ['products'] as const,
  product: (id: string) => ['product', id] as const,
  productStores: (id: string) => ['productStores', id] as const,
  relatedProducts: (id: string) => ['relatedProducts', id] as const,
  stores: ['stores'] as const,
  store: (id: string) => ['store', id] as const,
  brands: ['brands'] as const,
  brand: (id: string) => ['brand', id] as const,
  stats: ['stats'] as const,
  favorites: ['favorites'] as const,
  contacts: ['contacts'] as const,
};

// Products
export const useProducts = (options?: QueryOptions) => {
  return useQuery({
    queryKey: queryKeys.products,
    queryFn: async () => {
      // v1 canonical lists are paginated; fetch first (max) page for general UI usage
      const response = await api.get('/items', { params: { page: 1, limit: 100 } });
      const body: unknown = response.data;
      const items = getArray(body, 'items');
      const products = getArray(body, 'products');
      if (items) return items as Product[];
      if (Array.isArray(body)) return body as Product[];
      if (products) return products as Product[];
      return [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (renamed from cacheTime)
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
      const body: unknown = response.data;
      if (!isRecord(body)) return body;
      return body.item ?? body.product ?? body;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

// Product Stores
export const useProductStores = (productId: string, options?: QueryOptions) => {
  return useQuery({
    queryKey: queryKeys.productStores(productId),
    queryFn: async () => {
      const response = await api.get(`/items/${productId}/stores`);
      const body: unknown = response.data;
      const items = getArray(body, 'items');
      const stores = getArray(body, 'stores');
      if (items) return items;
      if (stores) return stores;
      if (Array.isArray(body)) return body;
      return [];
    },
    enabled: !!productId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    ...options,
  });
};

// Related Products
export const useRelatedProducts = (productId: string) => {
  return useQuery({
    queryKey: queryKeys.relatedProducts(productId),
    queryFn: async () => {
      // Canonical: related products come from the aggregated v1 endpoint.
      const response = await api.get(`/pages/product/${productId}`);
      const body: unknown = response.data;
      const related = getRecord(body, 'item')?.relatedProducts;
      return Array.isArray(related) ? related : [];
    },
    enabled: !!productId,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000,
  });
};

// Stores
export const useStores = (options?: QueryOptions) => {
  return useQuery({
    queryKey: queryKeys.stores,
    queryFn: async () => {
      const response = await api.get('/stores');
      const body: unknown = response.data;
      const items = getArray(body, 'items');
      const stores = getArray(body, 'stores');
      if (items) return items;
      if (stores) return stores;
      if (Array.isArray(body)) return body;
      return [];
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    ...options,
  });
};

export const useStoreProducts = (
  storeId: string, 
  params?: { category?: string; page?: number; limit?: number },
  options?: QueryOptions
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

      const body: unknown = response.data;
      const itemsFromItems = getArray(body, 'items');
      const itemsFromProducts = getArray(body, 'products');
      const items = itemsFromItems ?? itemsFromProducts ?? (Array.isArray(body) ? body : []);

      const store = (isRecord(body) ? body.store : undefined) ?? getRecord(body, 'data')?.store ?? null;

      const meta = getRecord(body, 'meta') ?? {};
      const page = asNumber(meta.page, params?.page ?? 1);
      const limit = asNumber(meta.limit, params?.limit ?? 24);
      const totalItems = asNumber(meta.totalItems, items.length);
      const totalPages = asNumber(meta.totalPages, Math.max(1, Math.ceil(totalItems / Math.max(1, limit))));
      const hasNext = typeof meta.hasNext === 'boolean' ? meta.hasNext : page < totalPages;
      const hasPrev = typeof meta.hasPrev === 'boolean' ? meta.hasPrev : page > 1;

      const pagination: PaginationInfo = { page, limit, totalItems, totalPages, hasNext, hasPrev };
      return { products: items, pagination, store };
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
export const useBrands = (options?: QueryOptions) => {
  return useQuery({
    queryKey: queryKeys.brands,
    queryFn: async () => {
      const response = await api.get('/brands');
      const body: unknown = response.data;
      const items = getArray(body, 'items');
      const brands = getArray(body, 'brands');
      if (items) return items;
      if (Array.isArray(body)) return body;
      if (brands) return brands;
      return [];
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    ...options,
  });
};

export const useProductsByIds = (ids: Array<string | number>, options?: QueryOptions) => {
  const normalizedIds = (ids || []).map(String).filter(Boolean);

  return useQuery({
    queryKey: ['products-by-ids', normalizedIds],
    queryFn: async () => {
      const uniqueIds = Array.from(new Set(normalizedIds));
      const results = await Promise.all(
        uniqueIds.map(async (id) => {
          const res = await api.get(`/items/${id}`);
          const body: unknown = res.data;
          if (!isRecord(body)) return body;
          return body.product ?? body;
        })
      );
      return results;
    },
    enabled: normalizedIds.length > 0,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    ...options,
  });
};

export const useBrand = (id: string, options?: QueryOptions) => {
  return useQuery({
    queryKey: queryKeys.brand(id),
    queryFn: async () => {
      const response = await api.get(`/brands/${id}`);
      return response.data;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

// Brand mutations (Admin)
export const useCreateBrand = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (brandData: Partial<Brand>) => {
      const response = await api.post('/brands', brandData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.brands });
    },
  });
};

export const useUpdateBrand = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Brand> }) => {
      const response = await api.put(`/brands/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.brands });
    },
  });
};

export const useDeleteBrand = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/brands/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.brands });
    },
  });
};

// Stats
export const useStats = () => {
  return useQuery({
    queryKey: queryKeys.stats,
    queryFn: async () => {
      try {
        // Canonical v1: stats are part of /pages/home response.
        const response = await api.get('/pages/home');
        const body: unknown = response.data;
        const item = getRecord(body, 'item') ?? getRecord(body, 'data') ?? (isRecord(body) ? body : undefined);
        const statistics = item && isRecord(item.statistics) ? item.statistics : {};

        return {
          products: statistics.total_products || 0,
          stores: statistics.total_stores || 0,
          brands: statistics.total_brands || 0,
          satisfaction_rate: statistics.satisfaction_rate || 0,
          total_reviews: statistics.total_reviews || 0,
        };
      } catch {
        console.log('Stats endpoint not available, returning defaults');
        return { products: 0, stores: 0, brands: 0, satisfaction_rate: 0, total_reviews: 0 };
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
        // Canonical v1: favorites come from an aggregated page endpoint.
        // This endpoint requires auth; keep it lightweight (first page, larger limit).
        const response = await api.get('/pages/favorites', { params: { page: 1, limit: 100 } });
        const body: unknown = response.data;
        const items = (getArray(body, 'items') ?? []);
        const meta = getRecord(body, 'meta');
        const total = typeof meta?.totalItems === 'number' ? meta.totalItems : items.length;

        // NOTE: items are Products; FavoritesContext can check by fav.id.
        return { favorites: items, total };
      } catch (error: unknown) {
        // Return empty array for auth errors, not found, or rate limit
        const status = getErrorStatus(error);
        if (status === 401 || status === 404 || status === 429) {
          if (process.env.NODE_ENV !== 'production' && status === 429) {
            console.log('⏳ Favorites: Rate limited, will retry later');
          }
          return { favorites: [], total: 0 };
        }
        console.error('Favorites fetch error:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - increased from 2
    gcTime: 30 * 60 * 1000,
    retry: false, // Don't retry - rate limit handled in API layer
    refetchOnMount: false, // Don't refetch on mount to reduce requests
    refetchOnWindowFocus: false, // Don't refetch on tab focus
    refetchOnReconnect: false,
    // Only fetch if user is authenticated
    enabled: globalThis.window !== undefined && !!getAuth(),
  });
};

export const useFavoritesPage = (
  params?: { page?: number; limit?: number },
  options?: QueryOptions
) => {
  return useQuery({
    queryKey: ['favorites-page', params],
    placeholderData: keepPreviousData,
    queryFn: async () => {
      const query = new URLSearchParams();
      query.set('page', String(params?.page ?? 1));
      query.set('limit', String(params?.limit ?? 24));

      const response = await api.get('/pages/favorites', { params: query });
      const body: unknown = response.data;
      const items = (getArray(body, 'items') ?? []);
      const meta = getRecord(body, 'meta') ?? {};

      const page = asNumber(meta.page, params?.page ?? 1);
      const limit = asNumber(meta.limit, params?.limit ?? 24);
      const totalItems = asNumber(meta.totalItems, items.length);
      const totalPages = asNumber(meta.totalPages, Math.max(1, Math.ceil(totalItems / Math.max(1, limit))));
      const hasNext = typeof meta.hasNext === 'boolean' ? meta.hasNext : page < totalPages;
      const hasPrev = typeof meta.hasPrev === 'boolean' ? meta.hasPrev : page > 1;

      const pagination: PaginationInfo = { page, limit, totalItems, totalPages, hasNext, hasPrev };
      return { items, meta, pagination };
    },
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    enabled: globalThis.window !== undefined && !!getAuth(),
    ...options,
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
      // v1 favorites CRUD isn't implemented yet in backend; use explicit legacy endpoint.
      const response = await apiLegacy.post(`/user/favorites/${productId}`);
      return response.data;
    },
    // Optimistic update
    onMutate: async (productId: string) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.favorites });
      
      // Snapshot current value
      const previousFavorites = queryClient.getQueryData(queryKeys.favorites);
      
      // Optimistically update
      queryClient.setQueryData(queryKeys.favorites, (old: FavoritesResponse | undefined) => {
        if (!old) return old;
        
        return {
          ...old,
          favorites: [
            ...(old.favorites || []),
            {
              id: `temp-${Date.now()}`,
              product_id: productId,
              user_id: 'current',
              created_at: new Date().toISOString(),
            },
          ],
        };
      });
      
      return { previousFavorites };
    },
    // Rollback on error
    onError: (error, variables, context) => {
      if (context?.previousFavorites) {
        queryClient.setQueryData(queryKeys.favorites, context.previousFavorites);
      }
      console.error('Add favorite failed:', error);
    },
    // Sync with server on success
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.favorites, refetchType: 'active' });
    },
  });
};

export const useRemoveFavorite = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (productId: string) => {
      // v1 favorites CRUD isn't implemented yet in backend; use explicit legacy endpoint.
      const response = await apiLegacy.delete(`/user/favorites/${productId}`);
      return response.data;
    },
    // Optimistic update
    onMutate: async (productId: string) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.favorites });
      
      // Snapshot current value
      const previousFavorites = queryClient.getQueryData(queryKeys.favorites);
      
      // Optimistically remove from cache
      queryClient.setQueryData(queryKeys.favorites, (old: FavoritesResponse | undefined) => {
        if (!old) return old;
        
        return {
          ...old,
          favorites: (old.favorites || []).filter((fav) => fav.product_id !== productId),
        };
      });
      
      return { previousFavorites };
    },
    // Rollback on error
    onError: (error, variables, context) => {
      if (context?.previousFavorites) {
        queryClient.setQueryData(queryKeys.favorites, context.previousFavorites);
      }
      console.error('Remove favorite failed:', error);
    },
    // Sync with server on success
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.favorites, refetchType: 'active' });
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
    onError: (error: unknown) => {
      const isRec = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null;
      const response = isRec(error) ? error.response : undefined;
      const responseData = isRec(response) ? response.data : undefined;
      const message = formatErrorMessage(error);
      console.error('❌ Failed to sync guest favorites:', responseData ?? message);
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
      } catch {
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
    mutationFn: async (productData: unknown) => {
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
    mutationFn: async ({ id, data }: { id: string; data: unknown }) => {
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
