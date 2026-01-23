/**
 * Server-side data fetching for Products
 */
import type { Product } from '@/types';
import { fetchBackendJson } from '@/lib/backendFetch';

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
      const res = await fetchBackendJson<any>(`/pages/products?${searchParams.toString()}`, {
        next: { revalidate: 60 },
        headers: { 'Content-Type': 'application/json' },
      });

      if (res) {
        const data = res.data;
        // BFF returns: { items: Product[], meta: { page, totalPages, totalItems, hasNext, hasPrev } }
        return {
          products: data.items || [],
          total: data.meta?.totalItems || 0,
          pagination: {
            page: data.meta?.page || 1,
            totalPages: data.meta?.totalPages || 1,
            hasNext: data.meta?.hasNext || false,
            hasPrev: data.meta?.hasPrev || false,
            totalItems: data.meta?.totalItems || 0,
          },
        };
      }
    } catch (_bffError) {
      console.log('BFF endpoint not available, trying fallback');
    }
    
    // Fallback to direct products endpoint
    const fallback = await fetchBackendJson<any>(`/products?${searchParams.toString()}`, {
      next: { revalidate: 60 },
      headers: { 'Content-Type': 'application/json' },
    }, { preferV1: false });

    if (!fallback) {
      return {
        products: [],
        total: 0,
        pagination: { page: 1, totalPages: 1, hasNext: false, hasPrev: false, totalItems: 0 },
      };
    }

    const data = fallback.data;
    
    return {
      products: data.items || data.products || data || [],
      total: data.meta?.totalItems || data.total || 0,
      pagination: {
        page: data.meta?.page || 1,
        totalPages: data.meta?.totalPages || 1,
        hasNext: data.meta?.hasNext || false,
        hasPrev: data.meta?.hasPrev || false,
        totalItems: data.meta?.totalItems || 0,
      },
    };
  } catch (error) {
    console.error('Error fetching products:', error);
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
