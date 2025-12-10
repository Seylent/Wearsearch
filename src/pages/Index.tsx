import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Sparkles, Shield, Package, Clock, ArrowRight } from "lucide-react";
import { Product } from "@/services/productService";
import { NeonAbstractions } from "@/components/NeonAbstractions";
import { useProducts, useStats, useHeroImages, useStores, useBrands } from "@/hooks/useApi";

const Index: React.FC = () => {
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Use React Query hooks
  const { data: productsData, isLoading: productsLoading } = useProducts();
  const { data: statsData } = useStats();
  const { data: heroImagesData } = useHeroImages();
  const { data: storesData } = useStores();
  const { data: brandsData } = useBrands();

  // Process products data
  const products = React.useMemo(() => {
    if (!productsData) return [];
    
    let productsList: Product[] = [];
    if (Array.isArray(productsData)) {
      productsList = productsData;
    } else if (productsData.products && Array.isArray(productsData.products)) {
      productsList = productsData.products;
    } else if ((productsData as any).items && Array.isArray((productsData as any).items)) {
      productsList = (productsData as any).items;
    }
    
    return productsList.slice(0, 6);
  }, [productsData]);

  // Process stats data
  const stats = React.useMemo(() => {
    const productsCount = Array.isArray(productsData) 
      ? productsData.length 
      : (productsData?.products?.length || 0);
    
    const storesCount = Array.isArray(storesData) 
      ? storesData.length 
      : (storesData?.stores?.length || 0);
    
    const brandsCount = Array.isArray(brandsData) 
      ? brandsData.length 
      : 0;

    return {
      brands: brandsCount,
      products: productsCount,
      stores: storesCount
    };
  }, [productsData, storesData, brandsData]);

  // Process hero images
  const heroImages = React.useMemo(() => {
    if (!heroImagesData) return [];
    
    let images = [];
    if (Array.isArray(heroImagesData)) {
      images = heroImagesData;
    } else if (heroImagesData.images && Array.isArray(heroImagesData.images)) {
      images = heroImagesData.images;
    } else if (heroImagesData.data && Array.isArray(heroImagesData.data)) {
      images = heroImagesData.data;
    }
    
    return images.filter((img: any) => img.is_active !== false);
  }, [heroImagesData]);

  useEffect(() => {
    if (heroImages.length > 1) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
      }, 5000); // Change image every 5 seconds
      return () => clearInterval(interval);
    }
  }, [heroImages]);

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
                <div className="relative w-[380px] h-[480px] overflow-hidden rounded-2xl">
                  <img
                    src={image.image_url}
                    alt={image.title || `Hero ${index + 1}`}
                    className="w-full h-full object-cover"
                    style={{
                      filter: 'brightness(1.4) contrast(1.3) saturate(0) drop-shadow(0 0 8px rgba(255,255,255,0.9)) drop-shadow(0 0 3px rgba(255,255,255,1))',
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
              <span className="block text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.8)] filter brightness-125">Discover</span>
              <span className="block relative inline-block">
                <span className="text-white drop-shadow-[0_0_35px_rgba(255,255,255,1)] filter brightness-150">Exceptional</span>
                {/* Decorative underline */}
                <svg className="absolute -bottom-2 left-0 w-full h-3" viewBox="0 0 300 12" preserveAspectRatio="none">
                  <path
                    d="M0,6 Q75,0 150,6 T300,6"
                    fill="none"
                    stroke="rgba(255,255,255,0.6)"
                    strokeWidth="2"
                  />
                </svg>
              </span>
              <span className="block text-white drop-shadow-[0_0_25px_rgba(255,255,255,0.9)] filter brightness-125">Fashion</span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg sm:text-xl text-white/80 max-w-2xl mx-auto mb-10 leading-relaxed drop-shadow-[0_0_15px_rgba(255,255,255,0.4)] backdrop-blur-sm">
              Curated collections from the world's most innovative designers
            </p>

            {/* Decorative illustration element - monochrome with strong neon */}
            <div className="flex justify-center mb-10">
              <div className="relative w-32 h-32">
                <div className="absolute inset-0 rounded-full border-2 border-white/40 animate-pulse-slow shadow-[0_0_35px_rgba(255,255,255,0.5)]\" />
                <div className="absolute inset-4 rounded-full border-2 border-white/50 animate-spin-slow shadow-[0_0_25px_rgba(255,255,255,0.6)]\" />
                <div className="absolute inset-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center shadow-[0_0_40px_rgba(255,255,255,0.7)]\">\n                  <Sparkles className="w-8 h-8 text-white filter drop-shadow-[0_0_15px_rgba(255,255,255,1)] brightness-150" />
                </div>
              </div>
            </div>

            {/* CTAs - Glassmorphism */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => navigate("/stores")}
                size="lg" 
                variant="outline"
                className="relative border border-white/20 text-white bg-white/5 backdrop-blur-xl hover:bg-white/10 hover:border-white/40 shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:shadow-[0_0_40px_rgba(255,255,255,0.4)] transition-all overflow-hidden group"
              >
                {/* Vertical light streak */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
                View Stores
              </Button>
            </div>

            {/* Stats - Glassmorphism cards */}
            <div className="flex justify-center gap-6 sm:gap-10 mt-20">
              {[
                { value: `${stats.brands > 0 ? stats.brands : 4}+`, label: "Brands" },
                { value: stats.products >= 1000 ? `${Math.floor(stats.products / 1000)}K+` : `${stats.products > 0 ? stats.products : 5}+`, label: "Products" },
                { value: `${stats.stores > 0 ? stats.stores : 4}+`, label: "Stores" },
              ].map((stat) => (
                <div key={stat.label} className="relative text-center px-8 py-5 rounded-2xl bg-white/5 backdrop-blur-[30px] border border-white/20 shadow-[0_0_30px_rgba(255,255,255,0.15)] overflow-hidden group hover:bg-white/10 hover:border-white/30 hover:shadow-[0_0_40px_rgba(255,255,255,0.25)] transition-all">
                  {/* Vertical light streak */}
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/10 to-transparent translate-y-[-200%] group-hover:translate-y-[200%] transition-transform duration-1000" />
                  <p className="relative font-display text-2xl sm:text-3xl font-bold mb-1 text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.8)] filter brightness-125">{stat.value}</p>
                  <p className="relative text-xs text-white/70 uppercase tracking-wider drop-shadow-[0_0_10px_rgba(255,255,255,0.4)]">{stat.label}</p>
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
      <section className="py-12 border-y border-white/10 bg-black/40">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => (
              <div 
                key={feature.title}
                className="group relative p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-[25px] hover:border-white/25 hover:bg-white/10 transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] overflow-hidden"
              >
                {/* Vertical light streak */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
                <div className="relative w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center mb-4 group-hover:bg-white/15 transition-colors shadow-[0_0_15px_rgba(255,255,255,0.2)] group-hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                  <feature.icon className="w-6 h-6 text-white filter drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]" />
                </div>
                <h3 className="relative font-display font-semibold text-base mb-2 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">{feature.title}</h3>
                <p className="relative text-sm text-white/70 leading-relaxed">{feature.description}</p>
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
                <div className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                <span className="text-xs text-white/60 uppercase tracking-wider drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">Just In</span>
              </div>
              <h2 className="font-display text-4xl sm:text-5xl font-bold text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.6)]">New Arrivals</h2>
              <p className="text-white/70 mt-2 drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">Fresh pieces just added to the collection</p>
            </div>
          </div>

          {/* Products Grid - 2 rows of 3 */}
          {productsLoading ? (
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

          {/* View All Button - Glassmorphism */}
          <div className="text-center mt-12">
            <button 
              onClick={() => navigate("/products")}
              className="relative px-8 py-3 rounded-full border border-white/20 bg-white/5 backdrop-blur-[30px] text-white font-medium text-sm hover:bg-white/10 hover:border-white/40 transition-all duration-300 shadow-[0_0_25px_rgba(255,255,255,0.2)] hover:shadow-[0_0_35px_rgba(255,255,255,0.3)] overflow-hidden group"
            >
              {/* Vertical light streak */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
              <span className="relative">View All Products</span>
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
