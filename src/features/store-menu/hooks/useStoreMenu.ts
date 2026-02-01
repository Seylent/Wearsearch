/**
 * Store Menu API Hooks
 * TanStack Query hooks for store menu API integration
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/services/api';
import type {
  DashboardData,
  StoreProduct,
  SiteProduct,
  Manager,
  StoreSettings,
  CreateProductData,
  AddExistingProductData,
  ApiResponse,
  PaginationMeta,
  UserStore,
  UserContextResponse,
} from '../types';

const BASE_URL = '/store-menu';

// Query keys
export const storeMenuKeys = {
  all: ['store-menu'] as const,
  userContext: ['user-context'] as const,
  stores: ['store-menu', 'stores'] as const,
  dashboard: (storeId: string) => [...storeMenuKeys.all, 'dashboard', storeId] as const,
  products: (storeId: string, filters?: Record<string, unknown>) =>
    [...storeMenuKeys.all, 'products', storeId, filters] as const,
  siteProducts: (storeId: string, filters?: Record<string, unknown>) =>
    [...storeMenuKeys.all, 'site-products', storeId, filters] as const,
  managers: (storeId: string) => [...storeMenuKeys.all, 'managers', storeId] as const,
  settings: (storeId: string) => [...storeMenuKeys.all, 'settings', storeId] as const,
};

// User Context - Get user's stores
export function useUserContext() {
  return useQuery({
    queryKey: storeMenuKeys.stores,
    queryFn: async () => {
      const response = await api.get<ApiResponse<UserStore[]>>(`${BASE_URL}/stores`);
      const payload = response.data as ApiResponse<UserStore[]> | UserStore[];
      const stores = Array.isArray(payload) ? payload : (payload.data ?? payload.items ?? []);
      return { stores } as UserContextResponse;
    },
  });
}

// Dashboard
export function useStoreDashboard(storeId: string) {
  return useQuery({
    queryKey: storeMenuKeys.dashboard(storeId),
    queryFn: async () => {
      const response = await api.get<ApiResponse<DashboardData>>(
        `${BASE_URL}/dashboard?store_id=${storeId}`
      );
      const fallbackStore: DashboardData['store'] = {
        id: '',
        name: '',
        logo_url: '',
        access_type: 'owner',
        is_verified: false,
        is_recommended: false,
      };

      return (
        response.data.data ?? {
          store: fallbackStore,
          stats: { total_products: 0, total_managers: 0 },
          recent_products: [],
        }
      );
    },
    enabled: !!storeId,
  });
}

// My Products
interface StoreProductsResponse {
  items: StoreProduct[];
  meta: PaginationMeta;
}

export function useStoreProducts(
  storeId: string,
  page: number = 1,
  limit: number = 25,
  search?: string,
  category?: string,
  sortBy: 'date' | 'price' | 'name' = 'date'
) {
  return useQuery<StoreProductsResponse>({
    queryKey: storeMenuKeys.products(storeId, { page, limit, search, category, sortBy }),
    queryFn: async () => {
      const params = new URLSearchParams({
        store_id: storeId,
        page: page.toString(),
        limit: limit.toString(),
        sort: sortBy,
      });
      if (search) params.append('search', search);
      if (category) params.append('category', category);

      const response = await api.get<ApiResponse<StoreProduct[]>>(
        `${BASE_URL}/products/my?${params.toString()}`
      );
      const items = (response.data.items || []) as unknown as StoreProduct[];
      return {
        items,
        meta: response.data.meta ?? { page: 1, limit: 25, totalItems: 0, totalPages: 0 },
      };
    },
    enabled: !!storeId,
  });
}

// Site Products (All products on site)
interface SiteProductsResponse {
  items: SiteProduct[];
  meta: PaginationMeta;
}

export function useSiteProducts(
  storeId: string,
  page: number = 1,
  search?: string,
  category?: string,
  brand?: string
) {
  const limit = 25;
  return useQuery<SiteProductsResponse>({
    queryKey: storeMenuKeys.siteProducts(storeId, { page, search, category, brand }),
    queryFn: async () => {
      const params = new URLSearchParams({
        store_id: storeId,
        page: page.toString(),
        limit: limit.toString(),
      });
      if (search) params.append('search', search);
      if (category) params.append('category', category);
      if (brand) params.append('brand', brand);

      const response = await api.get<ApiResponse<SiteProduct[]>>(
        `${BASE_URL}/products/all?${params.toString()}`
      );
      const items = (response.data.items || []) as unknown as SiteProduct[];
      return {
        items,
        meta: response.data.meta ?? { page: 1, limit: 25, totalItems: 0, totalPages: 0 },
      };
    },
    enabled: !!storeId,
  });
}

// Delete product from store
export function useDeleteStoreProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ storeId, productId }: { storeId: string; productId: string }) => {
      const response = await api.delete<ApiResponse<void>>(
        `${BASE_URL}/products/${productId}?store_id=${storeId}`
      );
      return response.data;
    },
    onSuccess: (_, { storeId }) => {
      queryClient.invalidateQueries({ queryKey: storeMenuKeys.products(storeId) });
      queryClient.invalidateQueries({ queryKey: storeMenuKeys.dashboard(storeId) });
    },
  });
}

// Create new product
export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ storeId, data }: { storeId: string; data: CreateProductData }) => {
      const { store_price, ...rest } = data as CreateProductData & {
        store_price?: number;
        price?: number;
      };
      const response = await api.post<ApiResponse<StoreProduct>>(`${BASE_URL}/products`, {
        store_id: storeId,
        ...rest,
        price: rest.price ?? store_price,
      });
      return response.data;
    },
    onSuccess: (_, { storeId }) => {
      queryClient.invalidateQueries({ queryKey: storeMenuKeys.products(storeId) });
      queryClient.invalidateQueries({ queryKey: storeMenuKeys.dashboard(storeId) });
    },
  });
}

// Add existing product to store
export function useAddExistingProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ storeId, data }: { storeId: string; data: AddExistingProductData }) => {
      const { store_price, ...rest } = data as AddExistingProductData & {
        store_price?: number;
        price?: number;
      };
      const response = await api.post<ApiResponse<StoreProduct>>(`${BASE_URL}/products`, {
        store_id: storeId,
        ...rest,
        price: rest.price ?? store_price,
      });
      return response.data;
    },
    onSuccess: (_, { storeId }) => {
      queryClient.invalidateQueries({ queryKey: storeMenuKeys.products(storeId) });
      queryClient.invalidateQueries({ queryKey: storeMenuKeys.siteProducts(storeId) });
      queryClient.invalidateQueries({ queryKey: storeMenuKeys.dashboard(storeId) });
    },
  });
}

// Managers
interface ManagersResponse {
  items: Manager[];
}

export function useStoreManagers(storeId: string) {
  return useQuery<ManagersResponse>({
    queryKey: storeMenuKeys.managers(storeId),
    queryFn: async () => {
      const response = await api.get<ApiResponse<Manager[]>>(
        `${BASE_URL}/managers?store_id=${storeId}`
      );
      const items = (response.data.items || []) as unknown as Manager[];
      return { items };
    },
    enabled: !!storeId,
  });
}

// Add manager
export function useAddManager() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ storeId, email }: { storeId: string; email: string }) => {
      const response = await api.post<ApiResponse<Manager>>(
        `${BASE_URL}/managers?store_id=${storeId}`,
        { email }
      );
      return response.data;
    },
    onSuccess: (_, { storeId }) => {
      queryClient.invalidateQueries({ queryKey: storeMenuKeys.managers(storeId) });
      queryClient.invalidateQueries({ queryKey: storeMenuKeys.dashboard(storeId) });
    },
  });
}

// Remove manager
export function useRemoveManager() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ storeId, userId }: { storeId: string; userId: string }) => {
      const response = await api.delete<ApiResponse<void>>(
        `${BASE_URL}/managers/${userId}?store_id=${storeId}`
      );
      return response.data;
    },
    onSuccess: (_, { storeId }) => {
      queryClient.invalidateQueries({ queryKey: storeMenuKeys.managers(storeId) });
      queryClient.invalidateQueries({ queryKey: storeMenuKeys.dashboard(storeId) });
    },
  });
}

// Store Settings
export function useStoreSettings(storeId: string) {
  return useQuery({
    queryKey: storeMenuKeys.settings(storeId),
    queryFn: async () => {
      const response = await api.get<ApiResponse<StoreSettings>>(
        `${BASE_URL}/store?store_id=${storeId}`
      );
      const payload = response.data as
        | ApiResponse<StoreSettings>
        | StoreSettings
        | { store?: StoreSettings }
        | { data?: StoreSettings | { store?: StoreSettings } };
      const dataLayer =
        payload && typeof payload === 'object' && 'data' in payload ? payload.data : payload;
      const storeSettings =
        dataLayer && typeof dataLayer === 'object' && 'store' in dataLayer
          ? dataLayer.store
          : (dataLayer as StoreSettings | undefined);
      const safeSettings = storeSettings ?? { name: '', logo_url: '' };
      return safeSettings;
    },
    enabled: !!storeId,
  });
}

// Update store settings
export function useUpdateStoreSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ storeId, data }: { storeId: string; data: StoreSettings }) => {
      const response = await api.put<ApiResponse<StoreSettings>>(
        `${BASE_URL}/store?store_id=${storeId}`,
        data
      );
      return response.data;
    },
    onSuccess: (_, { storeId }) => {
      queryClient.invalidateQueries({ queryKey: storeMenuKeys.settings(storeId) });
      queryClient.invalidateQueries({ queryKey: storeMenuKeys.dashboard(storeId) });
    },
  });
}
