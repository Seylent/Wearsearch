'use client';

import { useTranslation } from 'react-i18next';
import ProductCard from '@/components/ProductCard';
import { ScrollButton } from '@/components/home/ScrollButton';
import { ViewAllButton } from '@/components/home/ViewAllButton';
import { NeonAbstractions } from '@/components/NeonAbstractions';
import { ProductGridSkeleton } from '@/components/common/SkeletonLoader';
import dynamic from 'next/dynamic';

const RecentlyViewedProducts = dynamic(() => import('@/components/RecentlyViewedProducts'), {
  ssr: false,
  loading: () => null,
});
import type { Product } from '@/services/productService';
import type { SEOData } from '@/services/api/seo.api';

interface HomeContentProps {
  products: Product[];
  seoData: SEOData | null;
  isLoading?: boolean;
}

export function HomeContent({ products, seoData, isLoading }: Readonly<HomeContentProps>) {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-white text-foreground">
      {/* Hero Section */}
      <div>
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16 sm:pt-20">
          {/* NeonAbstractions background */}
          <div className="absolute inset-0 z-0" aria-hidden="true">
            <NeonAbstractions />
          </div>

          <div className="max-w-[1800px] mx-auto px-4 sm:px-6 md:px-12 lg:px-16 relative z-10">
            <div className="max-w-4xl mx-auto text-center mt-4 sm:mt-16 md:mt-20">
              {/* Main headline - LCP element, render immediately */}
              <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold mb-4 sm:mb-6 tracking-tight">
                <span className="block text-white filter brightness-110">
                  {seoData?.h1_title || t('home.discover')}
                </span>
                {!seoData?.h1_title && (
                  <>
                    <span className="block relative inline-block">
                      <span className="text-white filter brightness-125">
                        {t('home.exceptional')}
                      </span>
                    </span>
                    <span className="block text-white filter brightness-110">
                      {t('home.fashion')}
                    </span>
                  </>
                )}
              </h1>

              {/* Subheadline */}
              <p className="text-base sm:text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-6 sm:mb-10 leading-relaxed backdrop-blur-sm px-4 font-serif">
                {seoData?.content_text || t('home.heroSubtitle')}
              </p>

              {/* Scroll down button */}
              <ScrollButton targetId="products-section" variant="glass" />
            </div>
          </div>
        </section>

        {/* New Arrivals Section */}
        <section id="products-section" className="py-12 sm:py-16 md:py-20 bg-white">
          <div className="max-w-[1800px] mx-auto px-4 sm:px-6 md:px-12 lg:px-16">
            {/* Section Header */}
            <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 sm:gap-6 mb-6 sm:mb-10">
              <div>
                <div className="inline-flex items-center gap-2 mb-2 sm:mb-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-foreground" aria-hidden="true" />
                  <span className="text-[10px] sm:text-xs text-white/60 uppercase tracking-wider">
                    {t('home.justIn')}
                  </span>
                </div>
                <h2 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white">
                  {t('home.newArrivals')}
                </h2>
                <p className="text-sm sm:text-base text-white/70 mt-1 sm:mt-2 font-serif">
                  {t('home.freshPieces')}
                </p>
              </div>
            </header>

            {/* Products Grid - Smaller cards */}
            {isLoading ? (
              <ProductGridSkeleton count={10} columns={6} />
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
                {products.slice(0, 10).map(product => (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    name={product.name}
                    image={product.image_url || product.image}
                    price={product.price}
                    minPrice={product.price_min ?? product.min_price}
                    maxPrice={product.max_price ?? product.maxPrice}
                    priceCurrency={
                      product.currency === 'USD' || product.currency === 'UAH'
                        ? product.currency
                        : undefined
                    }
                    brand={product.brand}
                  />
                ))}
              </div>
            )}

            {/* View All Button - Glassmorphism */}
            <ViewAllButton label={t('home.viewAllProducts')} variant="glass" />
          </div>
        </section>

        {/* Recently Viewed Section */}
        <section className="py-8 sm:py-12 bg-white border-t border-border">
          <div className="max-w-[1800px] mx-auto px-4 sm:px-6 md:px-12 lg:px-16">
            <RecentlyViewedProducts maxItems={8} showClearButton={true} />
          </div>
        </section>
      </div>
    </div>
  );
}
