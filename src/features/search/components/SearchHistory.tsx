/**
 * Search History Component (Pure UI)
 * Displays search history and popular searches
 */

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
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

export const SearchHistory: React.FC<SearchHistoryProps> = React.memo(
  ({
    query,
    searchHistory = [],
    popularQueries = [],
    onHistoryClick,
    onRemoveHistory,
    onClearHistory,
  }) => {
    const { t } = useTranslation();
    const reduceMotion = useReducedMotion();

    const listVariants = {
      hidden: { opacity: 1 },
      show: {
        opacity: 1,
        transition: reduceMotion ? {} : { staggerChildren: 0.04 },
      },
    };

    const itemVariants = {
      hidden: reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 },
      show: reduceMotion
        ? { opacity: 1, y: 0 }
        : { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
    };

    // Only show when query is empty/short
    if (query.length >= 2) {
      return null;
    }

    return (
      <div className="rounded-2xl border border-border bg-muted/30 p-4 sm:p-5">
        {/* Popular Searches */}
        {popularQueries.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-[0.2em] sm:tracking-[0.3em]">
                {t('search.mostSearched', 'Most searched')}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {popularQueries.slice(0, 8).map(popularQuery => (
                <button
                  key={popularQuery}
                  onClick={() => onHistoryClick?.(popularQuery)}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-full text-[10px] sm:text-xs uppercase tracking-[0.16em] sm:tracking-[0.2em] bg-white border border-border text-muted-foreground hover:text-foreground hover:border-foreground/40 transition-colors"
                >
                  {popularQuery}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Search History */}
        {searchHistory.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-[0.2em] sm:tracking-[0.3em] flex items-center gap-2">
                <History className="w-3 h-3" />
                {t('search.recentSearches', 'Recent Searches')}
              </span>
              {onClearHistory && (
                <button
                  onClick={onClearHistory}
                  className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                  {t('search.clearHistory', 'Clear')}
                </button>
              )}
            </div>
            <motion.div
              className="space-y-2"
              variants={listVariants}
              initial="hidden"
              animate="show"
            >
              {searchHistory.slice(0, 5).map(item => (
                <motion.div
                  key={item.query}
                  className="flex items-center justify-between group px-3 py-2 rounded-xl bg-white border border-border hover:border-foreground/30 transition-colors"
                  variants={itemVariants}
                >
                  <button
                    onClick={() => onHistoryClick?.(item.query)}
                    className="flex items-center gap-3 flex-1 text-left"
                  >
                    <History className="w-4 h-4 text-muted-foreground" />
                    <span className="text-foreground/80 text-sm">{item.query}</span>
                  </button>
                  {onRemoveHistory && (
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        onRemoveHistory(item.query);
                      }}
                      className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 text-muted-foreground hover:text-foreground p-1 transition-opacity"
                      aria-label={t('search.removeFromHistory', 'Remove from history')}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </motion.div>
              ))}
            </motion.div>
          </div>
        )}

        {/* Empty state when no history */}
        {searchHistory.length === 0 && popularQueries.length === 0 && (
          <div className="text-center py-6">
            <Search className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
            <p className="text-muted-foreground">
              {t('search.startTyping', 'Start typing to search products and stores...')}
            </p>
            <p className="text-muted-foreground text-sm mt-2">
              {t('search.hint', 'Search by product name, brand, category, or store name')}
            </p>
          </div>
        )}
      </div>
    );
  }
);

SearchHistory.displayName = 'SearchHistory';
