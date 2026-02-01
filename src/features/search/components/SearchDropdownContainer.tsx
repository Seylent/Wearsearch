/**
 * SearchDropdown Container Component
 * Handles business logic, data fetching, and event handling
 */

'use client';

import React, { useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useProductSearch } from '../hooks/useProductSearch';
import { SearchDropdownView } from './SearchDropdownView';
import { detectSearchFilter } from '@/utils/searchFilters';
import { useSearchHistory } from '@/hooks/useSearchHistory';

interface SearchDropdownContainerProps {
  onClose: () => void;
}

export const SearchDropdownContainer: React.FC<SearchDropdownContainerProps> = React.memo(
  ({ onClose }) => {
    const router = useRouter();
    const inputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Business logic from custom hook
    const search = useProductSearch();

    // Search history hook
    const { history, popularQueries, addToHistory, removeFromHistory, clearHistory } =
      useSearchHistory();

    // Focus input on mount
    useEffect(() => {
      inputRef.current?.focus();
    }, []);

    // Handle keyboard events
    useEffect(() => {
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };

      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }, [onClose]);

    // Handle click outside
    useEffect(() => {
      const handleClickOutside = (e: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
          onClose();
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    // Event handlers
    const handleResultClick = useCallback(
      (result: { id: string; type: 'product' | 'store' }) => {
        if (result.type === 'store') {
          // Navigate to products page filtered by store
          router.push(`/products?store_id=${result.id}`);
        } else {
          // Navigate to product detail page
          router.push(`/product/${result.id}`);
        }
        onClose();
      },
      [router, onClose]
    );

    const handleViewAll = useCallback(() => {
      if (search.query.trim()) {
        // Add to search history
        addToHistory(search.query);

        const detectedFilter = detectSearchFilter(search.query);

        // If we detected a color or category filter, navigate with that filter
        if (detectedFilter.type && detectedFilter.value) {
          if (detectedFilter.type === 'color') {
            router.push(`/products?color=${encodeURIComponent(detectedFilter.value)}`);
          } else if (detectedFilter.type === 'category') {
            router.push(`/products?type=${encodeURIComponent(detectedFilter.value)}`);
          }
        } else {
          // Otherwise, use standard search
          router.push(`/products?search=${encodeURIComponent(search.query)}`);
        }

        onClose();
      }
    }, [router, onClose, search.query, addToHistory]);

    // Handle history item click
    const handleHistoryClick = useCallback(
      (query: string) => {
        search.setQuery(query);
        addToHistory(query);
        router.push(`/products?search=${encodeURIComponent(query)}`);
        onClose();
      },
      [router, onClose, search, addToHistory]
    );

    return (
      <SearchDropdownView
        query={search.query}
        onQueryChange={search.setQuery}
        results={search.results}
        isLoading={search.isLoading}
        showNoResults={search.showNoResults}
        onClose={onClose}
        onResultClick={handleResultClick}
        onViewAll={handleViewAll}
        inputRef={inputRef}
        dropdownRef={dropdownRef}
        searchHistory={history}
        popularQueries={popularQueries}
        onHistoryClick={handleHistoryClick}
        onRemoveHistory={removeFromHistory}
        onClearHistory={clearHistory}
        rateLimitError={search.rateLimitError}
      />
    );
  }
);

SearchDropdownContainer.displayName = 'SearchDropdownContainer';
