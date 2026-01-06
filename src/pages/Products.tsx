import { useState, useEffect, useMemo } from "react";
import { useSmoothScroll } from '@/hooks/useAnimationFrame';
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import Navigation from "@/components/layout/Navigation";
import Footer from "@/components/layout/Footer";
import { NeonAbstractions } from "@/components/NeonAbstractions";
import ProductCard from "@/components/ProductCard";
import { ProductGridSkeleton } from "@/components/common/SkeletonLoader";
import { NoProductsFound, NoStoreProducts, ErrorState } from "@/components/common/EmptyState";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Filter, Search, Grid3x3, LayoutGrid, Columns3 } from "lucide-react";
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
import { useProductFilters, useProductSort, useGridLayout } from "@/features/products";
import { PRODUCT_CATEGORIES } from "@/constants/categories";
import type { Product } from "@/types";
import { translateGender } from "@/utils/errorTranslation";
import { getColorTranslation, getCategoryTranslation } from "@/utils/translations";
import { useSEO } from "@/hooks/useSEO";
import { seoApi, type SEOData } from "@/services/api/seo.api";
import PriceRangeFilter from "@/components/PriceRangeFilter";
import RecentlyViewedProducts from "@/components/RecentlyViewedProducts";
import PersonalizedRecommendations from "@/components/PersonalizedRecommendations";

const Products = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const { scrollToTop } = useSmoothScroll();
  
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
  
  // SEO Meta Tags - use dynamic data if available
  useSEO({
    title: seoData?.meta_title || (storeIdParam 
      ? t('products.seoTitleStore', 'Shop Products from Store')
      : t('products.seoTitle', 'Shop All Fashion Products')),
    description: seoData?.meta_description || t('products.seoDescription', 'Browse our complete collection of fashion items. Filter by category, color, brand, and more. Find your perfect style.'),
    keywords: seoData?.keywords || 'fashion products, clothing, shoes, accessories, brands, online shopping',
    type: 'website',
    canonical: seoData?.canonical_url,
  });
  
  // Use custom hooks for state management
  const filters = useProductFilters();
  const sort = useProductSort();
  const layout = useGridLayout(6);
  const [brandSearchQuery, setBrandSearchQuery] = useState("");
  
  // Debounce search query
  const debouncedSearch = useDebounce(filters.searchQuery, 300);

  const colors = ["Black", "White", "Gray", "Beige", "Brown", "Red", "Blue", "Navy", "Green", "Olive", "Yellow", "Orange", "Pink", "Purple", "Cream"];
  const genders = ["men", "women", "unisex"];
  const categories = [...PRODUCT_CATEGORIES];
  
  const itemsPerPage = 24;

  // Server-driven pagination
  const [currentPage, setCurrentPage] = useState(1);
  
  // Defer data fetching until after initial render
  const [shouldFetchData, setShouldFetchData] = useState(false);
  
  useEffect(() => {
    const timeoutId = setTimeout(() => setShouldFetchData(true), 50);
    return () => clearTimeout(timeoutId);
  }, []);
  
  // Build API filters object (memoized to avoid query-key churn)
  const apiFilters = useMemo(
    () => ({
      page: currentPage,
      limit: itemsPerPage,
      search: debouncedSearch || undefined,
      type: filters.selectedTypes?.length ? filters.selectedTypes : undefined,
      color: filters.selectedColors?.length ? filters.selectedColors : undefined,
      gender: filters.selectedGenders?.length ? filters.selectedGenders : undefined,
      brandId: filters.selectedBrand ? [filters.selectedBrand] : undefined,
      sort: sort.sortBy !== 'default' ? sort.sortBy : undefined,
    }),
    [
      currentPage,
      itemsPerPage,
      debouncedSearch,
      filters.selectedTypes,
      filters.selectedColors,
      filters.selectedGenders,
      filters.selectedBrand,
      sort.sortBy,
    ]
  );
  
  // Use aggregated hook for better performance
  const { data: pageData, isLoading: pageLoading } = useProductsPageData(apiFilters, { 
    enabled: !storeIdParam && shouldFetchData 
  });
  
  // Use store-specific endpoint if store_id is present
  const storeProductsParams = useMemo(
    () => ({ page: currentPage, limit: itemsPerPage }),
    [currentPage, itemsPerPage]
  );

  const { data: storeProductsData, isLoading: storeLoading, error: storeError } = useStoreProducts(
    storeIdParam || '', 
    storeProductsParams,
    { enabled: !!storeIdParam && shouldFetchData }
  );
  
  // Extract data
  const productsData = !storeIdParam ? pageData?.products : null;
  const brandsData = !storeIdParam ? pageData?.brands : null;
  const loading = !storeIdParam ? pageLoading : false;
  
  // Use store products if filtering by store, otherwise use server-paged products
  const products = useMemo(() => {
    if (storeIdParam && storeProductsData) {
      return storeProductsData.products || [];
    }
    if (!productsData) return [];
    if (Array.isArray(productsData)) return productsData as Product[];
    if (typeof productsData === 'object' && productsData !== null) {
      const record = productsData as Record<string, unknown>;
      const inner = record['products'];
      if (Array.isArray(inner)) return inner as Product[];
    }
    return [];
  }, [productsData, storeProductsData, storeIdParam]);

  const serverPagination = useMemo(() => {
    // Aggregated endpoint: pageData.pagination
    if (!storeIdParam && pageData?.pagination) return pageData.pagination;

    // Store products endpoint may return pagination-ish fields
    if (storeIdParam && storeProductsData?.pagination) {
      return storeProductsData.pagination;
    }

    // Fallback
    return {
      page: currentPage,
      totalPages: 1,
      totalItems: Array.isArray(products) ? products.length : 0,
      hasNext: false,
      hasPrev: currentPage > 1,
    };
  }, [storeIdParam, pageData, storeProductsData, currentPage, products]);

  const brands = useMemo(() => {
    if (!brandsData) return [];
    return Array.isArray(brandsData) ? brandsData : [];
  }, [brandsData]);

  const filteredBrands = useMemo(() => {
    if (!brandSearchQuery.trim()) return brands;
    const query = brandSearchQuery.toLowerCase();
    return brands.filter((brand: { id: string; name: string }) => 
      brand.name?.toLowerCase().includes(query)
    );
  }, [brands, brandSearchQuery]);

  // Handle loading and error states
  const isLoading = storeIdParam ? storeLoading : loading;
  const currentError = storeIdParam ? storeError : null;

  // Filter toggle handlers are now provided by useProductFilters hook:
  // - filters.toggleColor(color)
  // - filters.toggleType(type)
  // - filters.toggleGender(gender)
  // - filters.clearFilters()

  useEffect(() => {
    setCurrentPage(1);
  }, [filters.searchQuery]);

  // Scroll to top when navigating between pages or changing filters
  useEffect(() => {
    scrollToTop(500); // RAF-based smooth scroll
  }, [currentPage, sort.sortBy, filters.selectedBrand, scrollToTop]);

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden font-sans">
      <Navigation />
      
      {/* Hero Section with NeonAbstractions */}
      <section className="relative min-h-[40vh] flex items-center justify-center overflow-hidden pt-28 pb-12">
        <NeonAbstractions />
        
        <div className="container mx-auto px-6 relative z-10 text-center">
          <h1 className="font-display text-5xl sm:text-6xl md:text-7xl font-bold mb-4 tracking-tight">
            <span className="neon-text">{t('products.title')}</span>
          </h1>
          
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            {t('home.subtitle')}
          </p>
          
          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto">
            <div className="relative flex items-center">
              <Search className="absolute left-5 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder={t('home.searchPlaceholder')}
                value={filters.searchQuery}
                onChange={(e) => filters.setSearchQuery(e.target.value)}
                className="w-full pl-14 pr-5 h-14 glass-card rounded-full text-foreground placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-foreground/20 border-foreground/10"
              />
            </div>
          </div>
        </div>
      </section>
      
      <main className="container mx-auto px-6 pb-16">
        <div className="flex flex-col gap-10">

          {/* Filters and Sort */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-3 flex-wrap">
              <Dialog modal={false} open={layout.filterOpen} onOpenChange={layout.setFilterOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="lg" className="border-foreground/20 bg-card/50 text-foreground hover:bg-card hover:border-foreground/30 min-h-[48px] text-base touch-manipulation active:scale-95">
                    <Filter className="w-5 h-5 mr-2" />
                    {t('products.filters')}
                    {filters.hasActiveFilters && (
                      <span className="ml-2 bg-primary text-primary-foreground rounded-full min-w-[24px] h-6 flex items-center justify-center px-2 text-xs font-bold">
                        {filters.selectedColors.length + filters.selectedTypes.length + filters.selectedGenders.length + (filters.selectedBrand ? 1 : 0)}
                      </span>
                    )}
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-card border-foreground/10 text-foreground w-[95vw] max-w-md max-h-[85vh] overflow-y-auto p-4 sm:p-6">
                  <DialogHeader>
                    <DialogTitle className="text-xl sm:text-2xl font-bold">{t('products.filter')}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-6 py-4">
                    {/* Color Filter */}
                    <div>
                      <h3 className="font-semibold mb-3 text-sm uppercase tracking-widest text-muted-foreground">{t('products.color')}</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {colors.map((color) => (
                          <div key={color} className="flex items-center gap-3 py-2 min-h-[44px] touch-manipulation">
                            <Checkbox 
                              id={`filter-color-${color}`}
                              checked={filters.selectedColors.includes(color)}
                              onCheckedChange={() => filters.toggleColor(color)}
                              className="min-w-[20px] min-h-[20px] h-5 w-5"
                            />
                            <Label 
                              htmlFor={`filter-color-${color}`}
                              className="text-sm cursor-pointer active:text-foreground/80 transition-colors capitalize flex-1"
                            >
                              {getColorTranslation(color)}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Category Filter */}
                    <div>
                      <h3 className="font-semibold mb-3 text-sm uppercase tracking-widest text-muted-foreground">{t('products.category')}</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {categories.map((category) => (
                          <div key={category} className="flex items-center gap-3 py-2 min-h-[44px] touch-manipulation">
                            <Checkbox 
                              id={`filter-category-${category}`}
                              checked={filters.selectedTypes.includes(category)}
                              onCheckedChange={() => filters.toggleType(category)}
                              className="min-w-[20px] min-h-[20px] h-5 w-5"
                            />
                            <Label 
                              htmlFor={`filter-category-${category}`}
                              className="text-sm cursor-pointer active:text-foreground/80 transition-colors capitalize flex-1"
                            >
                              {getCategoryTranslation(category)}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Gender Filter */}
                    <div>
                      <h3 className="font-semibold mb-3 text-sm uppercase tracking-widest text-muted-foreground">{t('products.gender')}</h3>
                      <div className="grid grid-cols-3 gap-2">
                        {genders.map((gender) => (
                          <div key={gender} className="flex items-center gap-3 py-2 min-h-[44px] touch-manipulation">
                            <Checkbox 
                              id={`filter-gender-${gender}`}
                              checked={filters.selectedGenders.includes(gender)}
                              onCheckedChange={() => filters.toggleGender(gender)}
                              className="min-w-[20px] min-h-[20px] h-5 w-5"
                            />
                            <Label 
                              htmlFor={`filter-gender-${gender}`}
                              className="text-sm cursor-pointer active:text-foreground/80 transition-colors capitalize flex-1"
                            >
                              {translateGender(gender)}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Brand Filter */}
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
                        onChange={(e) => setBrandSearchQuery(e.target.value)}
                        className="mb-2 h-9 text-sm"
                      />
                      <div className="max-h-40 overflow-y-auto space-y-1 border border-foreground/10 rounded-lg p-2">
                        {filteredBrands.length > 0 ? (
                          filteredBrands.map((brand: { id: string; name: string }) => (
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

                    {/* Price Range Filter */}
                    <div>
                      <PriceRangeFilter
                        min={0}
                        max={5000}
                        minValue={filters.priceMin ?? 0}
                        maxValue={filters.priceMax ?? 5000}
                        onApply={(min, max) => {
                          filters.setPriceRange(min === 0 ? null : min, max === 5000 ? null : max);
                          setCurrentPage(1);
                        }}
                        currency="$"
                        showApplyButton={false}
                        step={50}
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
                        onClick={() => layout.setFilterOpen(false)}
                      >
                        {t('products.applyFilters')}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              
              {filters.hasActiveFilters && (
                <Button 
                  variant="ghost" 
                  onClick={filters.clearFilters}
                  className="text-muted-foreground hover:text-foreground"
                >
                  {t('products.clearFilters')}
                </Button>
              )}
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              {/* Grid Layout Selector - Visual Gallery View */}
              <div className="flex items-center gap-1 border border-foreground/20 rounded-lg p-1 bg-card/50">
                <Button
                  variant={layout.columns === 2 ? "default" : "ghost"}
                  size="sm"
                  onClick={() => layout.setColumns(2)}
                  className="h-9 w-9 p-0"
                  title="Великі плитки (2 колонки)"
                >
                  <Columns3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={layout.columns === 4 ? "default" : "ghost"}
                  size="sm"
                  onClick={() => layout.setColumns(4)}
                  className="h-9 w-9 p-0"
                  title="Середні плитки (4 колонки)"
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button
                  variant={layout.columns === 6 ? "default" : "ghost"}
                  size="sm"
                  onClick={() => layout.setColumns(6)}
                  className="h-9 w-9 p-0"
                  title="Маленькі плитки (6 колонок)"
                >
                  <Grid3x3 className="h-4 w-4" />
                </Button>
              </div>

              {/* Sort */}
              <Select value={sort.sortBy} onValueChange={sort.setSortBy}>
                <SelectTrigger className="w-[200px] h-10 border-foreground/20 bg-card/50 text-foreground focus:ring-foreground/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent position="popper" className="bg-card border-foreground/10 text-foreground">
                  <SelectItem value="default">{t('products.default')}</SelectItem>
                  <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                  <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                  <SelectItem value="price-asc">{t('products.priceAsc')}</SelectItem>
                  <SelectItem value="price-desc">{t('products.priceDesc')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Products Grid */}
          {isLoading ? (
            <ProductGridSkeleton count={24} columns={6} />
          ) : currentError ? (
            <ErrorState 
              title="Failed to load products"
              description="We couldn't load the products. Please check your connection and try again."
              onRetry={() => window.location.reload()}
              technicalDetails={currentError instanceof Error ? currentError.message : String(currentError)}
            />
          ) : products.length === 0 ? (
            storeIdParam ? (
              <NoStoreProducts />
            ) : filters.searchQuery ? (
              <NoSearchResults 
                query={filters.searchQuery}
                onClearSearch={() => { filters.setSearchQuery(''); setCurrentPage(1); }}
              />
            ) : (
              <NoProductsFound 
                hasFilters={filters.hasActiveFilters}
                onClearFilters={filters.clearFilters}
              />
            )
          ) : (
            <>
              <div className={`grid gap-x-6 gap-y-12 ${
                layout.columns === 2 ? 'grid-cols-1 sm:grid-cols-2' :
                layout.columns === 4 ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4' :
                'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6'
              }`}>
                {products.map((product: Product) => (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    name={product.name}
                    image={product.image_url || product.image || ""}
                    price={String(product.price)}
                    category={product.type}
                    brand={product.brand}
                  />
                ))}
              </div>

              {/* Pagination */}
              {products.length > 0 && serverPagination.totalPages > 1 && (
                <Pagination className="mt-20">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="cursor-pointer text-foreground hover:bg-card hover:text-foreground"
                      />
                    </PaginationItem>
                    
                    {[...Array(serverPagination.totalPages)].map((_, i) => {
                      const pageNum = i + 1;
                      if (
                        pageNum === 1 ||
                        pageNum === serverPagination.totalPages ||
                        (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                      ) {
                        return (
                          <PaginationItem key={pageNum}>
                            <PaginationLink
                              onClick={() => setCurrentPage(pageNum)}
                              isActive={currentPage === pageNum}
                              className="cursor-pointer border-foreground/20 text-foreground hover:bg-card hover:text-foreground"
                            >
                              {pageNum}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      } else if (
                        pageNum === currentPage - 2 ||
                        pageNum === currentPage + 2
                      ) {
                        return (
                          <PaginationItem key={pageNum}>
                            <PaginationEllipsis className="text-muted-foreground" />
                          </PaginationItem>
                        );
                      }
                      return null;
                    })}
                    
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => setCurrentPage((p) => Math.min(serverPagination.totalPages, p + 1))}
                        disabled={currentPage === serverPagination.totalPages}
                        className="cursor-pointer text-foreground hover:bg-card hover:text-foreground"
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </>
          )}

          {/* Personalized Recommendations */}
          <PersonalizedRecommendations 
            className="mt-8"
            limit={8}
          />

          {/* Recently Viewed Products */}
          <RecentlyViewedProducts 
            className="mt-8"
            maxItems={8}
          />
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Products;

