import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import Navigation from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
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
import { Filter, Search, Sparkles, AlertCircle, Grid3x3, LayoutGrid, Columns3 } from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { useProducts, useBrands, useStoreProducts } from "@/hooks/useApi";
import { useDebounce } from "@/hooks/useDebounce";
import { PRODUCT_CATEGORIES } from "@/constants/categories";
import type { Product } from "@/types";

const Products = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedGenders, setSelectedGenders] = useState<string[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<string>("");
  const [brandSearchQuery, setBrandSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("default");
  const [currentPage, setCurrentPage] = useState(1);
  const [filterOpen, setFilterOpen] = useState(false);
  const [gridColumns, setGridColumns] = useState<number>(6); // Grid layout selector
  const itemsPerPage = 24;

  const colors = ["Black", "White", "Gray", "Beige", "Brown", "Red", "Blue", "Navy", "Green", "Olive", "Yellow", "Orange", "Pink", "Purple", "Cream"];
  const types = ["Outerwear", "Tops", "Bottoms", "Dresses", "Shoes", "Accessories"];
  const genders = ["Male", "Female", "Unisex"];
  const categories = [...PRODUCT_CATEGORIES]; // Use the standardized categories

  // Get store_id from URL params
  const storeIdParam = searchParams.get('store_id');
  
  // Use store-specific endpoint if store_id is present, otherwise get all products
  const { data: productsData, isLoading: loading, error } = useProducts({ 
    enabled: !storeIdParam // Only fetch all products if not filtering by store
  });
  const { data: storeProductsData, isLoading: storeLoading, error: storeError } = useStoreProducts(
    storeIdParam || '', 
    { limit: 1000 }, // Fetch all products from store
    { enabled: !!storeIdParam }
  );
  const { data: brandsData } = useBrands();
  
  // Use store products if filtering by store, otherwise use all products
  const allProducts = useMemo(() => {
    if (storeIdParam && storeProductsData) {
      return storeProductsData.products || storeProductsData || [];
    }
    if (!productsData) return [];
    return productsData.products || productsData || [];
  }, [productsData, storeProductsData, storeIdParam]);

  const brands = useMemo(() => {
    if (!brandsData) return [];
    return Array.isArray(brandsData) ? brandsData : [];
  }, [brandsData]);

  const filteredBrands = useMemo(() => {
    if (!brandSearchQuery.trim()) return brands;
    const query = brandSearchQuery.toLowerCase();
    return brands.filter((brand: any) => 
      brand.name?.toLowerCase().includes(query)
    );
  }, [brands, brandSearchQuery]);

  const filteredAndSortedProducts = useMemo(() => {
    let filtered = [...allProducts];

    // Search filter - use debounced value
    if (debouncedSearch.trim()) {
      const query = debouncedSearch.toLowerCase();
      filtered = filtered.filter((p: Product) =>
        p.name?.toLowerCase().includes(query) ||
        p.category?.toLowerCase().includes(query) ||
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

    // Sorting
    if (sortBy !== 'default') {
      const [field, order] = sortBy.split('-');
      filtered.sort((a: any, b: any) => {
        const aVal = a[field] || '';
        const bVal = b[field] || '';
        if (order === 'asc') {
          return aVal > bVal ? 1 : -1;
        } else {
          return aVal < bVal ? 1 : -1;
        }
      });
    }

    return filtered;
  }, [allProducts, debouncedSearch, selectedColors, selectedTypes, selectedGenders, selectedBrand, sortBy]);

  // Handle loading and error states for both data sources
  const isLoading = storeIdParam ? storeLoading : loading;
  const currentError = storeIdParam ? storeError : error;

  const totalProducts = filteredAndSortedProducts.length;
  const totalPages = Math.ceil(totalProducts / itemsPerPage);
  
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedProducts.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedProducts, currentPage, itemsPerPage]);

  const toggleColor = (color: string) => {
    setSelectedColors(prev => 
      prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color]
    );
    setCurrentPage(1);
  };

  const toggleType = (type: string) => {
    setSelectedTypes(prev => 
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
    setCurrentPage(1);
  };

  const toggleGender = (gender: string) => {
    setSelectedGenders(prev => 
      prev.includes(gender) ? prev.filter(g => g !== gender) : [...prev, gender]
    );
    setCurrentPage(1);
  };

  const clearAllFilters = () => {
    setSelectedColors([]);
    setSelectedTypes([]);
    setSelectedGenders([]);
    setSelectedBrand("");
    setBrandSearchQuery("");
    setSearchQuery("");
    setCurrentPage(1);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Scroll to top when navigating between pages or changing filters
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage, sortBy, selectedBrand]);

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden font-sans">
      <Navigation />
      
      {/* Hero Section with NeonAbstractions */}
      <section className="relative min-h-[40vh] flex items-center justify-center overflow-hidden pt-28 pb-12">
        <NeonAbstractions />
        
        <div className="container mx-auto px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 glass-card-strong rounded-full mb-6">
            <Sparkles className="w-3 h-3" />
            <span className="text-xs text-foreground/80 tracking-wider uppercase font-medium">
              Curated Collection
            </span>
          </div>
          
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
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
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
              <Dialog open={filterOpen} onOpenChange={setFilterOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="lg" className="border-foreground/20 bg-card/50 text-foreground hover:bg-card hover:border-foreground/30">
                    <Filter className="w-4 h-4 mr-2" />
                    {t('products.filters')}
                    {(selectedColors.length + selectedTypes.length + selectedGenders.length + (selectedBrand ? 1 : 0)) > 0 && (
                      <span className="ml-2 bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold">
                        {selectedColors.length + selectedTypes.length + selectedGenders.length + (selectedBrand ? 1 : 0)}
                      </span>
                    )}
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-card border-foreground/10 text-foreground sm:max-w-md max-h-[85vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">{t('products.filter')}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-6 py-4">
                    {/* Color Filter */}
                    <div>
                      <h3 className="font-semibold mb-3 text-sm uppercase tracking-widest text-muted-foreground">{t('products.color')}</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {colors.map((color) => (
                          <div key={color} className="flex items-center">
                            <Checkbox 
                              id={`filter-color-${color}`}
                              checked={selectedColors.includes(color)}
                              onCheckedChange={() => toggleColor(color)}
                              className="border-foreground/20 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                            />
                            <Label 
                              htmlFor={`filter-color-${color}`}
                              className="ml-2 text-sm cursor-pointer hover:text-foreground/80 transition-colors"
                            >
                              {color}
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
                          <div key={category} className="flex items-center">
                            <Checkbox 
                              id={`filter-category-${category}`}
                              checked={selectedTypes.includes(category)}
                              onCheckedChange={() => toggleType(category)}
                              className="border-foreground/20 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                            />
                            <Label 
                              htmlFor={`filter-category-${category}`}
                              className="ml-2 text-sm cursor-pointer hover:text-foreground/80 transition-colors capitalize"
                            >
                              {t(`products.${category.toLowerCase().replace('-', '')}`)}
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
                          <div key={gender} className="flex items-center">
                            <Checkbox 
                              id={`filter-gender-${gender}`}
                              checked={selectedGenders.includes(gender)}
                              onCheckedChange={() => toggleGender(gender)}
                              className="border-foreground/20 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                            />
                            <Label 
                              htmlFor={`filter-gender-${gender}`}
                              className="ml-2 text-sm cursor-pointer hover:text-foreground/80 transition-colors"
                            >
                              {t(`products.${gender.toLowerCase()}`)}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Brand Filter */}
                    <div>
                      <h3 className="font-semibold mb-3 text-sm uppercase tracking-widest text-muted-foreground">{t('products.brand')}</h3>
                      {selectedBrand && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => { setSelectedBrand(""); setCurrentPage(1); }}
                          className="mb-2 text-xs text-muted-foreground hover:text-foreground h-7"
                        >
                          Clear: {selectedBrand}
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
                          filteredBrands.map((brand: any) => (
                            <button
                              key={brand.id}
                              onClick={() => {
                                setSelectedBrand(brand.name);
                                setCurrentPage(1);
                              }}
                              className={`w-full text-left px-2 py-1.5 rounded-md text-sm transition-colors ${
                                selectedBrand === brand.name
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

                    <div className="flex gap-2 pt-4 border-t border-foreground/10">
                      <Button 
                        variant="ghost" 
                        className="flex-1 text-muted-foreground hover:text-foreground h-10"
                        onClick={clearAllFilters}
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
                </DialogContent>
              </Dialog>
              
              {(selectedColors.length > 0 || selectedTypes.length > 0 || selectedGenders.length > 0 || selectedBrand) && (
                <Button 
                  variant="ghost" 
                  onClick={clearAllFilters}
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
                  variant={gridColumns === 2 ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setGridColumns(2)}
                  className="h-9 w-9 p-0"
                  title="Великі плитки (2 колонки)"
                >
                  <Columns3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={gridColumns === 4 ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setGridColumns(4)}
                  className="h-9 w-9 p-0"
                  title="Середні плитки (4 колонки)"
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button
                  variant={gridColumns === 6 ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setGridColumns(6)}
                  className="h-9 w-9 p-0"
                  title="Маленькі плитки (6 колонок)"
                >
                  <Grid3x3 className="h-4 w-4" />
                </Button>
              </div>

              {/* Sort */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[200px] h-10 border-foreground/20 bg-card/50 text-foreground focus:ring-foreground/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-foreground/10 text-foreground">
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
            />
          ) : paginatedProducts.length === 0 ? (
            storeIdParam ? (
              <NoStoreProducts />
            ) : (
              <NoProductsFound hasFilters={
                selectedColors.length > 0 || 
                selectedTypes.length > 0 || 
                selectedGenders.length > 0 || 
                selectedBrand !== '' ||
                debouncedSearch !== ''
              } />
            )
          ) : (
            <>
              <div className={`grid gap-x-6 gap-y-12 ${
                gridColumns === 2 ? 'grid-cols-1 sm:grid-cols-2' :
                gridColumns === 4 ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4' :
                'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6'
              }`}>
                {paginatedProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    name={product.name}
                    image={product.image_url || product.image || ""}
                    price={String(product.price)}
                    category={product.category}
                  />
                ))}
              </div>

              {/* Pagination */}
              {paginatedProducts.length > 0 && totalPages > 1 && (
                <Pagination className="mt-20">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        className={`cursor-pointer text-foreground hover:bg-card hover:text-foreground ${currentPage === 1 ? "pointer-events-none opacity-50" : ""}`}
                      />
                    </PaginationItem>
                    
                    {[...Array(totalPages)].map((_, i) => {
                      const pageNum = i + 1;
                      if (
                        pageNum === 1 ||
                        pageNum === totalPages ||
                        (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                      ) {
                        return (
                          <PaginationItem key={pageNum}>
                            <PaginationLink
                              onClick={() => setCurrentPage(pageNum)}
                              isActive={currentPage === pageNum}
                              className={`cursor-pointer border-foreground/20 text-foreground hover:bg-card hover:text-foreground ${currentPage === pageNum ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground" : ""}`}
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
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        className={`cursor-pointer text-foreground hover:bg-card hover:text-foreground ${currentPage === totalPages ? "pointer-events-none opacity-50" : ""}`}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Products;

