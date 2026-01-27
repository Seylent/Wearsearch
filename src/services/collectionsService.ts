/**
 * Collections API Service
 * Handles user collections/wishlists API calls
 */

import api, { apiLegacy, handleApiError } from './api';
import { Product } from './productService';

// Types
export interface Collection {
  id: string;
  name: string;
  emoji?: string;
  description?: string;
  productCount: number;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  items?: CollectionItem[];
}

export interface CollectionItem {
  productId: string;
  addedAt: string;
  notes?: string;
  product?: Product;
}

export interface CollectionWithItems extends Collection {
  items: CollectionItem[];
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const getRecord = (value: unknown, key: string): Record<string, unknown> | undefined => {
  if (!isRecord(value)) return undefined;
  const nested = value[key];
  return isRecord(nested) ? nested : undefined;
};

const hasProductReference = (record: Record<string, unknown>): boolean => {
  const product = isRecord(record.product) ? (record.product as Record<string, unknown>) : null;
  return Boolean(
    record.product_id ??
    record.productId ??
    (product ? (product.id ?? product.product_id ?? product.productId) : undefined)
  );
};

const extractCollectionItems = (body: unknown): Record<string, unknown>[] => {
  if (Array.isArray(body)) return body as Record<string, unknown>[];
  if (isRecord(body)) {
    if (Array.isArray(body.items)) return body.items as Record<string, unknown>[];
    if (Array.isArray(body.products)) return body.products as Record<string, unknown>[];
    if (Array.isArray(body.collection_items))
      return body.collection_items as Record<string, unknown>[];
    if (isRecord(body.data)) {
      if (Array.isArray(body.data.items)) return body.data.items as Record<string, unknown>[];
      if (Array.isArray(body.data.products)) return body.data.products as Record<string, unknown>[];
    }
  }
  return [];
};

// API functions
export const collectionsService = {
  /**
   * Get all user collections
   */
  async getCollections(): Promise<Collection[]> {
    try {
      const response = await api.get('/users/me/collections', {
        headers: { 'X-Skip-Retry': 'true' },
      });
      const body: unknown = response.data;
      const payload = getRecord(body, 'data') ?? (isRecord(body) ? body : undefined);
      const collectionsRaw =
        (payload as { collections?: unknown }).collections ??
        (payload as { items?: unknown }).items ??
        payload ??
        [];
      const collections = Array.isArray(collectionsRaw) ? collectionsRaw : [];
      const itemsByCollection = collectItemsByCollection(
        (payload as { items?: unknown }).items ?? (body as { items?: unknown }).items
      );

      return collections.map(raw => {
        const collection = transformCollection(raw as Record<string, unknown>);
        const inlineItems = Array.isArray((raw as Record<string, unknown>).items)
          ? (raw as { items: unknown[] }).items
              .filter(
                item => isRecord(item) && hasProductReference(item as Record<string, unknown>)
              )
              .map(item => transformCollectionItem(item as Record<string, unknown>))
          : undefined;

        return {
          ...collection,
          items: inlineItems ?? itemsByCollection[collection.id] ?? [],
        };
      });
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Create a new collection
   */
  async createCollection(data: {
    name: string;
    emoji?: string;
    description?: string;
  }): Promise<Collection> {
    try {
      const response = await api.post('/users/me/collections', data);
      const body: unknown = response.data;
      const dataRecord = getRecord(body, 'data');
      const payload =
        (body as { collection?: unknown }).collection ??
        (body as { item?: unknown }).item ??
        (dataRecord?.collection as unknown) ??
        (dataRecord?.item as unknown) ??
        dataRecord ??
        body;
      if (!isRecord(payload)) {
        throw new Error('Invalid collection response');
      }
      return transformCollection(payload);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Update a collection
   */
  async updateCollection(
    collectionId: string,
    data: {
      name?: string;
      emoji?: string;
      description?: string;
    }
  ): Promise<Collection> {
    try {
      const response = await api.put(`/users/me/collections/${collectionId}`, data);
      const body: unknown = response.data;
      const dataRecord = getRecord(body, 'data');
      const payload =
        (body as { collection?: unknown }).collection ??
        (body as { item?: unknown }).item ??
        (dataRecord?.collection as unknown) ??
        (dataRecord?.item as unknown) ??
        dataRecord ??
        body;
      if (!isRecord(payload)) {
        throw new Error('Invalid collection response');
      }
      return transformCollection(payload);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Delete a collection
   */
  async deleteCollection(collectionId: string): Promise<void> {
    try {
      await api.delete(`/users/me/collections/${collectionId}`);
    } catch (error) {
      const apiError = handleApiError(error);
      if (apiError.status === 404) {
        try {
          await apiLegacy.delete(`/user/collections/${collectionId}`);
          return;
        } catch (legacyError) {
          throw handleApiError(legacyError);
        }
      }
      throw apiError;
    }
  },

  /**
   * Get items in a collection
   */
  async getCollectionItems(collectionId: string, currency?: string): Promise<CollectionItem[]> {
    try {
      const response = await api.get(`/users/me/collections/${collectionId}/items`, {
        headers: { 'X-Skip-Retry': 'true' },
        params: currency ? { currency } : undefined,
      });
      const items = extractCollectionItems(response.data).filter(hasProductReference);
      return items.map(item => transformCollectionItem(item as Record<string, unknown>));
    } catch (error) {
      const apiError = handleApiError(error);
      if (apiError.status === 401 || apiError.status === 403 || apiError.status === 404) {
        return [];
      }
      if (apiError.status !== undefined && apiError.status >= 500) {
        if (process.env.NODE_ENV !== 'production') {
          console.warn('Failed to fetch collection items:', apiError.message);
        }
        return [];
      }
      throw apiError;
    }
  },

  /**
   * Add product to collection
   */
  async addToCollection(
    collectionId: string,
    productId: string | number,
    notes?: string
  ): Promise<CollectionItem> {
    try {
      const response = await api.post(`/users/me/collections/${collectionId}/items`, {
        product_id: productId,
        productId,
        collection_id: collectionId,
        collectionId,
        notes,
      });
      const item = (response.data?.item ?? response.data) as Record<string, unknown>;
      return transformCollectionItem(item);
    } catch (error) {
      const apiError = handleApiError(error);
      if (apiError.status === 404) {
        try {
          const response = await apiLegacy.post(`/user/collections/${collectionId}/items`, {
            product_id: productId,
            productId,
            collection_id: collectionId,
            collectionId,
            notes,
          });
          const item = (response.data?.item ?? response.data) as Record<string, unknown>;
          return transformCollectionItem(item);
        } catch (legacyError) {
          throw handleApiError(legacyError);
        }
      }
      throw apiError;
    }
  },

  /**
   * Remove product from collection
   */
  async removeFromCollection(collectionId: string, productId: string | number): Promise<void> {
    try {
      await api.delete(`/users/me/collections/${collectionId}/items/${productId}`);
    } catch (error) {
      const apiError = handleApiError(error);
      if (apiError.status === 404) {
        try {
          await apiLegacy.delete(`/user/collections/${collectionId}/items/${productId}`);
          return;
        } catch (legacyError) {
          throw handleApiError(legacyError);
        }
      }
      throw apiError;
    }
  },
};

// Transform functions (backend → frontend)
function transformCollection(raw: Record<string, unknown>): Collection {
  return {
    id: String(raw.id || raw.collection_id || raw.collectionId || ''),
    name: String(raw.name || ''),
    emoji: raw.emoji as string | undefined,
    description: raw.description as string | undefined,
    productCount: Number(raw.product_count || raw.productCount || 0),
    isPublic: Boolean(raw.is_public || raw.isPublic),
    createdAt: String(raw.created_at || raw.createdAt || new Date().toISOString()),
    updatedAt: String(raw.updated_at || raw.updatedAt || new Date().toISOString()),
  };
}

function transformCollectionItem(raw: Record<string, unknown>): CollectionItem {
  return {
    productId: String(raw.product_id || raw.productId || raw.id || ''),
    addedAt: String(raw.added_at || raw.addedAt || new Date().toISOString()),
    notes: raw.notes as string | undefined,
    product: (raw.product as Product | undefined) || (raw as unknown as Product),
  };
}

function collectItemsByCollection(raw: unknown): Record<string, CollectionItem[]> {
  if (!raw) return {};

  if (Array.isArray(raw)) {
    return raw.reduce<Record<string, CollectionItem[]>>((acc, item) => {
      if (!item || typeof item !== 'object') return acc;
      const record = item as Record<string, unknown>;
      const collectionId = String(record.collection_id ?? record.collectionId ?? '').trim();
      if (!collectionId) return acc;
      if (!hasProductReference(record)) return acc;
      const normalized = transformCollectionItem(record);
      acc[collectionId] = [...(acc[collectionId] ?? []), normalized];
      return acc;
    }, {});
  }

  if (raw && typeof raw === 'object') {
    const record = raw as Record<string, unknown>;
    return Object.entries(record).reduce<Record<string, CollectionItem[]>>((acc, [key, value]) => {
      if (Array.isArray(value)) {
        acc[key] = value.map(item => transformCollectionItem(item as Record<string, unknown>));
      }
      return acc;
    }, {});
  }

  return {};
}

export default collectionsService;
