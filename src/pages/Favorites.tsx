import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { NeonAbstractions } from "@/components/sections/NeonAbstractions";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Heart, Loader2, ShoppingBag } from "lucide-react";
import { userService, FavoriteProduct } from "@/services/userService";

const Favorites = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [favorites, setFavorites] = useState<FavoriteProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
    loadFavorites();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      toast({
        title: "Login Required",
        description: "Please login to view your favorites",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }
  };

  const loadFavorites = async () => {
    try {
      setLoading(true);
      const data = await userService.getFavorites();
      setFavorites(data);
    } catch (error: any) {
      console.error("Error loading favorites:", error);
      if (error.message.includes('401')) {
        navigate("/auth");
      } else {
        toast({
          title: "Error",
          description: "Failed to load favorites",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative min-h-[50vh] flex items-center justify-center overflow-hidden pt-20">
        <NeonAbstractions />
        
        <div className="container mx-auto px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border/50 bg-card/30 backdrop-blur-sm mb-8 animate-fade-in">
            <Heart className="w-4 h-4 fill-current" />
            <span className="text-xs text-muted-foreground tracking-wider uppercase">
              Your Collection
            </span>
          </div>

          <h1 className="font-display text-5xl sm:text-6xl md:text-7xl font-bold mb-6 tracking-tight animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <span className="block">Your</span>
            <span className="block text-gradient">Favorites</span>
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            Items you've loved and saved for later
          </p>
        </div>
      </section>

      {/* Favorites Grid */}
      <section className="py-24 relative">
        <div className="container mx-auto px-6">
          {loading ? (
            <div className="min-h-[400px] flex flex-col items-center justify-center">
              <Loader2 className="w-12 h-12 animate-spin mb-4" />
              <p className="text-muted-foreground">Loading your favorites...</p>
            </div>
          ) : favorites.length > 0 ? (
            <>
              <div className="flex items-center justify-between mb-8">
                <p className="text-muted-foreground">
                  {favorites.length} {favorites.length === 1 ? 'item' : 'items'} saved
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
                {favorites.map((favorite: any, index) => {
                  // Handle both API formats: with nested product object or flat
                  const product = favorite.product || favorite;
                  const productId = favorite.product_id || favorite.id;
                  
                  return (
                    <div
                      key={productId}
                      className="animate-fade-in-up"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <ProductCard
                        id={productId}
                        name={product.name || 'Unknown Product'}
                        image={product.image_url || product.image || ''}
                        price={String(product.price || 0)}
                        category={product.type || product.category}
                        brand={product.brand}
                      />
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="min-h-[400px] flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 rounded-full border-2 border-border/50 flex items-center justify-center mb-6">
                <Heart className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="font-display text-2xl font-bold mb-3">
                No Favorites Yet
              </h3>
              <p className="text-muted-foreground mb-8 max-w-md">
                Start exploring our collection and save items you love. 
                Click the heart icon on any product to add it to your favorites.
              </p>
              <Button
                onClick={() => navigate('/')}
                className="bg-foreground text-background hover:bg-foreground/90 hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] rounded-full px-8 transition-all"
              >
                <ShoppingBag className="w-5 h-5 mr-2" />
                Browse Products
              </Button>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Favorites;
