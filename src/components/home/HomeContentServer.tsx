import ProductCard from '@/components/ProductCard';
import RecentlyViewedProducts from '@/components/RecentlyViewedProducts';
import { HomeHero } from './HomeHero';
import { ViewAllButton } from './ViewAllButton';
import type { Product } from '@/types';

interface SEOData {
  title?: string;
  meta_title?: string;
  description?: string;
  meta_description?: string;
  h1_title?: string;
  content_text?: string;
  keywords?: string;
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
}

interface HomeContentProps {
  featuredProducts: Product[];
  newProducts: Product[];
  popularProducts: Product[];
  categories: Array<{
    id: string;
    name: string;
    slug: string;
    imageUrl?: string;
    productCount: number;
  }>;
  seoData: SEOData | null;
  stats: {
    totalProducts: number;
    totalBrands: number;
    totalCategories: number;
  };
}

// SERVER COMPONENT - No 'use client'
export default function HomeContent({
  featuredProducts,
  _newProducts,
  seoData,
}: Readonly<HomeContentProps>) {
  // Use only featured products to avoid duplicates
  const allProducts = featuredProducts;
  const hasProducts = allProducts.length > 0;

  return (
    <div className="min-h-screen bg-black text-white">
      <main id="main-content">
        {/* Hero Section - Server Component */}
        <HomeHero 
          h1Title={seoData?.h1_title}
          contentText={seoData?.content_text}
        />

        {/* New Arrivals Section - Server Component */}
        <section id="products-section" className="py-12 sm:py-16 md:py-20 bg-black">
          <div className="container mx-auto px-4 sm:px-6">
            <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 sm:gap-6 mb-6 sm:mb-10">
              <div>
                <div className="inline-flex items-center gap-2 mb-2 sm:mb-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-white" aria-hidden="true" />
                  <span className="text-[10px] sm:text-xs text-white/60 uppercase tracking-wider">Just In</span>
                </div>
                <h2 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white">New Arrivals</h2>
                <p className="text-sm sm:text-base text-white/70 mt-1 sm:mt-2">Fresh pieces from the latest collections</p>
              </div>
            </header>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
              {hasProducts ? (
                allProducts.slice(0, 12).map((product) => (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    name={product.name}
                    image={product.image_url || product.image || ''}
                    price={product.price}
                    brand={product.brand}
                  />
                ))
              ) : (
                <div className="col-span-full text-center py-16 px-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 mb-4">
                    <svg className="w-8 h-8 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Немає доступних продуктів</h3>
                  <p className="text-white/60 mb-4 max-w-md mx-auto">
                    Підключіть backend сервер для завантаження продуктів.<br/>
                    Перевірте NEXT_PUBLIC_API_URL в .env файлі.
                  </p>
                  <div className="text-sm text-white/40 font-mono bg-white/5 rounded-lg p-4 max-w-lg mx-auto">
                    <div className="text-left">
                      <div className="text-white/60 mb-2">Очікується:</div>
                      <div>NEXT_PUBLIC_API_URL=http://localhost:3000</div>
                      <div className="mt-3 text-white/60 mb-2">Або запустіть backend:</div>
                      <div>cd backend && npm run dev</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Client Component для navigation */}
            <ViewAllButton label="View All Products" />
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
