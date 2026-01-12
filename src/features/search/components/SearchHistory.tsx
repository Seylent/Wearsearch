/**
 * Search History Component (Pure UI)
 * Displays search history and popular searches
 */

import React from 'react';
import { Search, History, TrendingUp, Trash2, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { SearchHistoryItem } from '@/hooks/useSearchHistory';

interface SearchHistoryProps {
  query: string;
  searchHistory?: SearchHistoryItem[];
  popularQueries?: string[];
  onHistoryClick?: (query: string) => void;
  onRemoveHistory?: (query: string) => void;
  onClearHistory?: () => void;
}

export const SearchHistory: React.FC<SearchHistoryProps> = React.memo(({
  query,
  searchHistory = [],
  popularQueries = [],
  onHistoryClick,
  onRemoveHistory,
  onClearHistory,
}) => {
  const { t } = useTranslation();

  // Only show when query is empty/short
  if (query.length >= 2) {
    return null;
  }

  return (
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
  );
});

SearchHistory.displayName = 'SearchHistory';