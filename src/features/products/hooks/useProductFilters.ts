/**
 * Product Filters Hook
 * Manages all filtering logic for products page
 */

import { useCallback, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { Brand, Product } from '@/types';

export interface ProductFiltersState {
  searchQuery: string;
  selectedColors: string[];
  selectedTypes: string[];
  selectedGenders: string[];
  selectedBrand: string;
  brandSearchQuery: string;
  priceMin: number | null;
  priceMax: number | null;
}

export const useProductFilters = () => {
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedGenders, setSelectedGenders] = useState<string[]>([]);
  const [selectedBrand, setSelectedBrand] = useState('');
  const [brandSearchQuery, setBrandSearchQuery] = useState('');
  const [priceMin, setPriceMin] = useState<number | null>(null);
  const [priceMax, setPriceMax] = useState<number | null>(null);

  // Get store_id from URL params
  const storeIdParam = searchParams.get('store_id');

  // Toggle filters
  const toggleColor = useCallback((color: string) => {
    setSelectedColors((prev) => (prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]));
  }, []);

  const toggleType = useCallback((type: string) => {
    setSelectedTypes((prev) => (prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]));
  }, []);

  const toggleGender = useCallback((gender: string) => {
    setSelectedGenders((prev) => (prev.includes(gender) ? prev.filter((g) => g !== gender) : [...prev, gender]));
  }, []);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedColors([]);
    setSelectedTypes([]);
    setSelectedGenders([]);
    setSelectedBrand('');
    setBrandSearchQuery('');
    setPriceMin(null);
    setPriceMax(null);
  }, []);

  // Set price range
  const setPriceRange = useCallback((min: number | null, max: number | null) => {
    setPriceMin(min);
    setPriceMax(max);
  }, []);

  // Check if any filters are active
  const hasActiveFilters = useMemo(
    () =>
      searchQuery.trim() !== '' ||
      selectedColors.length > 0 ||
      selectedTypes.length > 0 ||
      selectedGenders.length > 0 ||
      selectedBrand !== '' ||
      priceMin !== null ||
      priceMax !== null,
    [searchQuery, selectedColors.length, selectedTypes.length, selectedGenders.length, selectedBrand, priceMin, priceMax]
  );

  return {
    // State
    searchQuery,
    selectedColors,
    selectedTypes,
    selectedGenders,
    selectedBrand,
    brandSearchQuery,
    priceMin,
    priceMax,
    
    // Setters
    setSearchQuery,
    setSelectedBrand,
    setBrandSearchQuery,
    setPriceRange,
    
    // Actions
    toggleColor,
    toggleType,
    toggleGender,
    clearFilters,
    
    // Data (kept for backward compatibility; products are now server-driven in Products page)
    filteredProducts: [] as Product[],
    brands: [] as Brand[],
    filteredBrands: [] as Brand[],
    allProducts: [] as Product[],
    
    // Meta
    hasActiveFilters,
    isLoading: false,
    error: null as Error | null,
    storeIdParam,
  };
};
