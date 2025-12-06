import { useEffect, useState } from 'react';
import { productService, Product } from '@/services/productService';
import { storeService } from '@/services/storeService';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';
import { NeonAbstractions } from './NeonAbstractions';
import { HeroImageCarousel } from './HeroImageCarousel';

export const HeroSection = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    brands: 0,
    products: 0,
    stores: 0,
    loading: true
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch featured products and stats in parallel
        const [featuredResponse, productsResponse, storesResponse] = await Promise.all([
          productService.getAllProducts({ is_featured: true, limit: 5 }),
          productService.getAllProducts({ limit: 100 }), // For stats
          storeService.getAllStores()
        ]);

        // Set featured products
        if (featuredResponse && featuredResponse.data && Array.isArray(featuredResponse.data)) {
          setFeaturedProducts(featuredResponse.data.slice(0, 5));
        } else {
          setFeaturedProducts([]);
        }

        // Calculate stats
        const products = productsResponse?.data || [];
        const uniqueBrands = new Set(
          products
            .map((p: any) => p.brand)
            .filter((b: any) => b !== null && b !== undefined && b !== '')
        );

        const totalProducts = productsResponse?.pagination?.total || products.length;
        const totalStores = storesResponse?.length || 0;
        const brandsCount = uniqueBrands.size > 0 ? uniqueBrands.size : Math.min(totalStores, totalProducts);

        setStats({
          brands: brandsCount,
          products: totalProducts,
          stores: totalStores,
          loading: false
        });
      } catch (error) {
        console.error('Failed to fetch hero data:', error);
        setFeaturedProducts([]);
        setStats({
          brands: 0,
          products: 0,
          stores: 0,
          loading: false
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      <NeonAbstractions />
      
      <div className="container mx-auto px-6 relative z-10">
        {/* Floating product images carousel */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[600px] md:h-[700px] pointer-events-none opacity-30 md:opacity-50 z-0">
          <HeroImageCarousel />
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border/50 bg-card/30 backdrop-blur-sm mb-8 animate-fade-in">
            <span className="w-2 h-2 bg-foreground rounded-full animate-pulse" />
            <span className="text-xs text-muted-foreground tracking-wider uppercase">
              New Collection Available
            </span>
          </div>

          {/* Main headline */}
          <h1 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-6 tracking-tight animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <span className="block">Discover</span>
            <span className="block neon-text">Exceptional</span>
            <span className="block text-gradient">Fashion</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            Curated collections from the world's most innovative designers. 
            Where style meets artistry.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <Button 
              size="lg" 
              className="bg-foreground text-background hover:bg-foreground/90 hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] rounded-full px-8 h-12 text-sm tracking-widest uppercase font-medium transition-all group"
            >
              Explore Collections
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="border-foreground/20 text-foreground hover:bg-foreground hover:text-background rounded-full px-8 h-12 text-sm tracking-widest uppercase font-medium backdrop-blur-sm transition-all"
            >
              View Stores
            </Button>
          </div>

          {/* Stats - Real Data */}
          <div className="flex justify-center gap-12 mt-20 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            {[
              { value: stats.loading ? '...' : `${stats.brands}+`, label: "Brands" },
              { value: stats.loading ? '...' : `${stats.products}+`, label: "Products" },
              { value: stats.loading ? '...' : `${stats.stores}+`, label: "Stores" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="font-display text-3xl sm:text-4xl font-bold mb-1">{stat.value}</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 rounded-full border border-foreground/30 flex justify-center pt-2">
          <div className="w-1 h-2 bg-foreground rounded-full animate-pulse" />
        </div>
      </div>
    </section>
  );
};
