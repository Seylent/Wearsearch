/**
 * Server-side data fetching for Products
 */
import type { Product } from '@/types';

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
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    const url = `${baseUrl}/api/v1/products?${searchParams.toString()}`;
    
    const response = await fetch(url, {
      next: { revalidate: 0 }, // Always fresh for product listings
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.warn(`Products API error: ${response.status}`);
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

    const data = await response.json();
    
    // Map API response to our interface
    return {
      products: data?.data?.items || data?.items || [],
      total: data?.data?.meta?.totalItems || data?.meta?.totalItems || 0,
      pagination: {
        page: data?.data?.meta?.page || data?.meta?.page || 1,
        totalPages: data?.data?.meta?.totalPages || data?.meta?.totalPages || 1,
        hasNext: data?.data?.meta?.hasNext || data?.meta?.hasNext || false,
        hasPrev: data?.data?.meta?.hasPrev || data?.meta?.hasPrev || false,
        totalItems: data?.data?.meta?.totalItems || data?.meta?.totalItems || 0,
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