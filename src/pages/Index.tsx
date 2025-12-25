import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import Navigation from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Product } from "@/services/productService";
import { NeonAbstractions } from "@/components/NeonAbstractions";
import { useProducts, useHeroImages } from "@/hooks/useApi";

const Index: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Use React Query hooks - only fetch what's needed for this page
  const { data: productsData, isLoading: productsLoading } = useProducts();
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
                    loading="lazy"
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
          <div className="max-w-4xl mx-auto text-center mt-4 sm:mt-16 md:mt-20">
            {/* Main headline */}
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold mb-4 sm:mb-6 tracking-tight">
              <span className="block text-white filter brightness-110">{t('home.discover')}</span>
              <span className="block relative inline-block">
                <span className="text-white filter brightness-125">{t('home.exceptional')}</span>
              </span>
              <span className="block text-white filter brightness-110">{t('home.fashion')}</span>
            </h1>

            {/* Subheadline */}
            <p className="text-base sm:text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-6 sm:mb-10 leading-relaxed backdrop-blur-sm px-4">
              {t('home.heroSubtitle')}
            </p>

            {/* Scroll down button */}
            <div className="flex justify-center mb-6 sm:mb-10">
              <button
                onClick={() => {
                  const productsSection = document.getElementById('products-section');
                  productsSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                className="relative w-12 h-12 sm:w-16 sm:h-16 rounded-full border-2 border-white/30 bg-white/5 backdrop-blur-md hover:bg-white/10 hover:border-white/40 transition-all duration-300 flex items-center justify-center group cursor-pointer"
                aria-label="Scroll to products"
              >
                <svg
                  className="w-6 h-6 text-white "
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
                {t('home.viewStores')}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* New Arrivals Section */}
      <section id="products-section" className="py-12 sm:py-16 md:py-20 bg-black">
        <div className="container mx-auto px-4 sm:px-6">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 sm:gap-6 mb-6 sm:mb-10">
            <div>
              <div className="inline-flex items-center gap-2 mb-2 sm:mb-3">
                <div className="w-1.5 h-1.5 rounded-full bg-white" />
                <span className="text-[10px] sm:text-xs text-white/60 uppercase tracking-wider">{t('home.justIn')}</span>
              </div>
              <h2 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white">{t('home.newArrivals')}</h2>
              <p className="text-sm sm:text-base text-white/70 mt-1 sm:mt-2">{t('home.freshPieces')}</p>
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
                  category={product.type}
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
              <span className="relative">{t('home.viewAllProducts')}</span>
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
