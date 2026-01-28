'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { ArrowUpRight } from 'lucide-react';
import { useCurrencyConversion } from '@/hooks/useCurrencyConversion';
import ProductCard from '@/components/ProductCard';
import RecentlyViewedProducts from '@/components/RecentlyViewedProducts';
import { ViewAllButton } from './ViewAllButton';
import { HomeHero } from './HomeHero';
import { BannerCarousel } from '@/components/BannerCarousel';
import type { Banner } from '@/types/banner';
import { PRODUCT_CATEGORIES, getCategoryDisplayName } from '@/constants/categories';

interface Product {
  id: string | number;
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
  categories?: Array<{
    id: string;
    name: string;
    slug: string;
    imageUrl?: string;
    productCount: number;
  }>;
}

export default function HomeContentClient({
  initialProducts,
  banners = [],
  seoData,
  categories = [],
}: Readonly<HomeContentClientProps>) {
  const { t } = useTranslation();
  const { currency } = useCurrencyConversion();
  const [isMounted, setIsMounted] = useState(false);
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [productsCurrency, setProductsCurrency] = useState<'UAH' | 'USD'>('UAH');
  const [isLoading, setIsLoading] = useState(false);

  const fallbackCategories = useMemo(
    () =>
      PRODUCT_CATEGORIES.map(category => ({
        id: category,
        name: getCategoryDisplayName(category),
        slug: category.toLowerCase(),
        productCount: 0,
      })),
    []
  );

  const normalizedCategories = categories.length > 0 ? categories : fallbackCategories;
  const seoContent = seoData?.content_text?.trim() || '';
  const seoIsHtml = seoContent.includes('<');
  const categoryCards = normalizedCategories.map(category => {
    const slug = (category.slug || category.name).toLowerCase();
    const normalizedSlug = slug.replace(/\s+/g, '-');
    const nameKey = (category.name || '').toLowerCase().replace(/\s+/g, '-');
    const imageMap: Record<string, string> = {
      jackets: '/home/category-jackets.webp',
      puffer: '/home/category-jackets.webp',
      hoodies: '/home/category-hoodies.webp',
      hoodie: '/home/category-hoodies.webp',
      't-shirts': '/home/category-tshirts.webp',
      tshirts: '/home/category-tshirts.webp',
      't-shirt': '/home/category-tshirts.webp',
      pants: '/home/category-pants.webp',
      sweatpants: '/home/category-pants.webp',
      jeans: '/home/category-jeans.webp',
      shorts: '/home/category-shorts.webp',
      shoes: '/home/category-shoes.webp',
      sneakers: '/home/category-shoes.webp',
      accessories: '/home/category-accessories.webp',
      // Ukrainian fallbacks
      куртки: '/home/category-jackets.webp',
      пуховики: '/home/category-jackets.webp',
      худі: '/home/category-hoodies.webp',
      футболки: '/home/category-tshirts.webp',
      штани: '/home/category-pants.webp',
      джинси: '/home/category-jeans.webp',
      шорти: '/home/category-shorts.webp',
      взуття: '/home/category-shoes.webp',
      аксесуари: '/home/category-accessories.webp',
    };
    const localImage =
      imageMap[normalizedSlug] || imageMap[nameKey] || imageMap[slug] || imageMap[category.name];
    return {
      ...category,
      imageUrl: localImage || category.imageUrl,
    };
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

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
        const topCurrency =
          data?.currency?.code === 'USD' || data?.currency?.code === 'UAH'
            ? data.currency.code
            : currentCurrency;

        const item = data?.item ?? data?.data ?? data;
        const inner = item?.data ?? item;

        const featured =
          inner?.featured_products ?? inner?.featuredProducts ?? inner?.products ?? inner?.items;

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

  if (!isMounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-black text-white" suppressHydrationWarning>
      <main id="main-content">
        {/* Hero Section */}
        <HomeHero h1Title={seoData?.h1_title} contentText={seoData?.content_text} />

        {banners.length > 0 && (
          <section className="py-6 sm:py-8 bg-black">
            <div className="container mx-auto px-4 sm:px-6">
              <BannerCarousel banners={banners} />
            </div>
          </section>
        )}

        <section className="py-12 sm:py-16 bg-white text-foreground dark:bg-black border-y border-border">
          <div className="container mx-auto px-4 sm:px-6">
            <header className="flex items-end justify-between gap-4 mb-6 sm:mb-8">
              <div>
                <div className="inline-flex items-center gap-2 mb-2">
                  <div
                    className="w-1.5 h-1.5 rounded-full bg-muted-foreground"
                    aria-hidden="true"
                  />
                  <span className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider">
                    {t('home.shopByGender', 'Shop by vibe')}
                  </span>
                </div>
                <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold">
                  {t('home.genderPicks', 'Find your lane')}
                </h2>
                <p className="text-sm sm:text-base text-muted-foreground mt-2">
                  {t('home.genderHint', 'Curated edits for every silhouette and mood')}
                </p>
              </div>
            </header>

            <div className="flex items-center justify-between text-xs text-muted-foreground mb-3 sm:mb-4">
              <span>{t('home.scrollHint', 'Swipe to explore')}</span>
            </div>

            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-white to-transparent dark:from-black" />
              <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-white to-transparent dark:from-black" />

              <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1 snap-x snap-mandatory">
                {[
                  {
                    label: t('home.women', 'Women'),
                    sub: t('home.womenTag', 'Soft power tailoring'),
                    href: '/products?gender=women',
                    accent: 'from-fuchsia-500/60 via-fuchsia-400/30 to-transparent',
                  },
                  {
                    label: t('home.men', 'Men'),
                    sub: t('home.menTag', 'Utility with edge'),
                    href: '/products?gender=men',
                    accent: 'from-cyan-500/60 via-sky-400/30 to-transparent',
                  },
                  {
                    label: t('home.unisex', 'Unisex'),
                    sub: t('home.unisexTag', 'Fluid essentials'),
                    href: '/products?gender=unisex',
                    accent: 'from-emerald-500/60 via-lime-400/30 to-transparent',
                  },
                ].map(card => (
                  <Link
                    key={card.label}
                    href={card.href}
                    className="group relative min-w-[260px] sm:min-w-[300px] min-h-[170px] snap-start rounded-2xl border border-border bg-white/90 dark:bg-black p-5 transition hover:border-foreground/40"
                  >
                    <div className="relative z-10 flex h-full flex-col gap-3">
                      <div className="text-lg sm:text-xl font-semibold text-foreground">
                        {card.label}
                      </div>
                      <div className="mt-auto inline-flex items-center gap-2 text-sm text-foreground">
                        {t('home.browse', 'Browse')}
                        <ArrowUpRight className="h-4 w-4" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="py-10 sm:py-16 bg-white text-foreground dark:bg-black border-b border-border">
          <div className="container mx-auto px-4 sm:px-6">
            <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
              <div>
                <div className="inline-flex items-center gap-2 mb-2">
                  <div
                    className="w-1.5 h-1.5 rounded-full bg-muted-foreground"
                    aria-hidden="true"
                  />
                  <span className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider">
                    {t('home.categoriesLabel', 'Categories')}
                  </span>
                </div>
                <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">
                  {t('home.shopByCategory', 'Browse by category')}
                </h2>
                <p className="text-sm sm:text-base text-muted-foreground mt-2">
                  {t('home.categoryHint', 'Swipe through the essential edits')}
                </p>
              </div>
              <Link
                href="/products"
                className="text-sm text-muted-foreground hover:text-foreground transition inline-flex items-center gap-2"
              >
                {t('home.viewAllCategories', 'View all')}
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </header>

            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-white to-transparent dark:from-black" />
              <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-white to-transparent dark:from-black" />

              <div className="flex gap-4 overflow-x-auto pb-4 -mx-1 px-1 snap-x snap-mandatory">
                {categoryCards.map(category => (
                  <Link
                    key={category.id}
                    href={`/products?type=${encodeURIComponent(category.slug)}`}
                    className="group relative min-w-[240px] sm:min-w-[280px] min-h-[120px] snap-start rounded-2xl border border-border bg-white/90 dark:bg-zinc-950/80 p-5 transition hover:border-foreground/40"
                  >
                    <div className="absolute right-4 top-4 text-xs text-muted-foreground opacity-0 transition group-hover:opacity-100">
                      {t('home.open', 'Open')}
                    </div>
                    <div className="h-full flex items-center justify-center text-base font-semibold text-foreground text-center">
                      {category.name}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

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
                products
                  .slice(0, 12)
                  .map(product => (
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
                    <svg
                      className="w-8 h-8 text-white/40"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    {t('home.noProductsTitle', 'Немає доступних продуктів')}
                  </h3>
                  <p className="text-white/60 mb-4 max-w-md mx-auto">
                    {t(
                      'home.noProductsDescription',
                      'Підключіть backend сервер для завантаження продуктів.'
                    )}
                    <br />
                    {t('home.noProductsHint', 'Перевірте NEXT_PUBLIC_API_URL в .env файлі.')}
                  </p>
                  <div className="text-sm text-white/40 font-mono bg-white/5 rounded-lg p-4 max-w-lg mx-auto">
                    <div className="text-left">
                      <div className="text-white/60 mb-2">
                        {t('home.noProductsExpected', 'Очікується:')}
                      </div>
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
            <RecentlyViewedProducts maxItems={8} showClearButton={true} />
          </div>
        </section>
      </main>
    </div>
  );
}
