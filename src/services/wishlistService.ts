import { api, handleApiError } from './api';
import { logInfo } from './logger';
import type { WishlistItem, WishlistResponse } from '@/types';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const getRecord = (value: unknown, key: string): Record<string, unknown> | undefined => {
  if (!isRecord(value)) return undefined;
  const nested = value[key];
  return isRecord(nested) ? nested : undefined;
};

const getArray = (value: unknown, key: string): unknown[] | undefined => {
  if (!isRecord(value)) return undefined;
  const nested = value[key];
  return Array.isArray(nested) ? nested : undefined;
};

const toOptionalString = (value: unknown): string | undefined =>
  typeof value === 'string' && value.trim() ? value : undefined;

const toNumber = (value: unknown): number | undefined => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
};

const toBoolean = (value: unknown): boolean | undefined =>
  typeof value === 'boolean' ? value : undefined;

const toAttributes = (value: unknown): Record<string, string> | undefined => {
  if (!isRecord(value)) return undefined;
  const entries = Object.entries(value).reduce<Record<string, string>>((acc, [key, val]) => {
    if (typeof val === 'string' && val.trim()) {
      acc[key] = val;
      return acc;
    }
    if (typeof val === 'number' || typeof val === 'boolean') {
      acc[key] = String(val);
    }
    return acc;
  }, {});
  return Object.keys(entries).length > 0 ? entries : undefined;
};

const normalizeWishlistItem = (raw: unknown): WishlistItem => {
  const record = isRecord(raw) ? raw : {};
  const product = isRecord(record.product) ? record.product : undefined;
  const variant = isRecord(record.variant) ? record.variant : undefined;

  const productId =
    toOptionalString(record.product_id) ??
    toOptionalString(record.productId) ??
    toOptionalString(product?.id) ??
    toOptionalString(product?.product_id) ??
    '';

  const id =
    toOptionalString(record.id) ??
    toOptionalString(record.item_id) ??
    toOptionalString(record.wishlist_item_id) ??
    toOptionalString(record.wishlistItemId) ??
    productId;

  const name =
    toOptionalString(record.name) ??
    toOptionalString(record.title) ??
    toOptionalString(product?.name) ??
    toOptionalString(product?.title);

  const imageUrl =
    toOptionalString(record.imageUrl) ??
    toOptionalString(record.image_url) ??
    toOptionalString(record.image) ??
    toOptionalString(product?.image_url) ??
    toOptionalString(product?.image) ??
    toOptionalString(product?.thumbnail);

  const price =
    toNumber(record.price) ??
    toNumber(record.price_at_add) ??
    toNumber(record.priceAtAdd) ??
    toNumber(product?.price) ??
    toNumber(product?.min_price) ??
    toNumber(product?.max_price);

  const currency =
    toOptionalString(record.currency) ??
    toOptionalString(record.price_currency) ??
    toOptionalString(product?.currency);

  const variantId =
    toOptionalString(record.variant_id) ??
    toOptionalString(record.variantId) ??
    toOptionalString(variant?.id) ??
    toOptionalString(variant?.variant_id);

  const variantName =
    toOptionalString(record.variantName) ??
    toOptionalString(record.variant_name) ??
    toOptionalString(variant?.name) ??
    toOptionalString(variant?.title);

  const quantity = toNumber(record.quantity) ?? 1;

  const addedAt =
    toOptionalString(record.added_at) ??
    toOptionalString(record.addedAt) ??
    toOptionalString(record.created_at) ??
    toOptionalString(record.createdAt) ??
    new Date().toISOString();

  const inStock =
    toBoolean(record.in_stock) ??
    toBoolean(record.inStock) ??
    toBoolean(product?.in_stock) ??
    toBoolean(product?.is_in_stock);

  const url = toOptionalString(record.url) ?? toOptionalString(product?.url);

  const attributes =
    toAttributes(record.attributes) ??
    toAttributes(record.options) ??
    toAttributes(variant?.attributes) ??
    toAttributes(product?.attributes);

  const position = toNumber(record.position);

  return {
    id,
    productId,
    name,
    imageUrl,
    price,
    currency,
    variantId,
    variantName,
    quantity,
    addedAt,
    inStock,
    url,
    attributes,
    position,
  };
};

const normalizeWishlistResponse = (body: unknown): WishlistResponse => {
  const wishlistRecord = getRecord(body, 'wishlist') ?? getRecord(body, 'data');
  const source = wishlistRecord ?? (isRecord(body) ? body : undefined);
  const itemsSource =
    getArray(source, 'items') ?? getArray(source, 'wishlist') ?? getArray(source, 'products') ?? [];
  const items = itemsSource.map(item => normalizeWishlistItem(item));

  const totalItems =
    toNumber(source?.totalItems) ??
    toNumber(source?.total_items) ??
    toNumber(source?.total) ??
    toNumber(source?.count) ??
    items.length;

  const totalValue =
    toNumber(source?.totalValue) ??
    toNumber(source?.total_value) ??
    toNumber(source?.totalPrice) ??
    toNumber(source?.total_price);

  return { items, totalItems, totalValue };
};

const normalizeWishlistMutationResponse = (body: unknown) => {
  const record = isRecord(body) ? body : {};
  const itemSource =
    getRecord(record, 'item') ?? getRecord(record, 'wishlistItem') ?? getRecord(record, 'data');

  const wishlistSource = getRecord(record, 'wishlist') ?? (record.items ? record : undefined);
  const success = typeof record.success === 'boolean' ? record.success : undefined;

  return {
    success,
    item: itemSource ? normalizeWishlistItem(itemSource) : undefined,
    wishlist: wishlistSource ? normalizeWishlistResponse(wishlistSource) : undefined,
  };
};

export interface WishlistSettings {
  is_public: boolean;
  share_id?: string;
  share_url?: string;
}

export interface PublicWishlist {
  owner_name: string;
  items: Array<{
    id: string;
    name: string;
    brand?: string;
    image_url?: string;
    price?: number;
    price_min?: number;
    max_price?: number;
    currency?: string;
    added_at?: string;
  }>;
  items_count: number;
}

export interface AddWishlistItemPayload {
  productId: string;
  variantId?: string;
  quantity?: number;
}

export interface UpdateWishlistItemPayload {
  quantity?: number;
  variantId?: string;
}

export interface WishlistMutationResult {
  success?: boolean;
  item?: WishlistItem;
  wishlist?: WishlistResponse;
}

export const getWishlist = async (): Promise<WishlistResponse> => {
  try {
    const response = await api.get('/api/v1/wishlist');
    return normalizeWishlistResponse(response.data);
  } catch (error) {
    throw handleApiError(error);
  }
};

export const addWishlistItem = async (
  payload: AddWishlistItemPayload
): Promise<WishlistMutationResult> => {
  try {
    const response = await api.post('/api/v1/wishlist/items', payload);
    return normalizeWishlistMutationResponse(response.data);
  } catch (error) {
    throw handleApiError(error);
  }
};

export const updateWishlistItem = async (
  id: string,
  payload: UpdateWishlistItemPayload
): Promise<WishlistMutationResult> => {
  try {
    const response = await api.patch(`/api/v1/wishlist/items/${id}`, payload);
    return normalizeWishlistMutationResponse(response.data);
  } catch (error) {
    throw handleApiError(error);
  }
};

export const removeWishlistItem = async (id: string): Promise<WishlistMutationResult> => {
  try {
    const response = await api.delete(`/api/v1/wishlist/items/${id}`);
    return normalizeWishlistMutationResponse(response.data);
  } catch (error) {
    throw handleApiError(error);
  }
};

export const clearWishlist = async (): Promise<WishlistMutationResult> => {
  try {
    const response = await api.post('/api/v1/wishlist/clear');
    return normalizeWishlistMutationResponse(response.data);
  } catch (error) {
    throw handleApiError(error);
  }
};

// Get wishlist privacy settings
export const getWishlistSettings = async (): Promise<WishlistSettings> => {
  try {
    const response = await api.get('/api/v1/wishlist/settings');
    return response.data;
  } catch {
    // Default to private if API fails
    return { is_public: false };
  }
};

// Update wishlist privacy settings
export const updateWishlistSettings = async (isPublic: boolean): Promise<WishlistSettings> => {
  const response = await api.put('/api/v1/wishlist/settings', {
    is_public: isPublic,
  });
  return response.data;
};

// Generate/get share link
export const getShareLink = async (): Promise<{ share_url: string; share_id: string }> => {
  const response = await api.post('/api/v1/wishlist/share');
  return response.data;
};

// Get public wishlist by share ID (no auth required)
export const getPublicWishlist = async (
  shareId: string,
  currency?: string
): Promise<PublicWishlist> => {
  const response = await api.get(`/api/v1/wishlist/public/${shareId}`, {
    params: currency ? { currency } : undefined,
  });
  const data = response.data;

  // Debug logging - show full structure
  if (process.env.NODE_ENV !== 'production') {
    logInfo('Public wishlist raw response', {
      component: 'wishlistService',
      action: 'PUBLIC_WISHLIST_DEBUG',
      metadata: {
        keys: Object.keys(data),
        itemsLength: Array.isArray(data.items) ? data.items.length : undefined,
        productsLength: Array.isArray(data.products) ? data.products.length : undefined,
        favoritesLength: Array.isArray(data.favorites) ? data.favorites.length : undefined,
      },
    });
  }

  // Handle different response formats from backend
  // Format 1: { owner_name, items, items_count } - expected format
  // Format 2: { user, products/favorites, total } - alternative format
  // Format 3: { data: { ... } } - wrapped format (already unwrapped by interceptor)

  const result: PublicWishlist = {
    owner_name: data.owner_name || data.user_name || data.user?.name || data.username || 'User',
    items: [],
    items_count: 0,
  };

  const responseCurrency = typeof data.currency === 'string' ? data.currency : undefined;

  // Try to find items array in various locations
  const itemsSource = data.items || data.products || data.favorites || data.data?.items || [];

  if (Array.isArray(itemsSource)) {
    result.items = itemsSource.map((item: Record<string, unknown>) => ({
      id: String(item.id || item.product_id || item.item_id || ''),
      name: String(item.name || item.title || item.product_name || ''),
      brand: (item.brand as string | undefined) || (item.brand_name as string | undefined),
      image_url:
        (item.image_url as string | undefined) ||
        (item.image as string | undefined) ||
        (item.thumbnail as string | undefined),
      price:
        typeof item.price === 'number'
          ? item.price
          : typeof item.price === 'string'
            ? parseFloat(item.price)
            : undefined,
      price_min:
        typeof item.price_min === 'number'
          ? item.price_min
          : typeof item.price_min === 'string'
            ? parseFloat(item.price_min)
            : typeof item.min_price === 'number'
              ? item.min_price
              : typeof item.min_price === 'string'
                ? parseFloat(item.min_price)
                : undefined,
      max_price:
        typeof item.max_price === 'number'
          ? item.max_price
          : typeof item.max_price === 'string'
            ? parseFloat(item.max_price)
            : undefined,
      currency:
        typeof item.currency === 'string'
          ? item.currency
          : typeof item.price_currency === 'string'
            ? item.price_currency
            : responseCurrency,
      added_at: (item.added_at as string | undefined) || (item.created_at as string | undefined),
    }));
  }

  result.items_count = data.items_count ?? data.total ?? data.count ?? result.items.length;

  if (process.env.NODE_ENV !== 'production') {
    logInfo('Parsed public wishlist', {
      component: 'wishlistService',
      action: 'PUBLIC_WISHLIST_PARSED',
    });
  }

  return result;
};
