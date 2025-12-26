/**
 * Product Filters Hook
 * Manages all filtering logic for products page
 */

import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDebounce } from '@/hooks/useDebounce';
import { useProducts, useBrands, useStoreProducts } from '@/hooks/useApi';
import type { Product } from '@/types';

export interface ProductFiltersState {
  searchQuery: string;
  selectedColors: string[];
  selectedTypes: string[];
  selectedGenders: string[];
  selectedBrand: string;
  brandSearchQuery: string;
}

export const useProductFilters = () => {
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedGenders, setSelectedGenders] = useState<string[]>([]);
  const [selectedBrand, setSelectedBrand] = useState('');
  const [brandSearchQuery, setBrandSearchQuery] = useState('');

  // Get store_id from URL params
  const storeIdParam = searchParams.get('store_id');

  // Fetch products data
  const { data: productsData, isLoading: loading, error } = useProducts({
    enabled: !storeIdParam,
  });

  const { data: storeProductsData, isLoading: storeLoading, error: storeError } = useStoreProducts(
    storeIdParam || '',
    { limit: 1000 },
    { enabled: !!storeIdParam }
  );

  const { data: brandsData } = useBrands();

  // Extract all products from response
  const allProducts = useMemo(() => {
    if (storeIdParam && storeProductsData) {
      return storeProductsData.products || storeProductsData || [];
    }
    if (!productsData) return [];
    return productsData.products || productsData || [];
  }, [productsData, storeProductsData, storeIdParam]);

  // Extract brands list
  const brands = useMemo(() => {
    if (!brandsData) return [];
    return Array.isArray(brandsData) ? brandsData : [];
  }, [brandsData]);

  // Filter brands by search query
  const filteredBrands = useMemo(() => {
    if (!brandSearchQuery.trim()) return brands;
    const query = brandSearchQuery.toLowerCase();
    return brands.filter((brand: { name?: string }) =>
      brand.name?.toLowerCase().includes(query)
    );
  }, [brands, brandSearchQuery]);

  // Apply all filters
  const filteredProducts = useMemo(() => {
    let filtered = [...allProducts];

    // Search filter - use debounced value
    if (debouncedSearch.trim()) {
      const query = debouncedSearch.toLowerCase();
      filtered = filtered.filter((p: Product) =>
        p.name?.toLowerCase().includes(query) ||
        p.type?.toLowerCase().includes(query) ||
        p.brand?.toLowerCase().includes(query)
      );
    }

    // Color filter
    if (selectedColors.length > 0) {
      filtered = filtered.filter((p: Product) =>
        p.color && selectedColors.includes(p.color)
      );
    }

    // Type filter
    if (selectedTypes.length > 0) {
      filtered = filtered.filter((p: Product) =>
        p.type && selectedTypes.includes(p.type)
      );
    }

    // Gender filter
    if (selectedGenders.length > 0) {
      filtered = filtered.filter((p: Product) =>
        p.gender && selectedGenders.includes(p.gender)
      );
    }

    // Brand filter
    if (selectedBrand) {
      filtered = filtered.filter((p: Product) =>
        p.brand === selectedBrand
      );
    }

    return filtered;
  }, [allProducts, debouncedSearch, selectedColors, selectedTypes, selectedGenders, selectedBrand]);

  // Toggle filters
  const toggleColor = (color: string) => {
    setSelectedColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
    );
  };

  const toggleType = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const toggleGender = (gender: string) => {
    setSelectedGenders((prev) =>
      prev.includes(gender) ? prev.filter((g) => g !== gender) : [...prev, gender]
    );
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedColors([]);
    setSelectedTypes([]);
    setSelectedGenders([]);
    setSelectedBrand('');
    setBrandSearchQuery('');
  };

  // Check if any filters are active
  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    selectedColors.length > 0 ||
    selectedTypes.length > 0 ||
    selectedGenders.length > 0 ||
    selectedBrand !== '';

  // Loading and error states
  const isLoading = storeIdParam ? storeLoading : loading;
  const currentError = storeIdParam ? storeError : error;

  return {
    // State
    searchQuery,
    selectedColors,
    selectedTypes,
    selectedGenders,
    selectedBrand,
    brandSearchQuery,
    
    // Setters
    setSearchQuery,
    setSelectedBrand,
    setBrandSearchQuery,
    
    // Actions
    toggleColor,
    toggleType,
    toggleGender,
    clearFilters,
    
    // Data
    filteredProducts,
    brands,
    filteredBrands,
    allProducts,
    
    // Meta
    hasActiveFilters,
    isLoading,
    error: currentError,
    storeIdParam,
  };
};
