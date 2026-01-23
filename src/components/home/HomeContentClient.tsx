'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCurrencyConversion } from '@/hooks/useCurrencyConversion';
import ProductCard from '@/components/ProductCard';
import RecentlyViewedProducts from '@/components/RecentlyViewedProducts';
import { ViewAllButton } from './ViewAllButton';
import { HomeHero } from './HomeHero';
import { BannerCarousel } from '@/components/BannerCarousel';
import type { Banner } from '@/types/banner';

interface Product {
  id: number;
  name: string;
  image_url?: string;
  image?: string;
  price: number;
  brand?: string;
}

interface SEOData {
  h1_title?: string;
  content_text?: string;
}

interface HomeContentClientProps {
  initialProducts: Product[];
  banners?: Banner[];
  seoData?: SEOData | null;
}

export default function HomeContentClient({
  initialProducts,
  banners = [],
  seoData,
}: Readonly<HomeContentClientProps>) {
  const { t } = useTranslation();
  const { currency } = useCurrencyConversion();
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [productsCurrency, setProductsCurrency] = useState<'UAH' | 'USD'>('UAH');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Always fetch with current currency to ensure correct prices
    const fetchProductsWithCurrency = async () => {
      // Use UAH as default if currency not loaded yet
      const currentCurrency = currency || 'UAH';
      
      // If UAH and SSR provided products, use them directly.
      if (currentCurrency === 'UAH' && initialProducts.length > 0) {
        setProducts(initialProducts);
        setProductsCurrency('UAH');
        return;
      }

      setIsLoading(true);
      try {
        // Use the same v1 endpoint shape as the rest of the app.
        // Next rewrites proxy this to backend: http://localhost:3000
        const response = await fetch(`/api/v1/pages/home?currency=${currentCurrency}`);
         
        if (!response.ok) {
          console.error('Failed to fetch products with currency');
          setProducts(initialProducts);
          setProductsCurrency(currentCurrency === 'USD' ? 'USD' : 'UAH');
          return;
        }

        const data = await response.json();

        // v1 homepage endpoint can return different shapes, e.g.
        // - { success, data: { featured_products: [...] } }
        // - { item: { featured_products / products / items: [...] }, currency: { code: 'USD' } }
        const topCurrency = (data?.currency?.code === 'USD' || data?.currency?.code === 'UAH')
          ? data.currency.code
          : currentCurrency;

        const item = data?.item ?? data?.data ?? data;
        const inner = item?.data ?? item;

        const featured =
          inner?.featured_products ??
          inner?.featuredProducts ??
          inner?.products ??
          inner?.items;

        if (Array.isArray(featured)) {
          setProducts(featured);
          setProductsCurrency(topCurrency);
        } else {
          console.warn('Unexpected home currency response shape:', data);
          setProducts(initialProducts);
          setProductsCurrency(currentCurrency === 'USD' ? 'USD' : 'UAH');
        }
      } catch (error) {
        console.error('Error fetching products with currency:', error);
        setProducts(initialProducts);
        setProductsCurrency(currentCurrency === 'USD' ? 'USD' : 'UAH');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProductsWithCurrency();
  }, [currency, initialProducts]);

  const hasProducts = products.length > 0;

  return (
    <div className="min-h-screen bg-black text-white">
      <main id="main-content">
        {/* Hero Section */}
        <HomeHero 
          h1Title={seoData?.h1_title}
          contentText={seoData?.content_text}
        />

        {/* Banners Section - Best placement after hero */}
        {banners.length > 0 && (
          <section className="py-8 sm:py-12 md:py-16 bg-black">
            <div className="container mx-auto px-4 sm:px-6">
              <BannerCarousel banners={banners} />
            </div>
          </section>
        )}

        {/* New Arrivals Section */}
        <section id="products-section" className="py-12 sm:py-16 md:py-20 bg-black">
          <div className="container mx-auto px-4 sm:px-6">
            <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 sm:gap-6 mb-6 sm:mb-10">
              <div>
                <div className="inline-flex items-center gap-2 mb-2 sm:mb-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-white" aria-hidden="true" />
                  <span className="text-[10px] sm:text-xs text-white/60 uppercase tracking-wider">
                    {t('home.justIn', 'Just In')}
                  </span>
                </div>
                <h2 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white">
                  {t('home.newArrivals', 'New Arrivals')}
                </h2>
                <p className="text-sm sm:text-base text-white/70 mt-1 sm:mt-2">
                  {t('home.freshPieces', 'Fresh pieces from the latest collections')}
                </p>
              </div>
            </header>

            {/* Loading state */}
            {isLoading && (
              <div className="col-span-full text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
              {hasProducts ? (
                products.slice(0, 12).map((product) => (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    name={product.name}
                    image={product.image_url || product.image || ''}
                    price={product.price}
                    brand={product.brand}
                    priceCurrency={productsCurrency}
                  />
                ))
              ) : (
                <div className="col-span-full text-center py-16 px-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 mb-4">
                    <svg className="w-8 h-8 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    {t('home.noProductsTitle', 'Немає доступних продуктів')}
                  </h3>
                  <p className="text-white/60 mb-4 max-w-md mx-auto">
                    {t('home.noProductsDescription', 'Підключіть backend сервер для завантаження продуктів.')}
                    <br />
                    {t('home.noProductsHint', 'Перевірте NEXT_PUBLIC_API_URL в .env файлі.')}
                  </p>
                  <div className="text-sm text-white/40 font-mono bg-white/5 rounded-lg p-4 max-w-lg mx-auto">
                    <div className="text-left">
                      <div className="text-white/60 mb-2">{t('home.noProductsExpected', 'Очікується:')}</div>
                      <div>NEXT_PUBLIC_API_URL=http://localhost:3000</div>
                      <div className="mt-3 text-white/60 mb-2">
                        {t('home.noProductsBackend', 'Або запустіть backend:')}
                      </div>
                      <div>cd backend && npm run dev</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* View All Button */}
            <ViewAllButton label={t('home.viewAllProducts', 'View All Products')} />
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
