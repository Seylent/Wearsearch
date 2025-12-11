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
  type?: string;
  price?: number;
  description?: string;
  image?: string;
  image_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ProductsResponse {
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
  website?: string;
  location?: string;
  rating?: number;
  created_at?: string;
  updated_at?: string;
}

export interface StoresResponse {
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

// Stats Types
export interface SiteStats {
  brands: number;
  products: number;
  stores: number;
}

// Favorite Types
export interface Favorite {
  id: string;
  user_id: string;
  product_id: string;
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
