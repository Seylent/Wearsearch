/**
 * Collections/Wishlists Hook
 * Manages user collections with API integration + localStorage for tracking items
 */

import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useIsAuthenticated } from '@/hooks/useIsAuthenticated';
import collectionsService, {
  type Collection as ApiCollection,
  type CollectionItem as ApiCollectionItem,
} from '@/services/collectionsService';

const STORAGE_KEY = 'wearsearch_collections';
const ITEMS_STORAGE_KEY = 'wearsearch_collection_items';

export interface CollectionItem {
  productId: string;
  addedAt: number;
}

export interface Collection {
  id: string;
  name: string;
  emoji?: string;
  description?: string;
  items: CollectionItem[];
  productCount?: number;
  createdAt: number;
  updatedAt: number;
}

// Default collection templates for users
const DEFAULT_COLLECTION_TEMPLATES = [
  { name: 'Summer', emoji: '☀️', nameUk: 'На літо' },
  { name: 'Gifts', emoji: '🎁', nameUk: 'Подарунки' },
  { name: 'Want to Buy', emoji: '🛒', nameUk: 'Хочу купити' },
  { name: 'Outfit Ideas', emoji: '👔', nameUk: 'Ідеї образів' },
];

/**
 * Get collections from localStorage (fallback for non-authenticated users)
 */
const getStoredCollections = (): Collection[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch {
    return [];
  }
};

/**
 * Save collections to localStorage
 */
const saveCollections = (collections: Collection[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(collections));
  } catch {
    console.warn('Failed to save collections');
  }
};

/**
 * Get collection items mapping from localStorage (for API users)
 */
const getStoredItems = (): Record<string, CollectionItem[]> => {
  try {
    const stored = localStorage.getItem(ITEMS_STORAGE_KEY);
    if (!stored) return {};
    return JSON.parse(stored);
  } catch {
    return {};
  }
};

/**
 * Save collection items mapping to localStorage
 */
const saveItems = (items: Record<string, CollectionItem[]>): void => {
  try {
    localStorage.setItem(ITEMS_STORAGE_KEY, JSON.stringify(items));
  } catch {
    console.warn('Failed to save collection items');
  }
};

const toLocalCollectionItem = (item: ApiCollectionItem): CollectionItem => ({
  productId: item.productId,
  addedAt: new Date(item.addedAt).getTime(),
});

const toLocalCollection = (collection: ApiCollection): Collection => ({
  id: collection.id,
  name: collection.name,
  emoji: collection.emoji,
  description: collection.description,
  items: Array.isArray(collection.items) ? collection.items.map(toLocalCollectionItem) : [],
  productCount: collection.productCount,
  createdAt: new Date(collection.createdAt).getTime(),
  updatedAt: new Date(collection.updatedAt).getTime(),
});

/**
 * Generate unique ID
 */
const generateId = (): string => {
  return `col_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Hook for managing collections - uses API for authenticated users, localStorage for guests
 */
export const useCollections = () => {
  const queryClient = useQueryClient();
  const isLoggedIn = useIsAuthenticated();

  // Local state for guest users
  const [localCollections, setLocalCollections] = useState<Collection[]>([]);
  // Local items tracking (for API users to know which products are in which collections)
  const [collectionItems, setCollectionItems] = useState<Record<string, CollectionItem[]>>({});

  // Load local collections on mount (for guests)
  useEffect(() => {
    if (!isLoggedIn) {
      setLocalCollections(getStoredCollections());
    } else {
      // Load items mapping for API users
      setCollectionItems(getStoredItems());
    }
  }, [isLoggedIn]);

  // API query for authenticated users
  const { data: apiCollections, isLoading } = useQuery({
    queryKey: ['collections'],
    queryFn: collectionsService.getCollections,
    enabled: isLoggedIn,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: false,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (!isLoggedIn || !apiCollections) return;
    const apiItems = apiCollections.reduce<Record<string, CollectionItem[]>>((acc, collection) => {
      if (Array.isArray(collection.items) && collection.items.length > 0) {
        const normalizedItems = collection.items
          .filter(item => Boolean(item.productId))
          .map(item => ({
            productId: item.productId,
            addedAt: new Date(item.addedAt).getTime(),
          }));

        if (normalizedItems.length > 0) {
          acc[collection.id] = normalizedItems;
        }
      }
      return acc;
    }, {});

    if (Object.keys(apiItems).length > 0) {
      setCollectionItems(apiItems);
      saveItems(apiItems);
    }
  }, [apiCollections, isLoggedIn]);

  // Transform API collections to local format, including locally tracked items
  const collections: Collection[] = isLoggedIn
    ? (apiCollections || []).map(c => {
        const apiItems = Array.isArray(c.items)
          ? c.items
              .filter(item => Boolean(item.productId))
              .map(item => ({
                productId: item.productId,
                addedAt: new Date(item.addedAt).getTime(),
              }))
          : [];

        return {
          id: c.id,
          name: c.name,
          emoji: c.emoji,
          description: c.description,
          items: apiItems.length > 0 ? apiItems : collectionItems[c.id] || [],
          productCount: c.productCount,
          createdAt: new Date(c.createdAt).getTime(),
          updatedAt: new Date(c.updatedAt).getTime(),
        };
      })
    : localCollections;

  // Create collection mutation
  const createMutation = useMutation({
    mutationFn: (data: { name: string; emoji?: string; description?: string }) =>
      collectionsService.createCollection(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] });
    },
  });

  // Update collection mutation
  const updateMutation = useMutation({
    mutationFn: ({
      id,
      ...data
    }: {
      id: string;
      name?: string;
      emoji?: string;
      description?: string;
    }) => collectionsService.updateCollection(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] });
    },
  });

  // Delete collection mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => collectionsService.deleteCollection(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] });
    },
  });

  // Add to collection mutation
  const addItemMutation = useMutation({
    mutationFn: async ({
      collectionId,
      productId,
      notes,
    }: {
      collectionId: string;
      productId: string;
      notes?: string;
    }) => {
      const latest = await queryClient.fetchQuery({
        queryKey: ['collections'],
        queryFn: collectionsService.getCollections,
      });
      const match = (latest ?? []).find(collection => collection.id === collectionId);
      if (!match) {
        throw new Error('Collection not found');
      }
      return collectionsService.addToCollection(match.id, productId, notes);
    },
    onSuccess: (item, variables) => {
      queryClient.invalidateQueries({ queryKey: ['collections'] });

      if (!item?.productId) return;
      setCollectionItems(prev => {
        const existing = prev[variables.collectionId] ?? [];
        if (existing.some(existingItem => existingItem.productId === item.productId)) {
          return prev;
        }
        const updated = {
          ...prev,
          [variables.collectionId]: [
            ...existing,
            {
              productId: item.productId,
              addedAt: new Date(item.addedAt).getTime(),
            },
          ],
        };
        saveItems(updated);
        return updated;
      });
    },
  });

  // Remove from collection mutation
  const removeItemMutation = useMutation({
    mutationFn: ({ collectionId, productId }: { collectionId: string; productId: string }) =>
      collectionsService.removeFromCollection(collectionId, productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] });
    },
  });

  /**
   * Create a new collection
   */
  const createCollection = useCallback(
    async (name: string, emoji?: string, description?: string): Promise<Collection | null> => {
      const trimmedName = name.trim();
      if (!trimmedName) return null;

      if (isLoggedIn) {
        const created = await createMutation.mutateAsync({
          name: trimmedName,
          emoji,
          description,
        });
        const normalized = created ? toLocalCollection(created) : null;
        if (normalized?.id) return normalized;

        await queryClient.invalidateQueries({ queryKey: ['collections'] });
        const refreshed = await queryClient.fetchQuery({
          queryKey: ['collections'],
          queryFn: collectionsService.getCollections,
        });
        const match = (refreshed ?? []).find(
          collection => collection.name === trimmedName && collection.emoji === emoji
        );
        return match ? toLocalCollection(match) : null;
      }

      const newCollection: Collection = {
        id: generateId(),
        name: trimmedName,
        emoji,
        description,
        items: [],
        productCount: 0,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      setLocalCollections(prev => {
        const updated = [...prev, newCollection];
        saveCollections(updated);
        return updated;
      });

      return newCollection;
    },
    [isLoggedIn, createMutation]
  );

  /**
   * Delete a collection
   */
  const deleteCollection = useCallback(
    (collectionId: string) => {
      if (isLoggedIn) {
        deleteMutation.mutate(collectionId);
        // Also remove from local tracking
        setCollectionItems(prev => {
          const updated = { ...prev };
          delete updated[collectionId];
          saveItems(updated);
          return updated;
        });
      } else {
        setLocalCollections(prev => {
          const updated = prev.filter(c => c.id !== collectionId);
          saveCollections(updated);
          return updated;
        });
      }
    },
    [isLoggedIn, deleteMutation]
  );

  /**
   * Update collection details
   */
  const updateCollection = useCallback(
    (
      collectionId: string,
      updates: Partial<Pick<Collection, 'name' | 'emoji' | 'description'>>
    ) => {
      if (isLoggedIn) {
        updateMutation.mutate({ id: collectionId, ...updates });
      } else {
        setLocalCollections(prev => {
          const updated = prev.map(c =>
            c.id === collectionId ? { ...c, ...updates, updatedAt: Date.now() } : c
          );
          saveCollections(updated);
          return updated;
        });
      }
    },
    [isLoggedIn, updateMutation]
  );

  /**
   * Add product to collection
   */
  const addToCollection = useCallback(
    (collectionId: string, productId: string, notes?: string) => {
      if (isLoggedIn) {
        // Call API
        addItemMutation.mutate({ collectionId, productId, notes });
      } else {
        setLocalCollections(prev => {
          const updated = prev.map(c => {
            if (c.id !== collectionId) return c;

            // Check if already in collection
            if (c.items.some(item => item.productId === productId)) return c;

            return {
              ...c,
              items: [...c.items, { productId, addedAt: Date.now() }],
              updatedAt: Date.now(),
            };
          });
          saveCollections(updated);
          return updated;
        });
      }
    },
    [isLoggedIn, addItemMutation]
  );

  /**
   * Remove product from collection
   */
  const removeFromCollection = useCallback(
    (collectionId: string, productId: string) => {
      if (isLoggedIn) {
        // Call API
        removeItemMutation.mutate({ collectionId, productId });
        // Also update local tracking
        setCollectionItems(prev => {
          const items = prev[collectionId] || [];
          const updated = {
            ...prev,
            [collectionId]: items.filter(item => item.productId !== productId),
          };
          saveItems(updated);
          return updated;
        });
      } else {
        setLocalCollections(prev => {
          const updated = prev.map(c => {
            if (c.id !== collectionId) return c;

            return {
              ...c,
              items: c.items.filter(item => item.productId !== productId),
              updatedAt: Date.now(),
            };
          });
          saveCollections(updated);
          return updated;
        });
      }
    },
    [isLoggedIn, removeItemMutation]
  );

  /**
   * Check if product is in any collection
   */
  const getProductCollections = useCallback(
    (productId: string): Collection[] => {
      return collections.filter(c => c.items.some(item => item.productId === productId));
    },
    [collections]
  );

  /**
   * Check if product is in specific collection
   */
  const isInCollection = useCallback(
    (collectionId: string, productId: string): boolean => {
      const collection = collections.find(c => c.id === collectionId);
      return collection?.items.some(item => item.productId === productId) ?? false;
    },
    [collections]
  );

  return {
    collections,
    isLoading,
    createCollection,
    deleteCollection,
    updateCollection,
    addToCollection,
    removeFromCollection,
    getProductCollections,
    isInCollection,
    templates: DEFAULT_COLLECTION_TEMPLATES,
  };
};

export default useCollections;
