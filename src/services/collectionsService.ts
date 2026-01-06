/**
 * Collections API Service
 * Handles user collections/wishlists API calls
 */

import api, { handleApiError } from './api';
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

// API functions
export const collectionsService = {
  /**
   * Get all user collections
   */
  async getCollections(): Promise<Collection[]> {
    try {
      const response = await api.get('/users/me/collections');
      const collections = response.data.collections || response.data || [];
      return collections.map(transformCollection);
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
      return transformCollection(response.data.collection || response.data);
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
      return transformCollection(response.data.collection || response.data);
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
      throw handleApiError(error);
    }
  },

  /**
   * Get items in a collection
   */
  async getCollectionItems(collectionId: string): Promise<CollectionItem[]> {
    try {
      const response = await api.get(`/users/me/collections/${collectionId}/items`);
      const items = response.data.products || response.data.items || response.data || [];
      return items.map(transformCollectionItem);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Add product to collection
   */
  async addToCollection(
    collectionId: string,
    productId: string | number,
    notes?: string
  ): Promise<void> {
    try {
      await api.post(`/users/me/collections/${collectionId}/items`, {
        product_id: productId,
        notes,
      });
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Remove product from collection
   */
  async removeFromCollection(collectionId: string, productId: string | number): Promise<void> {
    try {
      await api.delete(`/users/me/collections/${collectionId}/items/${productId}`);
    } catch (error) {
      throw handleApiError(error);
    }
  },
};

// Transform functions (backend → frontend)
function transformCollection(raw: Record<string, unknown>): Collection {
  return {
    id: String(raw.id || ''),
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
    product: raw.product as Product | undefined || raw as unknown as Product,
  };
}

export default collectionsService;
