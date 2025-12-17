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
  role?: 'user' | 'admin';
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
  category?: string;  // Primary field (backend uses 'category')
  color?: string;
  price?: number | string;
  description?: string;
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
  rating?: number;
  is_verified?: boolean;       // Verified stores (✓)
  is_recommended?: boolean;     // Recommended stores (⭐)
  average_rating?: number;
  total_ratings?: number;
  created_at?: string;
  updated_at?: string;
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

// Hero Image Types
export interface HeroImage {
  id: string;
  image_url: string;
  alt_text?: string;
  is_active: boolean;
  display_order?: number;
  created_at?: string;
}

export interface HeroImagesResponse {
  images: HeroImage[];
}

  satisfaction_rate?: number;
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
  total?: number
  created_at?: string;
}

export interface FavoritesResponse {
  favorites: Favorite[];
}

// Rating Types
export interface Rating {
  id: string;
  user_id: string;
  store_id: string;
  product_id?: string;
  rating: number;
  comment?: string;
  created_at?: string;
  updated_at?: string;
}

export interface RatingsResponse {
  ratings: Rating[];
  average?: number;
  total?: number;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

// Pagination Types
export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

// Search Types
export interface SearchParams {
  query?: string;
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
}
