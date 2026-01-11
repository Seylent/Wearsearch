import { useState, useEffect, useMemo, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import { NeonAbstractions } from "@/components/NeonAbstractions";
import ProductCard from "@/components/ProductCard";
import { ProductGridSkeleton } from "@/components/common/SkeletonLoader";
import { NoProductsFound, NoStoreProducts, ErrorState, NoSearchResults } from "@/components/common/EmptyState";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useCurrencyConversion } from "@/hooks/useCurrencyConversion";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Filter, Search, Grid3x3, LayoutGrid, Columns3, ChevronDown } from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { useStoreProducts } from "@/hooks/useApi";
import { useProductsPageData } from "@/hooks/useAggregatedData";
import { useDebounce } from "@/hooks/useDebounce";
import { useProductFilters, useProductSort, useGridLayout, type SortOption } from "@/features/products";
import { PRODUCT_CATEGORIES } from "@/constants/categories";
import type { Product } from "@/types";
import { translateGender } from "@/utils/errorTranslation";
import { getColorTranslation, getCategoryTranslation } from "@/utils/translations";
import { seoApi, type SEOData } from "@/services/api/seo.api";
import PriceRangeFilter from "@/components/PriceRangeFilter";
import RecentlyViewedProducts from "@/components/RecentlyViewedProducts";
import PersonalizedRecommendations from "@/components/PersonalizedRecommendations";

// Format error details safely to avoid default object stringification
function formatErrorDetails(err: unknown): string {
    if (err instanceof Error) {
      return err.message || 'Unknown error';
    }
    if (typeof err === 'string') {
      return err;
    }
    if (err && typeof err === 'object') {
      try {
        return JSON.stringify(err);
      } catch {
        return 'Unknown error';
      }
    }
    return 'Unknown error';
}

function selectProductsFromData(
  storeIdParam: string | null,
  storeProductsData: unknown,
  pageData: unknown
): Product[] {
  if (storeIdParam && storeProductsData) {
    const p = (storeProductsData as Record<string, unknown>)['products'];
    return Array.isArray(p) ? (p as Product[]) : [];
  }
  const page = pageData as Record<string, unknown> | null | undefined;
  const products = page?.['products'];
  if (Array.isArray(products)) return products as Product[];
  return [];
}

function selectServerPagination(
  storeIdParam: string | null,
  pageData: unknown,
  storeProductsData: unknown,
  currentPage: number,
  products: Product[]
): {
  page: number;
  totalPages: number;
  totalItems: number;
  hasNext: boolean;
  hasPrev: boolean;
} {
  const pageDataObj = pageData as Record<string, unknown> | null | undefined;
  const storeDataObj = storeProductsData as Record<string, unknown> | null | undefined;

  const pagePagination = pageDataObj?.['pagination'] as any;
  if (!storeIdParam && pagePagination) {
    return pagePagination;
  }
  const storePagination = storeDataObj?.['pagination'] as any;
  if (storeIdParam && storePagination) {
    return storePagination;
  }
  return {
    page: currentPage,
    totalPages: 1,
    totalItems: Array.isArray(products) ? products.length : 0,
    hasNext: false,
    hasPrev: currentPage > 1,
  };
}

function buildApiFilters(args: {
  currentPage: number;
  itemsPerPage: number;
  debouncedSearch: string;
  filters: ReturnType<typeof useProductFilters>;
  sortBy: string;
  currency: string;
}) {
  const { currentPage, itemsPerPage, debouncedSearch, filters, sortBy, currency } = args;
  return {
    page: currentPage,
    limit: itemsPerPage,
    search: debouncedSearch || undefined,
    type: filters.selectedTypes?.length ? filters.selectedTypes : undefined,
    color: filters.selectedColors?.length ? filters.selectedColors : undefined,
    gender: filters.selectedGenders?.length ? filters.selectedGenders : undefined,
    brandId: filters.selectedBrand ? [filters.selectedBrand] : undefined,
    sort: sortBy === 'default' ? undefined : sortBy,
    currency,
  };
}

function selectBrands(brandsData: unknown): Array<{ id: string; name: string }> {
  return Array.isArray(brandsData) ? (brandsData as Array<{ id: string; name: string }>) : [];
}

function getBrandsFromPageData(pageData: unknown): Array<{ id: string; name: string }> {
  const page = pageData as Record<string, unknown> | null | undefined;
  const brands = page?.['brands'];
  return Array.isArray(brands) ? (brands as Array<{ id: string; name: string }>) : [];
}

function filterBrandsList(
  brands: Array<{ id: string; name: string }>,
  brandSearchQuery: string
): Array<{ id: string; name: string }> {
  if (!brandSearchQuery.trim()) return brands;
  const query = brandSearchQuery.toLowerCase();
  return brands.filter((brand) => brand.name?.toLowerCase().includes(query));
}

// Helper to avoid nested ternaries for grid classes
function computeGridClass(columns: number): string {
  if (columns === 2) return 'grid-cols-1 sm:grid-cols-2';
  if (columns === 4) return 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4';
  return 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6';
}

function getMaxPriceLimit(currency: string): number {
  return currency === 'USD' ? 2000 : 50000;
}

function safeReload(): void {
  globalThis.location?.reload();
}

function safeScrollToTop(): void {
  globalThis.scrollTo?.({ top: 0, behavior: 'smooth' });
}

function renderProductsMainContent(args: {
  t: any;
  error: unknown;
  loading: boolean;
  itemsPerPage: number;
  layoutColumns: number;
  products: Product[];
  totalPages: number;
  currentPage: number;
  pagination: { hasPrev: boolean; hasNext: boolean; totalPages: number };
  onPageChange: (page: number) => void;
  storeIdParam: string | null;
  searchQuery: string;
  isFilterActive: boolean;
  onClearSearch: () => void;
}): ReactNode {
  const {
    t,
    error,
    loading,
    itemsPerPage,
    layoutColumns,
    products,
    totalPages,
    currentPage,
    pagination,
    onPageChange,
    storeIdParam,
    searchQuery,
    isFilterActive,
    onClearSearch,
  } = args;

  if (error && !loading) {
    return (
      <ErrorState
        title={t('common.error')}
        description={formatErrorDetails(error)}
        onRetry={safeReload}
      />
    );
  }

  if (loading) {
    return <ProductGridSkeleton count={itemsPerPage} columns={layoutColumns as 2 | 3 | 4 | 6} />;
  }

  if (products.length > 0) {
    const hasPrev = pagination.hasPrev;
    const hasNext = pagination.hasNext;

    return (
      <>
        <div className={`grid ${computeGridClass(layoutColumns)} gap-3 sm:gap-6`}>
          {products.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              name={product.name}
              image={product.image_url || product.image || ""}
              price={product.price}
              brand={product.brand}
            />
          ))}
        </div>

        {totalPages > 1 && (
          <div className="mt-12 flex justify-center sticky bottom-6 z-20">
            <div className="bg-background/90 backdrop-blur-xl border border-foreground/10 rounded-full px-2 py-1 shadow-2xl">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e: React.MouseEvent) => {
                        e.preventDefault();
                        onPageChange(currentPage - 1);
                      }}
                      className={hasPrev ? "cursor-pointer" : "pointer-events-none opacity-50"}
                    />
                  </PaginationItem>

                  {pagination.totalPages > 7 ? (
                    <>
                      <PaginationItem>
                        <PaginationLink
                          href="#"
                          isActive={currentPage === 1}
                          onClick={(e: React.MouseEvent) => {
                            e.preventDefault();
                            onPageChange(1);
                          }}
                        >
                          1
                        </PaginationLink>
                      </PaginationItem>

                      {currentPage > 4 && (
                        <PaginationItem>
                          <PaginationEllipsis />
                        </PaginationItem>
                      )}

                      {new Array(3).fill(0).map((_, i) => {
                        const p = currentPage - 1 + i;
                        if (p > 1 && p < totalPages) {
                          return (
                            <PaginationItem key={p}>
                              <PaginationLink
                                href="#"
                                isActive={currentPage === p}
                                onClick={(e: React.MouseEvent) => {
                                  e.preventDefault();
                                  onPageChange(p);
                                }}
                              >
                                {p}
                              </PaginationLink>
                            </PaginationItem>
                          );
                        }
                        return null;
                      })}

                      {currentPage < totalPages - 3 && (
                        <PaginationItem>
                          <PaginationEllipsis />
                        </PaginationItem>
                      )}

                      <PaginationItem>
                        <PaginationLink
                          href="#"
                          isActive={currentPage === totalPages}
                          onClick={(e: React.MouseEvent) => {
                            e.preventDefault();
                            onPageChange(totalPages);
                          }}
                        >
                          {totalPages}
                        </PaginationLink>
                      </PaginationItem>
                    </>
                  ) : (
                    new Array(totalPages).fill(0).map((_, i) => (
                      <PaginationItem key={i + 1}>
                        <PaginationLink
                          href="#"
                          isActive={currentPage === i + 1}
                          onClick={(e: React.MouseEvent) => {
                            e.preventDefault();
                            onPageChange(i + 1);
                          }}
                        >
                          {i + 1}
                        </PaginationLink>
                      </PaginationItem>
                    ))
                  )}

                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e: React.MouseEvent) => {
                        e.preventDefault();
                        onPageChange(currentPage + 1);
                      }}
                      className={hasNext ? "cursor-pointer" : "pointer-events-none opacity-50"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </div>
        )}
      </>
    );
  }

  if (storeIdParam) {
    return <NoStoreProducts storeName="Selected Store" />;
  }

  const hasSearchOrFilters = Boolean(searchQuery) || isFilterActive;
  if (hasSearchOrFilters) {
    return <NoSearchResults query={searchQuery} onClearSearch={onClearSearch} />;
  }

  return <NoProductsFound />;
}

type FiltersDialogProps = Readonly<{
    t: any;
    visibleColors: string[];
    colors: string[];
    showAllColors: boolean;
    setShowAllColors: (v: boolean) => void;
    visibleCategories: string[];
    categories: string[];
    showAllCategories: boolean;
    setShowAllCategories: (v: boolean) => void;
    COMPACT_LIMIT: number;
    genders: string[];
    filters: any;
    brandSearchQuery: string;
    setBrandSearchQuery: (v: string) => void;
    setCurrentPage: (updater: number | ((p: number) => number)) => void;
    getCurrencySymbol: () => string;
    currency: string;
    setFilterOpen: (v: boolean) => void;
  }>;
  
  function FiltersDialogContent(props: FiltersDialogProps) {
    const {
      t,
      visibleColors,
      colors,
      showAllColors,
      setShowAllColors,
      visibleCategories,
      categories,
      showAllCategories,
      setShowAllCategories,
      COMPACT_LIMIT,
      genders,
      filters,
      brandSearchQuery,
      setBrandSearchQuery,
      setCurrentPage,
      getCurrencySymbol,
      currency,
      setFilterOpen,
    } = props;
  
    const brandsList = Array.isArray(filters.brands) ? (filters.brands as Array<{ id: string; name: string }>) : [];
    const filteredBrandList = Array.isArray(filters.filteredBrands) ? (filters.filteredBrands as Array<{ id: string; name: string }>) : [];
    const maxPriceLimit = getMaxPriceLimit(currency);
  
    return (
        <div className="space-y-6 py-4">
          <div>
            <h3 className="font-semibold mb-2 text-sm uppercase tracking-widest text-muted-foreground">{t('products.color')}</h3>
            <div className="grid grid-cols-3 gap-1">
              {visibleColors.map((color) => (
                <div key={color} className="flex items-center gap-2 py-1.5 min-h-[36px] touch-manipulation">
                  <Checkbox 
                    id={`filter-color-${color}`}
                    checked={filters.selectedColors.includes(color)}
                    onCheckedChange={() => filters.toggleColor(color)}
                    className="min-w-[18px] min-h-[18px] h-[18px] w-[18px]"
                  />
                  <Label 
                    htmlFor={`filter-color-${color}`}
                    className="text-xs cursor-pointer active:text-foreground/80 transition-colors capitalize flex-1"
                  >
                    {getColorTranslation(color)}
                  </Label>
                </div>
              ))}
            </div>
            {colors.length > COMPACT_LIMIT && (
              <button
                onClick={() => setShowAllColors(!showAllColors)}
                className="mt-2 text-xs text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
              >
                <ChevronDown className={`w-3 h-3 transition-transform ${showAllColors ? 'rotate-180' : ''}`} />
                {showAllColors 
                  ? t('common.showLess', 'Show less') 
                  : t('common.showAll', { count: colors.length, defaultValue: `Show all (${colors.length})` })}
              </button>
            )}
          </div>
  
          <div>
            <h3 className="font-semibold mb-2 text-sm uppercase tracking-widest text-muted-foreground">{t('products.category')}</h3>
            <div className="grid grid-cols-2 gap-1">
              {visibleCategories.map((category) => (
                <div key={category} className="flex items-center gap-2 py-1.5 min-h-[36px] touch-manipulation">
                  <Checkbox 
                    id={`filter-category-${category}`}
                    checked={filters.selectedTypes.includes(category)}
                    onCheckedChange={() => filters.toggleType(category)}
                    className="min-w-[18px] min-h-[18px] h-[18px] w-[18px]"
                  />
                  <Label 
                    htmlFor={`filter-category-${category}`}
                    className="text-xs cursor-pointer active:text-foreground/80 transition-colors capitalize flex-1"
                  >
                    {getCategoryTranslation(category)}
                  </Label>
                </div>
              ))}
            </div>
            {categories.length > COMPACT_LIMIT && (
              <button
                onClick={() => setShowAllCategories(!showAllCategories)}
                className="mt-2 text-xs text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
              >
                <ChevronDown className={`w-3 h-3 transition-transform ${showAllCategories ? 'rotate-180' : ''}`} />
                {showAllCategories 
                  ? t('common.showLess', 'Show less') 
                  : t('common.showAll', { count: categories.length, defaultValue: `Show all (${categories.length})` })}
              </button>
            )}
          </div>
  
          <div>
            <h3 className="font-semibold mb-2 text-sm uppercase tracking-widest text-muted-foreground">{t('products.gender')}</h3>
            <div className="grid grid-cols-3 gap-1">
              {genders.map((gender) => (
                <div key={gender} className="flex items-center gap-2 py-1.5 min-h-[36px] touch-manipulation">
                  <Checkbox 
                    id={`filter-gender-${gender}`}
                    checked={filters.selectedGenders.includes(gender)}
                    onCheckedChange={() => filters.toggleGender(gender)}
                    className="min-w-[18px] min-h-[18px] h-[18px] w-[18px]"
                  />
                  <Label 
                    htmlFor={`filter-gender-${gender}`}
                    className="text-xs cursor-pointer active:text-foreground/80 transition-colors capitalize flex-1"
                  >
                    {translateGender(gender)}
                  </Label>
                </div>
              ))}
            </div>
          </div>
  
          <div>
            <h3 className="font-semibold mb-3 text-sm uppercase tracking-widest text-muted-foreground">{t('products.brand')}</h3>
            {filters.selectedBrand && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { filters.setSelectedBrand(""); setCurrentPage(1); }}
                className="mb-2 text-xs text-muted-foreground hover:text-foreground h-7"
              >
                Clear: {filters.selectedBrand}
              </Button>
            )}
            <Input
              type="text"
              placeholder={t('products.searchBrand')}
              value={brandSearchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBrandSearchQuery(e.target.value)}
              className="mb-2 h-9 text-sm"
            />
            <div className="max-h-40 overflow-y-auto space-y-1 border border-foreground/10 rounded-lg p-2">
              {brandsList.length > 0 ? (
                filteredBrandList.map((brand: { id: string; name: string }) => (
                  <button
                    key={brand.id}
                    onClick={() => {
                      filters.setSelectedBrand(brand.name);
                      setCurrentPage(1);
                    }}
                    className={`w-full text-left px-2 py-1.5 rounded-md text-sm transition-colors ${
                      filters.selectedBrand === brand.name
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-foreground/5"
                    }`}
                  >
                    {brand.name}
                  </button>
                ))
              ) : (
                <p className="text-xs text-muted-foreground text-center py-3">{t('common.noResults')}</p>
              )}
            </div>
          </div>
  
          <div>
            <PriceRangeFilter
              min={0}
              max={maxPriceLimit}
              minValue={filters.priceMin || 0}
              maxValue={filters.priceMax || maxPriceLimit}
              onApply={(min: number, max: number) => {
                const minValue = min === 0 ? null : min;
                const maxValue = max === maxPriceLimit ? null : max;
                filters.setPriceRange(minValue, maxValue);
                setCurrentPage(1);
              }}
              currency={getCurrencySymbol()}
              showApplyButton={false}
              step={currency === 'USD' ? 5 : 100}
            />
          </div>
  
          <div className="flex gap-2 pt-4 border-t border-foreground/10">
            <Button 
              variant="ghost" 
              className="flex-1 text-muted-foreground hover:text-foreground h-10"
              onClick={filters.clearFilters}
            >
              {t('products.clearFilters')}
            </Button>
            <Button 
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 h-10"
              onClick={() => setFilterOpen(false)}
            >
              {t('products.applyFilters')}
            </Button>
          </div>
        </div>
    );
  }

export function ProductsContent() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const { currency } = useCurrency();
  const { getCurrencySymbol } = useCurrencyConversion();
  const maxPriceLimit = getMaxPriceLimit(currency);
  
  // Dynamic SEO based on filters
  const [seoData, setSeoData] = useState<SEOData | null>(null);
  const typeParam = searchParams.get('type');
  const colorParam = searchParams.get('color');
  const storeIdParam = searchParams.get('store_id');
  
  // Fetch dynamic SEO data when filters change
  useEffect(() => {
    const fetchSEO = async () => {
      try {
        let data: SEOData | null = null;
        
        // Priority: category > color > default
        if (typeParam) {
          data = await seoApi.getCategorySEO(typeParam);
        } else if (colorParam) {
          data = await seoApi.getColorSEO(colorParam);
        }
        
        setSeoData(data);
      } catch (error) {
        console.error('Failed to fetch products SEO:', error);
        setSeoData(null);
      }
    };
    
    fetchSEO();
  }, [typeParam, colorParam]);

  useEffect(() => {
    if (seoData) {
      document.title = seoData.meta_title;
    }
  }, [seoData]);
  
  // Use custom hooks for state management
  const filters = useProductFilters();
  const sort = useProductSort([] as Product[]);
  const layout = useGridLayout(6);
  const [brandSearchQuery, setBrandSearchQuery] = useState("");
  
  // Debounce search query
  const debouncedSearch = useDebounce(filters.searchQuery, 300);

  const colors = ["Black", "White", "Gray", "Beige", "Brown", "Red", "Blue", "Navy", "Green", "Olive", "Yellow", "Orange", "Pink", "Purple", "Cream"];
  const genders = ["men", "women", "unisex"];
  const categories = [...PRODUCT_CATEGORIES];
  
  // Compact filter states - show only first N items
  const [showAllColors, setShowAllColors] = useState(false);
  const [showAllCategories, setShowAllCategories] = useState(false);
  const COMPACT_LIMIT = 6;
  
  const visibleColors = showAllColors ? colors : colors.slice(0, COMPACT_LIMIT);
  const visibleCategories = showAllCategories ? categories : categories.slice(0, COMPACT_LIMIT);
  
  const itemsPerPage = 24;

  // Server-driven pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [filterOpen, setFilterOpen] = useState(false);
  
  // Defer data fetching until after initial render
  const [shouldFetchData, setShouldFetchData] = useState(false);
  
  useEffect(() => {
    const timeoutId = setTimeout(() => setShouldFetchData(true), 50);
    return () => clearTimeout(timeoutId);
  }, []);
  
  // Build API filters object (memoized to avoid query-key churn)
  const apiFilters = useMemo(
    () =>
      buildApiFilters({
        currentPage,
        itemsPerPage,
        debouncedSearch,
        filters,
        sortBy: sort.sortBy,
        currency,
      }),
    [
      currentPage,
      itemsPerPage,
      debouncedSearch,
      filters,
      sort.sortBy,
      currency,
    ]
  );
  
  // Use aggregated hook for better performance
  const { data: pageData, isLoading: pageLoading, error: pageError } = useProductsPageData(apiFilters, { 
    enabled: storeIdParam ? false : shouldFetchData 
  });
  
  // Use store-specific endpoint if store_id is present
  const storeProductsParams = useMemo(
    () => ({ page: currentPage, limit: itemsPerPage }),
    [currentPage, itemsPerPage]
  );

  const { data: storeProductsData, error: storeError } = useStoreProducts(
    storeIdParam || '', 
    storeProductsParams,
    { enabled: !!storeIdParam && shouldFetchData }
  );
  
  // Extract data
  const loading = storeIdParam ? false : pageLoading;
  const error = storeIdParam ? storeError : pageError;
  const products = selectProductsFromData(storeIdParam, storeProductsData, pageData);
  
  // Extract pagination from API response
  const pagination = selectServerPagination(storeIdParam, pageData, storeProductsData, currentPage, products);
  const totalPages = pagination.totalPages;

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      safeScrollToTop();
    }
  };

  const isFilterActive =
    filters.selectedTypes.length > 0 ||
    filters.selectedColors.length > 0 ||
    filters.selectedGenders.length > 0 ||
    Boolean(filters.selectedBrand) ||
    (filters.priceMin !== null && filters.priceMin > 0) ||
    (filters.priceMax !== null && filters.priceMax < maxPriceLimit);

  const defaultHeading = storeIdParam ? t('products.storeTitle') : t('products.heading');
  const pageHeading = seoData?.h1_title ?? defaultHeading;
  const pageDescription = seoData?.content_text ?? t('products.subheading');

  const mainContent = renderProductsMainContent({
    t,
    error,
    loading,
    itemsPerPage,
    layoutColumns: layout.columns,
    products,
    totalPages,
    currentPage,
    pagination,
    onPageChange: handlePageChange,
    storeIdParam,
    searchQuery: filters.searchQuery,
    isFilterActive,
    onClearSearch: filters.clearFilters,
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed inset-0 z-0 pointer-events-none opacity-20">
        <NeonAbstractions />
      </div>
      
      <main className="container mx-auto px-4 py-8 relative z-10 pt-24 sm:pt-28">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
            <div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-foreground mb-4 neon-text">
                {pageHeading}
              </h1>
              <p className="text-muted-foreground max-w-2xl text-lg neon-description">
                {pageDescription}
              </p>
            </div>
          </div>
  
          {/* Controls Bar */}
          <div className="sticky top-[72px] rounded-2xl z-30 bg-background/80 backdrop-blur-xl border border-foreground/10 p-4 mb-8 shadow-2xl transition-all duration-300">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
                
                {/* Search with animated border */}
                <div className="relative flex-1 min-w-0">
                  <div className="relative group">
                    {/* Animated border gradient */}
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-white/60 via-white/90 to-white/60 rounded-xl blur-sm opacity-60 group-hover:opacity-85 group-focus-within:opacity-100 transition-opacity duration-300 animate-gradient-shift"></div>
                    <div className="relative flex items-center">
                      <Search className="absolute left-3 w-4 h-4 text-muted-foreground z-10 group-focus-within:text-white transition-colors" />
                      <Input
                        type="text"
                        placeholder={t('products.searchPlaceholder')}
                        value={filters.searchQuery}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            filters.setSearchQuery(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="pl-9 h-11 w-full bg-background border-foreground/10 focus:border-white/50 transition-all font-medium rounded-xl relative"
                      />
                    </div>
                  </div>
                </div>
  
                <div className="flex flex-wrap items-center gap-3">
                    {/* Filter Dialog */}
                    <Dialog open={filterOpen} onOpenChange={setFilterOpen}>
                        <DialogTrigger asChild>
                        <Button 
                            variant={isFilterActive ? "default" : "outline"} 
                            className="h-11 px-4 gap-2 rounded-xl relative overflow-hidden"
                        >
                            <Filter className="w-4 h-4" />
                            <span className="hidden sm:inline">{t('products.filters')}</span>
                            {isFilterActive && <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary animate-pulse" />}
                        </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px] overflow-hidden flex flex-col max-h-[90vh]">
                        <DialogHeader>
                            <DialogTitle>{t('products.filters')}</DialogTitle>
                        </DialogHeader>
                        <div className="flex-1 overflow-y-auto pr-2">
                            <FiltersDialogContent
                                t={t}
                                visibleColors={visibleColors}
                                colors={colors}
                                showAllColors={showAllColors}
                                setShowAllColors={setShowAllColors}
                                visibleCategories={visibleCategories}
                                categories={categories}
                                showAllCategories={showAllCategories}
                                setShowAllCategories={setShowAllCategories}
                                COMPACT_LIMIT={COMPACT_LIMIT}
                                genders={genders}
                                filters={filters}
                                brandSearchQuery={brandSearchQuery}
                                setBrandSearchQuery={setBrandSearchQuery}
                                setCurrentPage={setCurrentPage}
                                getCurrencySymbol={getCurrencySymbol}
                                currency={currency}
                                setFilterOpen={setFilterOpen}
                            />
                        </div>
                        </DialogContent>
                    </Dialog>
  
                  {/* Sort Select */}
                  <Select 
                    value={sort.sortBy} 
                    onValueChange={(value) => {
                        sort.setSortBy(value as SortOption);
                        setCurrentPage(1);
                    }}
                   >
                    <SelectTrigger className="w-[180px] h-11 bg-background/50 border-foreground/10 rounded-xl">
                      <SelectValue placeholder={t('products.sortBy')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">{t('products.sortDefault')}</SelectItem>
                      <SelectItem value="price_asc">{t('products.priceAsc')}</SelectItem>
                      <SelectItem value="price_desc">{t('products.priceDesc')}</SelectItem>
                      <SelectItem value="newest">{t('products.newest')}</SelectItem>
                    </SelectContent>
                  </Select>
  
                  {/* View Layout Toggle */}
                  <div className="hidden sm:flex bg-background/50 p-1 rounded-xl border border-foreground/10">
                    <Button
                      variant={layout.columns === 2 ? "secondary" : "ghost"}
                      size="icon"
                      onClick={() => layout.setColumns(2)}
                      className="h-9 w-9 rounded-lg"
                      aria-label="Two columns"
                    >
                      <LayoutGrid className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={layout.columns === 4 ? "secondary" : "ghost"}
                      size="icon"
                      onClick={() => layout.setColumns(4)}
                      className="h-9 w-9 rounded-lg"
                      aria-label="Four columns"
                    >
                      <Grid3x3 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={layout.columns === 6 ? "secondary" : "ghost"}
                      size="icon"
                      onClick={() => layout.setColumns(6)}
                      className="h-9 w-9 rounded-lg hidden lg:flex"
                      aria-label="Six columns"
                    >
                      <Columns3 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
  
          {/* Main Content Grid */}
          <div className="space-y-8">
            {mainContent}
           </div>

          {/* Recently Viewed - Client Side */}
          <RecentlyViewedProducts />
  
          {/* Personalized Recommends */}
          <PersonalizedRecommendations />
        </main>
      </div>
  );
}
