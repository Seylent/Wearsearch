/**
 * Product Filters Hook
 * Manages all filtering logic for products page
 * Syncs filters with URL search params for shareable links
 */

import { useCallback, useEffect, useMemo, useState, useRef } from 'react';
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

// URL param keys
const URL_PARAMS = {
  SEARCH: 'q',
  COLORS: 'color',
  TYPES: 'type',
  GENDERS: 'gender',
  BRAND: 'brand',
  PRICE_MIN: 'price_min',
  PRICE_MAX: 'price_max',
  STORE: 'store_id',
} as const;

export const useProductFilters = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const isInitialized = useRef(false);
  
  // Parse initial values from URL
  const getInitialColors = () => searchParams.getAll(URL_PARAMS.COLORS);
  const getInitialTypes = () => searchParams.getAll(URL_PARAMS.TYPES);
  const getInitialGenders = () => searchParams.getAll(URL_PARAMS.GENDERS);
  const getInitialSearch = () => searchParams.get(URL_PARAMS.SEARCH) || '';
  const getInitialBrand = () => searchParams.get(URL_PARAMS.BRAND) || '';
  const getInitialPriceMin = () => {
    const val = searchParams.get(URL_PARAMS.PRICE_MIN);
    return val ? parseFloat(val) : null;
  };
  const getInitialPriceMax = () => {
    const val = searchParams.get(URL_PARAMS.PRICE_MAX);
    return val ? parseFloat(val) : null;
  };
  
  const [searchQuery, setSearchQuery] = useState(getInitialSearch);
  const [selectedColors, setSelectedColors] = useState<string[]>(getInitialColors);
  const [selectedTypes, setSelectedTypes] = useState<string[]>(getInitialTypes);
  const [selectedGenders, setSelectedGenders] = useState<string[]>(getInitialGenders);
  const [selectedBrand, setSelectedBrand] = useState(getInitialBrand);
  const [brandSearchQuery, setBrandSearchQuery] = useState('');
  const [priceMin, setPriceMin] = useState<number | null>(getInitialPriceMin);
  const [priceMax, setPriceMax] = useState<number | null>(getInitialPriceMax);

  // Get store_id from URL params
  const storeIdParam = searchParams.get(URL_PARAMS.STORE);
  
  // Sync state to URL when filters change
  useEffect(() => {
    // Skip on first render to avoid duplicate URL update
    if (!isInitialized.current) {
      isInitialized.current = true;
      return;
    }
    
    const newParams = new URLSearchParams();
    
    // Preserve store_id if present
    if (storeIdParam) {
      newParams.set(URL_PARAMS.STORE, storeIdParam);
    }
    
    // Add filters to URL
    if (searchQuery.trim()) {
      newParams.set(URL_PARAMS.SEARCH, searchQuery.trim());
    }
    
    selectedColors.forEach(color => newParams.append(URL_PARAMS.COLORS, color));
    selectedTypes.forEach(type => newParams.append(URL_PARAMS.TYPES, type));
    selectedGenders.forEach(gender => newParams.append(URL_PARAMS.GENDERS, gender));
    
    if (selectedBrand) {
      newParams.set(URL_PARAMS.BRAND, selectedBrand);
    }
    
    if (priceMin !== null) {
      newParams.set(URL_PARAMS.PRICE_MIN, priceMin.toString());
    }
    
    if (priceMax !== null) {
      newParams.set(URL_PARAMS.PRICE_MAX, priceMax.toString());
    }
    
    // Update URL without navigation (replace instead of push to avoid history spam)
    setSearchParams(newParams, { replace: true });
  }, [searchQuery, selectedColors, selectedTypes, selectedGenders, selectedBrand, priceMin, priceMax, storeIdParam, setSearchParams]);

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
