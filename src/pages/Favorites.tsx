import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import ProductCard from "@/components/ProductCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Heart } from "lucide-react";
import { authService } from "@/services/authService";
import { userService } from "@/services/userService";
import { Product } from "@/services/productService";

const Favorites = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [favorites, setFavorites] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthAndFetchFavorites();
  }, []);

  const checkAuthAndFetchFavorites = async () => {
    if (!authService.isAuthenticated()) {
      toast({
        title: "Login Required",
        description: "Please login to view your favorites",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    fetchFavorites();
  };

  const fetchFavorites = async () => {
    setLoading(true);
    
    try {
      const data = await userService.getFavorites();
      console.log('Favorites data:', data);
      
      // Handle different response formats
      if (Array.isArray(data)) {
        setFavorites(data);
      } else if (data && Array.isArray(data.favorites)) {
        setFavorites(data.favorites);
      } else if (data && Array.isArray(data.products)) {
        setFavorites(data.products);
      } else {
        setFavorites([]);
      }
    } catch (error) {
      console.error('Error fetching favorites:', error);
      setFavorites([]);
      toast({
        title: "Error",
        description: "Failed to load favorites",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredFavorites = Array.isArray(favorites) 
    ? favorites.filter(product => 
        product?.name?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      
      <main className="container mx-auto px-6 pt-28 pb-16">
        {/* Header */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 mb-4">
            <Heart className="w-4 h-4 text-red-500" />
            <span className="text-xs text-muted-foreground uppercase tracking-wider">Your Collection</span>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-bold mb-3">My Favorites</h1>
          <p className="text-muted-foreground text-lg">Items you've saved for later</p>
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
          <div className="min-h-[400px] flex items-center justify-center">
            <div className="animate-spin w-8 h-8 border-2 border-foreground border-t-transparent rounded-full"></div>
          </div>
        ) : filteredFavorites.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-border/30 rounded-3xl bg-card/10">
            <div className="w-16 h-16 rounded-full border-2 border-border/30 flex items-center justify-center mx-auto mb-6">
              <Heart className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-display text-xl font-semibold mb-2">
              {searchQuery ? "No favorites match your search" : "No favorites yet"}
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
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
            {filteredFavorites.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                image={product.image_url || product.image || ""}
                price={product.price}
                category={product.type}
              />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Favorites;
