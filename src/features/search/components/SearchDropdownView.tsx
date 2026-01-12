/**
 * SearchDropdown View Component (Pure UI)
 * No business logic - only receives props and renders UI
 */

import React, { useMemo } from 'react';
import { Search, X, Store as StoreIcon, Package, History, TrendingUp, Trash2 } from 'lucide-react';
import { convertS3UrlToHttps } from '@/lib/utils';
import { getCategoryTranslation } from '@/utils/translations';
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslation } from 'react-i18next';
import { useCurrencyConversion } from '@/hooks/useCurrencyConversion';
import type { SearchResult } from '../hooks/useProductSearch';
import type { SearchHistoryItem } from '@/hooks/useSearchHistory';

interface SearchDropdownViewProps {
  query: string;
  onQueryChange: (value: string) => void;
  results: SearchResult[];
  isLoading: boolean;
  showNoResults: boolean;
  onClose: () => void;
  onResultClick: (result: { id: string; type: 'product' | 'store' }) => void;
  onViewAll: () => void;
  inputRef: React.RefObject<HTMLInputElement>;
  dropdownRef: React.RefObject<HTMLDivElement>;
  searchHistory?: SearchHistoryItem[];
  popularQueries?: string[];
  onHistoryClick?: (query: string) => void;
  onRemoveHistory?: (query: string) => void;
  onClearHistory?: () => void;
}

export const SearchDropdownView: React.FC<SearchDropdownViewProps> = React.memo(({
  query,
  onQueryChange,
  results,
  isLoading,
  showNoResults,
  onClose,
  onResultClick,
  onViewAll,
  inputRef,
  dropdownRef,
  searchHistory = [],
  popularQueries = [],
  onHistoryClick,
  onRemoveHistory,
  onClearHistory,
}) => {
  const { t } = useTranslation();
  const { formatPrice } = useCurrencyConversion();

  const skeletonRows = useMemo(() => Array.from({ length: 5 }, (_, i) => i), []);

  return (
    <div 
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-start justify-center pt-24"
      aria-label={t('aria.searchResults')}
    >
      <div 
        ref={dropdownRef}
        className="w-full max-w-2xl mx-4 bg-black/95 border border-white/20 backdrop-blur-xl rounded-2xl shadow-[0_0_50px_rgba(255,255,255,0.2)] overflow-hidden"
        role="search"
      >
        {/* Search Input */}
        <div className="p-4 border-b border-white/10">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && query.trim()) {
                  onViewAll();
                }
              }}
              placeholder={t('search.placeholder', 'Search for products, stores, or brands...')}
              className="w-full h-14 pl-12 pr-12 bg-white/5 border border-white/20 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-white/40 focus:shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all"
              aria-label={t('aria.searchInput')}
              role="searchbox"
              aria-autocomplete="list"
            />
            <button
              onClick={onClose}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors"
              aria-label={t('aria.closeSearch')}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto">
          {isLoading && query.length >= 2 && (
            <div className="p-4">
              <div className="space-y-3">
                {skeletonRows.map((i) => (
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
          )}

          {showNoResults && (
            <div className="p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
                <Search className="w-8 h-8 text-white/40" />
              </div>
              <p className="text-white/60">{t('search.noResults', 'No products or stores found for "{{query}}"', { query })}</p>
              <p className="text-white/40 text-sm mt-2">{t('search.tryDifferent', 'Try a different search term')}</p>
              <p className="text-white/30 text-xs mt-4">💡 Tip: Check browser console (F12) for debug info</p>
            </div>
          )}

          {results.length > 0 && (
            <>
              <div className="divide-y divide-white/5">
                {results.map((result) => {
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
                      <div className={`w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border ${
                        isStore ? 'bg-white/10 border-white/20' : 'bg-white/5 border-white/10'
                      }`}>
                        {result.image || result.logo_url ? (
                          <img
                            src={convertS3UrlToHttps(result.image || result.logo_url || '')}
                            alt={result.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                            decoding="async"
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
                              <span className="text-[10px] font-medium uppercase tracking-wider">Store</span>
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
                                <span className="truncate">{getCategoryTranslation(result.category)}</span>
                              )}
                              {result.brand && result.category && (
                                <span>•</span>
                              )}
                              {result.brand && (
                                <span className="truncate">{result.brand}</span>
                              )}
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
          )}

          {/* Search History and Popular - show when query is empty/short */}
          {query.length < 2 && (
            <div className="p-4">
              {/* Search History */}
              {searchHistory.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium text-white/40 uppercase tracking-wider flex items-center gap-2">
                      <History className="w-3 h-3" />
                      {t('search.recentSearches', 'Recent Searches')}
                    </span>
                    {onClearHistory && (
                      <button
                        onClick={onClearHistory}
                        className="text-xs text-white/40 hover:text-white flex items-center gap-1 transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                        {t('search.clearHistory', 'Clear')}
                      </button>
                    )}
                  </div>
                  <div className="space-y-1">
                    {searchHistory.slice(0, 5).map((item) => (
                      <div
                        key={item.query}
                        className="flex items-center justify-between group px-3 py-2 rounded-lg hover:bg-white/5 transition-colors"
                      >
                        <button
                          onClick={() => onHistoryClick?.(item.query)}
                          className="flex items-center gap-3 flex-1 text-left"
                        >
                          <History className="w-4 h-4 text-white/40" />
                          <span className="text-white/80">{item.query}</span>
                        </button>
                        {onRemoveHistory && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onRemoveHistory(item.query);
                            }}
                            className="opacity-0 group-hover:opacity-100 text-white/40 hover:text-white p-1 transition-opacity"
                            aria-label={t('search.removeFromHistory', 'Remove from history')}
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Popular Searches */}
              {popularQueries.length > 0 && (
                <div>
                  <span className="text-xs font-medium text-white/40 uppercase tracking-wider flex items-center gap-2 mb-3">
                    <TrendingUp className="w-3 h-3" />
                    {t('search.popular', 'Popular')}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {popularQueries.slice(0, 8).map((popularQuery) => (
                      <button
                        key={popularQuery}
                        onClick={() => onHistoryClick?.(popularQuery)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm bg-white/5 text-white/70 hover:bg-white/10 hover:text-white transition-colors"
                      >
                        <TrendingUp className="w-3 h-3" />
                        {popularQuery}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Empty state when no history */}
              {searchHistory.length === 0 && popularQueries.length === 0 && (
                <div className="text-center py-4">
                  <Search className="w-12 h-12 mx-auto mb-4 text-white/20" />
                  <p className="text-white/60">{t('search.startTyping', 'Start typing to search products and stores...')}</p>
                  <p className="text-white/40 text-sm mt-2">{t('search.hint', 'Search by product name, brand, category, or store name')}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

SearchDropdownView.displayName = 'SearchDropdownView';
