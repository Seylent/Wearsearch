/**
 * Search Results Component (Pure UI)
 * Displays search results with loading and empty states
 */

import React, { useMemo } from 'react';
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
    const skeletonRows = useMemo(() => Array.from({ length: 5 }, (_, i) => i), []);

    if (isLoading && query.length >= 2) {
      return (
        <div className="p-4">
          <div className="space-y-3">
            {skeletonRows.map(i => (
              <div key={i} className="flex items-center gap-4 p-2">
                <Skeleton className="h-16 w-16 rounded-lg bg-white/10" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-2/3 bg-white/10" />
                  <Skeleton className="h-3 w-1/2 bg-white/10" />
                </div>
                <Skeleton className="h-4 w-14 bg-white/10" />
              </div>
            ))}
          </div>
          <p className="mt-4 text-center text-white/60">{t('search.searching', 'Searching...')}</p>
        </div>
      );
    }

    if (showNoResults) {
      return (
        <div className="p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
            <Search className="w-8 h-8 text-white/40" />
          </div>
          <p className="text-white/60">
            {t('search.noResults', 'No products or stores found for "{{query}}"', { query })}
          </p>
          <p className="text-white/40 text-sm mt-2">
            {t('search.tryDifferent', 'Try a different search term')}
          </p>
          <p className="text-white/30 text-xs mt-4">
            💡 Tip: Check browser console (F12) for debug info
          </p>
        </div>
      );
    }

    if (results.length === 0) {
      return null;
    }

    return (
      <>
        <div className="divide-y divide-white/5">
          {results.map(result => {
            const isStore = result.type === 'store';

            return (
              <button
                key={`${result.type}-${result.id}`}
                onClick={() => onResultClick({ id: result.id, type: result.type })}
                className={`w-full p-4 flex items-center gap-4 hover:bg-white/5 transition-colors text-left group ${
                  isStore ? 'bg-white/[0.02]' : ''
                }`}
              >
                {/* Image/Logo */}
                <div
                  className={`w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border ${
                    isStore ? 'bg-white/10 border-white/20' : 'bg-white/5 border-white/10'
                  }`}
                >
                  {result.image || result.logo_url ? (
                    <Image
                      src={convertS3UrlToHttps(result.image || result.logo_url || '')}
                      alt={result.name}
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      {isStore ? (
                        <StoreIcon className="w-6 h-6 text-white/40" />
                      ) : (
                        <Package className="w-6 h-6 text-white/20" />
                      )}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {isStore && (
                      <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/10 border border-white/20">
                        <StoreIcon className="w-3 h-3" />
                        <span className="text-[10px] font-medium uppercase tracking-wider">
                          Store
                        </span>
                      </div>
                    )}
                    <h3 className="font-medium text-white group-hover:text-white/90 transition-colors truncate">
                      {result.name}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-white/50">
                    {isStore ? (
                      <>
                        {result.product_count !== undefined && (
                          <span className="truncate">{result.product_count} products</span>
                        )}
                        <span className="text-white/30">→ View all products</span>
                      </>
                    ) : (
                      <>
                        {result.category && (
                          <span className="truncate">
                            {getCategoryTranslation(result.category)}
                          </span>
                        )}
                        {result.brand && result.category && <span>•</span>}
                        {result.brand && <span className="truncate">{result.brand}</span>}
                      </>
                    )}
                  </div>
                </div>

                {/* Price (only for products) */}
                {!isStore && result.price && (
                  <div className="text-white font-medium flex-shrink-0">
                    {formatPrice(Number(result.price))}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* View All Button */}
        {query.trim() && (
          <div className="p-4 border-t border-white/10">
            <button
              onClick={onViewAll}
              className="w-full py-3 px-4 bg-white/10 hover:bg-white/15 rounded-xl text-white font-medium transition-colors"
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
