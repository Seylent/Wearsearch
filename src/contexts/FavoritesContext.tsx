import React, { createContext, useContext, ReactNode } from 'react';
import { useFavorites } from '@/hooks/useApi';
import { isAuthenticated } from '@/utils/authStorage';

interface FavoritesContextType {
  favorites: any[];
  isLoading: boolean;
  isFavorited: (productId: string) => boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const isLoggedIn = isAuthenticated();
  
  // Only fetch favorites if user is logged in
  const { data: favoritesData, isLoading } = useFavorites({
    enabled: isLoggedIn,
  });
  
  const favorites = favoritesData?.favorites || [];
  
  // Debug log
  React.useEffect(() => {
    if (isLoggedIn) {
      console.log('[FavoritesContext] Fetched favorites:', favorites.length);
    }
  }, [favorites, isLoggedIn]);
  
  const isFavorited = (productId: string) => {
    return Array.isArray(favorites) && favorites.some(
      (fav: any) => {
        const favProductId = fav.product_id || fav.productId;
        return String(favProductId) === String(productId);
      }
    );
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
