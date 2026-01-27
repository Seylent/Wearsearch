'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
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
  const categoriesTrackRef = useRef<HTMLDivElement | null>(null);
  const genderTrackRef = useRef<HTMLDivElement | null>(null);
  const [isDraggingCategories, setIsDraggingCategories] = useState(false);
  const [isDraggingGender, setIsDraggingGender] = useState(false);
  const dragStartX = useRef(0);
  const dragScrollLeft = useRef(0);
  const genderDragStartX = useRef(0);
  const genderDragScrollLeft = useRef(0);

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
    const imageMap: Record<string, string> = {
      jackets:
        'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1200&auto=format&fit=crop',
      hoodies:
        'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=1200&auto=format&fit=crop',
      't-shirts':
        'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=1200&auto=format&fit=crop',
      pants:
        'https://images.unsplash.com/photo-1475178626620-a4d074967452?q=80&w=1200&auto=format&fit=crop',
      jeans:
        'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=1200&auto=format&fit=crop',
      shorts:
        'https://images.unsplash.com/photo-1516826957135-700dedea698c?q=80&w=1200&auto=format&fit=crop',
      shoes:
        'https://images.unsplash.com/photo-1528701800489-20be3c0ea6d2?q=80&w=1200&auto=format&fit=crop',
      accessories:
        'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1200&auto=format&fit=crop',
    };
    return {
      ...category,
      imageUrl: category.imageUrl || imageMap[normalizedSlug],
      tone:
        {
          jackets: 'from-neutral-100 via-white to-neutral-200',
          hoodies: 'from-stone-100 via-white to-stone-200',
          't-shirts': 'from-zinc-100 via-white to-zinc-200',
          pants: 'from-slate-100 via-white to-slate-200',
          jeans: 'from-neutral-100 via-white to-neutral-200',
          shorts: 'from-amber-100/70 via-white to-amber-200/70',
          shoes: 'from-emerald-100/60 via-white to-emerald-200/60',
          accessories: 'from-sky-100/70 via-white to-sky-200/70',
        }[normalizedSlug] || 'from-neutral-100 via-white to-neutral-200',
    };
  });

  const handleCategoryScroll = (direction: 'left' | 'right') => {
    const track = categoriesTrackRef.current;
    if (!track) return;
    const scrollAmount = track.clientWidth * 0.7;
    track.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  const handleCategoryPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    const track = categoriesTrackRef.current;
    if (!track) return;
    setIsDraggingCategories(true);
    dragStartX.current = event.clientX;
    dragScrollLeft.current = track.scrollLeft;
    track.setPointerCapture(event.pointerId);
  };

  const handleCategoryPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const track = categoriesTrackRef.current;
    if (!track || !isDraggingCategories) return;
    const distance = event.clientX - dragStartX.current;
    track.scrollLeft = dragScrollLeft.current - distance;
  };

  const handleCategoryPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    const track = categoriesTrackRef.current;
    if (!track) return;
    setIsDraggingCategories(false);
    track.releasePointerCapture(event.pointerId);
  };

  const handleGenderScroll = (direction: 'left' | 'right') => {
    const track = genderTrackRef.current;
    if (!track) return;
    const scrollAmount = track.clientWidth * 0.7;
    track.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  const handleGenderPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    const track = genderTrackRef.current;
    if (!track) return;
    setIsDraggingGender(true);
    genderDragStartX.current = event.clientX;
    genderDragScrollLeft.current = track.scrollLeft;
    track.setPointerCapture(event.pointerId);
  };

  const handleGenderPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const track = genderTrackRef.current;
    if (!track || !isDraggingGender) return;
    const distance = event.clientX - genderDragStartX.current;
    track.scrollLeft = genderDragScrollLeft.current - distance;
  };

  const handleGenderPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    const track = genderTrackRef.current;
    if (!track) return;
    setIsDraggingGender(false);
    track.releasePointerCapture(event.pointerId);
  };

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

        <section className="py-10 sm:py-14 bg-background text-foreground border-y border-border">
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
                <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">
                  {t('home.genderPicks', 'Find your lane')}
                </h2>
                <p className="text-sm sm:text-base text-muted-foreground mt-2">
                  {t('home.genderHint', 'Curated edits for every silhouette and mood')}
                </p>
              </div>
            </header>

            <div className="flex items-center justify-between text-xs text-muted-foreground mb-3 sm:mb-4">
              <span>{t('home.scrollHint', 'Swipe to explore')}</span>
              <span className="hidden sm:inline">
                {t('home.scrollHintDesktop', 'Drag or use arrows')}
              </span>
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={() => handleGenderScroll('left')}
                className="hidden sm:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 h-9 w-9 items-center justify-center rounded-full border border-border bg-background/90 text-muted-foreground shadow-sm hover:text-foreground"
                aria-label={t('home.scrollLeft', 'Scroll left')}
              >
                ‹
              </button>
              <button
                type="button"
                onClick={() => handleGenderScroll('right')}
                className="hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 h-9 w-9 items-center justify-center rounded-full border border-border bg-background/90 text-muted-foreground shadow-sm hover:text-foreground"
                aria-label={t('home.scrollRight', 'Scroll right')}
              >
                ›
              </button>

              <div className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-background to-transparent" />
              <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-background to-transparent" />

              <div
                ref={genderTrackRef}
                onPointerDown={handleGenderPointerDown}
                onPointerMove={handleGenderPointerMove}
                onPointerUp={handleGenderPointerUp}
                onPointerLeave={handleGenderPointerUp}
                className={`flex gap-4 overflow-x-auto pb-2 -mx-1 px-1 snap-x snap-mandatory ${
                  isDraggingGender ? 'cursor-grabbing' : 'cursor-grab'
                }`}
              >
                {[
                  {
                    label: t('home.women', 'Women'),
                    sub: t('home.womenTag', 'Soft power tailoring'),
                    href: '/products?gender=women',
                    image:
                      'https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?q=80&w=1600&auto=format&fit=crop',
                  },
                  {
                    label: t('home.men', 'Men'),
                    sub: t('home.menTag', 'Utility with edge'),
                    href: '/products?gender=men',
                    image:
                      'https://images.unsplash.com/photo-1495385794356-15371f348c31?q=80&w=1600&auto=format&fit=crop',
                  },
                  {
                    label: t('home.unisex', 'Unisex'),
                    sub: t('home.unisexTag', 'Fluid essentials'),
                    href: '/products?gender=unisex',
                    image:
                      'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=1600&auto=format&fit=crop',
                  },
                ].map(card => (
                  <Link
                    key={card.label}
                    href={card.href}
                    className="group relative min-w-[260px] sm:min-w-[320px] snap-start overflow-hidden rounded-2xl border border-border bg-card transition hover:border-foreground/40 shadow-[0_10px_24px_rgba(15,15,15,0.08)]"
                  >
                    <div className="absolute inset-0">
                      <img
                        src={card.image}
                        alt={card.label}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                      />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/70 to-background/10" />
                    <div className="relative z-10 flex h-full flex-col gap-3 p-5">
                      <div className="text-xl sm:text-2xl font-semibold text-foreground">
                        {card.label}
                      </div>
                      <p className="text-sm text-muted-foreground max-w-xs">{card.sub}</p>
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

        <section className="py-10 sm:py-16 bg-background text-foreground border-b border-border">
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
              <button
                type="button"
                onClick={() => handleCategoryScroll('left')}
                className="hidden sm:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 h-10 w-10 items-center justify-center rounded-full border border-border bg-background/90 text-muted-foreground shadow-sm hover:text-foreground"
                aria-label={t('home.scrollLeft', 'Scroll left')}
              >
                ‹
              </button>
              <button
                type="button"
                onClick={() => handleCategoryScroll('right')}
                className="hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 h-10 w-10 items-center justify-center rounded-full border border-border bg-background/90 text-muted-foreground shadow-sm hover:text-foreground"
                aria-label={t('home.scrollRight', 'Scroll right')}
              >
                ›
              </button>

              <div className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-background to-transparent" />
              <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-background to-transparent" />

              <div
                ref={categoriesTrackRef}
                onPointerDown={handleCategoryPointerDown}
                onPointerMove={handleCategoryPointerMove}
                onPointerUp={handleCategoryPointerUp}
                onPointerLeave={handleCategoryPointerUp}
                className={`flex gap-4 overflow-x-auto pb-4 -mx-1 px-1 snap-x snap-mandatory ${
                  isDraggingCategories ? 'cursor-grabbing' : 'cursor-grab'
                }`}
              >
                {categoryCards.map(category => (
                  <Link
                    key={category.id}
                    href={`/products?type=${encodeURIComponent(category.slug)}`}
                    className="group min-w-[220px] sm:min-w-[260px] snap-start rounded-2xl border border-border bg-card overflow-hidden transition hover:border-foreground/40 shadow-[0_10px_20px_rgba(15,15,15,0.06)]"
                  >
                    <div className={`relative h-40 bg-gradient-to-br ${category.tone}`}>
                      {category.imageUrl && (
                        <img
                          src={category.imageUrl}
                          alt={category.name}
                          className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-background/30 to-transparent" />
                    </div>
                    <div className="p-4">
                      <div className="text-base font-semibold text-foreground">{category.name}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {category.productCount
                          ? `${category.productCount} ${t('home.items', 'items')}`
                          : t('home.explore', 'Explore')}
                      </div>
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
