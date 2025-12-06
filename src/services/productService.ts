import api, { handleApiError } from './api';
import ENDPOINTS from './endpoints';

// Type definitions matching backend API responses
export interface Product {
  id: string;
  name: string;
  color: string;
  type: string;
  price: number;
  description: string | null;
  image_url: string | null;
  created_at?: string;
  gender?: string | null;
  brand?: string | null;
  is_featured?: boolean;
}

export interface Store {
  id: string;
  name: string;
  telegram_url: string | null;
  instagram_url: string | null;
  shipping_info: string | null;
  average_rating?: number;
  total_ratings?: number;
  is_verified?: boolean;
  product_count?: number;
  brand_count?: number; // ✅ NEW: Number of unique brands
  price?: number;       // Price at this specific store
}

export interface ProductFilters {
  name?: string;
  color?: string;
  type?: string;
  gender?: string;
  brand?: string;
  is_featured?: boolean;
  min_price?: number;
  max_price?: number;
  skip?: number;
  limit?: number;
  sort_by?: 'id' | 'name' | 'price' | 'created_at';
  order?: 'asc' | 'desc';
}

export interface ProductsResponse {
  success: boolean;
  data: Product[];
  pagination: {
    skip: number;
    limit: number;
    total: number;
  };
  filters?: {
    name?: string | null;
    color?: string | null;
    type?: string | null;
    gender?: string | null;
    brand?: string | null;
    is_featured?: boolean | null;
    min_price?: string | null;
    max_price?: string | null;
  };
}

export interface ProductStoresResponse {
  success: boolean;
  product_id: string;
  product_name: string;
  stores_count: number;
  stores: Store[];
}

// Product Service - handles all product-related API calls
export const productService = {
  /**
   * Get all products with optional filters and pagination
   */
  async getAllProducts(filters?: ProductFilters): Promise<ProductsResponse> {
    try {
      const response = await api.get(ENDPOINTS.PRODUCTS.LIST, {
        params: filters,
      });
      
      // Backend returns { success, data, pagination, filters }
      // We need to return { success, data, pagination } format
      return {
        success: response.data.success,
        data: response.data.data || [],
        pagination: response.data.pagination || { skip: 0, limit: 15, total: 0 },
        filters: response.data.filters
      };
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Get a single product by ID
   */
  async getProductById(id: string | number): Promise<Product> {
    try {
      const response = await api.get(ENDPOINTS.PRODUCTS.DETAIL(id));
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Get all stores that carry a specific product
   */
  async getProductStores(productId: string | number): Promise<ProductStoresResponse> {
    try {
      const response = await api.get(ENDPOINTS.PRODUCTS.STORES(productId));
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Create a new product (Admin only)
   */
  async createProduct(data: {
    name: string;
    color: string;
    type: string;
    price: number;
    description?: string;
    image_url?: string;
    gender?: string;
    brand?: string;
    is_featured?: boolean;
    store_id?: string;
    store_name?: string;
    store_price?: number; // ✅ NEW: Specific price for this store
    store_telegram_url?: string;
    store_instagram_url?: string;
    store_shipping_info?: string;
  }): Promise<Product> {
    try {
      const response = await api.post(ENDPOINTS.PRODUCTS.CREATE, data);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Update a product (Admin only)
   */
  async updateProduct(
    id: string | number,
    data: Partial<Product>
  ): Promise<{ success: boolean; data: Product; message: string }> {
    try {
      const response = await api.put(ENDPOINTS.PRODUCTS.UPDATE(id), data);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Delete a product (Admin only)
   */
  async deleteProduct(id: string | number): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.delete(ENDPOINTS.PRODUCTS.DELETE(id));
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
      const response = await api.get(ENDPOINTS.PRODUCTS.LIST);
      const products = response.data.data || [];
      const types = [...new Set(products.map((p: Product) => p.type))];
      return types as string[];
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};

export default productService;
