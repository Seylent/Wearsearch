import { useState, useEffect } from "react";
import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";
import { supabase } from "@/integrations/supabase/client";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Filter } from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedShipping, setSelectedShipping] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("default");
  const [currentPage, setCurrentPage] = useState(1);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterOpen, setFilterOpen] = useState(false);
  const itemsPerPage = 15;

  const colors = ["Black", "White", "Blue", "Red", "Brown", "Beige", "Gray"];
  const types = ["Outerwear", "Bottoms", "Hats", "Shoes", "Tops", "Accessories"];
  const shippingOptions = ["Worldwide", "Europe", "Ukraine"];

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("products")
      .select(`
        *,
        product_stores(
          stores(*)
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching products:", error);
    }
    
    if (data) {
      setProducts(data);
    }
    setLoading(false);
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch = 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.type.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesColor = selectedColors.length === 0 || selectedColors.includes(product.color);
    const matchesType = selectedTypes.length === 0 || selectedTypes.includes(product.type);
    
    // Shipping filter - check if product has stores with exact matching shipping region
    const matchesShipping = selectedShipping.length === 0 || (
      product.product_stores?.some((ps: any) => 
        selectedShipping.includes(ps.stores?.shipping_info)
      )
    );
    
    return matchesSearch && matchesColor && matchesType && matchesShipping;
  }).sort((a, b) => {
    switch (sortBy) {
      case "name-asc":
        return a.name.localeCompare(b.name);
      case "name-desc":
        return b.name.localeCompare(a.name);
      case "price-asc":
        return parseFloat(a.price) - parseFloat(b.price);
      case "price-desc":
        return parseFloat(b.price) - parseFloat(a.price);
      default:
        return 0;
    }
  });

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

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

  const toggleShipping = (shipping: string) => {
    setSelectedShipping(prev => 
      prev.includes(shipping) ? prev.filter(s => s !== shipping) : [...prev, shipping]
    );
    setCurrentPage(1);
  };

  const clearAllFilters = () => {
    setSelectedColors([]);
    setSelectedTypes([]);
    setSelectedShipping([]);
    setCurrentPage(1);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  return (
    <div className="min-h-screen bg-background">
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      
      <main className="container mx-auto px-4 py-12">
        {loading ? (
          <div className="text-center py-16">
            <p className="text-lg">Loading products...</p>
          </div>
        ) : (
          <div>
            <div className="mb-6 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <p className="text-sm text-muted-foreground">
                  {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'} found
                </p>
                <Dialog open={filterOpen} onOpenChange={setFilterOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="default" className="shadow-sm">
                      <Filter className="w-4 h-4 mr-2" />
                      Filters
                      {(selectedColors.length + selectedTypes.length + selectedShipping.length) > 0 && (
                        <span className="ml-2 bg-primary text-primary-foreground rounded-full px-2.5 py-0.5 text-xs font-semibold">
                          {selectedColors.length + selectedTypes.length + selectedShipping.length}
                        </span>
                      )}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto border-2 shadow-strong rounded-2xl">
                    <DialogHeader>
                      <DialogTitle className="text-xl">Filter Products</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6 py-4">
                      {/* Color Filter */}
                      <div>
                        <h3 className="font-semibold mb-3">Color</h3>
                        <div className="space-y-2">
                          {colors.map((color) => (
                            <div key={color} className="flex items-center space-x-2">
                              <Checkbox 
                                id={`filter-color-${color}`}
                                checked={selectedColors.includes(color)}
                                onCheckedChange={() => toggleColor(color)}
                              />
                              <Label 
                                htmlFor={`filter-color-${color}`}
                                className="text-sm cursor-pointer"
                              >
                                {color}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Category Filter */}
                      <div>
                        <h3 className="font-semibold mb-3">Category</h3>
                        <div className="space-y-2">
                          {types.map((type) => (
                            <div key={type} className="flex items-center space-x-2">
                              <Checkbox 
                                id={`filter-type-${type}`}
                                checked={selectedTypes.includes(type)}
                                onCheckedChange={() => toggleType(type)}
                              />
                              <Label 
                                htmlFor={`filter-type-${type}`}
                                className="text-sm cursor-pointer"
                              >
                                {type}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Shipping Filter */}
                      <div>
                        <h3 className="font-semibold mb-3">Shipping Region</h3>
                        <div className="space-y-2">
                          {shippingOptions.map((shipping) => (
                            <div key={shipping} className="flex items-center space-x-2">
                              <Checkbox 
                                id={`filter-shipping-${shipping}`}
                                checked={selectedShipping.includes(shipping)}
                                onCheckedChange={() => toggleShipping(shipping)}
                              />
                              <Label 
                                htmlFor={`filter-shipping-${shipping}`}
                                className="text-sm cursor-pointer"
                              >
                                {shipping === "Ukraine" ? "Ukraine Only" : shipping}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>

                       <div className="flex gap-3 pt-4">
                        <Button 
                          variant="outline" 
                          className="flex-1"
                          onClick={clearAllFilters}
                        >
                          Clear All
                        </Button>
                        <Button 
                          className="flex-1 shadow-sm"
                          onClick={() => setFilterOpen(false)}
                        >
                          Apply Filters
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor="sort" className="text-sm">Sort by:</Label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger id="sort" className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default</SelectItem>
                    <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                    <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                    <SelectItem value="price-asc">Price (Low to High)</SelectItem>
                    <SelectItem value="price-desc">Price (High to Low)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 stagger-fade-in">
                {currentProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    name={product.name}
                    image={product.image_url || ""}
                    price={product.price}
                    category={product.type}
                  />
                ))}
              </div>
            
            {filteredProducts.length === 0 && (
              <div className="text-center py-16">
                <p className="text-muted-foreground text-lg">No products found matching your filters.</p>
              </div>
            )}

            {filteredProducts.length > 0 && totalPages > 1 && (
              <Pagination className="mt-12">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
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
                            className="cursor-pointer"
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
                          <PaginationEllipsis />
                        </PaginationItem>
                      );
                    }
                    return null;
                  })}
                  
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
