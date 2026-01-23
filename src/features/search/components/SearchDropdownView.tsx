/**
 * SearchDropdown View Component (Pure UI)
 * Orchestrates smaller UI components
 */

import React from 'react';
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
  }) => {
    const { t } = useTranslation();

    return (
      <div
        role="dialog"
        aria-modal="true"
        className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-start justify-center pt-2 sm:pt-4 p-4"
        aria-label={t('aria.searchResults')}
      >
        <div
          ref={dropdownRef}
          className="w-full max-w-2xl bg-black/95 border border-white/20 backdrop-blur-xl rounded-2xl shadow-[0_0_50px_rgba(255,255,255,0.2)] overflow-hidden"
          role="search"
        >
          <SearchInput
            value={query}
            onChange={onQueryChange}
            onClose={onClose}
            onSubmit={onViewAll}
            inputRef={inputRef}
          />

          <div className="max-h-[60vh] overflow-y-auto">
            <SearchResults
              query={query}
              results={results}
              isLoading={isLoading}
              showNoResults={showNoResults}
              onResultClick={onResultClick}
              onViewAll={onViewAll}
            />

            <SearchHistory
              query={query}
              searchHistory={searchHistory}
              popularQueries={popularQueries}
              onHistoryClick={onHistoryClick}
              onRemoveHistory={onRemoveHistory}
              onClearHistory={onClearHistory}
            />
          </div>
        </div>
      </div>
    );
  }
);

SearchDropdownView.displayName = 'SearchDropdownView';
