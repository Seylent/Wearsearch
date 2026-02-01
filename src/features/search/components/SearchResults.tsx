/**
 * Search Results Component (Pure UI)
 * Displays search results with loading and empty states
 */

import React, { useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import Image from 'next/image';
import { Search, Store as StoreIcon, Package } from 'lucide-react';
import { convertS3UrlToHttps } from '@/lib/utils';
import { getCategoryTranslation } from '@/utils/translations';
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslation } from 'react-i18next';
import { useCurrencyConversion } from '@/hooks/useCurrencyConversion';
import type { SearchResult } from '../hooks/useProductSearch';

interface SearchResultsProps {
  query: string;
  results: SearchResult[];
  isLoading: boolean;
  showNoResults: boolean;
  onResultClick: (result: { id: string; type: 'product' | 'store' }) => void;
  onViewAll: () => void;
}

export const SearchResults: React.FC<SearchResultsProps> = React.memo(
  ({ query, results, isLoading, showNoResults, onResultClick, onViewAll }) => {
    const { t } = useTranslation();
    const { formatPrice } = useCurrencyConversion();
    const skeletonRows = useMemo(() => Array.from({ length: 6 }, (_, i) => i), []);
    const reduceMotion = useReducedMotion();

    const productResults = useMemo(
      () => results.filter(result => result.type === 'product'),
      [results]
    );
    const storeResults = useMemo(
      () => results.filter(result => result.type === 'store'),
      [results]
    );

    const listVariants = {
      hidden: { opacity: 1 },
      show: {
        opacity: 1,
        transition: reduceMotion ? {} : { staggerChildren: 0.03 },
      },
    };

    const itemVariants = {
      hidden: reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 },
      show: reduceMotion
        ? { opacity: 1, y: 0 }
        : { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
    };

    if (isLoading && query.length >= 2) {
      return (
        <div className="pb-6">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {skeletonRows.map(i => (
              <div key={i} className="p-3 border border-border rounded-2xl">
                <Skeleton className="h-28 w-full rounded-xl bg-muted" />
                <div className="mt-3 space-y-2">
                  <Skeleton className="h-3 w-3/4 bg-muted" />
                  <Skeleton className="h-3 w-1/2 bg-muted" />
                </div>
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            {t('search.searching', 'Searching...')}
          </p>
        </div>
      );
    }

    if (showNoResults) {
      return (
        <div className="p-6 text-center">
          <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
            <Search className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">
            {t('search.noResults', 'No products or stores found for "{{query}}"', { query })}
          </p>
          <p className="text-muted-foreground text-sm mt-2">
            {t('search.tryDifferent', 'Try a different search term')}
          </p>
        </div>
      );
    }

    if (results.length === 0) {
      return null;
    }

    return (
      <>
        {productResults.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                {t('search.suggestedProducts', 'Suggested products')}
              </span>
            </div>
            <motion.div
              className="grid grid-cols-2 lg:grid-cols-3 gap-4"
              variants={listVariants}
              initial="hidden"
              animate="show"
            >
              {productResults.map(result => (
                <motion.button
                  key={`product-${result.id}`}
                  onClick={() => onResultClick({ id: result.id, type: result.type })}
                  className="group text-left rounded-2xl border border-border bg-white hover:bg-muted/40 transition-colors p-3"
                  variants={itemVariants}
                >
                  <div className="relative w-full h-28 rounded-xl overflow-hidden bg-muted">
                    {result.image ? (
                      <Image
                        src={convertS3UrlToHttps(result.image)}
                        alt={result.name}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="(max-width: 1024px) 50vw, 20vw"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-6 h-6 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="mt-3">
                    <p className="text-sm font-medium text-foreground truncate">{result.name}</p>
                    <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                      <span className="truncate">
                        {result.category ? getCategoryTranslation(result.category) : ''}
                      </span>
                      {result.price && (
                        <span className="text-foreground font-medium">
                          {formatPrice(Number(result.price))}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.button>
              ))}
            </motion.div>
          </div>
        )}

        {storeResults.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                {t('search.suggestedStores', 'Stores')}
              </span>
            </div>
            <motion.div
              className="space-y-2"
              variants={listVariants}
              initial="hidden"
              animate="show"
            >
              {storeResults.map(result => (
                <motion.button
                  key={`store-${result.id}`}
                  onClick={() => onResultClick({ id: result.id, type: result.type })}
                  className="w-full p-3 flex items-center gap-3 rounded-xl border border-border bg-white hover:bg-muted/40 transition-colors text-left"
                  variants={itemVariants}
                >
                  <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 border border-border bg-muted">
                    {result.logo_url ? (
                      <Image
                        src={convertS3UrlToHttps(result.logo_url)}
                        alt={result.name}
                        width={48}
                        height={48}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <StoreIcon className="w-5 h-5 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{result.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {result.product_count !== undefined
                        ? `${result.product_count} ${t('search.products', 'products')}`
                        : t('search.viewStore', 'View store')}
                    </p>
                  </div>
                </motion.button>
              ))}
            </motion.div>
          </div>
        )}

        {/* View All Button */}
        {query.trim() && (
          <div className="mt-6">
            <button
              onClick={onViewAll}
              className="w-full py-3 px-4 bg-black text-white rounded-full font-medium transition-colors hover:bg-black/90"
            >
              {t('search.viewAll', 'View All Results for "{{query}}"', { query })}
            </button>
          </div>
        )}
      </>
    );
  }
);

SearchResults.displayName = 'SearchResults';
