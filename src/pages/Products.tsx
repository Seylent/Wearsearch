import { useState, useEffect, useMemo } from "react";
import Navigation from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { NeonAbstractions } from "@/components/NeonAbstractions";
import ProductCard from "@/components/ProductCard";
import { ProductGridSkeleton } from "@/components/common/SkeletonLoader";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Filter, Search, Sparkles, AlertCircle } from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { useProducts, useBrands } from "@/hooks/useApi";
import { useDebounce } from "@/hooks/useDebounce";
import type { Product } from "@/types";

const Products = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<string>("");
  const [brandSearchQuery, setBrandSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("default");
  const [currentPage, setCurrentPage] = useState(1);
  const [filterOpen, setFilterOpen] = useState(false);
  const itemsPerPage = 24;

  const colors = ["Black", "White", "Gray", "Beige", "Brown", "Red", "Blue", "Navy", "Green", "Olive", "Yellow", "Orange", "Pink", "Purple", "Cream"];
  const types = ["Outerwear", "Tops", "Bottoms", "Dresses", "Shoes", "Accessories"];

  const { data: productsData, isLoading: loading, error } = useProducts();
  const { data: brandsData } = useBrands();
  
  const allProducts = useMemo(() => {
    if (!productsData) return [];
    return productsData.products || productsData || [];
  }, [productsData]);

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
  }, [allProducts, debouncedSearch, selectedColors, selectedTypes, sortBy]);

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

  const clearAllFilters = () => {
    setSelectedColors([]);
    setSelectedTypes([]);
    setSelectedBrand("");
    setBrandSearchQuery("");
    setSearchQuery("");
    setCurrentPage(1);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

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
            <span className="neon-text">Explore</span> Products
          </h1>
          
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Discover our curated selection of premium fashion from world-class designers
          </p>
          
          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto">
            <div className="relative flex items-center">
              <Search className="absolute left-5 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search products..."
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
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center gap-3 flex-wrap">
              <Dialog open={filterOpen} onOpenChange={setFilterOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="lg" className="border-foreground/20 bg-card/50 text-foreground hover:bg-card hover:border-foreground/30">
                    <Filter className="w-4 h-4 mr-2" />
                    Filters
                    {(selectedColors.length + selectedTypes.length + (selectedBrand ? 1 : 0)) > 0 && (
                      <span className="ml-2 bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold">
                        {selectedColors.length + selectedTypes.length + (selectedBrand ? 1 : 0)}
                      </span>
                    )}
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-card border-foreground/10 text-foreground sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">Filter Products</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-8 py-6">
                    {/* Color Filter */}
                    <div>
                      <h3 className="font-semibold mb-4 text-sm uppercase tracking-widest text-muted-foreground">Color</h3>
                      <div className="grid grid-cols-2 gap-3">
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
                      <h3 className="font-semibold mb-4 text-sm uppercase tracking-widest text-muted-foreground">Category</h3>
                      <div className="grid grid-cols-2 gap-3">
                        {types.map((type) => (
                          <div key={type} className="flex items-center">
                            <Checkbox 
                              id={`filter-type-${type}`}
                              checked={selectedTypes.includes(type)}
                              onCheckedChange={() => toggleType(type)}
                              className="border-foreground/20 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                            />
                            <Label 
                              htmlFor={`filter-type-${type}`}
                              className="ml-2 text-sm cursor-pointer hover:text-foreground/80 transition-colors"
                            >
                              {type}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Brand Filter */}
                    <div>
                      <h3 className="font-semibold mb-4 text-sm uppercase tracking-widest text-muted-foreground">Brand</h3>
                      {selectedBrand && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => { setSelectedBrand(""); setCurrentPage(1); }}
                          className="mb-3 text-xs text-muted-foreground hover:text-foreground"
                        >
                          Clear brand: {selectedBrand}
                        </Button>
                      )}
                      <Input
                        type="text"
                        placeholder="Search brands..."
                        value={brandSearchQuery}
                        onChange={(e) => setBrandSearchQuery(e.target.value)}
                        className="mb-3 h-9 text-sm"
                      />
                      <div className="max-h-48 overflow-y-auto space-y-2 border border-foreground/10 rounded-lg p-2">
                        {filteredBrands.length > 0 ? (
                          filteredBrands.map((brand: any) => (
                            <button
                              key={brand.id}
                              onClick={() => {
                                setSelectedBrand(brand.name);
                                setCurrentPage(1);
                              }}
                              className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                                selectedBrand === brand.name
                                  ? "bg-primary text-primary-foreground"
                                  : "hover:bg-foreground/5"
                              }`}
                            >
                              {brand.name}
                            </button>
                          ))
                        ) : (
                          <p className="text-xs text-muted-foreground text-center py-4">No brands found</p>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-3 pt-6 border-t border-foreground/10">
                      <Button 
                        variant="ghost" 
                        className="flex-1 text-muted-foreground hover:text-foreground"
                        onClick={clearAllFilters}
                      >
                        Reset
                      </Button>
                      <Button 
                        className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                        onClick={() => setFilterOpen(false)}
                      >
                        Show Results
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              
              {(selectedColors.length > 0 || selectedTypes.length > 0 || selectedBrand) && (
                <Button 
                  variant="ghost" 
                  onClick={clearAllFilters}
                  className="text-muted-foreground hover:text-foreground"
                >
                  Clear all filters
                </Button>
              )}
            </div>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[200px] h-11 border-foreground/20 bg-card/50 text-foreground focus:ring-foreground/20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card border-foreground/10 text-foreground">
                <SelectItem value="default">Default</SelectItem>
                <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                <SelectItem value="price-asc">Price (Low to High)</SelectItem>
                <SelectItem value="price-desc">Price (High to Low)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Products Grid */}
          {loading ? (
            <ProductGridSkeleton count={24} columns={6} />
          ) : error ? (
            <div className="text-center py-32 border border-dashed border-destructive/30 rounded-3xl bg-destructive/5">
              <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-8 h-8 text-destructive" />
              </div>
              <h3 className="font-display text-xl font-semibold mb-2">Failed to load products</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                We couldn't load the products. Please check your connection and try again.
              </p>
              <Button onClick={() => window.location.reload()}>
                Retry
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-x-6 gap-y-12">
                {paginatedProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    name={product.name}
                    image={product.image_url || product.image || ""}
                    price={String(product.price)}
                    category={product.type || product.category}
                  />
                ))}
              </div>
              
              {paginatedProducts.length === 0 && (
                <div className="text-center py-32 border border-dashed border-foreground/10 rounded-3xl bg-card/20">
                  <p className="text-muted-foreground text-lg">No products found matching your filters.</p>
                  <Button variant="link" onClick={clearAllFilters} className="text-primary mt-2">Clear all filters</Button>
                </div>
              )}

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

