/**
 * Aggregated Data Hooks
 * These hooks fetch multiple related data in a single React Query call
 * Reduces number of API requests by batching related data
 */

import { useQuery, UseQueryOptions, keepPreviousData } from '@tanstack/react-query';
import { api } from '@/services/api';
import { logApiError } from '@/services/logger';

type QueryOptions = Omit<UseQueryOptions<unknown, Error, unknown, readonly unknown[]>, 'queryKey' | 'queryFn'>;

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

const getErrorMessage = (error: unknown): string => {
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
};

/**
 * Homepage Data - Fetch all homepage data in one call
 * Combines: products, brands, statistics
 * Reduces 2-3 requests → 1 request
 * 
 * Backend endpoint: GET /api/pages/home
 * Response: { products: Product[], brands: Brand[], stats: Stats }
 */
export const useHomepageData = (currency: string = 'UAH', options?: QueryOptions) => {
  return useQuery({
    queryKey: ['homepage-data', currency],
    queryFn: async () => {
      if (process.env.NODE_ENV === 'development') {
        console.log('[API] Fetching homepage data...');
      }
      try {
        const response = await api.get('/pages/home', { params: { currency } });
        if (process.env.NODE_ENV === 'development') {
          console.log('[API] Homepage data received');
        }
        
        // BFF returns: { success: true, data: { products, brands, statistics } }
        const apiData = response.data?.data || response.data;
        
        return {
          products: apiData.products || [],
          brands: apiData.brands || [],
          statistics: apiData.statistics || apiData.stats || { 
            total_products: 0, 
            total_stores: 0, 
            total_brands: 0 
          },
        };
      } catch (error) {
        // Check for rate limit error
        const status = (error as { response?: { status?: number } })?.response?.status;
        if (status === 429) {
          if (process.env.NODE_ENV === 'development') {
            console.log('[Homepage] Rate limited, returning empty data');
          }
          return {
            products: [],
            brands: [],
            statistics: { total_products: 0, total_stores: 0, total_brands: 0 },
          };
        }
        
        // Fallback to individual calls
        if (process.env.NODE_ENV === 'development') {
          console.log('[Homepage] Using fallback endpoints');
        }

        try {
          const [productsRes, statsRes] = await Promise.all([
            api.get('/products/popular', { params: { limit: 12, currency } }),
            api.get('/statistics').catch(() => ({ data: { total_products: 0, total_stores: 0, total_brands: 0 } })),
          ]);
          
          const productsData = productsRes.data;
          const statsData = statsRes.data;
          
          return {
            products: productsData.products || productsData || [],
            brands: [],
            statistics: statsData.stats || statsData || { total_products: 0, total_stores: 0, total_brands: 0 },
          };
        } catch (_error: unknown) {
          return {
            products: [],
            brands: [],
            statistics: { total_products: 0, total_stores: 0, total_brands: 0 },
          };
        }
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: false,
    ...options,
  });
};

/**
 * Products Page Data - Fetch all products page data in one call with filters
 * Combines: products, brands, pagination
 * Reduces 2-3 requests → 1 request
 * 
 * Backend endpoint (v1): GET /api/v1/pages/products
 * Response: { items: [...], meta: {...}, facets: {...} }
 */
interface ProductFilters {
  page?: number;
  limit?: number;
  search?: string;
  type?: string | string[];
  color?: string | string[];
  gender?: string | string[];
  brandId?: string | string[];
  minPrice?: string;
  maxPrice?: string;
  sort?: string;
  currency?: string;
}

type PaginationInfo = {
  page: number;
  totalPages: number;
  totalItems: number;
  hasNext: boolean;
  hasPrev: boolean;
  limit?: number;
  itemsPerPage?: number;
};

const asNumber = (value: unknown, fallback: number): number => {
  const num = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(num) ? num : fallback;
};

const buildV1ProductsParams = (filters: ProductFilters): URLSearchParams => {
  const params = new URLSearchParams();

  if (filters.page !== undefined) params.set('page', String(filters.page));
  if (filters.limit !== undefined) params.set('limit', String(filters.limit));

  if (filters.search) params.set('search', filters.search);
  if (filters.sort) params.set('sort', filters.sort);
  if (filters.minPrice) params.set('minPrice', filters.minPrice);
  if (filters.maxPrice) params.set('maxPrice', filters.maxPrice);
  if (filters.currency) params.set('currency', filters.currency);

  const appendMany = (key: string, value?: string | string[]) => {
    if (!value) return;
    if (Array.isArray(value)) {
      for (const v of value) {
        if (v !== undefined && v !== null && String(v).trim() !== '') params.append(key, String(v));
      }
      return;
    }
    if (String(value).trim() !== '') params.append(key, String(value));
  };

  appendMany('type', filters.type);
  appendMany('color', filters.color);
  appendMany('gender', filters.gender);
  appendMany('brandId', filters.brandId);

  return params;
};

export const useProductsPageData = (filters: ProductFilters = {}, options?: QueryOptions) => {
  return useQuery({
    queryKey: ['products-page-data', filters],
    queryFn: async () => {
      try {
        // BFF: GET /api/pages/products -> { success, data: { items, meta, facets } }
        const params = buildV1ProductsParams(filters);
        const response = await api.get('/pages/products', { params });

        const body: unknown = response.data?.data || response.data;
        const items = (getArray(body, 'items') ?? []);
        const meta = getRecord(body, 'meta') ?? {};
        const facets = getRecord(body, 'facets') ?? {};
        const currency = getRecord(body, 'currency');

        const page = asNumber(meta.page, filters.page ?? 1);
        const limit = asNumber(meta.limit, filters.limit ?? 24);
        const totalItems = asNumber(meta.totalItems, items.length);
        const totalPages = asNumber(meta.totalPages, Math.max(1, Math.ceil(totalItems / Math.max(1, limit))));
        const hasNext = typeof meta.hasNext === 'boolean' ? meta.hasNext : page < totalPages;
        const hasPrev = typeof meta.hasPrev === 'boolean' ? meta.hasPrev : page > 1;

        const pagination: PaginationInfo = { page, limit, totalItems, totalPages, hasNext, hasPrev };
        const facetsBrands = facets.brands;
        const brands = Array.isArray(facetsBrands) ? facetsBrands : [];

        return { products: items, brands, pagination, facets, currency };
      } catch (_error: unknown) {
        // Fallback to individual calls
        if (process.env.NODE_ENV !== 'production') {
          console.log('[Products Page] Using fallback endpoints');
        }
        
        const [productsRes, brandsRes] = await Promise.all([
          api.get('/items', { params: buildV1ProductsParams(filters) }),
          api.get('/brands').catch(() => ({ data: [] })),
        ]);

        const productsBody: unknown = productsRes.data;
        const items = (getArray(productsBody, 'items') ?? (Array.isArray(productsBody) ? productsBody : []));
        const meta = getRecord(productsBody, 'meta') ?? {};

        const page = asNumber(meta.page, filters.page ?? 1);
        const limit = asNumber(meta.limit, filters.limit ?? 24);
        const totalItems = asNumber(meta.totalItems, items.length);
        const totalPages = asNumber(meta.totalPages, Math.max(1, Math.ceil(totalItems / Math.max(1, limit))));
        const hasNext = typeof meta.hasNext === 'boolean' ? meta.hasNext : page < totalPages;
        const hasPrev = typeof meta.hasPrev === 'boolean' ? meta.hasPrev : page > 1;
        const pagination: PaginationInfo = { page, limit, totalItems, totalPages, hasNext, hasPrev };

        const brandsBody: unknown = brandsRes.data;
        const brands = (getArray(brandsBody, 'items') ?? getArray(brandsBody, 'brands') ?? (Array.isArray(brandsBody) ? brandsBody : []));

        return { products: items, brands, pagination };
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      // Retry on network errors, not on 4xx
      const status = (error as { response?: { status?: number } })?.response?.status;
      if (status && status >= 400 && status < 500) return false;
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    ...options,
  });
};

/**
 * Product Detail Data - Fetch all product detail data in one call
 * Combines: product, stores, brand, relatedProducts
 * Reduces 3-4 requests → 1 request
 * 
 * Backend endpoint (v1): GET /api/v1/pages/product/:id
 * Response: { item: { product, stores, brand, relatedProducts } }
 */
export const useProductDetailData = (productId: string, currency: string = 'UAH', options?: QueryOptions) => {
  const extractStoresArray = (storesBody: unknown): unknown[] => {
    return Array.isArray(storesBody)
      ? storesBody
      : (getArray(storesBody, 'stores') ?? getArray(storesBody, 'items') ?? getArray(storesBody, 'data') ?? []);
  };

  const fetchProductDetailFallback = async (productId: string) => {
    const productRes = await api.get(`/items/${productId}`, { params: { currency } });
    const productBody: unknown = productRes.data;
    const product = (isRecord(productBody) ? productBody.product : undefined) ?? productBody;

    const rawBrandId = isRecord(product) ? product.brand_id : undefined;
    const brandId = typeof rawBrandId === 'string' || typeof rawBrandId === 'number' ? String(rawBrandId) : '';

    const [storesRes, brandRes] = await Promise.all([
      api.get(`/items/${productId}/stores`),
      brandId
        ? api.get(`/brands/${brandId}`).catch(() => ({ data: null }))
        : Promise.resolve({ data: null }),
    ]);

    const storesBody: unknown = storesRes.data;
    const storesArray = extractStoresArray(storesBody);

    return {
      product: product ?? null,
      stores: storesArray,
      brand: (isRecord(brandRes.data) ? brandRes.data.data : undefined) ?? brandRes.data ?? null,
      relatedProducts: [],
    };
  };

  return useQuery({
    queryKey: ['product-detail-data', productId, currency],
    queryFn: async () => {
      if (!productId) throw new Error('Product ID is required');
      try {
        // v1 BFF: single call
        const response = await api.get(`/pages/product/${productId}`, { params: { currency } });
        const body: unknown = response.data;
        const item = getRecord(body, 'item') ?? {};

        return {
          product: item?.product ?? null,
          stores: Array.isArray(item?.stores) ? item.stores : [],
          brand: item?.brand ?? null,
          relatedProducts: Array.isArray(item?.relatedProducts) ? item.relatedProducts : [],
        };
      } catch {
        // Fallback to individual endpoints (keeps the app functional if the BFF isn't deployed yet)
        try {
          return await fetchProductDetailFallback(productId);
        } catch (fallbackError: unknown) {
          logApiError(fallbackError, `/pages/product/${productId}`, { component: 'useProductDetail' });
          throw fallbackError;
        }
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
 * Stores Page Data - Fetch stores list in one call (paginated)
 * 
 * Backend endpoint (v1): GET /api/v1/pages/stores?page&limit&search
 * Response: { items: [...], meta: {...} }
 */
export const useStoresPageData = (
  params?: { page?: number; limit?: number; search?: string },
  options?: QueryOptions
) => {
  return useQuery({
    queryKey: ['stores-page-data', params],
    placeholderData: keepPreviousData,
    queryFn: async () => {
      try {
        const query = new URLSearchParams();
        query.set('page', String(params?.page ?? 1));
        query.set('limit', String(params?.limit ?? 24));
        if (params?.search) query.set('search', params.search);

        const response = await api.get('/pages/stores', { params: query });
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
        return { stores: items, pagination };
      } catch (error: unknown) {
        console.warn('[Stores Page] v1 endpoint failed, using fallback /stores:', getErrorMessage(error));

        const response = await api.get('/stores');
        const body: unknown = response.data;
        const stores = getArray(body, 'items') ?? getArray(body, 'stores') ?? (Array.isArray(body) ? body : []);

        // Best-effort client-side search for fallback
        const search = params?.search?.trim();
        const filteredStores = search
          ? stores.filter((store: unknown) => {
              const name = isRecord(store) ? store.name : undefined;
              return typeof name === 'string' && name.toLowerCase().includes(search.toLowerCase());
            })
          : stores;

        return {
          stores: filteredStores,
          pagination: {
            page: 1,
            limit: filteredStores.length,
            totalItems: filteredStores.length,
            totalPages: 1,
            hasNext: false,
            hasPrev: false,
          },
        };
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
      // v1: GET /api/v1/admin/dashboard -> { products: {items, meta}, stores: {items, meta}, brands: {items, meta} }
      const response = await api.get('/admin/dashboard');
      return response.data;
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
  requests: Record<string, () => Promise<{ data: unknown }>>,
  options?: QueryOptions
) => {
  const requestKeys = Object.keys(requests).sort((a, b) => a.localeCompare(b)).join(',');
  
  return useQuery({
    queryKey: ['batched-requests', requestKeys],
    queryFn: async () => {
      const results = await Promise.all(
        Object.entries(requests).map(async ([key, requestFn]) => {
          try {
            const response = await requestFn();
            return [key, response.data];
          } catch (error: unknown) {
            logApiError(error, `batched-${key}`, { component: 'useBatchedData' });
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
