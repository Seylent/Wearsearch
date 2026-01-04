import React, { createContext, useContext, ReactNode } from 'react';
import { useFavorites } from '@/hooks/useApi';
import { isAuthenticated } from '@/utils/authStorage';

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

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const isLoggedIn = isAuthenticated();
  
  // Only fetch favorites if user is logged in
  const { data: favoritesData, isLoading } = useFavorites();
  
  const favorites = isLoggedIn ? favoritesData?.favorites ?? [] : [];
  
  const isFavorited = (productId: string) => {
    if (!Array.isArray(favorites)) return false;
    const target = String(productId);
    return favorites.some((fav) => {
      const favProductId = getFavoriteProductId(fav);
      return favProductId !== undefined && String(favProductId) === target;
    });
  };
  
  return (
    <FavoritesContext.Provider value={{ favorites, isLoading, isFavorited }}>
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
