'use client';

import { createContext, useContext, ReactNode, useMemo, useCallback } from 'react';
import { useFavorites } from '@/hooks/useApi';
import { useAuth } from '@/features/auth/hooks/useAuth';

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null;

const toOptionalString = (value: unknown): string | undefined => {
  if (typeof value === 'string') return value;
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  return undefined;
};

const getFavoriteProductId = (favorite: unknown): string | undefined => {
  if (!isRecord(favorite)) return undefined;
  return (
    toOptionalString(favorite.product_id) ??
    toOptionalString(favorite.productId) ??
    toOptionalString(favorite.id)
  );
};

interface FavoritesContextType {
  favorites: unknown[];
  isLoading: boolean;
  isFavorited: (productId: string) => boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: Readonly<{ children: ReactNode }>) {
  const { isAuthenticated } = useAuth();
  
  // Only fetch favorites if user is authenticated
  const { data: favoritesData, isLoading } = useFavorites();
  
  // Memoize favorites array to prevent unnecessary changes
  const favorites = useMemo(() => {
    return isAuthenticated ? favoritesData?.favorites ?? [] : [];
  }, [isAuthenticated, favoritesData?.favorites]);
  
  // Wrap isFavorited in useCallback to keep it stable
  const isFavorited = useCallback((productId: string) => {
    if (!Array.isArray(favorites)) return false;
    const target = String(productId);
    return favorites.some((fav) => {
      const favProductId = getFavoriteProductId(fav);
      return favProductId !== undefined && String(favProductId) === target;
    });
  }, [favorites]);
  
  const value = useMemo(() => ({
    favorites,
    isLoading,
    isFavorited
  }), [favorites, isLoading, isFavorited]);

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavoritesContext() {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavoritesContext must be used within FavoritesProvider');
  }
  return context;
}
