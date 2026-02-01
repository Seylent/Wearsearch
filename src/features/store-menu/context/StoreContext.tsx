/**
 * Store Context Provider
 * Manages selected store state and auto-selects first store if needed
 */

'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { useUserContext } from '../hooks/useStoreMenu';
import type { UserStore } from '../types';

interface StoreContextType {
  stores: UserStore[];
  selectedStore: UserStore | null;
  selectedStoreId: string | null;
  setSelectedStore: (storeId: string) => void;
  isLoading: boolean;
  hasNoStores: boolean;
}

const StoreContext = createContext<StoreContextType | null>(null);

const STORAGE_KEY = 'wearsearch.selectedStoreId';

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  const { data, isLoading } = useUserContext();

  const [selectedStoreId, setSelectedStoreIdState] = useState<string | null>(null);

  const stores = useMemo(() => data?.stores ?? [], [data?.stores]);
  const hasNoStores = !isLoading && stores.length === 0;

  // Get selected store from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setSelectedStoreIdState(stored);
      }
    }
  }, []);

  // Auto-select store when data loads
  useEffect(() => {
    if (stores.length > 0 && !selectedStoreId) {
      // Check URL param first
      const urlStoreId = searchParams.get('store_id');
      if (urlStoreId && stores.some(s => s.id === urlStoreId)) {
        setSelectedStoreIdState(urlStoreId);
        localStorage.setItem(STORAGE_KEY, urlStoreId);
      } else {
        // Auto-select first store
        const firstStore = stores[0];
        setSelectedStoreIdState(firstStore.id);
        localStorage.setItem(STORAGE_KEY, firstStore.id);
      }
    }
  }, [stores, selectedStoreId, searchParams]);

  const setSelectedStore = useCallback((storeId: string) => {
    setSelectedStoreIdState(storeId);
    localStorage.setItem(STORAGE_KEY, storeId);
  }, []);

  const selectedStore = stores.find(s => s.id === selectedStoreId) || null;

  const value: StoreContextType = {
    stores,
    selectedStore,
    selectedStoreId,
    setSelectedStore,
    isLoading,
    hasNoStores,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStoreContext() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStoreContext must be used within a StoreProvider');
  }
  return context;
}
