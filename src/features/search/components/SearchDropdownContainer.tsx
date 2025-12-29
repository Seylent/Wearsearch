/**
 * SearchDropdown Container Component
 * Handles business logic, data fetching, and event handling
 */

import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProductSearch } from '../hooks/useProductSearch';
import { SearchDropdownView } from './SearchDropdownView';

interface SearchDropdownContainerProps {
  onClose: () => void;
}

export const SearchDropdownContainer: React.FC<SearchDropdownContainerProps> = ({ onClose }) => {
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
  const handleResultClick = (productId: string) => {
    navigate(`/product/${productId}`);
    onClose();
  };

  const handleViewAll = () => {
    if (search.query.trim()) {
      navigate(`/products?search=${encodeURIComponent(search.query)}`);
      onClose();
    }
  };

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
};
