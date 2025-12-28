/**
 * Aggregated Data Hooks
 * These hooks fetch multiple related data in a single React Query call
 * Reduces number of API requests by batching related data
 */

import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { api } from '@/services/api';

type QueryOptions = Omit<UseQueryOptions<any, Error, any, any>, 'queryKey' | 'queryFn'>;

/**
 * Homepage Data - Fetch all homepage data in one call
 * Combines: products, brands, statistics
 * Reduces 2-3 requests → 1 request
 * 
 * Backend endpoint: GET /api/pages/home (with fallback)
 * Response: { success: true, data: { products: [...], brands: [...], statistics: {...} } }
 */
export const useHomepageData = (options?: QueryOptions) => {
  return useQuery({
    queryKey: ['homepage-data'],
    queryFn: async () => {
      console.log('[API] Fetching homepage data...');
      try {
        const response = await api.get('/pages/home');
        console.log('[API] Homepage data received');
        // Backend returns { success: true, data: {...} }
        return response.data?.data || response.data;
      } catch (error: any) {
        // Fallback to individual calls
        console.warn('[Homepage] Aggregated endpoint failed, using fallback:', error.message);
        
        const [productsRes, statsRes] = await Promise.all([
          api.get('/items?limit=6'),
          api.get('/statistics').catch(() => ({ data: { data: { total_products: 0, total_stores: 0, total_brands: 0 } } })),
        ]);
        
        return {
          products: productsRes.data?.products || productsRes.data || [],
          brands: [], // Not critical for homepage
          statistics: statsRes.data?.data || statsRes.data || { total_products: 0, total_stores: 0, total_brands: 0 },
        };
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 1,
    ...options,
  });
};

/**
 * Products Page Data - Fetch all products page data in one call with filters
 * Combines: products, brands, pagination
 * Reduces 2-3 requests → 1 request
 * 
 * Backend endpoint: GET /api/pages/products
 * Response: { success: true, data: { products: [...], brands: [...], pagination: {...} } }
 */
interface ProductFilters {
  page?: number;
  limit?: number;
  search?: string;
  type?: string;
  color?: string;
  gender?: string;
  brand_id?: string;
  min_price?: string;
  max_price?: string;
  sort?: string;
}

export const useProductsPageData = (filters: ProductFilters = {}, options?: QueryOptions) => {
  return useQuery({
    queryKey: ['products-page-data', filters],
    queryFn: async () => {
      try {
        // Try new aggregated endpoint first
        const params = new URLSearchParams(
          Object.entries(filters).reduce((acc, [key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
              acc[key] = String(value);
            }
            return acc;
          }, {} as Record<string, string>)
        );
        
        const url = `/pages/products${params.toString() ? `?${params}` : ''}`;
        const response = await api.get(url);
        
        // Backend returns { success: true, data: {...} }
        return response.data?.data || response.data;
      } catch (error: any) {
        // Fallback to individual calls
        console.warn('[Products Page] Aggregated endpoint failed, using fallback:', error.message);
        
        const [productsRes, brandsRes] = await Promise.all([
          api.get('/items'),
          api.get('/brands').catch(() => ({ data: [] })),
        ]);
        
        return {
          products: productsRes.data?.products || productsRes.data || [],
          brands: brandsRes.data || [],
          pagination: {
            page: 1,
            totalPages: 1,
            totalItems: (productsRes.data?.products || productsRes.data || []).length,
            hasNext: false,
            hasPrev: false,
          },
        };
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
    ...options,
  });
};

/**
 * Product Detail Data - Fetch all product detail data in one call
 * Combines: product, stores, brand, relatedProducts
 * Reduces 3-4 requests → 1 request
 * 
 * Backend endpoint: GET /api/pages/product/:id (with fallback to individual calls)
 * Response: { success: true, data: { product: {...}, stores: [...], brand: {...}, relatedProducts: [...] } }
 */
export const useProductDetailData = (productId: string, options?: QueryOptions) => {
  return useQuery({
    queryKey: ['product-detail-data', productId],
    queryFn: async () => {
      if (!productId) throw new Error('Product ID is required');
      
      // TEMPORARY FIX: Always use individual endpoints because aggregated endpoint returns empty stores
      // TODO: Remove this once backend fixes /api/pages/product/:id to include stores
      
      try {
        // Fetch product first
        const productRes = await api.get(`/items/${productId}`);
        const product = productRes.data?.product || productRes.data;
        
        // Then fetch stores and brand in parallel
        const [storesRes, brandRes] = await Promise.all([
          api.get(`/items/${productId}/stores`),
          product?.brand_id 
            ? api.get(`/brands/${product.brand_id}`).catch((e) => {
                console.warn('Failed to fetch brand:', e.message);
                return { data: null };
              })
            : Promise.resolve({ data: null }),
        ]);
        
        // Extract stores - handle different response formats
        let storesArray = [];
        if (Array.isArray(storesRes.data)) {
          storesArray = storesRes.data;
        } else if (storesRes.data?.stores && Array.isArray(storesRes.data.stores)) {
          storesArray = storesRes.data.stores;
        } else if (storesRes.data?.data && Array.isArray(storesRes.data.data)) {
          storesArray = storesRes.data.data;
        }
        
        console.log('[Product Detail] Using individual endpoints - stores:', storesArray.length);
        
        return {
          product,
          stores: storesArray,
          brand: brandRes.data?.data || brandRes.data || null,
          relatedProducts: [],
        };
      } catch (error: any) {
        console.error('[Product Detail] Failed to fetch product details:', error.message);
        throw error;
      }
    },
    enabled: !!productId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000,
    retry: 1, // Reduced since we have fallback
    ...options,
  });
};

/**
 * Stores Page Data - Fetch all stores page data in one call
 * Combines: stores with product counts
 * Reduces 1-2 requests → 1 request
 * 
 * Backend endpoint: GET /api/pages/stores (with fallback to /api/stores)
 * Response: { success: true, data: { stores: [...with product_count, brand_count...] } }
 */
export const useStoresPageData = (search?: string, options?: QueryOptions) => {
  return useQuery({
    queryKey: ['stores-page-data', search],
    queryFn: async () => {
      try {
        // Try new aggregated endpoint first
        const params = search ? `?search=${encodeURIComponent(search)}` : '';
        const response = await api.get(`/pages/stores${params}`);
        
        // Backend returns { success: true, data: {...} }
        return response.data?.data || response.data;
      } catch (error: any) {
        // Fallback to old endpoint if new one fails
        console.warn('[Stores Page] Aggregated endpoint failed, using fallback /api/stores:', error.message);
        
        const response = await api.get('/stores');
        const stores = Array.isArray(response.data) ? response.data : response.data?.stores || [];
        
        // Apply client-side search if needed
        const filteredStores = search 
          ? stores.filter((store: any) => 
              store.name?.toLowerCase().includes(search.toLowerCase())
            )
          : stores;
        
        return { stores: filteredStores };
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 60 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1, // Reduced to 1 since we have fallback
    ...options,
  });
};

/**
 * Admin Dashboard Data - Fetch all admin dashboard data in one call
 * Combines: products, stores, brands
 * Reduces 3 requests → 1 request
 * 
 * Note: If backend implements this endpoint, update Admin.tsx to use this hook
 * Backend endpoint: GET /api/admin/dashboard
 * Response: { success: true, data: { products: [...], stores: [...], brands: [...] } }
 */
export const useAdminDashboardData = (options?: QueryOptions) => {
  return useQuery({
    queryKey: ['admin-dashboard-data'],
    queryFn: async () => {
      const response = await api.get('/admin/dashboard');
      
      // Backend returns { success: true, data: {...} }
      return response.data?.data || response.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 2,
    ...options,
  });
};

/**
 * Batch API Requests - Generic utility for batching multiple API calls
 * Use this when you need custom combinations of data
 * 
 * @example
 * const { data, isLoading } = useBatchedRequests({
 *   products: () => api.get('/items'),
 *   brands: () => api.get('/brands'),
 *   custom: () => api.get('/custom-endpoint'),
 * });
 */
export const useBatchedRequests = (
  requests: Record<string, () => Promise<any>>,
  options?: QueryOptions
) => {
  const requestKeys = Object.keys(requests).sort().join(',');
  
  return useQuery({
    queryKey: ['batched-requests', requestKeys],
    queryFn: async () => {
      const results = await Promise.all(
        Object.entries(requests).map(async ([key, requestFn]) => {
          try {
            const response = await requestFn();
            return [key, response.data];
          } catch (error) {
            console.error(`[Batched Request] Failed to fetch ${key}:`, error);
            return [key, null];
          }
        })
      );
      
      return Object.fromEntries(results);
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    ...options,
  });
};
