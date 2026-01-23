'use client';

import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { useState, useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Edit, Package, Tag, ZoomIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LazySection } from '@/components/common/LazySection';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { useToast } from '@/hooks/use-toast';
import { convertS3UrlToHttps } from '@/lib/utils';
import { FavoriteButton } from '@/components/FavoriteButton';
import dynamic from 'next/dynamic';
import ShareButton from '@/components/ShareButton';
const ProductStoresPanel = dynamic(() => import('@/components/ProductStoresPanel'), {
  ssr: false,
  loading: () => null,
});
const RecentlyViewedProducts = dynamic(() => import('@/components/RecentlyViewedProducts'), {
  ssr: false,
  loading: () => null,
});

const SimilarProducts = dynamic(() => import('@/components/SimilarProducts'), {
  ssr: false,
  loading: () => null,
});

const RelatedProducts = dynamic(
  () => import('@/components/RelatedProducts').then(mod => mod.RelatedProducts),
  { ssr: false, loading: () => null }
);
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed';
import { trackInteraction } from '@/hooks/useRecommendations';
import { translateGender } from '@/utils/errorTranslation';
import { getCategoryTranslation, getColorTranslation } from '@/utils/translations';
import { useProductDetailData } from '@/hooks/useAggregatedData';
import { useSEO } from '@/hooks/useSEO';
import { seoApi, type SEOData } from '@/services/api/seo.api';
import { useCurrencyConversion } from '@/hooks/useCurrencyConversion';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useAuth } from '@/features/auth/hooks/useAuth';
import type { Product } from '@/types';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function getFirstString(...values: unknown[]): string | null {
  for (const value of values) {
    if (typeof value === 'string' && value.trim() !== '') return value;
  }
  return null;
}

type DetailData = {
  product?: unknown;
  stores?: unknown;
  brand?: unknown;
  relatedProducts?: unknown;
};

type NormalizedStore = Record<string, unknown> & {
  id: string;
  name: string;
  price: number | null;
  sizes: string[];
  telegram_url?: string | null;
  instagram_url?: string | null;
  shipping_info?: string | null;
  is_recommended?: boolean;
  logo_url?: string | null;
};

const normalizeProductRecord = (raw: unknown): Product | null => {
  if (!isRecord(raw)) return null;
  const id = String(raw.id ?? raw.product_id ?? raw.uuid ?? '').trim();
  if (!id) return null;
  const name = typeof raw.name === 'string' ? raw.name : String(raw.title ?? '');

  return {
    ...raw,
    id,
    name,
    brand:
      typeof raw.brand === 'string'
        ? raw.brand
        : isRecord(raw.brands) && typeof raw.brands.name === 'string'
          ? raw.brands.name
          : undefined,
    category:
      typeof raw.category === 'string'
        ? raw.category
        : typeof raw.type === 'string'
          ? raw.type
          : undefined,
    type:
      typeof raw.type === 'string'
        ? raw.type
        : typeof raw.category === 'string'
          ? raw.category
          : undefined,
    image_url: typeof raw.image_url === 'string' ? raw.image_url : undefined,
    image: typeof raw.image === 'string' ? raw.image : undefined,
    price: (raw.price ?? raw.min_price ?? raw.max_price) as Product['price'],
    description: typeof raw.description === 'string' ? raw.description : undefined,
    description_ua: typeof raw.description_ua === 'string' ? raw.description_ua : undefined,
    description_en: typeof raw.description_en === 'string' ? raw.description_en : undefined,
    gender: typeof raw.gender === 'string' ? raw.gender : undefined,
  } as Product;
};

const ProductDetail = () => {
  const params = useParams();
  const id = params?.id as string | undefined;
  const { toast } = useToast();
  const router = useRouter();
  const { t } = useTranslation();
  const { formatPrice } = useCurrencyConversion();
  const { currency } = useCurrency();
  const { isAuthenticated, isAdmin: authIsAdmin } = useAuth();
  const selectedImage = 0; // Currently always showing first image
  const isAdmin = isAuthenticated && authIsAdmin;
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Dynamic SEO from API
  const [seoData, setSeoData] = useState<SEOData | null>(null);

  // Store filters
  const [storeSearch, setStoreSearch] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'price-asc' | 'price-desc'>('name');
  const [showRecommendedOnly, setShowRecommendedOnly] = useState(false);
  const [currentStorePage, setCurrentStorePage] = useState(1);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterButtonRef = useRef<HTMLButtonElement>(null);
  const filterDropdownRef = useRef<HTMLDivElement>(null);
  const storesPerPage = 3;

  // Use aggregated hook for better performance (3 requests → 1 request)
  const {
    data: detailData,
    isLoading: detailLoading,
    error: productError,
  } = useProductDetailData(id || '', currency);

  const detail = detailData && typeof detailData === 'object' ? (detailData as DetailData) : {};

  // Extract data from aggregated response
  const productData = detail.product;
  const storesData = detail.stores;
  const brandData = detail.brand;
  const productLoading = detailLoading;

  // Extract product from response
  const product = useMemo<Product | null>(() => {
    if (!productData) return null;

    // Handle both response formats
    if (isRecord(productData) && productData.success) {
      const data = isRecord(productData.data) ? productData.data : productData;
      return normalizeProductRecord(data);
    }
    if (isRecord(productData)) {
      return normalizeProductRecord(productData);
    }

    return null;
  }, [productData]);

  // Fetch SEO data when product ID changes
  useEffect(() => {
    if (!id) return;

    const fetchSEO = async () => {
      try {
        const data = await seoApi.getProductSEO(id);
        setSeoData(data);
      } catch (error) {
        console.error('Failed to fetch product SEO:', error);
      }
    };

    fetchSEO();
  }, [id]);

  useSEO({
    title:
      seoData?.meta_title ||
      (product?.name ? String(product.name) : t('product.seoTitle', 'Product')),
    description:
      seoData?.meta_description ||
      (product?.description
        ? String(product.description)
        : t('product.seoDescription', 'View product details and compare prices across stores.')),
    keywords: seoData?.keywords || 'product, fashion, stores, prices',
    type: 'product',
    image: product?.image_url || product?.image,
    canonical:
      seoData?.canonical_url || (product as { canonical_url?: string } | null)?.canonical_url,
  });

  // Extract brand from aggregated response
  const brand = useMemo(() => {
    if (!brandData) return null;

    if (isRecord(brandData) && brandData.success && brandData.data) {
      return isRecord(brandData.data) ? brandData.data : brandData;
    }
    if (isRecord(brandData) && brandData.id) {
      return brandData;
    }

    return null;
  }, [brandData]);

  // Extract stores array
  const stores = useMemo<NormalizedStore[]>(() => {
    // Helper function to parse sizes from various formats
    const parseSizes = (rawSizes: unknown): string[] => {
      if (Array.isArray(rawSizes)) {
        return rawSizes
          .map(String)
          .map(s => s.trim())
          .filter(Boolean);
      }

      if (typeof rawSizes === 'string') {
        const trimmed = rawSizes.trim();

        // Try parsing as JSON array
        if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
          try {
            const parsed: unknown = JSON.parse(trimmed);
            if (Array.isArray(parsed)) {
              return parsed
                .map(String)
                .map(s => s.trim())
                .filter(Boolean);
            }
          } catch {
            // ignore parse error
          }
        }

        // Try parsing as comma-separated
        if (trimmed.includes(',')) {
          return trimmed
            .split(',')
            .map(s => s.trim())
            .filter(Boolean);
        }

        // Single value
        if (trimmed) {
          return [trimmed];
        }
      }

      return [];
    };

    // Helper function to extract price from various field names
    const extractPrice = (storeRecord: Record<string, unknown>): number | null => {
      const rawPrice =
        storeRecord['product_price'] ??
        storeRecord['price'] ??
        storeRecord['item_price'] ??
        storeRecord['store_price'] ??
        null;

      const numericPrice =
        rawPrice != null && (typeof rawPrice === 'string' || typeof rawPrice === 'number')
          ? Number.parseFloat(String(rawPrice))
          : null;

      return numericPrice != null && !Number.isNaN(numericPrice) ? numericPrice : null;
    };

    // The stores from the API might have price in different fields
    const rawStores = Array.isArray(storesData) ? (storesData as unknown[]) : [];

    const normalized = rawStores.map((store: unknown): NormalizedStore => {
      const storeRecord: Record<string, unknown> = isRecord(store) ? store : {};

      const storesObj = isRecord(storeRecord['stores']) ? storeRecord['stores'] : undefined;

      const rawId =
        storeRecord['id'] ?? storeRecord['store_id'] ?? (storesObj ? storesObj['id'] : undefined);
      const id = typeof rawId === 'string' || typeof rawId === 'number' ? String(rawId) : '';

      const rawName =
        storeRecord['name'] ??
        storeRecord['store_name'] ??
        (storesObj ? storesObj['name'] : undefined);
      const name = typeof rawName === 'string' ? rawName : '';

      const finalPrice = extractPrice(storeRecord);
      const rawSizes = storeRecord['sizes'] ?? storeRecord['available_sizes'];
      const sizes = parseSizes(rawSizes);

      return {
        ...storeRecord,
        id,
        name,
        price: finalPrice,
        sizes,
        // Normalize URL fields
        telegram_url: getFirstString(storeRecord['telegram_url'], storeRecord['telegram']),
        instagram_url: getFirstString(storeRecord['instagram_url'], storeRecord['instagram']),
        shipping_info: getFirstString(
          storeRecord['shipping_info'],
          storeRecord['shipping'],
          storeRecord['location']
        ),
        is_recommended: Boolean(
          storeRecord['is_recommended'] ??
          storeRecord['recommended'] ??
          storeRecord['isRecommended']
        ),
        logo_url: getFirstString(storeRecord['logo_url'], storeRecord['logo']),
      };
    });

    return normalized;
  }, [storesData]);

  const relatedProducts = useMemo(() => {
    if (!isRecord(detailData)) return undefined;
    const value = detailData['relatedProducts'];
    return Array.isArray(value) ? value : undefined;
  }, [detailData]);

  const brandName = useMemo(() => {
    if (brand && isRecord(brand) && typeof brand.name === 'string') {
      return brand.name;
    }
    if (product?.brand) return product.brand;
    return null;
  }, [brand, product]);

  // Track recently viewed products and interactions
  const { addItem: addToRecentlyViewed } = useRecentlyViewed();

  useEffect(() => {
    if (product) {
      addToRecentlyViewed(product);
      // Track view interaction for recommendations
      trackInteraction(product.id, 'view');
    }
  }, [product, addToRecentlyViewed]);

  // Admin status handled by auth hook

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isFilterOpen &&
        filterDropdownRef.current &&
        filterButtonRef.current &&
        !filterDropdownRef.current.contains(event.target as Node) &&
        !filterButtonRef.current.contains(event.target as Node)
      ) {
        setIsFilterOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isFilterOpen]);

  // Handle product loading error
  useEffect(() => {
    if (productError) {
      toast({
        title: 'Error',
        description: 'Failed to load product',
        variant: 'destructive',
      });
    }
  }, [productError, toast]);

  // Filter and sort stores using useMemo
  const filteredStores = useMemo(() => {
    let filtered = [...stores];

    // Search filter
    if (storeSearch) {
      filtered = filtered.filter(store =>
        store.name.toLowerCase().includes(storeSearch.toLowerCase())
      );
    }

    // Sort - when showRecommendedOnly is true, show recommended first, then others
    filtered.sort((a, b) => {
      // If showRecommendedOnly is active, prioritize recommended stores
      if (showRecommendedOnly) {
        if (a.is_recommended && !b.is_recommended) return -1;
        if (!a.is_recommended && b.is_recommended) return 1;
      }

      // Then apply the selected sort
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'price-asc':
          return (a.price || 0) - (b.price || 0);
        case 'price-desc':
          return (b.price || 0) - (a.price || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [stores, storeSearch, sortBy, showRecommendedOnly]);

  // Paginate stores
  const paginatedStores = useMemo(() => {
    const startIndex = (currentStorePage - 1) * storesPerPage;
    return filteredStores.slice(startIndex, startIndex + storesPerPage);
  }, [filteredStores, currentStorePage, storesPerPage]);

  // Get price range from stores
  const priceRange = useMemo(() => {
    if (stores.length === 0) return null;

    const prices = stores.map(s => s.price).filter(p => p != null);
    if (prices.length === 0) return null;

    const min = Math.min(...prices);
    const max = Math.max(...prices);

    if (min === max) return formatPrice(min);
    return `${formatPrice(min)} - ${formatPrice(max)}`;
  }, [stores, formatPrice]);

  // Loading state
  if (productLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-2 border-foreground border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center">
        <h2 className="font-display text-2xl font-bold mb-4">Product Not Found</h2>
        <Button onClick={() => router.push('/')} className="rounded-full">
          Go Home
        </Button>
      </div>
    );
  }

  const productImages = product.image_url ? [product.image_url] : [];
  const httpsImageUrl = convertS3UrlToHttps(productImages[selectedImage] || '/placeholder.svg');

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <div className="container mx-auto px-4 sm:px-6 py-12 pt-28">
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            { label: t('nav.products', 'Products'), href: '/products' },
            {
              label: product?.type
                ? getCategoryTranslation(product.type)
                : t('nav.product', 'Product'),
              href: product?.type ? `/products?type=${product.type}` : undefined,
            },
            { label: product?.name || t('nav.product', 'Product') },
          ]}
          className="mb-6"
        />

        {/* Back Button & Edit */}
        <div className="flex justify-between items-center mb-8">
          <Button variant="ghost" onClick={() => router.back()} className="group">
            <ArrowLeft className="w-4 h-4 mr-2 md:group-hover:-translate-x-1 transition-transform" />
            {t('common.back')}
          </Button>

          {isAdmin && (
            <Button
              variant="outline"
              onClick={() => router.push(`/admin?editProduct=${id}`)}
              className="gap-2"
            >
              <Edit className="w-4 h-4" />
              {t('products.editProduct')}
            </Button>
          )}
        </div>

        {/* Product Layout - Two Columns (big image, right sidebar) */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr,360px] gap-8 mb-16 items-start">
          {/* Left: Image & Details */}
          <div className="space-y-8">
            {/* Image Section */}
            <div className="relative animate-fade-in">
              <div className="relative rounded-3xl overflow-hidden border border-transparent bg-transparent group">
                {product && (
                  <div className="absolute top-4 right-4 z-10 flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsLightboxOpen(true)}
                      className="w-12 h-12 rounded-full bg-foreground/80 text-background backdrop-blur-sm md:hover:bg-foreground md:hover:text-background active:bg-foreground active:text-background transition-all dark:bg-black/60 dark:text-white dark:md:hover:bg-white dark:md:hover:text-black dark:active:bg-white dark:active:text-black"
                      title={t('products.zoomImage', 'Click to zoom')}
                    >
                      <ZoomIn className="w-5 h-5" />
                    </Button>
                    <FavoriteButton
                      productId={String(id)}
                      variant="ghost"
                      className="w-12 h-12 rounded-full bg-foreground/80 text-background backdrop-blur-sm md:hover:bg-foreground md:hover:text-background active:bg-foreground active:text-background transition-all dark:bg-black/60 dark:text-white dark:md:hover:bg-white dark:md:hover:text-black dark:active:bg-white dark:active:text-black"
                    />
                    <ShareButton
                      title={product.name}
                      description={product.description}
                      variant="ghost"
                      className="w-12 h-12 rounded-full bg-foreground/80 text-background backdrop-blur-sm md:hover:bg-foreground md:hover:text-background active:bg-foreground active:text-background transition-all dark:bg-black/60 dark:text-white dark:md:hover:bg-white dark:md:hover:text-black dark:active:bg-white dark:active:text-black"
                      productImage={httpsImageUrl}
                      productName={product.name}
                    />
                  </div>
                )}
                <button
                  type="button"
                  className="relative w-full rounded-3xl flex items-center justify-center p-6 sm:p-8 lg:p-10 cursor-zoom-in border-0"
                  style={{
                    background: 'var(--product-media-bg)',
                  }}
                  onClick={() => setIsLightboxOpen(true)}
                  aria-label={t('products.zoomImage', 'Click to zoom image')}
                >
                  <Image
                    src={httpsImageUrl}
                    alt={product.name}
                    width={1200}
                    height={1600}
                    priority
                    sizes="(max-width: 768px) 90vw, (max-width: 1200px) 60vw, 50vw"
                    className="max-h-[68vh] sm:max-h-[72vh] lg:max-h-[80vh] w-auto object-contain transition-transform duration-300 group-hover:scale-[1.02]"
                    draggable={false}
                  />
                </button>
              </div>
            </div>

            {/* Image Lightbox */}
            {isLightboxOpen && (
              <ProductImageViewer
                isOpen={isLightboxOpen}
                onClose={() => setIsLightboxOpen(false)}
                images={
                  productImages.length > 0
                    ? productImages.map(convertS3UrlToHttps)
                    : [httpsImageUrl]
                }
                initialIndex={selectedImage}
                alt={product.name}
              />
            )}

            {/* Product Info */}
            <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              {/* Brand */}
              {brandName && (
                <p className="text-xs sm:text-sm text-muted-foreground uppercase tracking-[0.15em] sm:tracking-[0.2em] mb-2 sm:mb-3">
                  {brandName}
                </p>
              )}

              {/* Title */}
              <h1 className="font-display text-2xl sm:text-3xl md:text-5xl font-bold tracking-tight mb-4">
                {product.name}
              </h1>

              {/* Details */}
              <div className="space-y-2 sm:space-y-3 mb-6 sm:mb-8">
                {product.type && (
                  <div className="flex items-center gap-2 sm:gap-3">
                    <Tag className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground flex-shrink-0" />
                    <span className="text-xs sm:text-sm text-muted-foreground">
                      {t('products.category')}:
                    </span>
                    <span className="text-sm sm:text-base font-medium capitalize">
                      {getCategoryTranslation(product.type)}
                    </span>
                  </div>
                )}
                {product.color && (
                  <div className="flex items-center gap-2 sm:gap-3">
                    <Package className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground flex-shrink-0" />
                    <span className="text-xs sm:text-sm text-muted-foreground">
                      {t('products.color')}:
                    </span>
                    <span className="text-sm sm:text-base font-medium capitalize">
                      {getColorTranslation(product.color)}
                    </span>
                  </div>
                )}
                {product.gender && (
                  <div className="flex items-center gap-2 sm:gap-3">
                    <Package className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground flex-shrink-0" />
                    <span className="text-xs sm:text-sm text-muted-foreground">
                      {t('products.gender')}:
                    </span>
                    <span className="text-sm sm:text-base font-medium capitalize">
                      {translateGender(product.gender)}
                    </span>
                  </div>
                )}
              </div>

              {/* Description */}
              {product.description && (
                <div className="mb-8 p-6 rounded-xl border border-border/50 bg-card/40 backdrop-blur-sm">
                  <h3 className="font-semibold mb-2">{t('productDetail.description')}</h3>
                  <p className="text-muted-foreground leading-relaxed">{product.description}</p>
                </div>
              )}
            </div>
          </div>

          {/* Right: Stores Sidebar */}
          <LazySection minHeight="520px" rootMargin="200px">
            <ProductStoresPanel
              priceRange={priceRange}
              stores={stores}
              filteredStores={filteredStores}
              paginatedStores={paginatedStores}
              storeSearch={storeSearch}
              setStoreSearch={setStoreSearch}
              showRecommendedOnly={showRecommendedOnly}
              setShowRecommendedOnly={setShowRecommendedOnly}
              sortBy={sortBy}
              setSortBy={setSortBy}
              currentStorePage={currentStorePage}
              setCurrentStorePage={setCurrentStorePage}
              storesPerPage={storesPerPage}
              isFilterOpen={isFilterOpen}
              setIsFilterOpen={setIsFilterOpen}
              filterButtonRef={filterButtonRef}
              filterDropdownRef={filterDropdownRef}
              isAdmin={isAdmin}
              t={t}
              formatPrice={formatPrice}
            />
          </LazySection>
        </div>

        {/* Recently Viewed Products */}
        <LazySection minHeight="220px" rootMargin="200px">
          <RecentlyViewedProducts
            className="mb-16 animate-fade-in-up"
            maxItems={6}
            excludeProductId={id}
          />
        </LazySection>

        {/* Similar Products Section (from API) */}
        {product && id && (
          <LazySection minHeight="220px" rootMargin="200px">
            <SimilarProducts productId={id} limit={6} className="mb-16 animate-fade-in-up" />
          </LazySection>
        )}

        {/* Related Products Section */}
        {product && (
          <LazySection minHeight="220px" rootMargin="200px">
            <RelatedProducts
              productId={String(id)}
              products={relatedProducts}
              className="mb-16 animate-fade-in-up"
            />
          </LazySection>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
const ProductImageViewer = dynamic(
  () => import('@/components/ProductImageViewer').then(mod => mod.ProductImageViewer),
  {
    ssr: false,
    loading: () => null,
  }
);
