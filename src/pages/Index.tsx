import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Sparkles, Shield, Package, Clock, ArrowRight } from "lucide-react";
import { productService, Product } from "@/services/productService";
import { storeService } from "@/services/storeService";
import { NeonAbstractions } from "@/components/NeonAbstractions";

const Index: React.FC = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ brands: 0, products: 0, stores: 0 });
  const [heroImages, setHeroImages] = useState<any[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    fetchProducts();
    fetchStats();
    fetchHeroImages();
  }, []);

  useEffect(() => {
    if (heroImages.length > 1) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
      }, 5000); // Change image every 5 seconds
      return () => clearInterval(interval);
    }
  }, [heroImages]);

  const fetchProducts = async () => {
    try {
      const response = await productService.getAllProducts(undefined, { limit: 6 });
      console.log('Products response:', response);
      
      // Handle different response formats from backend
      if (response) {
        if (response.products && Array.isArray(response.products)) {
          setProducts(response.products);
        } else if (Array.isArray(response)) {
          // Backend might return array directly
          setProducts(response as any);
        } else if ((response as any).items && Array.isArray((response as any).items)) {
          // Backend might use 'items' instead of 'products'
          setProducts((response as any).items);
        }
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      // Show toast to user
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const [productsRes, storesRes] = await Promise.all([
        productService.getAllProducts().catch(() => ({ products: [], total: 0 })),
        storeService.getAllStores().catch(() => [] as any)
      ]);

      // Fetch brands count from admin endpoint if available
      let brandsCount = 0;
      try {
        const brandsRes = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'}/brands`);
        if (brandsRes.ok) {
          const brandsData = await brandsRes.json();
          brandsCount = brandsData?.brands?.length || brandsData?.length || 0;
        }
      } catch (e) {
        console.log('Brands endpoint not available, using 0');
      }

      const storesCount = Array.isArray(storesRes) 
        ? storesRes.length 
        : (storesRes as any)?.stores?.length || 0;

      setStats({
        brands: brandsCount,
        products: productsRes?.total || productsRes?.products?.length || 0,
        stores: storesCount
      });
      
      console.log('Stats updated:', {
        brands: brandsCount,
        products: productsRes?.total || productsRes?.products?.length || 0,
        stores: storesCount
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
      // Set default values on error
      setStats({ brands: 0, products: 0, stores: 0 });
    }
  };

  const fetchHeroImages = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'}/hero-images`);
      if (response.ok) {
        const data = await response.json();
        console.log('Hero images response:', data);
        
        // Handle different response formats
        let images = [];
        if (data.images && Array.isArray(data.images)) {
          images = data.images;
        } else if (Array.isArray(data)) {
          images = data;
        } else if (data.data && Array.isArray(data.data)) {
          images = data.data;
        }
        
        const activeImages = images.filter((img: any) => img.is_active !== false);
        console.log('Active hero images:', activeImages);
        setHeroImages(activeImages);
      }
    } catch (error) {
      console.log('Hero images not available:', error);
    }
  };

  const features = [
    {
      icon: Sparkles,
      title: "Curated Selection",
      description: "Hand-picked pieces from world-renowned designers",
    },
    {
      icon: Shield,
      title: "Authenticity Guaranteed",
      description: "Every item verified by our expert team",
    },
    {
      icon: Package,
      title: "Global Shipping",
      description: "Express delivery to 50+ countries worldwide",
    },
    {
      icon: Clock,
      title: "24/7 Support",
      description: "Personal styling assistance anytime",
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        {/* Hero Images as Floating Products */}
        {heroImages.length > 0 && (
          <div className="absolute inset-0 z-0 pointer-events-none">
            {heroImages.map((image, index) => (
              <div
                key={image.id}
                className={`absolute transition-all duration-1000 ${
                  index === currentImageIndex ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                }`}
                style={{
                  // Position images dynamically - more visible placement
                  top: index % 2 === 0 ? '30%' : '50%',
                  right: index % 3 === 0 ? '15%' : index % 3 === 1 ? '50%' : '5%',
                  transform: `translateY(-50%) rotate(${index % 2 === 0 ? '-5deg' : '5deg'})`,
                }}
              >
                <div className="relative w-[380px] h-[480px]">
                  {/* Neon glow effect - multiple layers */}
                  <div className="absolute inset-0 bg-white/20 blur-3xl animate-pulse-slow" />
                  <div className="absolute inset-0 bg-cyan-400/10 blur-2xl" />
                  <div className="absolute inset-0 bg-purple-400/10 blur-2xl" />
                  
                  <img
                    src={image.image_url}
                    alt={image.title || `Hero ${index + 1}`}
                    className="w-full h-full object-contain drop-shadow-[0_0_30px_rgba(255,255,255,0.3)]"
                    style={{
                      filter: 'brightness(1.1) contrast(1.3) saturate(1.2)',
                      mixBlendMode: 'screen',
                    }}
                    onError={(e) => {
                      console.error('Hero image failed to load:', image.image_url);
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* NeonAbstractions on top of hero images */}
        <div className="absolute inset-0 z-[5]">
          <NeonAbstractions />
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center mt-20">
            {/* Main headline */}
            <h1 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-6 tracking-tight">
              <span className="block drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]">Discover</span>
              <span className="block relative inline-block">
                <span className="neon-text drop-shadow-[0_0_25px_rgba(255,255,255,0.8)]">Exceptional</span>
                {/* Decorative underline */}
                <svg className="absolute -bottom-2 left-0 w-full h-3" viewBox="0 0 300 12" preserveAspectRatio="none">
                  <path
                    d="M0,6 Q75,0 150,6 T300,6"
                    fill="none"
                    stroke="rgba(255,255,255,0.3)"
                    strokeWidth="2"
                  />
                </svg>
              </span>
              <span className="block text-gradient drop-shadow-[0_0_20px_rgba(255,255,255,0.6)]">Fashion</span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg sm:text-xl text-zinc-300 max-w-2xl mx-auto mb-10 leading-relaxed drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
              Curated collections from the world's most innovative designers
            </p>

            {/* Decorative illustration element */}
            <div className="flex justify-center mb-10">
              <div className="relative w-32 h-32">
                <div className="absolute inset-0 rounded-full border border-white/10 animate-pulse-slow" />
                <div className="absolute inset-4 rounded-full border border-white/20 animate-spin-slow" />
                <div className="absolute inset-8 rounded-full bg-white/5 backdrop-blur-sm flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-white/60" />
                </div>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => navigate("/stores")}
                size="lg" 
                variant="outline"
                className="border-zinc-700 text-white hover:bg-zinc-800 hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] transition-all"
              >
                View Stores
              </Button>
            </div>

            {/* Stats - with glass cards */}
            <div className="flex justify-center gap-6 sm:gap-10 mt-20">
              {[
                { value: `${stats.brands > 0 ? stats.brands : 4}+`, label: "Brands" },
                { value: stats.products >= 1000 ? `${Math.floor(stats.products / 1000)}K+` : `${stats.products > 0 ? stats.products : 5}+`, label: "Products" },
                { value: `${stats.stores > 0 ? stats.stores : 4}+`, label: "Stores" },
              ].map((stat) => (
                <div key={stat.label} className="text-center px-6 py-4 glass-card rounded-2xl shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                  <p className="font-display text-2xl sm:text-3xl font-bold mb-1 drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]">{stat.value}</p>
                  <p className="text-xs text-zinc-400 uppercase tracking-wider drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-7 h-12 rounded-full glass-card flex justify-center pt-3">
            <div className="w-1 h-2.5 bg-foreground rounded-full animate-pulse" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 border-y border-zinc-800/50 bg-zinc-900/20">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => (
              <div 
                key={feature.title}
                className="p-6 rounded-2xl border border-zinc-800/40 bg-zinc-900/20 backdrop-blur-sm hover:bg-zinc-800/30 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl border border-zinc-700/50 bg-zinc-800/30 flex items-center justify-center mb-4">
                  <feature.icon className="w-5 h-5 text-zinc-400" />
                </div>
                <h3 className="font-display font-semibold text-base mb-2 text-white">{feature.title}</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* New Arrivals Section */}
      <section className="py-20 bg-black">
        <div className="container mx-auto px-6">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-10">
            <div>
              <div className="inline-flex items-center gap-2 mb-3">
                <div className="w-1.5 h-1.5 rounded-full bg-white" />
                <span className="text-xs text-zinc-500 uppercase tracking-wider">Just In</span>
              </div>
              <h2 className="font-display text-4xl sm:text-5xl font-bold text-white">New Arrivals</h2>
              <p className="text-zinc-400 mt-2">Fresh pieces just added to the collection</p>
            </div>
          </div>

          {/* Products Grid - 2 rows of 3 */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="aspect-[3/4] rounded-2xl bg-card/50 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {products.slice(0, 6).map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  image={product.image_url || product.image}
                  price={product.price}
                  category={product.type}
                />
              ))}
            </div>
          )}

          {/* View All Button */}
          <div className="text-center mt-12">
            <button 
              onClick={() => navigate("/products")}
              className="px-8 py-3 rounded-full border border-zinc-700 text-white font-medium text-sm hover:bg-zinc-800 transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:shadow-[0_0_30px_rgba(255,255,255,0.25)]"
            >
              View All Products
            </button>
          </div>
        </div>
      </section>

      {/* Vision Section */}
      <section className="py-32 relative overflow-hidden bg-black">
        <div className="container mx-auto px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-zinc-700/50 bg-zinc-900/30 backdrop-blur-sm mb-8">
            <Sparkles className="w-3 h-3 text-zinc-400" />
            <span className="text-xs text-zinc-400 tracking-[0.15em] uppercase font-medium">Curated Excellence</span>
          </div>
          
          <h2 className="font-display text-5xl sm:text-6xl md:text-7xl font-bold mb-6 text-white leading-[1.05]">
            <span className="block">Where Style</span>
            <span className="block">Meets Vision</span>
          </h2>
          
          <p className="text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Discover exclusive collections from the world's most innovative designers. 
            Every piece tells a story of craftsmanship and creativity.
          </p>
          
          <button 
            onClick={() => navigate("/products")}
            className="px-8 py-3.5 rounded-full bg-zinc-800 text-white font-medium text-sm hover:bg-zinc-700 transition-all duration-300 border border-zinc-700"
          >
            Explore Collections
          </button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
