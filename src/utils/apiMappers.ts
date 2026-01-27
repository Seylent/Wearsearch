/**
 * API response mappers for Saved (Favorites) and Wishlist (Collections)
 * Normalizes backend responses to consistent frontend models.
 */

import {
  FavoritesResponse,
  FavoriteProduct,
  CollectionsResponse,
  Collection,
  CollectionItemsResponse,
  CollectionItem,
  BaseProduct,
  CurrencyInfo,
} from '@/types/apiContracts';

// Simple runtime guard for object shape
const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

// Safe string extraction
const getString = (value: unknown, fallback = ''): string =>
  typeof value === 'string' ? value : fallback;

// Safe number extraction
const getNumber = (value: unknown, fallback = 0): number =>
  typeof value === 'number' && Number.isFinite(value) ? value : fallback;

// Normalize price fields to a consistent structure
export const normalizePrice = (
  product: Record<string, unknown>,
  targetCurrency?: string
): { price_min?: number; price?: number; max_price?: number; currency?: string } => {
  const price_min = getNumber(product.price_min);
  const price = getNumber(product.price);
  const max_price = getNumber(product.max_price);
  let currency = getString(product.currency);

  // If target currency is requested and differs, we could convert here
  // For now, we just ensure the field exists and fallback to targetCurrency
  if (targetCurrency && (!currency || currency !== targetCurrency)) {
    currency = targetCurrency;
  }

  return { price_min, price, max_price, currency };
};

// Extract base product fields from any product-like object
export const extractBaseProduct = (
  source: Record<string, unknown>,
  targetCurrency?: string
): BaseProduct => {
  const id = getString(source.id) || getString(source.product_id);
  const name = getString(source.name) || getString(source.product_name);
  const image_url = getString(source.image_url) || getString(source.image);
  const { price_min, price, max_price, currency } = normalizePrice(source, targetCurrency);

  return {
    id: id || '',
    name: name || '',
    image_url,
    price_min,
    price,
    max_price,
    currency,
  };
};

// Mapper for Favorites response
export const mapFavoritesResponse = (
  response: unknown,
  targetCurrency?: string
): { items: FavoriteProduct[]; meta?: FavoritesResponse['meta'] } => {
  if (!isRecord(response)) {
    return { items: [] };
  }

  // Extract items from possible field names
  const rawItems = (response.products as unknown[]) || (response.items as unknown[]) || [];

  const items = rawItems.filter(isRecord).map(item => {
    const base = extractBaseProduct(item, targetCurrency);
    const product_id = getString(item.product_id) || base.id;
    const added_at = getString(item.added_at);
    const favorite_id = getString(item.favorite_id);

    return {
      ...base,
      product_id,
      added_at,
      favorite_id,
    } as FavoriteProduct;
  });

  // Extract meta if present
  const meta = isRecord(response.meta) ? response.meta : undefined;

  return { items, meta };
};

// Mapper for Collections response
export const mapCollectionsResponse = (
  response: unknown
): { collections: Collection[]; meta: CollectionsResponse['meta'] } => {
  if (!isRecord(response) || !Array.isArray(response.collections)) {
    return { collections: [], meta: { totalItems: 0 } };
  }

  const collections = response.collections.filter(isRecord).map(item => ({
    id: getString(item.id),
    name: getString(item.name),
    emoji: getString(item.emoji),
    description: getString(item.description),
    is_public: Boolean(item.is_public),
    product_count: getNumber(item.product_count),
    created_at: getString(item.created_at),
    updated_at: getString(item.updated_at),
  })) as Collection[];

  const meta = isRecord(response.meta)
    ? { totalItems: getNumber(response.meta.totalItems) }
    : { totalItems: collections.length };

  return { collections, meta };
};

// Mapper for Collection Items response
export const mapCollectionItemsResponse = (
  response: unknown,
  targetCurrency?: string
): { items: CollectionItem[]; meta: CollectionItemsResponse['meta'] } => {
  if (!isRecord(response) || !Array.isArray(response.items)) {
    return { items: [], meta: { totalItems: 0 } };
  }

  const items = response.items.filter(isRecord).map(item => {
    const product_id = getString(item.product_id);
    const added_at = getString(item.added_at);
    const notes = getString(item.notes);
    let product: BaseProduct | undefined;

    // Extract nested product if present
    if (isRecord(item.product)) {
      product = extractBaseProduct(item.product, targetCurrency);
    }

    return {
      product_id,
      added_at,
      notes,
      product,
    } as CollectionItem;
  });

  const meta = isRecord(response.meta)
    ? { totalItems: getNumber(response.meta.totalItems) }
    : { totalItems: items.length };

  return { items, meta };
};

// Helper to validate required fields in a contract
export const validateFavoriteProduct = (item: unknown): item is FavoriteProduct => {
  if (!isRecord(item)) return false;
  return (
    typeof item.id === 'string' &&
    item.id.length > 0 &&
    typeof item.name === 'string' &&
    item.name.length > 0
  );
};

export const validateCollection = (item: unknown): item is Collection => {
  if (!isRecord(item)) return false;
  return (
    typeof item.id === 'string' &&
    item.id.length > 0 &&
    typeof item.name === 'string' &&
    item.name.length > 0
  );
};

export const validateCollectionItem = (item: unknown): item is CollectionItem => {
  if (!isRecord(item)) return false;
  return typeof item.product_id === 'string' && item.product_id.length > 0;
};
