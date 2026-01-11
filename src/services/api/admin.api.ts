/**
 * Admin API Service
 * Згідно з ADMIN_API_SPECIFICATION.md
 * Base URL: http://localhost:4000/api
 */

import { api } from '../api';

interface Product {
  id?: string;
  name: string;
  color: string;
  type: string;
  price: number;
  description?: string;
  image_url?: string;
  gender?: string;
  brand_id?: string;
  stores?: Array<{
    store_id: string;
    price: number;
    sizes?: string[];
  }>;
}

interface Store {
  id?: string;
  name: string;
  logo_url?: string;
  telegram_url?: string;
  instagram_url?: string;
  tiktok_url?: string;
  shipping_info?: string;
  is_verified?: boolean;
  is_recommended?: boolean;
}

interface Brand {
  id?: string;
  name: string;
  logo_url?: string;
  description?: string;
  website_url?: string;
}

interface DashboardResponse {
  products: {
    items: any[];
    meta: {
      page: number;
      limit: number;
      totalItems: number;
      totalPages: number;
    };
  };
  stores: {
    items: any[];
    meta: any;
  };
  brands: {
    items: any[];
    meta: any;
  };
}

export const adminApi = {
  // ===== DASHBOARD =====
  
  async getDashboard(options?: {
    productsPage?: number;
    productsLimit?: number;
    storesPage?: number;
    storesLimit?: number;
    brandsPage?: number;
    brandsLimit?: number;
  }): Promise<DashboardResponse> {
    const params = new URLSearchParams();
    if (options?.productsPage) params.set('productsPage', String(options.productsPage));
    if (options?.productsLimit) params.set('productsLimit', String(options.productsLimit));
    if (options?.storesPage) params.set('storesPage', String(options.storesPage));
    if (options?.storesLimit) params.set('storesLimit', String(options.storesLimit));
    if (options?.brandsPage) params.set('brandsPage', String(options.brandsPage));
    if (options?.brandsLimit) params.set('brandsLimit', String(options.brandsLimit));

    const response = await api.get(`/admin/dashboard?${params}`);
    return response.data;
  },

  // ===== PRODUCTS =====
  
  async getProducts() {
    const response = await api.get('/admin/products');
    return response.data;
  },

  async createProduct(product: Product) {
    const response = await api.post('/admin/products', product);
    return response.data;
  },

  async updateProduct(id: string, product: Partial<Product>) {
    const response = await api.put(`/admin/products/${id}`, product);
    return response.data;
  },

  async deleteProduct(id: string) {
    const response = await api.delete(`/admin/products/${id}`);
    return response.data;
  },

  // ===== STORES =====
  
  async getStores(search?: string) {
    const params = search ? `?search=${encodeURIComponent(search)}` : '';
    const response = await api.get(`/admin/stores${params}`);
    return response.data;
  },

  async createStore(store: Store) {
    const response = await api.post('/admin/stores', store);
    return response.data;
  },

  async updateStore(id: string, store: Partial<Store>) {
    const response = await api.put(`/admin/stores/${id}`, store);
    return response.data;
  },

  async deleteStore(id: string) {
    const response = await api.delete(`/admin/stores/${id}`);
    return response.data;
  },

  // ===== BRANDS =====
  
  async getBrands(search?: string) {
    const params = search ? `?search=${encodeURIComponent(search)}` : '';
    const response = await api.get(`/brands${params}`);
    return response.data;
  },

  async createBrand(brand: Brand) {
    const response = await api.post('/brands', brand);
    return response.data;
  },

  async updateBrand(id: string, brand: Partial<Brand>) {
    const response = await api.put(`/brands/${id}`, brand);
    return response.data;
  },

  async deleteBrand(id: string) {
    const response = await api.delete(`/brands/${id}`);
    return response.data;
  },

  // ===== FILE UPLOAD =====
  
  async uploadImage(file: File, folder: string = 'products'): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    const response = await api.post('/supabase-upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data.url;
  },
};

export type { Product, Store, Brand, DashboardResponse };
