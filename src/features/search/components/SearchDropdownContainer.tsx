/**
 * SearchDropdown Container Component
 * Handles business logic, data fetching, and event handling
 */

import React, { useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProductSearch } from '../hooks/useProductSearch';
import { SearchDropdownView } from './SearchDropdownView';
import { detectSearchFilter } from '@/utils/searchFilters';

interface SearchDropdownContainerProps {
  onClose: () => void;
}

export const SearchDropdownContainer: React.FC<SearchDropdownContainerProps> = React.memo(({ onClose }) => {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Business logic from custom hook
  const search = useProductSearch();

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
  const handleResultClick = useCallback((result: { id: string; type: 'product' | 'store' }) => {
    if (result.type === 'store') {
      // Navigate to products page filtered by store
      navigate(`/products?store_id=${result.id}`);
    } else {
      // Navigate to product detail page
      navigate(`/product/${result.id}`);
    }
    onClose();
  }, [navigate, onClose]);

  const handleViewAll = useCallback(() => {
    if (search.query.trim()) {
      const detectedFilter = detectSearchFilter(search.query);
      
      // If we detected a color or category filter, navigate with that filter
      if (detectedFilter.type && detectedFilter.value) {
        if (detectedFilter.type === 'color') {
          navigate(`/products?color=${encodeURIComponent(detectedFilter.value)}`);
        } else if (detectedFilter.type === 'category') {
          navigate(`/products?type=${encodeURIComponent(detectedFilter.value)}`);
        }
      } else {
        // Otherwise, use standard search
        navigate(`/products?search=${encodeURIComponent(search.query)}`);
      }
      
      onClose();
    }
  }, [navigate, onClose, search.query]);

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
    />
  );
});

SearchDropdownContainer.displayName = 'SearchDropdownContainer';
