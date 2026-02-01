/**
 * SearchDropdown View Component (Pure UI)
 * Orchestrates smaller UI components
 */

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import type { SearchResult } from '../hooks/useProductSearch';
import type { SearchHistoryItem } from '@/hooks/useSearchHistory';
import dynamic from 'next/dynamic';

const SearchInput = dynamic(() => import('./SearchInput').then(mod => mod.SearchInput), {
  ssr: false,
  loading: () => null,
});

const SearchResults = dynamic(() => import('./SearchResults').then(mod => mod.SearchResults), {
  ssr: false,
  loading: () => null,
});

const SearchHistory = dynamic(() => import('./SearchHistory').then(mod => mod.SearchHistory), {
  ssr: false,
  loading: () => null,
});

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
  rateLimitError?: string | null;
}

export const SearchDropdownView: React.FC<Readonly<SearchDropdownViewProps>> = React.memo(
  ({
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
    rateLimitError,
  }) => {
    const { t } = useTranslation();
    const reduceMotion = useReducedMotion();

    const overlayTransition = reduceMotion ? { duration: 0 } : { duration: 0.4 };
    const panelTransition = reduceMotion
      ? { duration: 0 }
      : { duration: 0.6, ease: [0.22, 1, 0.36, 1] };

    return (
      <motion.div
        role="dialog"
        aria-modal="true"
        className="fixed inset-0 z-[100] bg-white/80 backdrop-blur-sm flex items-start justify-center pt-4 sm:pt-8 px-4 pb-6"
        aria-label={t('aria.searchResults')}
        initial={reduceMotion ? { opacity: 1 } : { opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={reduceMotion ? { opacity: 1 } : { opacity: 0 }}
        transition={overlayTransition}
      >
        <motion.div
          ref={dropdownRef}
          className="w-full max-w-6xl bg-white border border-border shadow-[0_30px_90px_rgba(0,0,0,0.12)] rounded-3xl overflow-hidden"
          role="search"
          initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: -10 }}
          transition={panelTransition}
        >
          <SearchInput
            value={query}
            onChange={onQueryChange}
            onClose={onClose}
            onSubmit={onViewAll}
            onClear={() => onQueryChange('')}
            inputRef={inputRef}
          />

          {rateLimitError && (
            <div className="px-6 py-2 bg-destructive/10 border-y border-destructive/20">
              <p className="text-sm text-destructive">{rateLimitError}</p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_2fr] gap-6 px-6 pb-6 pt-4 max-h-[70vh] overflow-y-auto">
            <div className="order-2 lg:order-1">
              <SearchHistory
                query={query}
                searchHistory={searchHistory}
                popularQueries={popularQueries}
                onHistoryClick={onHistoryClick}
                onRemoveHistory={onRemoveHistory}
                onClearHistory={onClearHistory}
              />
            </div>
            <div className="order-1 lg:order-2">
              <SearchResults
                query={query}
                results={results}
                isLoading={isLoading}
                showNoResults={showNoResults}
                onResultClick={onResultClick}
                onViewAll={onViewAll}
              />
            </div>
          </div>
        </motion.div>
      </motion.div>
    );
  }
);

SearchDropdownView.displayName = 'SearchDropdownView';
