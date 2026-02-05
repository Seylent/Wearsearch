'use client';

import { useState, useEffect, useMemo, useRef, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { usePathname, useSearchParams } from 'next/navigation';
import ProductCard from '@/components/ProductCard';
import { ProductGridSkeleton } from '@/components/common/SkeletonLoader';
import {
  NoProductsFound,
  NoStoreProducts,
  ErrorState,
  NoSearchResults,
} from '@/components/common/EmptyState';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useCurrencyConversion } from '@/hooks/useCurrencyConversion';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Filter, Search, Grid3x3, LayoutGrid, Columns3, ChevronDown } from 'lucide-react';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from '@/components/ui/pagination';
import { useStoreProducts } from '@/hooks/useApi';
import { useProductsPageData } from '@/hooks/useAggregatedData';
import { useDebounce } from '@/hooks/useDebounce';
import { useCatalogFilters } from '@/hooks/useCatalogFilters';
import {
  useProductFilters,
  useProductSort,
  useGridLayout,
  type SortOption,
} from '@/features/products';
import { PRODUCT_CATEGORIES } from '@/constants/categories';
import type { Product } from '@/types';
import { translateGender } from '@/utils/errorTranslation';
import { getColorTranslation, getCategoryTranslation } from '@/utils/translations';
import { seoApi, type SEOData } from '@/services/api/seo.api';
import { getCollectionType } from '@/constants/collections';
import PriceRangeFilter from '@/components/PriceRangeFilter';
import dynamic from 'next/dynamic';
import type { Banner } from '@/types/banner';

const RecentlyViewedProducts = dynamic(() => import('@/components/RecentlyViewedProducts'), {
  ssr: false,
  loading: () => null,
});

const PersonalizedRecommendations = dynamic(
  () => import('@/components/PersonalizedRecommendations'),
  { ssr: false, loading: () => null }
);

const BannerCarousel = dynamic(
  () => import('@/components/BannerCarousel').then(mod => mod.BannerCarousel),
  { ssr: false, loading: () => null }
);

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

type PaginationMeta = {
  page: number;
  totalPages: number;
  totalItems: number;
  hasNext: boolean;
  hasPrev: boolean;
};

type ProductsContentProps = {
  initialPageData?: Record<string, unknown> | null;
  initialPage?: number;
  initialCurrency?: string;
  banners?: Banner[];
};

function selectServerPagination(
  storeIdParam: string | null,
  pageData: unknown,
  storeProductsData: unknown,
  currentPage: number,
  products: Product[]
): PaginationMeta {
  const pageDataObj = pageData as Record<string, unknown> | null | undefined;
  const storeDataObj = storeProductsData as Record<string, unknown> | null | undefined;

  const pagePagination = pageDataObj?.['pagination'] as PaginationMeta | undefined;
  if (!storeIdParam && pagePagination) {
    return pagePagination;
  }
  const storePagination = storeDataObj?.['pagination'] as PaginationMeta | undefined;
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
    material: filters.selectedMaterials?.length ? filters.selectedMaterials : undefined,
    technology: filters.selectedTechnologies?.length ? filters.selectedTechnologies : undefined,
    size: filters.selectedSizes?.length ? filters.selectedSizes : undefined,
    sort: sortBy === 'default' ? undefined : sortBy,
    currency,
  };
}

// Helper to avoid nested ternaries for grid classes
function computeGridClass(columns: number): string {
  if (columns === 2) return 'grid-cols-2 sm:grid-cols-2';
  if (columns === 4) return 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4';
  return 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6';
}

type GenderCopy = {
  title: string;
  description: string;
};

function getGenderCopy(gender: string | null, t: TFunction): GenderCopy | null {
  if (!gender) return null;
  const normalized = gender.toLowerCase();

  if (normalized === 'men' || normalized === 'male') {
    return {
      title: t('products.genderTitleMen', "Men's clothing"),
      description: t(
        'products.genderDescriptionMen',
        "Browse the latest men's styles, essentials, and new drops."
      ),
    };
  }

  if (normalized === 'women' || normalized === 'female') {
    return {
      title: t('products.genderTitleWomen', "Women's clothing"),
      description: t(
        'products.genderDescriptionWomen',
        "Discover women's fashion picks, seasonal edits, and best sellers."
      ),
    };
  }

  if (normalized === 'unisex') {
    return {
      title: t('products.genderTitleUnisex', 'Unisex clothing'),
      description: t(
        'products.genderDescriptionUnisex',
        'Explore unisex essentials with inclusive fits and versatile styles.'
      ),
    };
  }

  return null;
}

function getMaxPriceLimit(currency: string): number {
  return currency === 'USD' ? 2000 : 50000;
}

const SIZE_GROUP_BY_CATEGORY: Record<string, string> = {
  outerwear: 'tops',
  tops: 'tops',
  bottoms: 'bottoms',
  footwear: 'footwear',
  accessories: 'accessories',
};

function safeReload(): void {
  globalThis.location?.reload();
}

function safeScrollToTop(): void {
  globalThis.scrollTo?.({ top: 0, behavior: 'smooth' });
}

function renderProductsMainContent(args: {
  t: TFunction;
  error: unknown;
  loading: boolean;
  itemsPerPage: number;
  layoutColumns: number;
  products: Product[];
  totalPages: number;
  currentPage: number;
  pagination: PaginationMeta;
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
          {products.map(product => (
            <ProductCard
              key={product.id}
              id={product.id}
              name={product.name}
              image={product.image_url || product.image || ''}
              price={product.price}
              minPrice={product.price_min ?? product.min_price}
              maxPrice={product.max_price ?? product.maxPrice}
              priceCurrency={
                product.currency === 'USD' || product.currency === 'UAH'
                  ? product.currency
                  : product.price_currency === 'USD' || product.price_currency === 'UAH'
                    ? product.price_currency
                    : undefined
              }
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
                      className={hasPrev ? 'cursor-pointer' : 'pointer-events-none opacity-50'}
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
                      className={hasNext ? 'cursor-pointer' : 'pointer-events-none opacity-50'}
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
  t: TFunction;
  visibleColors: string[];
  colors: string[];
  showAllColors: boolean;
  setShowAllColors: (v: boolean) => void;
  visibleCategories: string[];
  categories: string[];
  categoryLabels: Record<string, string>;
  showAllCategories: boolean;
  setShowAllCategories: (v: boolean) => void;
  COMPACT_LIMIT: number;
  genders: string[];
  materials: Array<{ id?: string; slug: string; name: string }>;
  visibleMaterials: Array<{ id?: string; slug: string; name: string }>;
  showAllMaterials: boolean;
  setShowAllMaterials: (v: boolean) => void;
  technologies: Array<{ id?: string; slug: string; name: string }>;
  visibleTechnologies: Array<{ id?: string; slug: string; name: string }>;
  showAllTechnologies: boolean;
  setShowAllTechnologies: (v: boolean) => void;
  sizes: Array<{ id?: string; slug: string; label: string; group?: string }>;
  visibleSizes: Array<{ id?: string; slug: string; label: string; group?: string }>;
  showAllSizes: boolean;
  setShowAllSizes: (v: boolean) => void;
  filters: ReturnType<typeof useProductFilters>;
  brands: Array<{ id: string; name: string; slug?: string }>;
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
    categoryLabels,
    showAllCategories,
    setShowAllCategories,
    COMPACT_LIMIT,
    genders,
    materials,
    visibleMaterials,
    showAllMaterials,
    setShowAllMaterials,
    technologies,
    visibleTechnologies,
    showAllTechnologies,
    setShowAllTechnologies,
    sizes,
    visibleSizes,
    showAllSizes,
    setShowAllSizes,
    filters,
    brands,
    brandSearchQuery,
    setBrandSearchQuery,
    setCurrentPage,
    getCurrencySymbol,
    currency,
    setFilterOpen,
  } = props;

  const brandsList = Array.isArray(brands)
    ? (brands as Array<{ id: string; name: string; slug?: string }>)
    : [];
  const filteredBrandList = brandsList.filter(brand =>
    brand.name.toLowerCase().includes(brandSearchQuery.toLowerCase())
  );
  const maxPriceLimit = getMaxPriceLimit(currency);

  return (
    <div className="space-y-6 py-4">
      <div>
        <h3 className="font-semibold mb-2 text-sm uppercase tracking-widest text-warm-gray">
          {t('products.color')}
        </h3>
        <div className="grid grid-cols-3 gap-1">
          {visibleColors.map(color => (
            <div
              key={color}
              className="flex items-center gap-2 py-1.5 min-h-[36px] touch-manipulation"
            >
              <Checkbox
                id={`filter-color-${color}`}
                checked={filters.selectedColors.includes(color)}
                onCheckedChange={() => filters.toggleColor(color)}
                className="min-w-[18px] min-h-[18px] h-[18px] w-[18px] border-earth/30 data-[state=checked]:bg-sand/60 data-[state=checked]:border-earth/40 data-[state=checked]:text-earth"
              />
              <Label
                htmlFor={`filter-color-${color}`}
                className="text-xs cursor-pointer text-warm-gray hover:text-earth transition-colors capitalize flex-1"
              >
                {getColorTranslation(color)}
              </Label>
            </div>
          ))}
        </div>
        {colors.length > COMPACT_LIMIT && (
          <button
            onClick={() => setShowAllColors(!showAllColors)}
            className="mt-2 text-xs text-earth/70 hover:text-earth transition-colors flex items-center gap-1"
          >
            <ChevronDown
              className={`w-3 h-3 text-earth/70 transition-transform ${showAllColors ? 'rotate-180' : ''}`}
            />
            {showAllColors
              ? t('common.showLess', 'Show less')
              : t('common.showAll', {
                  count: colors.length,
                  defaultValue: `Show all (${colors.length})`,
                })}
          </button>
        )}
      </div>

      <div>
        <h3 className="font-semibold mb-2 text-sm uppercase tracking-widest text-warm-gray">
          {t('products.category')}
        </h3>
        <div className="grid grid-cols-2 gap-1">
          {visibleCategories.map(category => (
            <div
              key={category}
              className="flex items-center gap-2 py-1.5 min-h-[36px] touch-manipulation"
            >
              <Checkbox
                id={`filter-category-${category}`}
                checked={filters.selectedTypes.includes(category)}
                onCheckedChange={() => filters.toggleType(category)}
                className="min-w-[18px] min-h-[18px] h-[18px] w-[18px] border-earth/30 data-[state=checked]:bg-sand/60 data-[state=checked]:border-earth/40 data-[state=checked]:text-earth"
              />
              <Label
                htmlFor={`filter-category-${category}`}
                className="text-xs cursor-pointer text-warm-gray hover:text-earth transition-colors capitalize flex-1"
              >
                {categoryLabels[category] || getCategoryTranslation(category)}
              </Label>
            </div>
          ))}
        </div>
        {categories.length > COMPACT_LIMIT && (
          <button
            onClick={() => setShowAllCategories(!showAllCategories)}
            className="mt-2 text-xs text-earth/70 hover:text-earth transition-colors flex items-center gap-1"
          >
            <ChevronDown
              className={`w-3 h-3 text-earth/70 transition-transform ${showAllCategories ? 'rotate-180' : ''}`}
            />
            {showAllCategories
              ? t('common.showLess', 'Show less')
              : t('common.showAll', {
                  count: categories.length,
                  defaultValue: `Show all (${categories.length})`,
                })}
          </button>
        )}
      </div>

      <div>
        <h3 className="font-semibold mb-2 text-sm uppercase tracking-widest text-warm-gray">
          {t('products.materials', 'Materials')}
        </h3>
        <div className="grid grid-cols-2 gap-1">
          {visibleMaterials.map(material => (
            <div
              key={material.slug || material.id}
              className="flex items-center gap-2 py-1.5 min-h-[36px] touch-manipulation"
            >
              <Checkbox
                id={`filter-material-${material.slug || material.id}`}
                checked={filters.selectedMaterials.includes(material.slug || material.id || '')}
                onCheckedChange={() =>
                  filters.toggleMaterial(material.slug || material.id || material.name)
                }
                className="min-w-[18px] min-h-[18px] h-[18px] w-[18px] border-earth/30 data-[state=checked]:bg-sand/60 data-[state=checked]:border-earth/40 data-[state=checked]:text-earth"
              />
              <Label
                htmlFor={`filter-material-${material.slug || material.id}`}
                className="text-xs cursor-pointer text-warm-gray hover:text-earth transition-colors capitalize flex-1"
              >
                {material.name}
              </Label>
            </div>
          ))}
        </div>
        {materials.length > COMPACT_LIMIT && (
          <button
            onClick={() => setShowAllMaterials(!showAllMaterials)}
            className="mt-2 text-xs text-earth/70 hover:text-earth transition-colors flex items-center gap-1"
          >
            <ChevronDown
              className={`w-3 h-3 text-earth/70 transition-transform ${showAllMaterials ? 'rotate-180' : ''}`}
            />
            {showAllMaterials
              ? t('common.showLess', 'Show less')
              : t('common.showAll', {
                  count: materials.length,
                  defaultValue: `Show all (${materials.length})`,
                })}
          </button>
        )}
      </div>

      <div>
        <h3 className="font-semibold mb-2 text-sm uppercase tracking-widest text-warm-gray">
          {t('products.technologies', 'Technologies')}
        </h3>
        <div className="grid grid-cols-2 gap-1">
          {visibleTechnologies.map(technology => (
            <div
              key={technology.slug || technology.id}
              className="flex items-center gap-2 py-1.5 min-h-[36px] touch-manipulation"
            >
              <Checkbox
                id={`filter-technology-${technology.slug || technology.id}`}
                checked={filters.selectedTechnologies.includes(
                  technology.slug || technology.id || ''
                )}
                onCheckedChange={() =>
                  filters.toggleTechnology(technology.slug || technology.id || technology.name)
                }
                className="min-w-[18px] min-h-[18px] h-[18px] w-[18px] border-earth/30 data-[state=checked]:bg-sand/60 data-[state=checked]:border-earth/40 data-[state=checked]:text-earth"
              />
              <Label
                htmlFor={`filter-technology-${technology.slug || technology.id}`}
                className="text-xs cursor-pointer text-warm-gray hover:text-earth transition-colors capitalize flex-1"
              >
                {technology.name}
              </Label>
            </div>
          ))}
        </div>
        {technologies.length > COMPACT_LIMIT && (
          <button
            onClick={() => setShowAllTechnologies(!showAllTechnologies)}
            className="mt-2 text-xs text-earth/70 hover:text-earth transition-colors flex items-center gap-1"
          >
            <ChevronDown
              className={`w-3 h-3 text-earth/70 transition-transform ${showAllTechnologies ? 'rotate-180' : ''}`}
            />
            {showAllTechnologies
              ? t('common.showLess', 'Show less')
              : t('common.showAll', {
                  count: technologies.length,
                  defaultValue: `Show all (${technologies.length})`,
                })}
          </button>
        )}
      </div>

      <div>
        <h3 className="font-semibold mb-2 text-sm uppercase tracking-widest text-warm-gray">
          {t('products.sizes', 'Sizes')}
        </h3>
        <div className="grid grid-cols-3 gap-1">
          {visibleSizes.map(size => (
            <div
              key={size.slug || size.id}
              className="flex items-center gap-2 py-1.5 min-h-[36px] touch-manipulation"
            >
              <Checkbox
                id={`filter-size-${size.slug || size.id}`}
                checked={filters.selectedSizes.includes(size.slug || size.id || '')}
                onCheckedChange={() => filters.toggleSize(size.slug || size.id || size.label)}
                className="min-w-[18px] min-h-[18px] h-[18px] w-[18px] border-earth/30 data-[state=checked]:bg-sand/60 data-[state=checked]:border-earth/40 data-[state=checked]:text-earth"
              />
              <Label
                htmlFor={`filter-size-${size.slug || size.id}`}
                className="text-xs cursor-pointer text-warm-gray hover:text-earth transition-colors flex-1"
              >
                {size.label}
              </Label>
            </div>
          ))}
        </div>
        {sizes.length > COMPACT_LIMIT && (
          <button
            onClick={() => setShowAllSizes(!showAllSizes)}
            className="mt-2 text-xs text-earth/70 hover:text-earth transition-colors flex items-center gap-1"
          >
            <ChevronDown
              className={`w-3 h-3 text-earth/70 transition-transform ${showAllSizes ? 'rotate-180' : ''}`}
            />
            {showAllSizes
              ? t('common.showLess', 'Show less')
              : t('common.showAll', {
                  count: sizes.length,
                  defaultValue: `Show all (${sizes.length})`,
                })}
          </button>
        )}
      </div>

      <div>
        <h3 className="font-semibold mb-2 text-sm uppercase tracking-widest text-warm-gray">
          {t('products.gender')}
        </h3>
        <div className="grid grid-cols-3 gap-1">
          {genders.map(gender => (
            <div
              key={gender}
              className="flex items-center gap-2 py-1.5 min-h-[36px] touch-manipulation"
            >
              <Checkbox
                id={`filter-gender-${gender}`}
                checked={filters.selectedGenders.includes(gender)}
                onCheckedChange={() => filters.toggleGender(gender)}
                className="min-w-[18px] min-h-[18px] h-[18px] w-[18px] border-earth/30 data-[state=checked]:bg-sand/60 data-[state=checked]:border-earth/40 data-[state=checked]:text-earth"
              />
              <Label
                htmlFor={`filter-gender-${gender}`}
                className="text-xs cursor-pointer text-warm-gray hover:text-earth transition-colors capitalize flex-1"
              >
                {translateGender(gender)}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-3 text-sm uppercase tracking-widest text-warm-gray">
          {t('products.brand')}
        </h3>
        {filters.selectedBrand && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              filters.setSelectedBrand('');
              setCurrentPage(1);
            }}
            className="mb-2 text-xs text-warm-gray hover:text-earth h-7"
          >
            {t('filters.clearBrand', { brand: filters.selectedBrand })}
          </Button>
        )}
        <Input
          type="text"
          placeholder={t('products.searchBrand')}
          value={brandSearchQuery}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBrandSearchQuery(e.target.value)}
          className="mb-2 h-9 text-sm rounded-full bg-background/60 border-earth/20 text-earth placeholder:text-warm-gray focus:border-earth/40"
        />
        <div className="max-h-40 overflow-y-auto space-y-1 border border-earth/20 rounded-2xl p-2 bg-background/60">
          {brandsList.length > 0 ? (
            filteredBrandList.map((brand: { id: string; name: string }) => (
              <button
                key={brand.id}
                onClick={() => {
                  filters.setSelectedBrand(brand.name);
                  setCurrentPage(1);
                }}
                className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  filters.selectedBrand === brand.name
                    ? 'bg-sand/50 text-earth'
                    : 'text-warm-gray hover:text-earth hover:bg-sand/30'
                }`}
              >
                {brand.name}
              </button>
            ))
          ) : (
            <p className="text-xs text-warm-gray text-center py-3">{t('common.noResults')}</p>
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

      <div className="flex gap-2 pt-4 border-t border-earth/10">
        <Button
          variant="ghost"
          className="flex-1 text-warm-gray hover:text-earth h-10 rounded-full border border-earth/20 hover:border-earth/40"
          onClick={filters.clearFilters}
        >
          {t('products.clearFilters')}
        </Button>
        <Button
          className="flex-1 bg-sand/60 text-earth border border-earth/40 hover:bg-sand/70 h-10 rounded-full"
          onClick={() => setFilterOpen(false)}
        >
          {t('products.applyFilters')}
        </Button>
      </div>
    </div>
  );
}

export function ProductsContent({
  initialPageData,
  initialPage = 1,
  initialCurrency = 'UAH',
  banners = [],
}: ProductsContentProps) {
  const { t } = useTranslation();
  const [isClient, setIsClient] = useState(false);
  const searchParamsHook = useSearchParams();
  const pathname = usePathname();
  const { currency } = useCurrency();
  const { getCurrencySymbol } = useCurrencyConversion();
  const maxPriceLimit = getMaxPriceLimit(currency);

  // Safe access to search params
  const searchParams = searchParamsHook || new URLSearchParams();

  // Dynamic SEO based on filters
  const [seoData, setSeoData] = useState<SEOData | null>(null);
  const collectionSlug = pathname?.match(/^\/collections\/(.+?)(?:\/|$)/)?.[1];
  const collectionType = getCollectionType(collectionSlug);
  const typeParam = searchParams?.get('type') || collectionType || '';
  const colorParam = searchParams?.get('color') || '';
  const materialParam = searchParams?.get('material') || '';
  const technologyParam = searchParams?.get('technology') || '';
  const sizeParam = searchParams?.get('size') || '';
  const genderParam =
    searchParams?.get('gender') ||
    pathname?.match(/^\/gender\/(men|women|unisex)(?:\/|$)/)?.[1] ||
    null;
  const storeIdParam = searchParams?.get('store_id') || '';

  // Debounce SEO params to reduce API calls
  const debouncedTypeParam = useDebounce(typeParam, 500);
  const debouncedColorParam = useDebounce(colorParam, 500);
  const debouncedMaterialParam = useDebounce(materialParam, 500);
  const debouncedTechnologyParam = useDebounce(technologyParam, 500);
  const debouncedSizeParam = useDebounce(sizeParam, 500);

  // Fetch dynamic SEO data when filters change (with debounce)
  useEffect(() => {
    if (
      !debouncedTypeParam &&
      !debouncedColorParam &&
      !debouncedMaterialParam &&
      !debouncedTechnologyParam &&
      !debouncedSizeParam
    ) {
      setSeoData(null);
      return;
    }

    const fetchSEO = async () => {
      try {
        let data: SEOData | null = null;

        // Priority: category > color > default
        if (debouncedTypeParam) {
          data = await seoApi.getCategorySEO(debouncedTypeParam);
        } else if (debouncedColorParam) {
          data = await seoApi.getColorSEO(debouncedColorParam);
        }

        setSeoData(data);
      } catch (error) {
        console.error('Failed to fetch products SEO:', error);
        setSeoData(null);
      }
    };

    fetchSEO();
  }, [
    debouncedTypeParam,
    debouncedColorParam,
    debouncedMaterialParam,
    debouncedTechnologyParam,
    debouncedSizeParam,
  ]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (seoData) {
      document.title = seoData.meta_title;
    }
  }, [seoData]);

  // Use custom hooks for state management
  const filters = useProductFilters();
  const sort = useProductSort([] as Product[]);
  const layout = useGridLayout(6);
  const [brandSearchQuery, setBrandSearchQuery] = useState('');
  const { data: catalogFilters } = useCatalogFilters();

  // Debounce search query
  const debouncedSearch = useDebounce(filters.searchQuery, 300);

  const colors = [
    'Black',
    'White',
    'Gray',
    'Beige',
    'Brown',
    'Red',
    'Blue',
    'Navy',
    'Green',
    'Olive',
    'Yellow',
    'Orange',
    'Pink',
    'Purple',
    'Cream',
  ];
  const genders = ['men', 'women', 'unisex'];

  const catalogCategories = useMemo(() => catalogFilters?.categories ?? [], [catalogFilters]);
  const categoryOptions = useMemo(() => {
    if (catalogCategories.length > 0) {
      const childCategories = catalogCategories.filter(category => category.parent_id);
      const source = childCategories.length > 0 ? childCategories : catalogCategories;
      return source.map(category => ({
        id: category.id,
        slug: category.slug,
        name: category.name,
        parent_id: category.parent_id ?? null,
      }));
    }
    return PRODUCT_CATEGORIES.map(slug => ({
      slug,
      name: getCategoryTranslation(slug),
    }));
  }, [catalogCategories]);

  const categoryLabels = useMemo(
    () => Object.fromEntries(categoryOptions.map(category => [category.slug, category.name])),
    [categoryOptions]
  );

  const categories = useMemo(
    () => categoryOptions.map(category => category.slug),
    [categoryOptions]
  );

  const materials = useMemo(() => catalogFilters?.materials ?? [], [catalogFilters]);
  const technologies = useMemo(() => catalogFilters?.technologies ?? [], [catalogFilters]);
  const catalogSizes = useMemo(() => catalogFilters?.sizes ?? [], [catalogFilters]);
  const categoriesById = useMemo(
    () => new Map(catalogCategories.map(category => [category.id, category])),
    [catalogCategories]
  );
  const activeSizeGroups = useMemo(() => {
    if (filters.selectedTypes.length === 0) return new Set<string>();
    const groups = new Set<string>();
    for (const slug of filters.selectedTypes) {
      const category = catalogCategories.find(item => item.slug === slug);
      const parent =
        category?.parent_id && categoriesById.has(category.parent_id)
          ? categoriesById.get(category.parent_id)
          : category;
      const groupSlug = parent?.slug || slug;
      const mappedGroup = SIZE_GROUP_BY_CATEGORY[groupSlug] || groupSlug;
      if (mappedGroup) groups.add(mappedGroup);
    }
    return groups;
  }, [catalogCategories, categoriesById, filters.selectedTypes]);
  const sizes = useMemo(() => {
    if (catalogSizes.length === 0) return [];
    if (activeSizeGroups.size === 0) return catalogSizes;
    return catalogSizes.filter(size =>
      size.group === 'universal' ? true : activeSizeGroups.has(size.group)
    );
  }, [catalogSizes, activeSizeGroups]);

  // Compact filter states - show only first N items
  const [showAllColors, setShowAllColors] = useState(false);
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [showAllMaterials, setShowAllMaterials] = useState(false);
  const [showAllTechnologies, setShowAllTechnologies] = useState(false);
  const [showAllSizes, setShowAllSizes] = useState(false);
  const COMPACT_LIMIT = 6;

  const visibleColors = showAllColors ? colors : colors.slice(0, COMPACT_LIMIT);
  const visibleCategories = showAllCategories ? categories : categories.slice(0, COMPACT_LIMIT);
  const visibleMaterials = showAllMaterials ? materials : materials.slice(0, COMPACT_LIMIT);
  const visibleTechnologies = showAllTechnologies
    ? technologies
    : technologies.slice(0, COMPACT_LIMIT);
  const visibleSizes = showAllSizes ? sizes : sizes.slice(0, COMPACT_LIMIT);

  const itemsPerPage = 24;

  // Server-driven pagination
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [filterOpen, setFilterOpen] = useState(false);

  // Defer data fetching until after initial render
  const [shouldFetchData, setShouldFetchData] = useState(false);
  const searchLogRef = useRef<string | null>(null);

  useEffect(() => {
    // Immediate fetch for better UX (initial data is still used)
    setShouldFetchData(true);
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
    [currentPage, itemsPerPage, debouncedSearch, filters, sort.sortBy, currency]
  );

  // Use aggregated hook for better performance with enhanced caching
  const shouldSeedInitial =
    Boolean(initialPageData) && !storeIdParam && currency === initialCurrency;
  const {
    data: pageData,
    isLoading: pageLoading,
    error: pageError,
  } = useProductsPageData(apiFilters, {
    enabled: !storeIdParam && shouldFetchData,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    ...(shouldSeedInitial
      ? {
          initialData: initialPageData ?? undefined,
        }
      : {}),
  });

  const pageSeo = useMemo(() => {
    if (!pageData || typeof pageData !== 'object') return null;
    const data = pageData as Record<string, unknown>;
    const seo = data.seo;
    return seo && typeof seo === 'object' ? (seo as SEOData) : null;
  }, [pageData]);

  useEffect(() => {
    if (pageSeo) {
      setSeoData(pageSeo);
    }
  }, [pageSeo]);

  // Use store-specific endpoint if store_id is present
  const storeProductsParams = useMemo(
    () => ({ page: currentPage, limit: itemsPerPage }),
    [currentPage, itemsPerPage]
  );

  const { data: storeProductsData, error: storeError } = useStoreProducts(
    storeIdParam || '',
    storeProductsParams,
    {
      enabled: !!storeIdParam && shouldFetchData,
      staleTime: 3 * 60 * 1000, // 3 minutes for store data
      gcTime: 10 * 60 * 1000, // 10 minutes cache
      refetchOnWindowFocus: false,
    }
  );

  // Extract data
  const loading = storeIdParam ? false : pageLoading;
  const error = storeIdParam ? storeError : pageError;
  const products = selectProductsFromData(storeIdParam, storeProductsData, pageData);

  // Extract brands from pageData
  const brandsFromData =
    ((pageData as Record<string, unknown> | null)?.['brands'] as unknown[]) || [];
  const brands: Array<{ id: string; name: string; slug?: string }> = Array.isArray(brandsFromData)
    ? brandsFromData
        .filter(item => typeof item === 'object' && item !== null)
        .map(item => {
          const record = item as Record<string, unknown>;
          return {
            id: String(record.id ?? record.slug ?? ''),
            name: String(record.name ?? record.title ?? 'Unknown'),
            slug: typeof record.slug === 'string' ? record.slug : undefined,
          };
        })
    : [];

  // Extract pagination from API response
  const pagination = selectServerPagination(
    storeIdParam,
    pageData,
    storeProductsData,
    currentPage,
    products
  );
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
    filters.selectedMaterials.length > 0 ||
    filters.selectedTechnologies.length > 0 ||
    filters.selectedSizes.length > 0 ||
    filters.selectedGenders.length > 0 ||
    Boolean(filters.selectedBrand) ||
    (filters.priceMin !== null && filters.priceMin > 0) ||
    (filters.priceMax !== null && filters.priceMax < maxPriceLimit);

  useEffect(() => {
    if (loading) return;
    if (products.length > 0) return;
    const hasSearchOrFilters = Boolean(filters.searchQuery) || isFilterActive;
    if (!hasSearchOrFilters) return;

    const payload = {
      query: filters.searchQuery.trim(),
      filters: {
        colors: filters.selectedColors,
        types: filters.selectedTypes,
        materials: filters.selectedMaterials,
        technologies: filters.selectedTechnologies,
        sizes: filters.selectedSizes,
        genders: filters.selectedGenders,
        brand: filters.selectedBrand,
        priceMin: filters.priceMin,
        priceMax: filters.priceMax,
      },
      timestamp: new Date().toISOString(),
    };

    const fingerprint = JSON.stringify(payload);
    if (searchLogRef.current === fingerprint) return;
    searchLogRef.current = fingerprint;

    fetch('/api/search-logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => undefined);
  }, [
    loading,
    products.length,
    filters.searchQuery,
    filters.selectedColors,
    filters.selectedTypes,
    filters.selectedMaterials,
    filters.selectedTechnologies,
    filters.selectedSizes,
    filters.selectedGenders,
    filters.selectedBrand,
    filters.priceMin,
    filters.priceMax,
    isFilterActive,
  ]);

  const defaultHeading = storeIdParam ? t('products.storeTitle') : t('products.heading');
  const genderCopy = getGenderCopy(genderParam, t);
  const pageHeading = seoData?.h1_title ?? genderCopy?.title ?? defaultHeading;
  const pageDescription =
    seoData?.content_text ?? genderCopy?.description ?? t('products.subheading');

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
    <div className="min-h-screen">
      <main className="w-full px-4 sm:px-6 md:px-12 lg:px-16 py-6 sm:py-8 pt-24 sm:pt-28">
        <div className="max-w-[1800px] mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div>
              <h1 className="text-2xl sm:text-4xl md:text-5xl font-display font-bold text-foreground mb-3 sm:mb-4 neon-text">
                {pageHeading}
              </h1>
              <p className="text-muted-foreground max-w-2xl text-base sm:text-lg neon-description font-serif">
                {pageDescription}
              </p>
            </div>
          </div>

          {banners.length > 0 && (
            <div className="mb-8">
              <BannerCarousel banners={banners} />
            </div>
          )}

          <div className="sticky top-[64px] sm:top-[72px] rounded-2xl sm:rounded-3xl z-30 bg-background/85 backdrop-blur-xl border border-earth/20 p-3 sm:p-4 mb-6 sm:mb-8 shadow-2xl transition-all duration-300">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
                {/* Search with animated border */}
                <div className="relative flex-1 min-w-0">
                  <div className="relative group">
                    {/* Animated border gradient */}
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-white/60 via-white/90 to-white/60 rounded-xl blur-sm opacity-60 group-hover:opacity-85 group-focus-within:opacity-100 transition-opacity duration-300 animate-gradient-shift"></div>
                    <div className="relative flex items-center">
                      <Search className="absolute left-3 w-4 h-4 text-warm-gray z-10 group-focus-within:text-earth transition-colors" />
                      <Input
                        type="text"
                        placeholder={t('products.searchPlaceholder')}
                        value={filters.searchQuery}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          filters.setSearchQuery(e.target.value);
                          setCurrentPage(1);
                        }}
                        className="pl-9 h-11 w-full bg-background/60 border-earth/20 text-earth placeholder:text-warm-gray focus:border-earth/40 transition-all font-medium rounded-full relative"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  {isClient ? (
                    <>
                      {/* Filter Dialog */}
                      <Dialog open={filterOpen} onOpenChange={setFilterOpen} modal={false}>
                        <DialogTrigger asChild>
                          <Button
                            variant={isFilterActive ? 'default' : 'outline'}
                            className={`h-11 px-4 gap-2 rounded-full w-full sm:w-auto relative overflow-hidden border border-earth/20 transition-all duration-150 touch-manipulation active:scale-95 ${
                              isFilterActive
                                ? 'bg-sand/40 text-earth border-earth/40'
                                : 'bg-background text-warm-gray hover:text-earth hover:border-earth/40'
                            }`}
                          >
                            <Filter className="w-4 h-4" />
                            <span>{t('products.filters')}</span>
                            {isFilterActive && (
                              <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary animate-pulse" />
                            )}
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="w-[calc(100vw-1.5rem)] sm:max-w-[425px] overflow-hidden flex flex-col max-h-[85svh] sm:max-h-[90vh] rounded-2xl sm:rounded-3xl border border-earth/20 bg-background/95 text-earth">
                          <DialogHeader>
                            <DialogTitle>{t('products.filters')}</DialogTitle>
                            <DialogDescription className="text-warm-gray">
                              {t(
                                'products.filtersDescription',
                                'Оберіть параметри для фільтрації товарів'
                              )}
                            </DialogDescription>
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
                              categoryLabels={categoryLabels}
                              showAllCategories={showAllCategories}
                              setShowAllCategories={setShowAllCategories}
                              COMPACT_LIMIT={COMPACT_LIMIT}
                              genders={genders}
                              materials={materials}
                              visibleMaterials={visibleMaterials}
                              showAllMaterials={showAllMaterials}
                              setShowAllMaterials={setShowAllMaterials}
                              technologies={technologies}
                              visibleTechnologies={visibleTechnologies}
                              showAllTechnologies={showAllTechnologies}
                              setShowAllTechnologies={setShowAllTechnologies}
                              sizes={sizes}
                              visibleSizes={visibleSizes}
                              showAllSizes={showAllSizes}
                              setShowAllSizes={setShowAllSizes}
                              filters={filters}
                              brands={brands}
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
                        onValueChange={value => {
                          sort.setSortBy(value as SortOption);
                          setCurrentPage(1);
                        }}
                      >
                        <SelectTrigger className="w-full sm:w-[220px] h-11 bg-background/60 border-earth/20 rounded-full text-earth hover:text-earth hover:border-earth/40">
                          <SelectValue placeholder={t('products.sortBy')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="default">{t('products.sortDefault')}</SelectItem>
                          <SelectItem value="price_asc">{t('products.priceAsc')}</SelectItem>
                          <SelectItem value="price_desc">{t('products.priceDesc')}</SelectItem>
                          <SelectItem value="newest">{t('products.newest')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        className="h-11 px-4 gap-2 rounded-full w-full sm:w-auto border border-earth/20 bg-background text-warm-gray"
                        disabled
                      >
                        <Filter className="w-4 h-4" />
                        <span>{t('products.filters')}</span>
                      </Button>
                      <div className="w-full sm:w-[220px] h-11 px-4 rounded-full border border-earth/20 bg-background/60 text-warm-gray flex items-center">
                        {t('products.sortBy')}
                      </div>
                    </>
                  )}

                  {/* View Layout Toggle */}
                  <div className="hidden sm:flex bg-background/60 p-1 rounded-full border border-earth/20">
                    <Button
                      variant={layout.columns === 2 ? 'secondary' : 'ghost'}
                      size="icon"
                      onClick={() => layout.setColumns(2)}
                      className={`h-9 w-9 rounded-full border transition-all duration-150 ${
                        layout.columns === 2
                          ? 'bg-sand/40 text-earth border-earth/40'
                          : 'border-transparent text-warm-gray hover:text-earth hover:border-earth/40'
                      }`}
                      aria-label="Two columns"
                    >
                      <LayoutGrid className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={layout.columns === 4 ? 'secondary' : 'ghost'}
                      size="icon"
                      onClick={() => layout.setColumns(4)}
                      className={`h-9 w-9 rounded-full border transition-all duration-150 ${
                        layout.columns === 4
                          ? 'bg-sand/40 text-earth border-earth/40'
                          : 'border-transparent text-warm-gray hover:text-earth hover:border-earth/40'
                      }`}
                      aria-label="Four columns"
                    >
                      <Grid3x3 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={layout.columns === 6 ? 'secondary' : 'ghost'}
                      size="icon"
                      onClick={() => layout.setColumns(6)}
                      className={`h-9 w-9 rounded-full border transition-all duration-150 hidden lg:flex ${
                        layout.columns === 6
                          ? 'bg-sand/40 text-earth border-earth/40'
                          : 'border-transparent text-warm-gray hover:text-earth hover:border-earth/40'
                      }`}
                      aria-label="Six columns"
                    >
                      <Columns3 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full space-y-8">{mainContent}</div>

        {/* Recently Viewed - Client Side */}
        <RecentlyViewedProducts />

        {/* Personalized Recommends */}
        <PersonalizedRecommendations />
      </main>
    </div>
  );
}
