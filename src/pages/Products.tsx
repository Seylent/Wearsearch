import { useState, useEffect } from "react";
import Navigation from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import ProductCard from "@/components/ProductCard";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Filter, Search } from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { productService, Product } from "@/services/productService";

const Products = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("default");
  const [currentPage, setCurrentPage] = useState(1);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [filterOpen, setFilterOpen] = useState(false);
  const itemsPerPage = 24;

  const colors = ["Black", "White", "Gray", "Beige", "Brown", "Red", "Blue", "Navy", "Green", "Olive", "Yellow", "Orange", "Pink", "Purple", "Cream"];
  const types = ["Outerwear", "Tops", "Bottoms", "Dresses", "Shoes", "Accessories"];

  useEffect(() => {
    fetchProducts();
  }, [searchQuery, selectedColors, selectedTypes, currentPage, sortBy]);

  const fetchProducts = async () => {
    setLoading(true);
    
    try {
      const params: any = {
        limit: itemsPerPage,
        skip: (currentPage - 1) * itemsPerPage,
      };

      if (searchQuery.trim()) {
        params.name = searchQuery.trim();
      }

      if (selectedColors.length > 0) {
        params.color = selectedColors;
      }

      if (selectedTypes.length > 0) {
        params.type = selectedTypes;
      }

      if (sortBy !== 'default') {
        const [field, order] = sortBy.split('-');
        params.sort_by = field;
        params.order = order;
      }

      const response = await productService.getAllProducts(params);
      
      if (response && response.products && Array.isArray(response.products)) {
        setProducts(response.products);
        setTotalProducts(response.total || response.products.length);
        setTotalPages(response.totalPages || Math.ceil((response.total || response.products.length) / itemsPerPage));
      } else {
        setProducts([]);
        setTotalProducts(0);
        setTotalPages(1);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      setProducts([]);
      setTotalProducts(0);
      setTotalPages(1);
    }
    
    setLoading(false);
  };

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
    setSearchQuery("");
    setCurrentPage(1);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden font-sans selection:bg-primary/30 selection:text-white">
      <Navigation />
      
      <main className="container mx-auto px-6 pt-28 pb-16">
        <div className="flex flex-col gap-10">
          {/* Header with Search */}
          <div className="space-y-6">
            <div>
              <div className="inline-flex items-center gap-2 mb-4">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-xs text-muted-foreground uppercase tracking-wider">Browse Collection</span>
              </div>
              <h1 className="font-display text-4xl sm:text-5xl font-bold mb-3">All Products</h1>
              <p className="text-muted-foreground text-lg">Discover our curated selection of premium fashion</p>
            </div>
            
            {/* Search Bar */}
            <div className="relative max-w-xl group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-foreground/10 to-foreground/5 rounded-full blur opacity-0 group-hover:opacity-30 transition duration-500"></div>
              <div className="relative flex items-center">
                <Search className="absolute left-4 w-5 h-5 text-muted-foreground group-focus-within:text-foreground transition-colors" />
                <Input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 h-14 bg-card/50 border-border/50 rounded-full text-foreground placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-foreground/30 focus-visible:border-foreground/30 transition-all backdrop-blur-sm"
                />
              </div>
            </div>
          </div>

          {/* Filters and Sort */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-4 flex-wrap">
              <Dialog open={filterOpen} onOpenChange={setFilterOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="lg" className="border-foreground/20 bg-card/50 text-foreground hover:bg-card hover:border-foreground/30">
                    <Filter className="w-4 h-4 mr-2" />
                    Filters
                    {(selectedColors.length + selectedTypes.length) > 0 && (
                      <span className="ml-2 bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold">
                        {selectedColors.length + selectedTypes.length}
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
              
              {(selectedColors.length > 0 || selectedTypes.length > 0) && (
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
              <SelectTrigger className="w-[200px] border-foreground/20 bg-card/50 text-foreground focus:ring-foreground/20">
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
            <div className="min-h-[400px] flex items-center justify-center">
              <div className="animate-spin w-8 h-8 border-2 border-foreground border-t-transparent rounded-full"></div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-x-6 gap-y-12">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    name={product.name}
                    image={product.image || ""}
                    price={String(product.price)}
                    category={product.type || product.category}
                  />
                ))}
              </div>
              
              {products.length === 0 && (
                <div className="text-center py-32 border border-dashed border-foreground/10 rounded-3xl bg-card/20">
                  <p className="text-muted-foreground text-lg">No products found matching your filters.</p>
                  <Button variant="link" onClick={clearAllFilters} className="text-primary mt-2">Clear all filters</Button>
                </div>
              )}

              {/* Pagination */}
              {products.length > 0 && totalPages > 1 && (
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

