"use client";

import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import ProductCard from "@/components/ProductCard";
import { NeonAbstractions } from "@/components/NeonAbstractions";
import { ProductGridSkeleton } from "@/components/common/SkeletonLoader";
import RecentlyViewedProducts from "@/components/RecentlyViewedProducts";
import type { Product } from "@/services/productService";
import type { SEOData } from "@/services/api/seo.api";

interface HomeContentProps {
  products: Product[];
  seoData: SEOData | null;
  isLoading?: boolean;
}

export function HomeContent({ products, seoData, isLoading }: HomeContentProps) {
  const router = useRouter(); 
  const { t } = useTranslation();
  
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <main id="main-content">
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16 sm:pt-20">
          {/* NeonAbstractions background */}
          <div className="absolute inset-0 z-0" aria-hidden="true">
            <NeonAbstractions />
          </div>

          <div className="container mx-auto px-4 sm:px-6 relative z-10">
            <div className="max-w-4xl mx-auto text-center mt-4 sm:mt-16 md:mt-20">
              {/* Main headline - LCP element, render immediately */}
              <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold mb-4 sm:mb-6 tracking-tight">
                <span className="block text-white filter brightness-110">
                  {seoData?.h1_title || t('home.discover')}
                </span>
                {!seoData?.h1_title && (
                  <>
                    <span className="block relative inline-block">
                      <span className="text-white filter brightness-125">{t('home.exceptional')}</span>
                    </span>
                    <span className="block text-white filter brightness-110">{t('home.fashion')}</span>
                  </>
                )}
              </h1>

              {/* Subheadline */}
              <p className="text-base sm:text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-6 sm:mb-10 leading-relaxed backdrop-blur-sm px-4">
                {seoData?.content_text || t('home.heroSubtitle')}
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

            </div>
          </div>
        </section>

        {/* New Arrivals Section */}
        <section id="products-section" className="py-12 sm:py-16 md:py-20 bg-black">
          <div className="container mx-auto px-4 sm:px-6">
            {/* Section Header */}
            <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 sm:gap-6 mb-6 sm:mb-10">
              <div>
                <div className="inline-flex items-center gap-2 mb-2 sm:mb-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-white" aria-hidden="true" />
                  <span className="text-[10px] sm:text-xs text-white/60 uppercase tracking-wider">{t('home.justIn')}</span>
                </div>
                <h2 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white">{t('home.newArrivals')}</h2>
                <p className="text-sm sm:text-base text-white/70 mt-1 sm:mt-2">{t('home.freshPieces')}</p>
              </div>
            </header>

            {/* Products Grid - Smaller cards */}
            {isLoading ? (
              <ProductGridSkeleton count={10} columns={6} />
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
                {products.slice(0, 10).map((product, index) => (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    name={product.name}
                    image={product.image_url || product.image}
                    price={product.price}
                    brand={product.brand}
                  />
                ))}
              </div>
            )}

            {/* View All Button - Glassmorphism */}
            <nav className="text-center mt-12">
              <button 
                onClick={() => router.push("/products")}
                className="relative px-8 py-3 rounded-full border border-white/20 bg-white/5 backdrop-blur-[30px] text-white font-medium text-sm hover:bg-white/10 hover:border-white/30 transition-all duration-300 overflow-hidden group"
              >
                <span className="relative">{t('home.viewAllProducts')}</span>
              </button>
            </nav>
          </div>
        </section>

        {/* Recently Viewed Section */}
        <section className="py-8 sm:py-12 bg-black border-t border-white/5">
          <div className="container mx-auto px-4 sm:px-6">
            <RecentlyViewedProducts 
              maxItems={8} 
              showClearButton={true}
            />
          </div>
        </section>
      </main>
    </div>
  );
}
