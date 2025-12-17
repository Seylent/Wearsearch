import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import Navigation from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Sparkles, Shield, Package, Clock, ArrowRight } from "lucide-react";
import { Product } from "@/services/productService";
import { NeonAbstractions } from "@/components/NeonAbstractions";
import { useProducts, useStats, useHeroImages } from "@/hooks/useApi";

const Index: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Use React Query hooks - only fetch what's needed for this page
  const { data: productsData, isLoading: productsLoading } = useProducts();
  const { data: statsData } = useStats();
  const { data: heroImagesData } = useHeroImages();

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

  // Process stats data - use real-time counts from API
  const stats = React.useMemo(() => {
    // Stats from /api/statistics endpoint with real database counts
    return {
      brands: statsData?.brands || 0,
      products: statsData?.products || 0,
      stores: statsData?.stores || 0
    };
  }, [statsData]);

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
      title: t('about.value1Title'),
      description: t('about.value1Desc'),
    },
    {
      icon: Shield,
      title: t('about.value2Title'),
      description: t('about.value2Desc'),
    },
    {
      icon: Package,
      title: t('about.value3Title'),
      description: t('about.value3Desc'),
    },
    {
      icon: Clock,
      title: t('about.value4Title'),
      description: t('about.value4Desc'),
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16 sm:pt-20">
        {/* Hero Images as Floating Products */}
        {heroImages.length > 0 && (
          <div className="absolute inset-0 z-0 pointer-events-none hidden md:block">
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
                <div className="relative w-[280px] lg:w-[380px] h-[360px] lg:h-[480px] overflow-hidden rounded-2xl">
                  <img
                    src={image.image_url}
                    alt={image.title || `Hero ${index + 1}`}
                    className="w-full h-full object-cover"
                    style={{
                      filter: 'brightness(1.4) contrast(1.3) saturate(0) drop-shadow(0 0 22px rgba(255,255,255,0.4)) drop-shadow(0 0 3px rgba(255,255,255,0.2))',
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

        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center mt-12 sm:mt-20">
            {/* Main headline */}
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold mb-4 sm:mb-6 tracking-tight select-none">
              <span className="block text-white filter brightness-110">Discover</span>
              <span className="block relative inline-block">
                <span className="text-white filter brightness-125">Exceptional</span>
              </span>
              <span className="block text-white filter brightness-110">Fashion</span>
            </h1>

            {/* Subheadline */}
            <p className="text-base sm:text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-6 sm:mb-10 leading-relaxed backdrop-blur-sm select-none px-4">
              Curated collections from the world's most innovative designers
            </p>

            {/* Scroll down button */}
            <div className="flex justify-center mb-6 sm:mb-10">
              <button
                onClick={() => {
                  const productsSection = document.getElementById('products-section');
                  productsSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                className="relative w-12 h-12 sm:w-16 sm:h-16 rounded-full border-2 border-white/30 bg-white/5 backdrop-blur-md hover:bg-white/10 hover:border-white/40 transition-all duration-300 flex items-center justify-center group cursor-pointer select-none"
                aria-label="Scroll to products"
              >
                <svg
                  className="w-6 h-6 text-white animate-bounce"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
                </svg>
              </button>
            </div>

            {/* CTAs - Glassmorphism */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => navigate("/stores")}
                size="lg" 
                variant="outline"
                className="relative border border-white/20 text-white bg-white/5 backdrop-blur-xl hover:bg-white/10 hover:border-white/30 transition-all overflow-hidden group"
              >
                View Stores
              </Button>
            </div>

            {/* Stats - Glassmorphism cards */}
            <div className="flex flex-wrap justify-center gap-3 sm:gap-6 md:gap-10 mt-10 sm:mt-20 px-4">
              {[
                { value: stats.brands >= 1000 ? `${Math.floor(stats.brands / 1000)}K+` : `${stats.brands}+`, label: "Brands" },
                { value: stats.products >= 1000 ? `${Math.floor(stats.products / 1000)}K+` : `${stats.products}+`, label: "Products" },
                { value: stats.stores >= 1000 ? `${Math.floor(stats.stores / 1000)}K+` : `${stats.stores}+`, label: "Stores" },
              ].map((stat) => (
                <div key={stat.label} className="relative text-center px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-5 rounded-xl sm:rounded-2xl bg-white/5 backdrop-blur-[30px] border border-white/15 overflow-hidden group hover:bg-white/8 hover:border-white/20 transition-all">
                  <p className="relative font-display text-xl sm:text-2xl md:text-3xl font-bold mb-1 text-white filter brightness-110">{stat.value}</p>
                  <p className="relative text-[10px] sm:text-xs text-white/70 uppercase tracking-wider">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-8 sm:py-12 border-y border-white/10 bg-black/40">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {features.map((feature) => (
              <div 
                key={feature.title}
                className="group relative p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-white/10 bg-white/5 backdrop-blur-[25px] hover:border-white/20 hover:bg-white/8 transition-all duration-300 overflow-hidden select-none"
              >
                <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center mb-3 sm:mb-4 group-hover:bg-white/15 transition-colors">
                  <feature.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <h3 className="relative font-display font-semibold text-sm sm:text-base mb-1 sm:mb-2 text-white">{feature.title}</h3>
                <p className="relative text-xs sm:text-sm text-white/70 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* New Arrivals Section */}
      <section id="products-section" className="py-12 sm:py-16 md:py-20 bg-black">
        <div className="container mx-auto px-4 sm:px-6">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 sm:gap-6 mb-6 sm:mb-10">
            <div>
              <div className="inline-flex items-center gap-2 mb-2 sm:mb-3 select-none">
                <div className="w-1.5 h-1.5 rounded-full bg-white" />
                <span className="text-[10px] sm:text-xs text-white/60 uppercase tracking-wider">Just In</span>
              </div>
              <h2 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white select-none">New Arrivals</h2>
              <p className="text-sm sm:text-base text-white/70 mt-1 sm:mt-2 select-none">Fresh pieces just added to the collection</p>
            </div>
          </div>

          {/* Products Grid - Smaller cards */}
          {productsLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="aspect-[3/4] rounded-xl sm:rounded-2xl bg-card/50 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
              {products.slice(0, 10).map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  image={product.image_url || product.image}
                  price={product.price}
                  category={product.category}
                />
              ))}
            </div>
          )}

          {/* View All Button - Glassmorphism */}
          <div className="text-center mt-12">
            <button 
              onClick={() => navigate("/products")}
              className="relative px-8 py-3 rounded-full border border-white/20 bg-white/5 backdrop-blur-[30px] text-white font-medium text-sm hover:bg-white/10 hover:border-white/30 transition-all duration-300 overflow-hidden group"
            >
              <span className="relative">View All Products</span>
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
