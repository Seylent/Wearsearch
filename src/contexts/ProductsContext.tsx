import React, { createContext, useContext, ReactNode } from 'react';
import { useProducts } from '@/hooks/useApi';
import type { Product } from '@/types';

interface ProductsContextType {
  products: Product[];
  isLoading: boolean;
  error: any;
}

const ProductsContext = createContext<ProductsContextType | undefined>(undefined);

export function ProductsProvider({ children }: { children: ReactNode }) {
  // Only fetch for SearchDropdown - other components should use aggregated hooks
  // This is enabled by default for search functionality in Navigation
  const { data: productsData, isLoading, error } = useProducts({
    enabled: true, // Enable for search
    staleTime: 30 * 60 * 1000, // 30 minutes - search data stays fresh longer
  });
  
  const products = React.useMemo(() => {
    if (!productsData) return [];
    return productsData.products || productsData || [];
  }, [productsData]);
  
  return (
    <ProductsContext.Provider value={{ products, isLoading, error }}>
      {children}
    </ProductsContext.Provider>
  );
}

export function useProductsContext() {
  const context = useContext(ProductsContext);
  if (context === undefined) {
    // Return empty data if not in provider (optional context)
    return { products: [], isLoading: false, error: null };
  }
  return context;
}
