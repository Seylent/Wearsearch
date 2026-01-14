/**
 * Type Definitions for Products, Stores, and Brands
 * Replacing any types with proper TypeScript interfaces
 */

// Base types
export interface BaseEntity {
  id: string | number;
  created_at?: string;
  updated_at?: string;
}

// Brand interface
export interface Brand extends BaseEntity {
  name: string;
  logo_url?: string;
  description?: string;
  website_url?: string;
  is_active?: boolean;
  products_count?: number;
}

// Store interface  
export interface Store extends BaseEntity {
  name: string;
  domain: string;
  logo_url?: string;
  description?: string;
  country?: string;
  website_url?: string;
  contact_email?: string;
  contact_phone?: string;
  is_active?: boolean;
  verification_status?: 'pending' | 'verified' | 'rejected';
  products_count?: number;
  shipping_regions?: string[];
  supported_currencies?: string[];
}

// Product size interface
export interface ProductSize {
  size: string;
  available?: boolean;
}

// Product store price interface
export interface ProductStorePrice {
  store_id: string | number;
  store: Store;
  price: number;
  currency: string;
  url?: string;
  sizes?: ProductSize[];
  last_updated?: string;
  is_available?: boolean;
}

// Product interface
export interface Product extends BaseEntity {
  title: string;
  name?: string; // Alternative name field
  description?: string;
  category?: string;
  color?: string;
  gender?: 'men' | 'women' | 'unisex';
  brand_id?: string | number;
  brand?: Brand;
  image?: string;
  image_url?: string;
  images?: string[];
  primary_image_index?: number;
  price?: number; // Base price or average price
  currency?: string;
  status?: 'active' | 'inactive' | 'draft';
  publish_at?: string;
  unpublish_at?: string;
  stores?: ProductStorePrice[];
  sizes?: ProductSize[];
  tags?: string[];
  seo_title?: string;
  seo_description?: string;
  view_count?: number;
  favorite_count?: number;
  is_featured?: boolean;
}

// Template interface for admin
export interface ProductTemplate extends BaseEntity {
  name: string;
  description?: string;
  data: Partial<Product>;
  user_id?: string;
  is_public?: boolean;
}

// Analytics data interfaces
export interface AnalyticsData {
  totalProducts: number;
  totalStores: number;
  totalBrands: number;
  totalViews: number;
  recentActivity: ActivityLogEntry[];
  topProducts: {
    product: Product;
    views: number;
    favorites: number;
  }[];
  topStores: {
    store: Store;
    products_count: number;
    avg_price: number;
  }[];
  priceDistribution: {
    range: string;
    count: number;
  }[];
  categoryDistribution: {
    category: string;
    count: number;
  }[];
}

// Activity log entry
export interface ActivityLogEntry extends BaseEntity {
  action: 'create' | 'update' | 'delete' | 'view' | 'favorite';
  entity_type: 'product' | 'store' | 'brand' | 'user';
  entity_id: string | number;
  user_id?: string;
  details?: string;
  metadata?: Record<string, unknown>;
  timestamp: string;
}

// Price history entry
export interface PriceHistoryEntry {
  date: string;
  price: number;
  currency: string;
  store_id: string | number;
  store_name: string;
}

// User interface
export interface User extends BaseEntity {
  email: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  role: 'user' | 'admin' | 'moderator';
  is_active: boolean;
  last_login?: string;
  preferences?: {
    currency?: string;
    language?: string;
    notifications?: boolean;
  };
}

// Favorite interface
export interface Favorite extends BaseEntity {
  user_id: string;
  product_id: string | number;
  product?: Product;
}

// API Response interfaces
export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends APIResponse<T[]> {
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Search and filter interfaces
export interface ProductFilters {
  search?: string;
  category?: string;
  color?: string;
  gender?: string;
  brand_id?: string | number;
  store_id?: string | number;
  min_price?: number;
  max_price?: number;
  currency?: string;
  status?: string;
  is_featured?: boolean;
  sizes?: string[];
}

export interface SearchParams extends ProductFilters {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

// Form data interfaces
export interface ProductFormData {
  title: string;
  description?: string;
  category?: string;
  color?: string;
  gender?: 'men' | 'women' | 'unisex';
  brand_id?: string | number;
  image_url?: string;
  images?: string[];
  primary_image_index?: number;
  status?: 'active' | 'inactive' | 'draft';
  publish_at?: string;
  unpublish_at?: string;
  stores?: {
    store_id: string | number;
    price: number;
    currency: string;
    url?: string;
    sizes?: ProductSize[];
  }[];
  tags?: string[];
  seo_title?: string;
  seo_description?: string;
}

export interface StoreFormData {
  name: string;
  domain: string;
  logo_url?: string;
  description?: string;
  country?: string;
  website_url?: string;
  contact_email?: string;
  contact_phone?: string;
  is_active?: boolean;
  verification_status?: 'pending' | 'verified' | 'rejected';
  shipping_regions?: string[];
  supported_currencies?: string[];
}

export interface BrandFormData {
  name: string;
  logo_url?: string;
  description?: string;
  website_url?: string;
  is_active?: boolean;
}