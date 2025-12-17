import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import ProductCard from "@/components/ProductCard";
import { ProductGridSkeleton } from "@/components/common/SkeletonLoader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Heart, AlertCircle } from "lucide-react";
import { isAuthenticated } from "@/utils/authStorage";
import { useFavorites, useProducts } from "@/hooks/useApi";
import { useDebounce } from "@/hooks/useDebounce";

const Favorites = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);
  
  // Use React Query hooks for favorites and products
  const { data: favoritesData, isLoading: loading, error } = useFavorites();
  const { data: productsData } = useProducts();
  
  // Extract favorites array and all products
  const favorites = favoritesData?.favorites || [];
  const allProducts = useMemo(() => {
    if (!productsData) return [];
    return productsData.products || productsData || [];
  }, [productsData]);
  
  // Check authentication on mount
  if (!isAuthenticated()) {
    toast({
      title: "Login Required",
      description: "Please login to view your favorites",
      variant: "destructive",
    });
    navigate("/auth");
    return null;
  }

  // Merge favorites with full product data from products query
  // This is needed because favorites API doesn't return complete product info (e.g. image_url is null)
  const products = useMemo(() => {
    return favorites.map((fav: any) => {
      const favoriteProduct = fav.products || fav.product || fav;
      // Find the full product data from products query
      const fullProduct = allProducts.find((p: any) => p.id === favoriteProduct.id);
      // Merge: use full product data if available, otherwise use favorite product data
      return fullProduct || favoriteProduct;
    });
  }, [favorites, allProducts]);

  const filteredFavorites = Array.isArray(products) 
    ? products.filter(product => {
        if (!product) return false;
        const name = product.name || product.product_name || product.item_name || '';
        const hasValidData = name && (product.price || product.product_price || product.image_url || product.image);
        if (!hasValidData) return false;
        return name.toLowerCase().includes(debouncedSearch.toLowerCase());
      })
    : [];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      
      <main className="container mx-auto px-6 pt-28 pb-16">
        {/* Header */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 mb-4 select-none">
            <Heart className="w-4 h-4 text-red-500" />
            <span className="text-xs text-muted-foreground uppercase tracking-wider">Your Collection</span>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-bold mb-3 select-none">My Favorites</h1>
          <p className="text-muted-foreground text-lg select-none">Items you've saved for later</p>
        </div>

        {/* Search */}
        {favorites.length > 0 && (
          <div className="relative max-w-md mb-10 group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-foreground/10 to-foreground/5 rounded-full blur opacity-0 group-hover:opacity-30 transition duration-500"></div>
            <div className="relative flex items-center">
              <Search className="absolute left-4 w-5 h-5 text-muted-foreground group-focus-within:text-foreground transition-colors" />
              <Input
                type="text"
                placeholder="Search your favorites..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 h-12 bg-card/50 border-border/50 rounded-full text-foreground placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-foreground/30 transition-all backdrop-blur-sm"
              />
            </div>
          </div>
        )}

        {/* Content */}
        {loading ? (
          <ProductGridSkeleton count={12} columns={4} />
        ) : error ? (
          <div className="text-center py-32 border border-dashed border-destructive/30 rounded-3xl bg-destructive/5">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-8 h-8 text-destructive" />
            </div>
            <h3 className="font-display text-xl font-semibold mb-2">Failed to load favorites</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              We couldn't load your favorites. Please check your connection and try again.
            </p>
            <Button onClick={() => window.location.reload()}>
              Retry
            </Button>
          </div>
        ) : filteredFavorites.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-border/30 rounded-3xl bg-card/10">
            <div className="w-16 h-16 rounded-full border-2 border-border/30 flex items-center justify-center mx-auto mb-6 select-none">
              <Heart className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-display text-xl font-semibold mb-2 select-none">
              {searchQuery ? "No favorites match your search" : "No favorites yet"}
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto select-none">
              {searchQuery 
                ? "Try adjusting your search terms" 
                : "Start exploring and save items you love to see them here"}
            </p>
            <Button 
              onClick={() => navigate("/products")}
              className="rounded-full"
            >
              Browse Products
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredFavorites.map((product: any, index: number) => {
              // Product is already extracted from the nested structure
              const productId = product.id;
              const productName = product.name || 'Unknown';
              
              // Handle image from various formats - same as Products page
              const productImage = product.image_url || product.image || '';
              const productPrice = String(product.price || '0');
              const productCategory = product.category || '';
              const productBrand = product.brand || (product.brands?.name) || '';
              
              return (
                <ProductCard
                  key={`${productId}-${index}`}
                  id={productId}
                  name={productName}
                  image={productImage}
                  price={productPrice}
                  category={productCategory}
                  brand={productBrand}
                />
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Favorites;
