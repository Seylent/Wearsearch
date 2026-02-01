/**
 * Saved Stores Hook
 * Manages favorite/saved stores with localStorage + API sync
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useIsAuthenticated } from '@/hooks/useIsAuthenticated';
import { api, apiLegacy } from '@/services/api';

const STORAGE_KEY = 'wearsearch_saved_stores';

export interface SavedStore {
  id: string;
  name: string;
  logo_url?: string;
  savedAt: number;
}

const toStoredTimestamp = (value: unknown): number | null => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Date.parse(value);
    return Number.isNaN(parsed) ? null : parsed;
  }
  return null;
};

const normalizeSavedStore = (entry: unknown): SavedStore | null => {
  if (!entry || typeof entry !== 'object') return null;
  const record = entry as Record<string, unknown>;
  const store = (
    record.store && typeof record.store === 'object' ? record.store : record
  ) as Record<string, unknown>;
  const id = String(record.store_id ?? store.id ?? record.id ?? '').trim();
  const name = String(store.name ?? record.name ?? '').trim();
  if (!id || !name) return null;
  const savedAt = toStoredTimestamp(record.saved_at ?? record.savedAt) ?? Date.now();
  return {
    id,
    name,
    logo_url: (store.logo_url ?? store.logoUrl ?? record.logo_url) as string | undefined,
    savedAt,
  };
};

const parseSavedStores = (data: unknown): SavedStore[] => {
  if (Array.isArray(data)) {
    return data.map(normalizeSavedStore).filter(Boolean) as SavedStore[];
  }
  if (data && typeof data === 'object') {
    const record = data as Record<string, unknown>;
    const stores = record.stores ?? record.items ?? record.data;
    if (Array.isArray(stores)) {
      return stores.map(normalizeSavedStore).filter(Boolean) as SavedStore[];
    }
  }
  return [];
};

/**
 * Get saved stores from localStorage
 */
const getStoredStores = (): SavedStore[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch {
    return [];
  }
};

/**
 * Save stores to localStorage
 */
const saveToStorage = (stores: SavedStore[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stores));
  } catch {
    console.warn('Failed to save stores to localStorage');
  }
};

/**
 * Hook for managing saved stores
 */
export const useSavedStores = () => {
  const queryClient = useQueryClient();
  const isLoggedIn = useIsAuthenticated();
  const [localStores, setLocalStores] = useState<SavedStore[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    setLocalStores(getStoredStores());
  }, []);

  // Fetch saved stores from API if logged in
  const { data: apiStores, isLoading } = useQuery({
    queryKey: ['savedStores'],
    queryFn: async () => {
      try {
        // Try v1 API first
        const response = await api.get('/users/me/saved-stores', {
          headers: { 'X-Skip-Retry': 'true' },
        });
        return parseSavedStores(response.data);
      } catch {
        // Fallback to legacy API
        try {
          const response = await apiLegacy.get('/user/saved-stores', {
            headers: { 'X-Skip-Retry': 'true' },
          });
          return parseSavedStores(response.data);
        } catch {
          return [];
        }
      }
    },
    enabled: globalThis.window !== undefined && isLoggedIn,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error: { status?: number; response?: { status?: number } }) => {
      const status = error?.status ?? error?.response?.status;
      if (status === 401 || status === 429) return false;
      return failureCount < 1;
    },
  });

  // Combine local and API stores - memoize to prevent changing on every render
  const stores = useMemo(() => {
    return isLoggedIn ? apiStores || [] : localStores;
  }, [isLoggedIn, apiStores, localStores]);

  // Add store mutation
  const addStoreMutation = useMutation({
    mutationFn: async (store: { id: string; name: string; logo_url?: string }) => {
      if (isLoggedIn) {
        try {
          await api.post(`/users/me/saved-stores/${store.id}`);
        } catch {
          await apiLegacy.post(`/user/saved-stores/${store.id}`);
        }
      }
      return store;
    },
    onSuccess: store => {
      if (isLoggedIn) {
        queryClient.invalidateQueries({ queryKey: ['savedStores'] });
      } else {
        const newStore: SavedStore = {
          id: store.id,
          name: store.name,
          logo_url: store.logo_url,
          savedAt: Date.now(),
        };
        setLocalStores(prev => {
          const filtered = prev.filter(s => s.id !== store.id);
          const updated = [newStore, ...filtered];
          saveToStorage(updated);
          return updated;
        });
      }
    },
  });

  // Remove store mutation
  const removeStoreMutation = useMutation({
    mutationFn: async (storeId: string) => {
      if (isLoggedIn) {
        try {
          await api.delete(`/users/me/saved-stores/${storeId}`);
        } catch {
          await apiLegacy.delete(`/user/saved-stores/${storeId}`);
        }
      }
      return storeId;
    },
    onSuccess: storeId => {
      if (isLoggedIn) {
        queryClient.invalidateQueries({ queryKey: ['savedStores'] });
      } else {
        setLocalStores(prev => {
          const updated = prev.filter(s => s.id !== storeId);
          saveToStorage(updated);
          return updated;
        });
      }
    },
  });

  // Check if store is saved
  const isSaved = useCallback(
    (storeId: string): boolean => {
      return stores.some((s: SavedStore) => String(s.id) === String(storeId));
    },
    [stores]
  );

  // Add store
  const addStore = useCallback(
    (store: { id: string; name: string; logo_url?: string }) => {
      addStoreMutation.mutate(store);
    },
    [addStoreMutation]
  );

  // Remove store
  const removeStore = useCallback(
    (storeId: string) => {
      removeStoreMutation.mutate(storeId);
    },
    [removeStoreMutation]
  );

  // Toggle store
  const toggleStore = useCallback(
    (store: { id: string; name: string; logo_url?: string }) => {
      if (isSaved(store.id)) {
        removeStore(store.id);
      } else {
        addStore(store);
      }
    },
    [isSaved, addStore, removeStore]
  );

  // Clear all
  const clearAll = useCallback(() => {
    if (!isLoggedIn) {
      setLocalStores([]);
      saveToStorage([]);
    }
  }, [isLoggedIn]);

  return {
    stores,
    count: stores.length,
    isLoading,
    isSaved,
    addStore,
    removeStore,
    toggleStore,
    clearAll,
    isAddingStore: addStoreMutation.isPending,
    isRemovingStore: removeStoreMutation.isPending,
  };
};

export default useSavedStores;
