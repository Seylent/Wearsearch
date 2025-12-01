import api, { handleApiError } from './api';
import ENDPOINTS from './endpoints';
import { AxiosResponse } from 'axios';

// Type definitions for products
export interface Product {
  id: number;
  name: string;
  category: string;
  price: string;
  image: string;
  images: string[];
  description: string;
  stores: Store[];
  color: string;
  type: string;
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
      const response: AxiosResponse<ProductsResponse> = await api.get(
        ENDPOINTS.PRODUCTS.LIST,
        {
          params: { ...filters, ...pagination },
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Get a single product by ID
   */
  async getProductById(id: string | number): Promise<Product> {
    try {
      const response: AxiosResponse<Product> = await api.get(
        ENDPOINTS.PRODUCTS.DETAIL(id)
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Search products by query
   */
  async searchProducts(query: string, pagination?: PaginationParams): Promise<ProductsResponse> {
    try {
      const response: AxiosResponse<ProductsResponse> = await api.get(
        ENDPOINTS.PRODUCTS.SEARCH,
        {
          params: { q: query, ...pagination },
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
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
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Get all available categories
   */
  async getCategories(): Promise<string[]> {
    try {
      const response: AxiosResponse<string[]> = await api.get(
        ENDPOINTS.PRODUCTS.CATEGORIES
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Create a new product (Admin only)
   */
  async createProduct(productData: Omit<Product, 'id'>): Promise<Product> {
    try {
      const response: AxiosResponse<Product> = await api.post(
        ENDPOINTS.PRODUCTS.CREATE,
        productData
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Update an existing product (Admin only)
   */
  async updateProduct(id: string | number, productData: Partial<Product>): Promise<Product> {
    try {
      const response: AxiosResponse<Product> = await api.put(
        ENDPOINTS.PRODUCTS.UPDATE(id),
        productData
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
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
      throw new Error(handleApiError(error));
    }
  },
};

export default productService;
