'use client';

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Edit, Package, Tag, MapPin, Search, Filter, ChevronDown, SortAsc, Star, Send, X, ZoomIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { useToast } from "@/hooks/use-toast";
import { convertS3UrlToHttps } from "@/lib/utils";
import { FavoriteButton } from "@/components/FavoriteButton";
import { RelatedProducts } from "@/components/RelatedProducts";
import ShareButton from "@/components/ShareButton";
import { SaveStoreButton } from "@/components/SaveStoreButton";
import RecentlyViewedProducts from "@/components/RecentlyViewedProducts";
import SimilarProducts from "@/components/SimilarProducts";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import { trackInteraction } from "@/hooks/useRecommendations";
import { translateGender } from "@/utils/errorTranslation";
import { getCategoryTranslation, getColorTranslation } from "@/utils/translations";
import { useProductDetailData } from "@/hooks/useAggregatedData";
import { ImageLightbox } from "@/components/ImageLightbox";
import { useSEO } from "@/hooks/useSEO";
import { logError } from "@/services/logger";
import { seoApi, type SEOData } from "@/services/api/seo.api";
import { useCurrencyConversion } from "@/hooks/useCurrencyConversion";
import { useCurrency } from "@/contexts/CurrencyContext";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getFirstString(...values: unknown[]): string | null {
  for (const value of values) {
    if (typeof value === "string" && value.trim() !== "") return value;
  }
  return null;
}

const ProductDetail = () => {
  const params = useParams();
  const id = params?.id as string | undefined;
  const { toast } = useToast();
  const router = useRouter();
  const { t } = useTranslation();
  const { formatPrice } = useCurrencyConversion();
  const { currency } = useCurrency();
  const [selectedImage, _setSelectedImage] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  
  // Dynamic SEO from API
  const [seoData, setSeoData] = useState<SEOData | null>(null);
  
  // Store filters
  const [storeSearch, setStoreSearch] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "price-asc" | "price-desc">("name");
  const [showRecommendedOnly, setShowRecommendedOnly] = useState(false);
  const [currentStorePage, setCurrentStorePage] = useState(1);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterButtonRef = useRef<HTMLButtonElement>(null);
  const filterDropdownRef = useRef<HTMLDivElement>(null);
  const storesPerPage = 3;

  // Use aggregated hook for better performance (3 requests ΓåÆ 1 request)
  const { data: detailData, isLoading: detailLoading, error: productError } = useProductDetailData(id || '', currency);
  
  // Extract data from aggregated response
  const productData = detailData?.product;
  const storesData = detailData?.stores;
  const brandData = detailData?.brand;
  const productLoading = detailLoading;
  
  // Extract product from response
  const product = useMemo(() => {
    if (!productData) return null;
    
    // Handle both response formats
    if (productData.success) {
      const data = productData.data || productData;
      delete data.success;
      return data;
    } else if (productData.id) {
      return productData;
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
    title: seoData?.meta_title || (product?.name ? String(product.name) : t('product.seoTitle', 'Product')),
    description: seoData?.meta_description || (product?.description
      ? String(product.description)
      : t('product.seoDescription', 'View product details and compare prices across stores.')),
    keywords: seoData?.keywords || 'product, fashion, stores, prices',
    type: 'product',
    image: product?.image_url || product?.image,
    canonical: seoData?.canonical_url,
  });
  
  // Extract brand from aggregated response
  const brand = useMemo(() => {
    if (!brandData) return null;
    
    if (brandData.success && brandData.data) {
      return brandData.data;
    } else if (brandData.id) {
      return brandData;
    }
    
    return null;
  }, [brandData]);
  
  // Extract stores array
  const stores = useMemo(() => {
    // The stores from the API might have price in different fields
    const rawStores = Array.isArray(storesData) ? (storesData as unknown[]) : [];
    
    const normalized = rawStores.map((store: unknown) => {
      const storeRecord: Record<string, unknown> = isRecord(store) ? store : {};

      const storesObj = isRecord(storeRecord["stores"]) ? (storeRecord["stores"] as Record<string, unknown>) : undefined;

      const rawId = storeRecord["id"] ?? storeRecord["store_id"] ?? (storesObj ? storesObj["id"] : undefined);
      const id = typeof rawId === "string" || typeof rawId === "number" ? String(rawId) : "";

      const rawName = storeRecord["name"] ?? storeRecord["store_name"] ?? (storesObj ? storesObj["name"] : undefined);
      const name = typeof rawName === "string" ? rawName : "";

      // Try multiple possible price field names from backend
      const rawPrice =
        storeRecord["product_price"] ??
        storeRecord["price"] ??
        storeRecord["item_price"] ??
        storeRecord["store_price"] ??
        null;
      // Convert to number if it's a string
      const numericPrice = rawPrice != null ? parseFloat(String(rawPrice)) : null;
      const finalPrice = numericPrice != null && !isNaN(numericPrice) ? numericPrice : null;

      const rawSizes = storeRecord["sizes"] ?? storeRecord["available_sizes"];
      let sizes: string[] = [];
      if (Array.isArray(rawSizes)) {
        sizes = rawSizes.map(String).map((s) => s.trim()).filter(Boolean);
      } else if (typeof rawSizes === "string") {
        const trimmed = rawSizes.trim();
        if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
          try {
            const parsed: unknown = JSON.parse(trimmed);
            if (Array.isArray(parsed)) {
              sizes = parsed.map(String).map((s) => s.trim()).filter(Boolean);
            }
          } catch {
            // ignore
          }
        } else if (trimmed.includes(",")) {
          sizes = trimmed.split(",").map((s) => s.trim()).filter(Boolean);
        } else if (trimmed) {
          sizes = [trimmed];
        }
      }
      
      return {
        ...storeRecord,
        id,
        name,
        price: finalPrice,
        sizes,
        // Normalize URL fields
        telegram_url: getFirstString(storeRecord["telegram_url"], storeRecord["telegram"]),
        instagram_url: getFirstString(storeRecord["instagram_url"], storeRecord["instagram"]),
        shipping_info: getFirstString(storeRecord["shipping_info"], storeRecord["shipping"], storeRecord["location"]),
      };
    });
    
    return normalized;
  }, [storesData]);

  const relatedProducts = useMemo(() => {
    if (!isRecord(detailData)) return undefined;
    const value = detailData["relatedProducts"];
    return Array.isArray(value) ? value : undefined;
  }, [detailData]);

  // Track recently viewed products and interactions
  const { addItem: addToRecentlyViewed } = useRecentlyViewed();
  
  useEffect(() => {
    if (product) {
      addToRecentlyViewed(product);
      // Track view interaction for recommendations
      trackInteraction(product.id, 'view');
    }
  }, [product, addToRecentlyViewed]);
  
  // Check admin status once
  useEffect(() => {
    // First try to get from localStorage user
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setIsAdmin(user.role === 'admin');
        return;
      } catch (_e) {
        logError(new Error('Failed to parse user data'), { component: 'ProductDetail', action: 'PARSE_USER' });
      }
    }
    
    // Fallback: try to decode token
    const token = localStorage.getItem('access_token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setIsAdmin(payload.role === 'admin');
      } catch (_e) {
        setIsAdmin(false);
      }
    }
  }, []);
  
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
        title: "Error",
        description: "Failed to load product",
        variant: "destructive",
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
        case "name":
          return a.name.localeCompare(b.name);
        case "price-asc":
          return (a.price || 0) - (b.price || 0);
        case "price-desc":
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
        <Button onClick={() => router.push('/')} className="rounded-full">Go Home</Button>
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
            { label: product?.type ? getCategoryTranslation(product.type) : t('nav.product', 'Product'), href: product?.type ? `/products?type=${product.type}` : undefined },
            { label: product?.name || t('nav.product', 'Product') },
          ]}
          className="mb-6"
        />

        {/* Back Button & Edit */}
        <div className="flex justify-between items-center mb-8">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="group"
          >
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
                      className="w-12 h-12 rounded-full bg-black/60 backdrop-blur-sm text-white md:hover:bg-white md:hover:text-black active:bg-white active:text-black transition-all"
                      title={t('products.zoomImage', 'Click to zoom')}
                    >
                      <ZoomIn className="w-5 h-5" />
                    </Button>
                    <FavoriteButton 
                      productId={String(id)}
                      variant="ghost"
                      className="w-12 h-12 rounded-full bg-black/60 backdrop-blur-sm text-white md:hover:bg-white md:hover:text-black active:bg-white active:text-black transition-all"
                    />
                    <ShareButton
                      title={product.name}
                      description={product.description}
                      variant="ghost"
                      className="w-12 h-12 rounded-full bg-black/60 backdrop-blur-sm text-white md:hover:bg-white md:hover:text-black active:bg-white active:text-black transition-all"
                      productImage={httpsImageUrl}
                      productName={product.name}
                    />
                  </div>
                )}
                <div 
                  className="w-full rounded-3xl flex items-center justify-center p-8 cursor-zoom-in" 
                  style={{
                    background: 'radial-gradient(circle at 20% 30%, rgba(255,255,255,0.08) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(255,255,255,0.06) 0%, transparent 50%), linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(20,20,20,0.95) 100%)'
                  }}
                  onClick={() => setIsLightboxOpen(true)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && setIsLightboxOpen(true)}
                  aria-label={t('products.zoomImage', 'Click to zoom image')}
                >
                  <img
                    src={httpsImageUrl}
                    alt={product.name}
                    className="max-h-[72vh] object-contain transition-transform duration-300 group-hover:scale-[1.02]"
                    loading="lazy"
                    draggable={false}
                  />
                </div>
              </div>
            </div>

            {/* Image Lightbox */}
            <ImageLightbox
              src={httpsImageUrl}
              alt={product.name}
              isOpen={isLightboxOpen}
              onClose={() => setIsLightboxOpen(false)}
              images={productImages.map(convertS3UrlToHttps)}
              initialIndex={selectedImage}
            />

            {/* Product Info */}
            <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              {/* Brand */}
              {(brand?.name || product.brand) && (
                <p className="text-xs sm:text-sm text-muted-foreground uppercase tracking-[0.15em] sm:tracking-[0.2em] mb-2 sm:mb-3">
                  {brand?.name || product.brand}
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
                    <span className="text-xs sm:text-sm text-muted-foreground">{t('products.category')}:</span>
                    <span className="text-sm sm:text-base font-medium capitalize">{getCategoryTranslation(product.type)}</span>
                  </div>
                )}
                {product.color && (
                  <div className="flex items-center gap-2 sm:gap-3">
                    <Package className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground flex-shrink-0" />
                    <span className="text-xs sm:text-sm text-muted-foreground">{t('products.color')}:</span>
                    <span className="text-sm sm:text-base font-medium capitalize">{getColorTranslation(product.color)}</span>
                  </div>
                )}
                {product.gender && (
                  <div className="flex items-center gap-2 sm:gap-3">
                    <Package className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground flex-shrink-0" />
                    <span className="text-xs sm:text-sm text-muted-foreground">{t('products.gender')}:</span>
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
          <div id="stores-section" className="h-fit animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <div className="rounded-2xl border border-white/6 bg-white/5 p-6">
              {/* Price Range - Moved Here */}
              <div className="mb-6 pb-6 border-b border-border/50">
                <div className="flex items-baseline gap-2 mb-2">
                  {priceRange ? (
                    <span className="font-display text-3xl font-extrabold">{priceRange}</span>
                  ) : (
                    <span className="font-display text-2xl font-bold text-white/60">Price N/A</span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{t('productDetail.priceRangeAcrossStores')}</p>
              </div>

              {/* Header */}
              <div className="mb-6">
                <h2 className="font-display text-2xl font-bold mb-2">{t('productDetail.availableAt')}</h2>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>{stores.length} {t('productDetail.stores')}</span>
                </div>
              </div>

              {/* Search & Filters */}
              {stores.length > 0 && (
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6 pb-6 border-b border-white/6">
                  {/* Search */}
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder={t('productDetail.searchStores')}
                      value={storeSearch}
                      onChange={(e) => setStoreSearch(e.target.value)}
                      className="pl-10 bg-black/30 border-white/6 text-white h-10"
                    />
                  </div>

                  {/* Filter Dropdown - Custom */}
                  <div className="relative">
                    <Button 
                      ref={filterButtonRef}
                      variant="outline" 
                      size="default" 
                      className="border-white/20 bg-black/30 text-white hover:bg-black/50 hover:border-white/30 w-full sm:w-auto h-10"
                      onClick={() => setIsFilterOpen(!isFilterOpen)}
                    >
                      <Filter className="w-4 h-4 mr-2" />
                      <span className="sm:inline">{t('products.filters')}</span>
                      {(showRecommendedOnly || sortBy !== 'name') && (
                        <span className="ml-2 bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold">
                          {(showRecommendedOnly ? 1 : 0) + (sortBy !== 'name' ? 1 : 0)}
                        </span>
                      )}
                    </Button>

                    {/* Custom Dropdown Menu */}
                    {isFilterOpen && (
                      <div 
                        ref={filterDropdownRef}
                        className="absolute left-0 top-full mt-2 w-64 max-h-[80vh] overflow-y-auto z-[1100] rounded-2xl border border-white/10 bg-zinc-900/95 backdrop-blur-2xl text-white p-1.5 shadow-[0_8px_32px_rgba(0,0,0,0.4)] animate-in fade-in-0 zoom-in-95 slide-in-from-top-2"
                      >
                        {/* Sort By Section */}
                        <div className="text-xs uppercase tracking-widest text-muted-foreground px-3 py-2 font-medium">
                          {t('productDetail.sortBy')}
                        </div>
                        
                        <button
                          onClick={() => {
                            setSortBy('name');
                          }}
                          className="w-full flex items-center cursor-pointer mx-1 rounded-lg px-3 py-2.5 text-sm text-white/80 hover:bg-white/10 hover:text-white transition-colors"
                        >
                          <Tag className="h-4 w-4 mr-3 text-muted-foreground" />
                          <span className="flex-1 text-left">{t('productDetail.name')}</span>
                          {sortBy === 'name' && <span className="ml-2 text-primary">Γ£ô</span>}
                        </button>
                        
                        <button
                          onClick={() => {
                            setSortBy('price-asc');
                          }}
                          className="w-full flex items-center cursor-pointer mx-1 rounded-lg px-3 py-2.5 text-sm text-white/80 hover:bg-white/10 hover:text-white transition-colors"
                        >
                          <SortAsc className="h-4 w-4 mr-3 text-muted-foreground" />
                          <span className="flex-1 text-left">{t('productDetail.priceAsc')}</span>
                          {sortBy === 'price-asc' && <span className="ml-2 text-primary">Γ£ô</span>}
                        </button>
                        
                        <button
                          onClick={() => {
                            setSortBy('price-desc');
                          }}
                          className="w-full flex items-center cursor-pointer mx-1 rounded-lg px-3 py-2.5 text-sm text-white/80 hover:bg-white/10 hover:text-white transition-colors"
                        >
                          <ChevronDown className="h-4 w-4 mr-3 text-muted-foreground" />
                          <span className="flex-1 text-left">{t('productDetail.priceDesc')}</span>
                          {sortBy === 'price-desc' && <span className="ml-2 text-primary">Γ£ô</span>}
                        </button>
                        
                        <div className="my-2 h-px bg-border/50 mx-1" />
                        
                        {/* Recommended Section */}
                        <div className="text-xs uppercase tracking-widest text-muted-foreground px-3 py-2 font-medium">
                          {t('common.recommended')}
                        </div>
                        
                        <button
                          onClick={() => {
                            setShowRecommendedOnly(!showRecommendedOnly);
                          }}
                          className="w-full flex items-center cursor-pointer mx-1 rounded-lg px-3 py-2.5 text-sm text-white/80 hover:bg-white/10 hover:text-white transition-colors"
                        >
                          <Star className="h-4 w-4 mr-3 text-muted-foreground" />
                          <span className="flex-1 text-left">{t('productDetail.recommendedOnly')}</span>
                          <div className={`w-4 h-4 rounded border ${showRecommendedOnly ? 'bg-primary border-primary' : 'border-white/30'} flex items-center justify-center`}>
                            {showRecommendedOnly && <span className="text-[10px]">Γ£ô</span>}
                          </div>
                        </button>
                        
                        {(showRecommendedOnly || sortBy !== 'name') && (
                          <>
                            <div className="my-2 h-px bg-border/50 mx-1" />
                            <button
                              onClick={() => {
                                setShowRecommendedOnly(false);
                                setSortBy('name');
                                setIsFilterOpen(false);
                              }}
                              className="w-full flex items-center cursor-pointer mx-1 rounded-lg px-3 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                            >
                              <X className="h-4 w-4 mr-3" />
                              <span className="flex-1 text-left">{t('products.clearFilters')}</span>
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Stores List */}
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                {filteredStores.length > 0 ? (
                  <>
                    {paginatedStores.map((store) => (
                      <div
                        key={store.id}
                        className="p-4 rounded-xl border border-white/6 bg-black/20 hover:bg-white/6 transition-colors"
                      >
                      {/* Store Header */}
                      <div className="flex items-start gap-3 mb-3">
                        {/* Store Logo */}
                        {store.logo_url && (
                          <div className="w-12 h-12 rounded-lg overflow-hidden bg-white/5 flex-shrink-0">
                            <img 
                              src={store.logo_url} 
                              alt={store.name}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          </div>
                        )}
                        
                        <div className="flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <h3 className="font-semibold">{store.name}</h3>
                            <SaveStoreButton
                              storeId={store.id}
                              storeName={store.name}
                              storeLogo={store.logo_url}
                              size="icon"
                              showText={false}
                              variant="ghost"
                              className="h-7 w-7 flex-shrink-0"
                            />
                          </div>
                          {store.is_recommended && (
                            <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-white/10 border border-white/20 text-white mt-1">
                              <Star className="w-3 h-3 fill-current" />
                              <span className="text-xs font-medium">{t('productDetail.recommended')}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Price */}
                      {store.price && (
                        <div className="mb-3">
                          <p className="font-display text-2xl font-bold">{formatPrice(store.price)}</p>
                        </div>
                      )}

                      {/* Sizes */}
                      {Array.isArray(store.sizes) && store.sizes.length > 0 && (
                        <p className="text-sm text-muted-foreground mb-3">
                          {t('productDetail.sizes', 'Sizes')}: {store.sizes.join(', ')}
                        </p>
                      )}

                      {/* Shipping Info */}
                      {store.shipping_info && (
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {store.shipping_info}
                        </p>
                      )}

                      {/* Contact Buttons */}
                      <div className="flex gap-2">
                        {store.telegram_url && (
                          <a
                            href={store.telegram_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1"
                          >
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full"
                            >
                              <Send className="w-4 h-4 mr-1" />
                              Telegram
                            </Button>
                          </a>
                        )}
                        {store.instagram_url && (
                          <a
                            href={store.instagram_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1"
                          >
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full"
                            >
                              <Instagram className="w-4 h-4 mr-1" />
                              Instagram
                            </Button>
                          </a>
                        )}
                      </div>
                    </div>
                  ))
                }
                
                {/* Pagination Controls */}
                {filteredStores.length > storesPerPage && (
                  <div className="flex items-center justify-between pt-4 border-t border-white/6">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentStorePage(prev => Math.max(1, prev - 1))}
                      disabled={currentStorePage === 1}
                      className="gap-2"
                    >
                      ΓåÉ Previous
                    </Button>
                    <span className="text-sm text-white/70">
                      Page {currentStorePage} of {Math.ceil(filteredStores.length / storesPerPage)}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentStorePage(prev => Math.min(Math.ceil(filteredStores.length / storesPerPage), prev + 1))}
                      disabled={currentStorePage === Math.ceil(filteredStores.length / storesPerPage)}
                      className="gap-2"
                    >
                      Next ΓåÆ
                    </Button>
                  </div>
                )}
              </>
                ) : stores.length > 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>{t('productDetail.noStoresMatch')}</p>
                    <Button
                      variant="link"
                      onClick={() => {
                        setStoreSearch("");
                        setShowRecommendedOnly(false);
                      }}
                      className="mt-2"
                    >
                      {t('productDetail.clearFilters')}
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8 border border-dashed border-border/50 rounded-xl">
                    <Package className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                    <p className="text-muted-foreground select-none mb-2">{t('productDetail.noStoresAvailable')}</p>
                    {isAdmin && (
                      <p className="text-xs text-muted-foreground">
                        {t('productDetail.addStores')}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Recently Viewed Products */}
        <RecentlyViewedProducts 
          className="mb-16 animate-fade-in-up"
          maxItems={6}
          excludeProductId={id}
        />

        {/* Similar Products Section (from API) */}
        {product && id && (
          <SimilarProducts
            productId={id}
            limit={6}
            className="mb-16 animate-fade-in-up"
          />
        )}

        {/* Related Products Section */}
        {product && (
          <RelatedProducts 
            productId={String(id)} 
            products={relatedProducts}
            className="mb-16 animate-fade-in-up" 
          />
        )}
        
      </div>
    </div>
  );
};

export default ProductDetail;

