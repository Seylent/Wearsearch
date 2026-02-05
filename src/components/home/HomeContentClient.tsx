'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useTranslation } from 'react-i18next';
import { ArrowUpRight } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { ScrollReveal } from '@/components/common/ScrollReveal';
import { useCurrencyConversion } from '@/hooks/useCurrencyConversion';
import ProductCard from '@/components/ProductCard';
import { ViewAllButton } from './ViewAllButton';
import { HomeHero } from './HomeHero';
const RecentlyViewedProducts = dynamic(() => import('@/components/RecentlyViewedProducts'), {
  ssr: false,
  loading: () => null,
});
import { PRODUCT_CATEGORIES, getCategoryDisplayName } from '@/constants/categories';
import { useIsTouchDevice } from '@/hooks/use-touch-device';

interface Product {
  id: string | number;
  name: string;
  image_url?: string;
  image?: string;
  price?: number | string;
  price_min?: number | string;
  min_price?: number | string;
  max_price?: number | string;
  maxPrice?: number | string;
  currency?: string;
  saves_count?: number;
  brand?: string;
}

interface SEOData {
  h1_title?: string;
  content_text?: string;
}

interface HomeContentClientProps {
  initialProducts: Product[];
  initialPopularProducts?: Product[];
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
  initialPopularProducts = [],
  seoData,
  categories = [],
}: Readonly<HomeContentClientProps>) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language || 'uk';
  const { currency } = useCurrencyConversion();
  const [isMounted, setIsMounted] = useState(false);
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [productsCurrency, setProductsCurrency] = useState<'UAH' | 'USD'>(
    initialProducts.length > 0 ? 'UAH' : 'USD'
  );
  const [isLoading, setIsLoading] = useState(false);
  const [popularProducts, setPopularProducts] = useState<Product[]>(initialPopularProducts);
  const [popularCurrency, setPopularCurrency] = useState<'UAH' | 'USD'>(
    initialPopularProducts.length > 0 ? 'UAH' : 'USD'
  );
  const [heroSeo, setHeroSeo] = useState<SEOData | null>(seoData ?? null);
  const reduceMotion = useReducedMotion();
  const isTouchDevice = useIsTouchDevice();
  const shouldAnimate = !reduceMotion && !isTouchDevice;

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
  const categoryCards = normalizedCategories.map(category => {
    const slug = (category.slug || category.name).toLowerCase();
    const normalizedSlug = slug.replace(/\s+/g, '-');
    const nameKey = (category.name || '').toLowerCase().replace(/\s+/g, '-');
    const fallbackName = category.name || getCategoryDisplayName(normalizedSlug);
    const displayName = t(`productTypes.${normalizedSlug}`, { defaultValue: fallbackName });
    const existingImageUrl = 'imageUrl' in category ? category.imageUrl : undefined;
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
      name: displayName,
      imageUrl: localImage || existingImageUrl,
    };
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    setHeroSeo(seoData ?? null);
  }, [seoData]);

  useEffect(() => {
    // Fetch only when currency differs from initial server currency (UAH)
    const fetchProductsWithCurrency = async () => {
      const currentCurrency = currency || 'UAH';

      if (currentCurrency === 'UAH' && initialProducts.length > 0) {
        setProducts(initialProducts);
        setProductsCurrency('UAH');
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/v1/items?limit=12&sort=newest&currency=${encodeURIComponent(currentCurrency)}&lang=${encodeURIComponent(lang)}`
        );

        if (!response.ok) {
          setProducts(initialProducts);
          setProductsCurrency(currentCurrency === 'USD' ? 'USD' : 'UAH');
          return;
        }

        const data = await response.json();

        const topCurrency =
          data?.currency?.code === 'USD' || data?.currency?.code === 'UAH'
            ? data.currency.code
            : currentCurrency;

        const itemsPayload = data?.data ?? data;
        const items =
          itemsPayload?.items ??
          itemsPayload?.products ??
          itemsPayload?.data?.items ??
          (Array.isArray(itemsPayload) ? itemsPayload : null);

        if (Array.isArray(items)) {
          setProducts(items);
          setProductsCurrency(topCurrency);
        } else {
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
  }, [currency, initialProducts, lang]);

  useEffect(() => {
    const fetchPopularSaved = async () => {
      const currentCurrency = currency || 'UAH';
      if (currentCurrency === 'UAH' && initialPopularProducts.length > 0) {
        setPopularProducts(initialPopularProducts.slice(0, 5));
        setPopularCurrency('UAH');
        return;
      }

      try {
        const response = await fetch(
          `/api/v1/items?limit=5&sort=popular&currency=${encodeURIComponent(currentCurrency)}`
        );
        if (!response.ok) {
          setPopularProducts(initialPopularProducts.slice(0, 5));
          setPopularCurrency(currentCurrency === 'USD' ? 'USD' : 'UAH');
          return;
        }

        const data = await response.json();
        const items = data?.items ?? data?.products ?? data?.data?.items ?? data;
        if (Array.isArray(items)) {
          setPopularProducts(items.slice(0, 5));
          setPopularCurrency(currentCurrency === 'USD' ? 'USD' : 'UAH');
        } else {
          setPopularProducts(initialPopularProducts.slice(0, 5));
          setPopularCurrency(currentCurrency === 'USD' ? 'USD' : 'UAH');
        }
      } catch (error) {
        console.error('Error fetching popular saved products:', error);
        setPopularProducts(initialPopularProducts.slice(0, 5));
        setPopularCurrency(currentCurrency === 'USD' ? 'USD' : 'UAH');
      }
    };

    fetchPopularSaved();
  }, [currency, initialPopularProducts]);

  const hasProducts = products.length > 0;

  if (!isMounted) {
    return null;
  }

  const gridVariants = {
    hidden: { opacity: 1 },
    show: {
      opacity: 1,
      transition: reduceMotion ? {} : { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 },
    show: reduceMotion
      ? { opacity: 1, y: 0 }
      : { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
  };

  return (
    <div className="min-h-screen text-foreground" suppressHydrationWarning>
      <div>
        {/* Hero Section */}
        <HomeHero
          h1Title={heroSeo?.h1_title}
          contentText={
            heroSeo?.content_text ??
            t('home.heroSubtitle', 'Compare fashion prices across trusted stores')
          }
          heroTitleLines={[
            t('home.heroTitleLine1', 'Wearsearch'),
            t('home.heroTitleLine2', 'Compare fashion prices'),
            t('home.heroTitleLine3', 'in one place'),
          ]}
          primaryCtaLabel={t('home.heroCtaBrowse', 'Browse categories')}
          primaryCtaHref="#categories-section"
          secondaryCtaLabel={t('home.heroCtaSell', 'Sell clothes')}
          secondaryCtaHref="/contacts"
        />

        <ScrollReveal>
          <section className="py-10 sm:py-14 bg-white text-foreground border-y border-border">
            <div className="w-full px-4 sm:px-6 md:px-12 lg:px-16">
              <header className="flex items-end justify-between gap-4 mb-6 sm:mb-8">
                <div className="text-left">
                  <div className="inline-flex items-center gap-2 mb-2">
                    <div
                      className="w-1.5 h-1.5 rounded-full bg-muted-foreground"
                      aria-hidden="true"
                    />
                    <span className="text-xs sm:text-sm text-muted-foreground/80 uppercase tracking-[0.18em]">
                      {t('home.howItWorksLabel', 'How it works')}
                    </span>
                  </div>
                  <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold">
                    {t('home.howItWorksTitle', 'Find your fit in three steps')}
                  </h2>
                  <p className="text-sm sm:text-base text-muted-foreground/80 mt-2 font-serif">
                    {t('home.howItWorksHint', 'Search, compare, and buy with confidence')}
                  </p>
                </div>
              </header>

              <div className="grid gap-8 md:grid-cols-3">
                {[
                  {
                    step: '01',
                    title: t('home.howItWorksStep1Title', 'Explore products'),
                    text: t(
                      'home.howItWorksStep1Text',
                      'Browse categories or search for the exact item you want.'
                    ),
                  },
                  {
                    step: '02',
                    title: t('home.howItWorksStep2Title', 'Compare prices'),
                    text: t(
                      'home.howItWorksStep2Text',
                      'See offers from multiple stores in one place.'
                    ),
                  },
                  {
                    step: '03',
                    title: t('home.howItWorksStep3Title', 'Buy from the seller'),
                    text: t(
                      'home.howItWorksStep3Text',
                      'Go directly to the store and place your order.'
                    ),
                  },
                ].map(card => (
                  <div key={card.step} className="p-1 sm:p-2">
                    <div className="text-4xl sm:text-5xl font-display font-medium text-muted-foreground/55 mb-2 leading-[0.85] tracking-[-0.03em]">
                      {card.step}
                    </div>
                    <h3 className="text-xl sm:text-2xl font-serif text-foreground mb-2">
                      {card.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed font-serif">
                      {card.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </ScrollReveal>

        <ScrollReveal>
          <section className="py-10 sm:py-14 bg-white text-foreground border-b border-border">
            <div className="w-full px-4 sm:px-6 md:px-12 lg:px-16">
              <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
                <div>
                  <div className="inline-flex items-center gap-2 mb-2">
                    <div
                      className="w-1.5 h-1.5 rounded-full bg-muted-foreground"
                      aria-hidden="true"
                    />
                    <span className="text-xs sm:text-sm text-muted-foreground/80 uppercase tracking-[0.18em]">
                      {t('home.genderLabel', 'Gender edits')}
                    </span>
                  </div>
                  <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">
                    {t('home.shopByGender', 'Shop by gender')}
                  </h2>
                  <p className="text-sm sm:text-base text-muted-foreground/80 mt-2 font-serif">
                    {t('home.genderHint', 'Curated essentials for every style')}
                  </p>
                </div>
              </header>

              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  { slug: 'men', label: t('home.genderMen', 'Men') },
                  { slug: 'women', label: t('home.genderWomen', 'Women') },
                  { slug: 'unisex', label: t('home.genderUnisex', 'Unisex') },
                ].map(item => (
                  <Link
                    key={item.slug}
                    href={`/gender/${item.slug}`}
                    className="group rounded-3xl border border-foreground/10 p-6 sm:p-8 bg-muted/60 hover:bg-muted transition"
                  >
                    <div className="text-lg sm:text-xl font-semibold text-foreground">
                      {item.label}
                    </div>
                    <div className="mt-2 text-sm text-muted-foreground inline-flex items-center gap-2">
                      {t('home.browse', 'Browse')}
                      <ArrowUpRight className="h-4 w-4" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        </ScrollReveal>

        <ScrollReveal>
          <section
            id="categories-section"
            className="py-10 sm:py-16 bg-white text-foreground border-b border-border"
          >
            <div className="w-full px-4 sm:px-6 md:px-12 lg:px-16">
              <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
                <div>
                  <div className="inline-flex items-center gap-2 mb-2">
                    <div
                      className="w-1.5 h-1.5 rounded-full bg-muted-foreground"
                      aria-hidden="true"
                    />
                    <span className="text-xs sm:text-sm text-muted-foreground/80 uppercase tracking-[0.18em]">
                      {t('home.categoriesLabel', 'Categories')}
                    </span>
                  </div>
                  <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">
                    {t('home.shopByCategory', 'Browse by category')}
                  </h2>
                  <p className="text-sm sm:text-base text-muted-foreground/80 mt-2 font-serif">
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
                <div className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-background to-transparent" />
                <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-background to-transparent" />

                <div className="flex gap-4 sm:gap-6 mobile-x-scroll pb-4 -mx-1 px-1 md:flex-wrap md:pb-0 md:mx-0 md:px-0">
                  {categoryCards.map(category => (
                    <Link
                      key={category.id}
                      href={`/products?type=${encodeURIComponent(category.slug)}`}
                      className="group relative min-w-[220px] sm:min-w-[340px] min-h-[160px] sm:min-h-[180px] rounded-3xl bg-muted p-6 sm:p-8 transition md:min-w-0"
                    >
                      <div className="absolute right-6 top-6 text-xs text-muted-foreground opacity-0 transition group-hover:opacity-100">
                        {t('home.open', 'Open')}
                      </div>
                      <div className="h-full flex items-center justify-center text-2xl font-serif text-foreground text-center">
                        {category.name}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </ScrollReveal>

        <ScrollReveal>
          <section className="py-14 sm:py-20 md:py-32 bg-white border-b border-border">
            <div className="w-full px-4 sm:px-6 md:px-12 lg:px-16">
              <header className="flex flex-col sm:flex-row items-start sm:items-end sm:justify-between gap-4 sm:gap-6 mb-10 md:mb-14 text-left">
                <div>
                  <div className="inline-flex items-center gap-2 mb-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-warm-gray" aria-hidden="true" />
                    <span className="text-xs text-warm-gray uppercase tracking-[0.2em]">
                      {t('home.topSavedLabel', 'Top saved')}
                    </span>
                  </div>
                  <h2 className="font-serif text-2xl sm:text-4xl md:text-5xl lg:text-6xl text-earth">
                    {t('home.topSavedTitle', 'Most saved right now')}
                  </h2>
                  <p className="text-sm sm:text-base text-warm-gray mt-3 max-w-xl">
                    {t('home.topSavedHint', 'The top 5 picks loved by the community')}
                  </p>
                </div>
                <Link
                  href="/products?sort=popular"
                  className="text-xs uppercase tracking-[0.2em] text-warm-gray hover:text-earth transition inline-flex items-center gap-2 self-start sm:self-auto"
                >
                  {t('home.viewAllPopular', 'View all')}
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </header>
            </div>

            {shouldAnimate ? (
              <motion.div
                className="w-full px-4 sm:px-6 md:px-12 lg:px-16"
                variants={gridVariants}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: '-100px' }}
              >
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-x-4 sm:gap-x-6 gap-y-8 sm:gap-y-10 md:gap-y-14">
                  {popularProducts.length > 0 ? (
                    popularProducts.slice(0, 5).map((product, index) => (
                      <motion.div
                        key={product.id}
                        variants={itemVariants}
                        className="transition-transform duration-300 hover:-translate-y-1"
                      >
                        <ProductCard
                          id={product.id}
                          name={product.name}
                          image={product.image_url || product.image || ''}
                          price={product.price}
                          minPrice={product.price_min ?? product.min_price}
                          maxPrice={product.max_price ?? product.maxPrice}
                          brand={product.brand}
                          priceCurrency={
                            product.currency === 'USD' || product.currency === 'UAH'
                              ? product.currency
                              : popularCurrency
                          }
                          priority={index < 2}
                        />
                      </motion.div>
                    ))
                  ) : (
                    <div className="col-span-full text-center py-10 text-warm-gray">
                      {t('home.topSavedEmpty', 'No popular products yet')}
                    </div>
                  )}
                </div>
              </motion.div>
            ) : (
              <div className="w-full px-4 sm:px-6 md:px-12 lg:px-16">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-x-4 sm:gap-x-6 gap-y-8 sm:gap-y-10 md:gap-y-14">
                  {popularProducts.length > 0 ? (
                    popularProducts.slice(0, 5).map((product, index) => (
                      <div
                        key={product.id}
                        className="transition-transform duration-300 hover:-translate-y-1"
                      >
                        <ProductCard
                          id={product.id}
                          name={product.name}
                          image={product.image_url || product.image || ''}
                          price={product.price}
                          minPrice={product.price_min ?? product.min_price}
                          maxPrice={product.max_price ?? product.maxPrice}
                          brand={product.brand}
                          priceCurrency={
                            product.currency === 'USD' || product.currency === 'UAH'
                              ? product.currency
                              : popularCurrency
                          }
                          priority={index < 2}
                        />
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full text-center py-10 text-warm-gray">
                      {t('home.topSavedEmpty', 'No popular products yet')}
                    </div>
                  )}
                </div>
              </div>
            )}
          </section>
        </ScrollReveal>

        {/* New Arrivals Section */}
        <ScrollReveal>
          <section id="products-section" className="py-14 sm:py-20 md:py-32 bg-white">
            <div className="w-full px-4 sm:px-6 md:px-12 lg:px-16">
              <header className="flex flex-col sm:flex-row items-start sm:items-end sm:justify-between gap-4 sm:gap-6 mb-10 md:mb-14 text-left">
                <div>
                  <div className="inline-flex items-center gap-2 mb-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-warm-gray" aria-hidden="true" />
                    <span className="text-xs text-warm-gray uppercase tracking-[0.2em]">
                      {t('home.justIn', 'Just In')}
                    </span>
                  </div>
                  <h2 className="font-serif text-2xl sm:text-4xl md:text-5xl lg:text-6xl text-earth">
                    {t('home.newArrivals', 'New Arrivals')}
                  </h2>
                  <p className="text-sm sm:text-base text-warm-gray mt-3 max-w-xl">
                    {t('home.freshPieces', 'Fresh pieces from the latest collections')}
                  </p>
                </div>
              </header>

              {isLoading && (
                <div className="col-span-full text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-earth"></div>
                </div>
              )}
            </div>

            {shouldAnimate ? (
              <motion.div
                className="w-full px-4 sm:px-6 md:px-12 lg:px-16"
                variants={gridVariants}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: '-100px' }}
              >
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-6 gap-y-12 md:gap-y-16">
                  {hasProducts ? (
                    products.slice(0, 12).map((product, index) => (
                      <motion.div
                        key={product.id}
                        variants={itemVariants}
                        className="transition-transform duration-300 hover:-translate-y-1"
                      >
                        <ProductCard
                          id={product.id}
                          name={product.name}
                          image={product.image_url || product.image || ''}
                          price={product.price}
                          minPrice={product.price_min ?? product.min_price}
                          maxPrice={product.max_price ?? product.maxPrice}
                          brand={product.brand}
                          priceCurrency={
                            product.currency === 'USD' || product.currency === 'UAH'
                              ? product.currency
                              : productsCurrency
                          }
                          priority={index < 2}
                        />
                      </motion.div>
                    ))
                  ) : (
                    <div className="col-span-full text-center py-16 px-4">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-sand mb-4">
                        <svg
                          className="w-8 h-8 text-warm-gray"
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
                      <h3 className="text-xl font-serif text-earth mb-2">
                        {t('home.noProductsTitle', 'Немає доступних продуктів')}
                      </h3>
                      <p className="text-warm-gray mb-4 max-w-md mx-auto">
                        {t(
                          'home.noProductsDescription',
                          'Підключіть backend сервер для завантаження продуктів.'
                        )}
                        <br />
                        {t('home.noProductsHint', 'Перевірте NEXT_PUBLIC_API_URL в .env файлі.')}
                      </p>
                      <div className="text-sm text-warm-gray font-mono bg-sand rounded-none p-4 max-w-lg mx-auto">
                        <div className="text-left">
                          <div className="text-earth mb-2">
                            {t('home.noProductsExpected', 'Очікується:')}
                          </div>
                          <div>NEXT_PUBLIC_API_URL=https://api.yourdomain.com</div>
                          <div className="mt-3 text-earth mb-2">
                            {t('home.noProductsBackend', 'Або запустіть backend:')}
                          </div>
                          <div>cd backend && npm run dev</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ) : (
              <div className="w-full px-4 sm:px-6 md:px-12 lg:px-16">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-6 gap-y-12 md:gap-y-16">
                  {hasProducts ? (
                    products.slice(0, 12).map((product, index) => (
                      <div
                        key={product.id}
                        className="transition-transform duration-300 hover:-translate-y-1"
                      >
                        <ProductCard
                          id={product.id}
                          name={product.name}
                          image={product.image_url || product.image || ''}
                          price={product.price}
                          minPrice={product.price_min ?? product.min_price}
                          maxPrice={product.max_price ?? product.maxPrice}
                          brand={product.brand}
                          priceCurrency={
                            product.currency === 'USD' || product.currency === 'UAH'
                              ? product.currency
                              : productsCurrency
                          }
                          priority={index < 2}
                        />
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full text-center py-16 px-4">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-sand mb-4">
                        <svg
                          className="w-8 h-8 text-warm-gray"
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
                      <h3 className="text-xl font-serif text-earth mb-2">
                        {t('home.noProductsTitle', 'Немає доступних продуктів')}
                      </h3>
                      <p className="text-warm-gray mb-4 max-w-md mx-auto">
                        {t(
                          'home.noProductsDescription',
                          'Підключіть backend сервер для завантаження продуктів.'
                        )}
                        <br />
                        {t('home.noProductsHint', 'Перевірте NEXT_PUBLIC_API_URL в .env файлі.')}
                      </p>
                      <div className="text-sm text-warm-gray font-mono bg-sand rounded-none p-4 max-w-lg mx-auto">
                        <div className="text-left">
                          <div className="text-earth mb-2">
                            {t('home.noProductsExpected', 'Очікується:')}
                          </div>
                          <div>NEXT_PUBLIC_API_URL=https://api.yourdomain.com</div>
                          <div className="mt-3 text-earth mb-2">
                            {t('home.noProductsBackend', 'Або запустіть backend:')}
                          </div>
                          <div>cd backend && npm run dev</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="max-w-[1800px] mx-auto px-4 sm:px-6 md:px-12 lg:px-16">
              <ViewAllButton label={t('home.viewAllProducts', 'View All Products')} />
            </div>
          </section>
        </ScrollReveal>

        {/* Recently Viewed Section */}
        <ScrollReveal>
          <section className="py-8 sm:py-12 bg-white border-t border-border">
            <div className="w-full px-4 sm:px-6 md:px-12 lg:px-16">
              <RecentlyViewedProducts maxItems={8} showClearButton={true} />
            </div>
          </section>
        </ScrollReveal>
      </div>
    </div>
  );
}
