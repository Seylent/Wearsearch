/**
 * Memoized Product Grid Component
 * Optimized for performance with React.memo
 */
'use client';

import { memo } from 'react';
import ProductCard from '@/components/ProductCard';
import { ProductGridSkeleton } from '@/components/common/SkeletonLoader';
import {
  NoProductsFound,
  NoStoreProducts,
  ErrorState,
  NoSearchResults,
} from '@/components/common/EmptyState';
import type { Product } from '@/types';
import type { TFunction } from 'i18next';

// Helper to avoid nested ternaries for grid classes
function computeGridClass(columns: number): string {
  if (columns === 2) return 'grid-cols-2 sm:grid-cols-2';
  if (columns === 4) return 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4';
  return 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6';
}

// Format error details safely
function formatErrorDetails(err: unknown): string {
  if (err instanceof Error) {
    return err.message || 'Unknown error';
  }
  if (typeof err === 'string') {
    return err;
  }
  if (err && typeof err === 'object') {
    try {
      return JSON.stringify(err);
    } catch {
      return 'Unknown error';
    }
  }
  return 'Unknown error';
}

interface ProductGridProps {
  products: Product[];
  loading: boolean;
  error: unknown;
  layoutColumns: number;
  itemsPerPage: number;
  storeIdParam: string | null;
  searchQuery: string;
  isFilterActive: boolean;
  t: TFunction;
  onClearSearch: () => void;
  onReload: () => void;
}

// Memoized individual product card to prevent unnecessary re-renders
const MemoizedProductCard = memo(ProductCard);

export const ProductGrid = memo(function ProductGrid({
  products,
  loading,
  error,
  layoutColumns,
  itemsPerPage,
  storeIdParam,
  searchQuery,
  isFilterActive,
  t,
  onClearSearch,
  onReload,
}: ProductGridProps) {
  if (error && !loading) {
    return (
      <ErrorState
        title={t('common.error')}
        description={formatErrorDetails(error)}
        onRetry={onReload}
      />
    );
  }

  if (loading) {
    return <ProductGridSkeleton count={itemsPerPage} columns={layoutColumns as 2 | 3 | 4 | 6} />;
  }

  if (products.length === 0) {
    if (storeIdParam) {
      return <NoStoreProducts storeName="Selected Store" />;
    }

    const hasSearchOrFilters = Boolean(searchQuery) || isFilterActive;
    if (hasSearchOrFilters) {
      return <NoSearchResults query={searchQuery} onClearSearch={onClearSearch} />;
    }

    return <NoProductsFound />;
  }

  return (
    <div className={`grid ${computeGridClass(layoutColumns)} gap-3 sm:gap-6`}>
      {products.map((product, index) => (
        <MemoizedProductCard
          key={product.id}
          id={product.id}
          name={product.name}
          image={product.image_url || product.image || ''}
          price={product.price}
          minPrice={product.price_min ?? product.min_price}
          maxPrice={product.max_price ?? product.maxPrice}
          priceCurrency={
            product.currency === 'USD' || product.currency === 'UAH'
              ? product.currency
              : product.price_currency === 'USD' || product.price_currency === 'UAH'
                ? product.price_currency
                : undefined
          }
          brand={product.brand}
          priority={index < 4} // Priority loading for first 4 items
        />
      ))}
    </div>
  );
});

export default ProductGrid;
