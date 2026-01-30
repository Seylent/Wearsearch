import api, { handleApiError } from './api';
import ENDPOINTS from './endpoints';
import { AxiosResponse } from 'axios';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function unwrapItemEnvelope(value: unknown): unknown {
  if (!isRecord(value)) return value;
  return value.item ?? value.product ?? value;
}

function getArrayProp(value: unknown, key: string): unknown[] | undefined {
  if (!isRecord(value)) return undefined;
  const candidate = value[key];
  return Array.isArray(candidate) ? candidate : undefined;
}

// Type definitions for products
export interface Product {
  id: number;
  name: string;
  category: string;
  price: string;
  price_min?: string | number;
  min_price?: string | number;
  max_price?: string | number;
  maxPrice?: string | number;
  currency?: string;
  image?: string; // Frontend field
  image_url?: string; // Backend field
  images?: string[];
  description: string;
  stores?: Store[];
  color: string;
  type: string;
  materials?: Array<{ id?: string; slug?: string; name?: string } | string>;
  technologies?: Array<{ id?: string; slug?: string; name?: string } | string>;
  sizes?: Array<{ id?: string; slug?: string; label?: string; group?: string } | string>;
  saves_count?: number;
  brand_id?: number;
  brand?: string;
  gender?: string;
}

export interface Store {
  name: string;
  telegram?: string;
  instagram?: string;
  shipping: string;
}

export interface ProductFilters {
  category?: string;
  type?: string;
  color?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PopularSavedOptions {
  limit?: number;
  noCache?: boolean;
}

export interface ProductsResponse {
  products: Product[];
  total: number;
  page: number;
  totalPages: number;
}

// Product Service - handles all product-related API calls
export const productService = {
  /**
   * Get all products with optional filters and pagination
   */
  async getAllProducts(
    filters?: ProductFilters,
    pagination?: PaginationParams
  ): Promise<ProductsResponse> {
    try {
      const response: AxiosResponse<ProductsResponse> = await api.get(ENDPOINTS.PRODUCTS.LIST, {
        params: { ...filters, ...pagination },
      });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error).message);
    }
  },

  /**
   * Get a single product by ID
   */
  async getProductById(id: string | number): Promise<Product> {
    try {
      const response: AxiosResponse<unknown> = await api.get(ENDPOINTS.PRODUCTS.DETAIL(id));
      const candidate = unwrapItemEnvelope(response.data);
      return candidate as Product;
    } catch (error) {
      throw new Error(handleApiError(error).message);
    }
  },

  /**
   * Get stores for a product (Admin/editor flows)
   */
  async getProductStores(id: string | number): Promise<unknown[]> {
    try {
      const response: AxiosResponse<unknown> = await api.get(ENDPOINTS.PRODUCTS.STORES(id));
      const body: unknown = response.data;

      if (Array.isArray(body)) return body;
      const stores = getArrayProp(body, 'stores');
      if (stores) return stores;
      const items = getArrayProp(body, 'items');
      if (items) return items;
      const data = getArrayProp(body, 'data');
      if (data) return data;
      return [];
    } catch (error) {
      throw new Error(handleApiError(error).message);
    }
  },

  /**
   * Search products by query
   */
  async searchProducts(query: string, pagination?: PaginationParams): Promise<ProductsResponse> {
    try {
      const response: AxiosResponse<ProductsResponse> = await api.get(ENDPOINTS.PRODUCTS.SEARCH, {
        params: { q: query, ...pagination },
      });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error).message);
    }
  },

  /**
   * Get products by category
   */
  async getProductsByCategory(
    category: string,
    pagination?: PaginationParams
  ): Promise<ProductsResponse> {
    try {
      const response: AxiosResponse<ProductsResponse> = await api.get(
        ENDPOINTS.PRODUCTS.BY_CATEGORY(category),
        {
          params: pagination,
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error).message);
    }
  },

  /**
   * Get all available categories
   */
  async getCategories(): Promise<string[]> {
    try {
      const response: AxiosResponse<string[]> = await api.get(ENDPOINTS.PRODUCTS.CATEGORIES);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error).message);
    }
  },

  /**
   * Get top products by saves (wishlist + favorites)
   */
  async getPopularSaved(options: PopularSavedOptions = {}): Promise<Product[]> {
    try {
      const params: Record<string, string | number> = {};
      if (options.limit) params.limit = options.limit;
      if (options.noCache) params.no_cache = 1;

      const response: AxiosResponse<unknown> = await api.get(ENDPOINTS.PRODUCTS.POPULAR_SAVED, {
        params,
      });
      const body: unknown = response.data;
      const items = getArrayProp(body, 'items');
      if (items) return items as Product[];
      if (Array.isArray(body)) return body as Product[];
      const products = getArrayProp(body, 'products');
      return products ? (products as Product[]) : [];
    } catch (error) {
      throw new Error(handleApiError(error).message);
    }
  },

  /**
   * Create a new product (Admin only)
   */
  async createProduct(productData: Record<string, unknown>): Promise<Product> {
    try {
      const response: AxiosResponse<unknown> = await api.post(
        ENDPOINTS.PRODUCTS.CREATE,
        productData
      );
      const candidate = unwrapItemEnvelope(response.data);
      return candidate as Product;
    } catch (error) {
      throw new Error(handleApiError(error).message);
    }
  },

  /**
   * Update an existing product (Admin only)
   */
  async updateProduct(id: string | number, productData: Record<string, unknown>): Promise<Product> {
    try {
      const response: AxiosResponse<unknown> = await api.put(
        ENDPOINTS.PRODUCTS.UPDATE(id),
        productData
      );
      const candidate = unwrapItemEnvelope(response.data);
      return candidate as Product;
    } catch (error) {
      throw new Error(handleApiError(error).message);
    }
  },

  /**
   * Delete a product (Admin only)
   */
  async deleteProduct(id: string | number): Promise<{ message: string }> {
    try {
      const response: AxiosResponse<{ message: string }> = await api.delete(
        ENDPOINTS.PRODUCTS.DELETE(id)
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error).message);
    }
  },
};

export default productService;
