/**
 * Core Type Definitions
 * Centralized type definitions for the entire application
 */

// User & Authentication Types
export interface User {
  id: string;
  email: string;
  username?: string;
  display_name?: string;
  role?: 'user' | 'admin' | 'moderator' | 'store_owner';
  created_at?: string;
  updated_at?: string;
}

export interface LoginCredentials {
  identifier?: string;
  email?: string;
  password: string;
}

export interface RegisterData {
  email: string;
  username?: string;
  password: string;
  display_name?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    user: User;
    token: string;
  };
  user?: User;
  token?: string;
}

// Product Types
export interface Product {
  id: string;
  name: string;
  brand?: string;
  brand_id?: string;
  brands?: {
    id: string;
    name: string;
  };
  category?: string; // Primary field (backend uses 'category')
  type?: string; // Legacy field for backward compatibility
  color?: string;
  price?: number | string;
  currency?: string;
  price_currency?: string;
  saves_count?: number;
  min_price?: number | string; // Minimum price across all stores
  price_min?: number | string; // Alias from some APIs
  max_price?: number | string; // Maximum price across all stores
  store_count?: number; // Number of stores selling this product
  // CamelCase aliases for client components
  minPrice?: number | string;
  maxPrice?: number | string;
  storeCount?: number;
  isNew?: boolean; // Flag for new products
  description?: string;
  description_ua?: string; // Ukrainian translation
  description_en?: string; // English original
  image?: string;
  image_url?: string;
  images?: string[] | null;
  gender?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ProductsResponse {
  success?: boolean;
  products: Product[];
  total?: number;
  page?: number;
  limit?: number;
}

// Store Types
export interface Store {
  id: string;
  name: string;
  description?: string;
  image?: string;
  logo_url?: string;
  website?: string;
  telegram?: string;
  instagram?: string;
  tiktok_url?: string;
  location?: string;
  shipping?: string;
  is_verified?: boolean; // Verified stores (✓)
  is_recommended?: boolean; // Recommended stores (⭐)
  created_at?: string;
  updated_at?: string;
  // Additional fields when returned from product-store relationship
  price?: number | string; // Price for this product at this store
  product_price?: number | string; // Alternative field name from backend
  telegram_url?: string; // Alternative telegram URL field
  instagram_url?: string; // Alternative instagram URL field
  shipping_info?: string; // Shipping info for this store
}

export interface StoresResponse {
  success?: boolean;
  stores: Store[];
  total?: number;
}

// Brand Types
export interface Brand {
  id: string;
  name: string;
  description?: string;
  logo?: string;
  website?: string;
  created_at?: string;
  updated_at?: string;
}

export interface BrandsResponse {
  brands: Brand[];
  total?: number;
}

export interface StatisticsResponse {
  success: boolean;
  data: {
    total_products: number;
    total_stores: number;
    total_brands: number;
    satisfaction_rate: number;
  };
}

// Favorite Types
export interface FavoriteProduct {
  id: string;
  product_id: string;
  user_id?: string;
  created_at?: string;
  products?: Product;
  product?: Product;
}

export interface Favorite {
  id: string;
  user_id: string;
  product_id: string;
  created_at?: string;
}

export interface FavoritesResponse {
  success?: boolean;
  favorites: FavoriteProduct[];
  total?: number;
  created_at?: string;
}

export interface FavoriteIdsResponse {
  favorites: Favorite[];
}

// Wishlist Types
export interface WishlistItem {
  id: string;
  productId: string;
  name?: string;
  imageUrl?: string;
  price?: number;
  currency?: string;
  variantId?: string;
  variantName?: string;
  quantity?: number;
  addedAt: string;
  inStock?: boolean;
  url?: string;
  attributes?: Record<string, string>;
  position?: number;
}

export interface WishlistResponse {
  items: WishlistItem[];
  totalItems: number;
  totalValue?: number;
}

// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  error_code?: string; // Added for backend error code support
  success_code?: string; // Added for backend success code support
}

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
  error_code?: string; // Added for backend error code support
}

// Pagination Types
export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface PaginationInfo {
  page: number;
  totalPages: number;
  totalItems: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Search Types
export interface SearchParams {
  query?: string;
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
}
