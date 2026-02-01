/**
 * Store Menu Types
 * Types for the store management interface
 */

export type StoreAccessType = 'owner' | 'manager';

export interface Store {
  id: string;
  name: string;
  logo_url: string;
  access_type: StoreAccessType;
  telegram_url?: string;
  instagram_url?: string;
  tiktok_url?: string;
  website_url?: string;
  shipping_info?: string;
  is_verified: boolean;
  is_recommended: boolean;
  brand_id?: string;
}

export interface StoreStats {
  total_products: number;
  total_managers: number;
}

export interface RecentProduct {
  id: string;
  name: string;
  image_url: string;
  store_price: number;
}

export interface DashboardData {
  store: Store;
  stats: StoreStats;
  recent_products: RecentProduct[];
}

export interface StoreProduct {
  id: string;
  product_id: string;
  name: string;
  image_url: string;
  category: string;
  store_price: number;
  sizes: string[];
  status: 'active' | 'inactive';
  is_own_product: boolean;
  brand_name?: string;
  created_at: string;
}

export interface SiteProduct {
  id: string;
  name: string;
  image_url: string;
  brand: string;
  category: string;
  base_price: number;
}

export interface Manager {
  id: string;
  email: string;
  name: string;
  added_at: string;
}

export interface StoreSettings {
  name: string;
  logo_url: string;
  telegram_url?: string;
  instagram_url?: string;
  tiktok_url?: string;
  website_url?: string;
  shipping_info?: string;
}

export interface CreateProductData {
  name: string;
  color: string;
  category_id: string;
  gender: 'male' | 'female' | 'unisex';
  brand_id?: string;
  store_price: number;
  sizes: string[];
  images: string[];
  description?: string;
  materials?: string[];
  technologies?: string[];
}

export interface AddExistingProductData {
  product_id: string;
  store_price: number;
  sizes: string[];
}

export interface PaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  items?: T[];
  meta?: PaginationMeta;
}

export interface UserStore {
  id: string;
  name: string;
  logo_url: string;
  access_type: StoreAccessType;
  is_verified: boolean;
  is_recommended: boolean;
  total_products: number;
}

export interface UserContextResponse {
  stores: UserStore[];
  selected_store_id?: string;
}
