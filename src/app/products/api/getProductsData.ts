/**
 * Server-side data fetching for Products
 */
import type { Product } from '@/types';
import { fetchBackendJson } from '@/lib/backendFetch';
import { logError, logWarn } from '@/services/logger';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

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

const toNumber = (value: unknown, fallback: number): number => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
};

export interface ProductsAPIResponse {
  products: Product[];
  total: number;
  pagination: {
    page: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
    totalItems: number;
  };
}

export async function getProductsData(params?: {
  page?: number;
  category?: string;
  brand?: string;
  color?: string;
  gender?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  sort?: string;
  store?: string;
}): Promise<ProductsAPIResponse> {
  const searchParams = new URLSearchParams();

  if (params?.page) searchParams.set('page', params.page.toString());
  if (params?.category) searchParams.set('category', params.category);
  if (params?.brand) searchParams.set('brand', params.brand);
  if (params?.color) searchParams.set('color', params.color);
  if (params?.gender) searchParams.set('gender', params.gender);
  if (params?.minPrice) searchParams.set('minPrice', params.minPrice.toString());
  if (params?.maxPrice) searchParams.set('maxPrice', params.maxPrice.toString());
  if (params?.search) searchParams.set('q', params.search);
  if (params?.sort) searchParams.set('sort', params.sort);
  if (params?.store) searchParams.set('store', params.store);

  try {
    // Try BFF endpoint first
    try {
      const res = await fetchBackendJson<unknown>(`/pages/products?${searchParams.toString()}`, {
        next: { revalidate: 60 },
        headers: { 'Content-Type': 'application/json' },
      });

      if (res) {
        const data = isRecord(res) ? res.data : undefined;
        const items = (getArray(data, 'items') ?? []) as Product[];
        const meta = getRecord(data, 'meta') ?? {};
        // BFF returns: { items: Product[], meta: { page, totalPages, totalItems, hasNext, hasPrev } }
        return {
          products: items,
          total: toNumber(meta.totalItems, 0),
          pagination: {
            page: toNumber(meta.page, 1),
            totalPages: toNumber(meta.totalPages, 1),
            hasNext: typeof meta.hasNext === 'boolean' ? meta.hasNext : false,
            hasPrev: typeof meta.hasPrev === 'boolean' ? meta.hasPrev : false,
            totalItems: toNumber(meta.totalItems, 0),
          },
        };
      }
    } catch {
      logWarn('BFF endpoint not available, trying fallback', {
        component: 'getProductsData',
        action: 'BFF_FALLBACK',
      });
    }

    // Fallback to direct products endpoint
    const fallback = await fetchBackendJson<unknown>(
      `/products?${searchParams.toString()}`,
      {
        next: { revalidate: 60 },
        headers: { 'Content-Type': 'application/json' },
      },
      { preferV1: false }
    );

    if (!fallback) {
      return {
        products: [],
        total: 0,
        pagination: { page: 1, totalPages: 1, hasNext: false, hasPrev: false, totalItems: 0 },
      };
    }

    const data = isRecord(fallback) ? fallback.data : undefined;
    const items = (getArray(data, 'items') ??
      getArray(data, 'products') ??
      (Array.isArray(data) ? data : [])) as Product[];
    const meta = getRecord(data, 'meta') ?? {};
    const total = toNumber(
      meta.totalItems,
      toNumber((data as { total?: unknown } | undefined)?.total, 0)
    );

    return {
      products: items,
      total,
      pagination: {
        page: toNumber(meta.page, 1),
        totalPages: toNumber(meta.totalPages, 1),
        hasNext: typeof meta.hasNext === 'boolean' ? meta.hasNext : false,
        hasPrev: typeof meta.hasPrev === 'boolean' ? meta.hasPrev : false,
        totalItems: toNumber(meta.totalItems, 0),
      },
    };
  } catch (error) {
    logError('Error fetching products', {
      component: 'getProductsData',
      action: 'FETCH_ERROR',
      metadata: { error },
    });
    return {
      products: [],
      total: 0,
      pagination: {
        page: 1,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
        totalItems: 0,
      },
    };
  }
}
