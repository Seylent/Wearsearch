'use client';

/**
 * Product Filters Hook
 * Manages all filtering logic for products page
 * Syncs filters with URL search params for shareable links
 */

import { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import type { Brand, Product } from '@/types';
import { getCollectionType } from '@/constants/collections';

export interface ProductFiltersState {
  searchQuery: string;
  selectedColors: string[];
  selectedTypes: string[];
  selectedMaterials: string[];
  selectedTechnologies: string[];
  selectedSizes: string[];
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
  MATERIALS: 'material',
  MATERIAL_IDS: 'material_id',
  TECHNOLOGIES: 'technology',
  TECHNOLOGY_IDS: 'technology_id',
  SIZES: 'size',
  SIZE_IDS: 'size_id',
  GENDERS: 'gender',
  BRAND: 'brand',
  PRICE_MIN: 'price_min',
  PRICE_MAX: 'price_max',
  STORE: 'store_id',
} as const;

export const useProductFilters = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const isInitialized = useRef(false);

  // Parse initial values from URL
  const getInitialColors = () => searchParams?.getAll(URL_PARAMS.COLORS) || [];
  const getInitialTypes = () => {
    const values = searchParams?.getAll(URL_PARAMS.TYPES) || [];
    if (values.length > 0) return values;
    const collectionSlug = pathname?.match(/^\/collections\/(.+?)(?:\/|$)/)?.[1];
    const collectionType = getCollectionType(collectionSlug);
    return collectionType ? [collectionType] : [];
  };
  const getInitialMaterials = () => {
    const values = searchParams?.getAll(URL_PARAMS.MATERIALS) || [];
    if (values.length > 0) return values;
    return searchParams?.getAll(URL_PARAMS.MATERIAL_IDS) || [];
  };
  const getInitialTechnologies = () => {
    const values = searchParams?.getAll(URL_PARAMS.TECHNOLOGIES) || [];
    if (values.length > 0) return values;
    return searchParams?.getAll(URL_PARAMS.TECHNOLOGY_IDS) || [];
  };
  const getInitialSizes = () => {
    const values = searchParams?.getAll(URL_PARAMS.SIZES) || [];
    if (values.length > 0) return values;
    return searchParams?.getAll(URL_PARAMS.SIZE_IDS) || [];
  };
  const getInitialGenders = () => {
    const values = searchParams?.getAll(URL_PARAMS.GENDERS) || [];
    if (values.length > 0) return values;
    const pathMatch = pathname?.match(/^\/gender\/(men|women|unisex)(?:\/|$)/);
    return pathMatch ? [pathMatch[1]] : [];
  };
  const getInitialSearch = () => searchParams?.get(URL_PARAMS.SEARCH) || '';
  const getInitialBrand = () => searchParams?.get(URL_PARAMS.BRAND) || '';
  const getInitialPriceMin = () => {
    const val = searchParams?.get(URL_PARAMS.PRICE_MIN);
    return val ? parseFloat(val) : null;
  };
  const getInitialPriceMax = () => {
    const val = searchParams?.get(URL_PARAMS.PRICE_MAX);
    return val ? parseFloat(val) : null;
  };

  const [searchQuery, setSearchQuery] = useState(getInitialSearch);
  const [selectedColors, setSelectedColors] = useState<string[]>(getInitialColors);
  const [selectedTypes, setSelectedTypes] = useState<string[]>(getInitialTypes);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>(getInitialMaterials);
  const [selectedTechnologies, setSelectedTechnologies] =
    useState<string[]>(getInitialTechnologies);
  const [selectedSizes, setSelectedSizes] = useState<string[]>(getInitialSizes);
  const [selectedGenders, setSelectedGenders] = useState<string[]>(getInitialGenders);
  const [selectedBrand, setSelectedBrand] = useState(getInitialBrand);
  const [brandSearchQuery, setBrandSearchQuery] = useState('');
  const [priceMin, setPriceMin] = useState<number | null>(getInitialPriceMin);
  const [priceMax, setPriceMax] = useState<number | null>(getInitialPriceMax);

  // Get store_id from URL params
  const storeIdParam = searchParams?.get(URL_PARAMS.STORE);

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
    selectedMaterials.forEach(material => newParams.append(URL_PARAMS.MATERIALS, material));
    selectedTechnologies.forEach(technology =>
      newParams.append(URL_PARAMS.TECHNOLOGIES, technology)
    );
    selectedSizes.forEach(size => newParams.append(URL_PARAMS.SIZES, size));
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
    const newUrl = `${pathname}?${newParams.toString()}`;
    const currentUrl = `${pathname}?${searchParams?.toString() || ''}`;

    // Only update if URL actually changed to prevent infinite loop
    if (newUrl !== currentUrl) {
      router.replace(newUrl);
    }
  }, [
    searchQuery,
    selectedColors,
    selectedTypes,
    selectedMaterials,
    selectedTechnologies,
    selectedSizes,
    selectedGenders,
    selectedBrand,
    priceMin,
    priceMax,
    storeIdParam,
    pathname,
    searchParams,
    router,
  ]);

  // Toggle filters
  const toggleColor = useCallback((color: string) => {
    setSelectedColors(prev =>
      prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color]
    );
  }, []);

  const toggleType = useCallback((type: string) => {
    setSelectedTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  }, []);

  const toggleMaterial = useCallback((material: string) => {
    setSelectedMaterials(prev =>
      prev.includes(material) ? prev.filter(m => m !== material) : [...prev, material]
    );
  }, []);

  const toggleTechnology = useCallback((technology: string) => {
    setSelectedTechnologies(prev =>
      prev.includes(technology) ? prev.filter(t => t !== technology) : [...prev, technology]
    );
  }, []);

  const toggleSize = useCallback((size: string) => {
    setSelectedSizes(prev =>
      prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
    );
  }, []);

  const toggleGender = useCallback((gender: string) => {
    setSelectedGenders(prev =>
      prev.includes(gender) ? prev.filter(g => g !== gender) : [...prev, gender]
    );
  }, []);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedColors([]);
    setSelectedTypes([]);
    setSelectedMaterials([]);
    setSelectedTechnologies([]);
    setSelectedSizes([]);
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
      selectedMaterials.length > 0 ||
      selectedTechnologies.length > 0 ||
      selectedSizes.length > 0 ||
      selectedGenders.length > 0 ||
      selectedBrand !== '' ||
      priceMin !== null ||
      priceMax !== null,
    [
      searchQuery,
      selectedColors.length,
      selectedTypes.length,
      selectedMaterials.length,
      selectedTechnologies.length,
      selectedSizes.length,
      selectedGenders.length,
      selectedBrand,
      priceMin,
      priceMax,
    ]
  );

  return {
    // State
    searchQuery,
    selectedColors,
    selectedTypes,
    selectedMaterials,
    selectedTechnologies,
    selectedSizes,
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
    toggleMaterial,
    toggleTechnology,
    toggleSize,
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
