/**
 * API contract types for Saved (Favorites) and Wishlist (Collections)
 * Ensures frontend and backend agree on response shapes.
 */

// Base product fields shared across both subsystems
export interface BaseProduct {
  id: string;
  name: string;
  image_url?: string;
  price_min?: number;
  price?: number;
  max_price?: number;
  currency?: string;
}

// Saved (Favorites) contracts
export interface FavoriteProduct extends BaseProduct {
  product_id?: string;
  added_at?: string;
  favorite_id?: string;
}

export interface FavoritesResponse {
  success: boolean;
  count?: number;
  products?: FavoriteProduct[];
  items?: FavoriteProduct[]; // alternative field name
  meta?: {
    totalItems?: number;
    totalPages?: number;
    page?: number;
    hasPrev?: boolean;
    hasNext?: boolean;
  };
}

export interface AddFavoriteResponse {
  success: boolean;
  message?: string;
  favorite?: {
    id?: string;
    product_id: string;
    added_at?: string | null;
  };
}

export interface RemoveFavoriteResponse {
  success: boolean;
  message?: string;
}

// Wishlist (Collections) contracts
export interface Collection {
  id: string;
  name: string;
  emoji?: string;
  description?: string;
  is_public?: boolean;
  product_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface CollectionItem {
  product_id: string;
  added_at?: string;
  notes?: string;
  product?: BaseProduct;
}

export interface CollectionsResponse {
  success: boolean;
  collections: Collection[];
  meta: {
    totalItems: number;
  };
}

export interface CollectionItemsResponse {
  success: boolean;
  items: CollectionItem[];
  meta: {
    totalItems: number;
  };
}

export interface AddCollectionResponse {
  success: boolean;
  collection: Collection;
}

export interface UpdateCollectionResponse {
  success: boolean;
  collection: Collection;
}

export interface DeleteCollectionResponse {
  success: boolean;
  message?: string;
}

export interface AddCollectionItemResponse {
  success: boolean;
  item: CollectionItem;
}

export interface RemoveCollectionItemResponse {
  success: boolean;
  message?: string;
}

// Common error contract
export interface ApiError {
  success: false;
  message: string;
  code?: string;
  status?: number;
}

// Currency info
export interface CurrencyInfo {
  code: string;
  symbol?: string;
  rate?: number;
}
