import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Edit, Package, Tag, MapPin, Search, Filter, ChevronDown, Sparkles, SortAsc, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Navigation from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { NeonAbstractions } from "@/components/NeonAbstractions";
import { FaTelegram, FaInstagram } from "react-icons/fa";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/services/api";
import { convertS3UrlToHttps } from "@/lib/utils";
import { FavoriteButton } from "@/components/FavoriteButton";
import { RelatedProducts } from "@/components/RelatedProducts";
import { translateGender } from "@/utils/errorTranslation";
import { getCategoryTranslation, getColorTranslation } from "@/utils/translations";
import { GenderBadge } from "@/components/GenderBadge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ProductDetail = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [product, setProduct] = useState<any>(null);
  const [stores, setStores] = useState<any[]>([]);
  const [filteredStores, setFilteredStores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const [brand, setBrand] = useState<any>(null);
  
  // Store filters
  const [storeSearch, setStoreSearch] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "price-asc" | "price-desc">("name");
  const [showRecommendedOnly, setShowRecommendedOnly] = useState(false);
  const [currentStorePage, setCurrentStorePage] = useState(1);
  const storesPerPage = 3;

  // Use ref to track if component is mounted to prevent state updates after unmount
  const isMounted = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      // Cancel any ongoing requests when component unmounts
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  useEffect(() => {
    fetchProduct();
    fetchStores();
    checkAdmin();
  }, [id]);

  useEffect(() => {
    filterAndSortStores();
  }, [stores, storeSearch, sortBy, showRecommendedOnly]);

  const checkAdmin = useCallback(() => {
    // First try to get from localStorage user
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (isMounted.current) {
          setIsAdmin(user.role === 'admin');
        }
        return;
      } catch (e) {
        console.error('Failed to parse user:', e);
      }
    }
    
    // Fallback: try to decode token
    const token = localStorage.getItem('access_token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (isMounted.current) {
          setIsAdmin(payload.role === 'admin');
        }
      } catch (e) {
        if (isMounted.current) {
          setIsAdmin(false);
        }
      }
    }
  }, []);

  const filterAndSortStores = useCallback(() => {
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

    if (isMounted.current) {
      setFilteredStores(filtered);
    }
  }, [stores, storeSearch, sortBy, showRecommendedOnly]);

  const fetchProduct = useCallback(async () => {
    // Cancel previous request if exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();

    try {
      console.log('🔍 Fetching product:', id);
      const response = await api.get(`/items/${id}`, {
        signal: abortControllerRef.current.signal
      });
      const result = response.data;
      console.log('📦 Product response:', result);
      
      // Handle both response formats: {success: true, data: {...}} or direct product object {id, name, ...}
      let productData;
      if (result.success) {
        productData = result.data || result;
        delete productData.success;
      } else if (result.id) {
        // Direct product object
        productData = result;
      } else {
        console.error('❌ Product fetch failed:', result);
        return;
      }
      
      console.log('✅ Product data:', productData);
      console.log('🖼️ Image URL:', productData.image_url);
      console.log('🏷️ Brand ID:', productData.brand_id);
      console.log('🏷️ Brand (legacy):', productData.brand);
      
      if (isMounted.current) {
        setProduct(productData);
      }
      
      // Fetch brand if brand_id exists
      if (productData.brand_id) {
        fetchBrand(productData.brand_id);
      }
    } catch (error: any) {
      // Don't show error if request was aborted (component unmounted or new request started)
      if (error.name === 'CanceledError' || error.code === 'ERR_CANCELED') {
        console.log('🔄 Product fetch cancelled');
        return;
      }
      
      console.error("❌ Error fetching product:", error);
      if (isMounted.current) {
        toast({
          title: "Error",
          description: "Failed to load product",
          variant: "destructive",
        });
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [id, toast]);

  const fetchBrand = useCallback(async (brandId: string) => {
    try {
      console.log('🏷️ Fetching brand:', brandId);
      const response = await api.get(`/brands/${brandId}`);
      const result = response.data;
      console.log('🏷️ Brand response:', result);
      
      if (result.success && result.data) {
        if (isMounted.current) {
          setBrand(result.data);
        }
      } else if (result.id) {
        // Direct brand object response
        if (isMounted.current) {
          setBrand(result);
        }
      }
    } catch (error) {
      console.error("❌ Error fetching brand:", error);
    }
  }, []);

  const fetchStores = useCallback(async () => {
    try {
      console.log('🏪 Fetching stores for product:', id);
      const response = await api.get(`/items/${id}/stores`);
      const result = response.data;
      console.log('🏪 Stores response:', result);
      
      // Handle different response formats
      let storesData = [];
      if (result.success && result.stores) {
        storesData = result.stores;
      } else if (result.stores) {
        storesData = result.stores;
      } else if (Array.isArray(result)) {
        // Direct array of stores
        storesData = result;
      }
      
      console.log('✅ Stores data:', storesData);
      if (isMounted.current) {
        setStores(storesData);
      }
    } catch (error) {
      console.error("❌ Error fetching stores:", error);
    }
  }, [id]);

  const getPriceRange = useCallback(() => {
    if (stores.length === 0) return null;
    
    const prices = stores.map(s => s.price).filter(p => p != null);
    if (prices.length === 0) return null;
    
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    
    if (min === max) return `₴${min}`;
    return `₴${min} - ₴${max}`;
  }, [stores]);

  if (loading) {
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
        <Button onClick={() => navigate('/')} className="rounded-full">Go Home</Button>
      </div>
    );
  }

  const productImages = product.image_url ? [product.image_url] : [];
  const httpsImageUrl = convertS3UrlToHttps(productImages[selectedImage] || '/placeholder.svg');
  const priceRange = getPriceRange();

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <Navigation />

      <div className="container mx-auto px-6 py-12 pt-28">
        {/* Back Button & Edit */}
        <div className="flex justify-between items-center mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="group"
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            {t('common.back')}
          </Button>
          
          {isAdmin && (
            <Button
              variant="outline"
              onClick={() => navigate(`/admin?editProduct=${id}`)}
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
                  <div className="absolute top-4 right-4 z-10">
                    <FavoriteButton 
                      productId={String(id)}
                      variant="ghost"
                      className="w-12 h-12 rounded-full bg-black/60 backdrop-blur-sm text-white hover:bg-white hover:text-black transition-all"
                    />
                  </div>
                )}
                <div className="w-full rounded-3xl flex items-center justify-center p-8" style={{
                  background: 'radial-gradient(circle at 20% 30%, rgba(255,255,255,0.08) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(255,255,255,0.06) 0%, transparent 50%), linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(20,20,20,0.95) 100%)'
                }}>
                  <img
                    src={httpsImageUrl}
                    alt={product.name}
                    className="max-h-[72vh] object-contain"
                    loading="lazy"
                    draggable={false}
                  />
                </div>
              </div>
            </div>

            {/* Product Info */}
            <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              {/* Brand */}
              {(brand?.name || product.brand) && (
                <p className="text-sm text-muted-foreground uppercase tracking-[0.2em] mb-3">
                  {brand?.name || product.brand}
                </p>
              )}

              {/* Title */}
              <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight mb-4">
                {product.name}
              </h1>

              {/* Details */}
              <div className="space-y-4 mb-8">
                {product.type && (
                  <div className="flex items-center gap-3">
                    <Tag className="w-5 h-5 text-muted-foreground" />
                    <span className="text-muted-foreground">{t('products.category')}:</span>
                    <span className="font-medium capitalize">{getCategoryTranslation(product.type)}</span>
                  </div>
                )}
                {product.color && (
                  <div className="flex items-center gap-3">
                    <Package className="w-5 h-5 text-muted-foreground" />
                    <span className="text-muted-foreground">{t('products.color')}:</span>
                    <span className="font-medium capitalize">{getColorTranslation(product.color)}</span>
                  </div>
                )}
                {product.gender && (
                  <div className="flex items-center gap-3">
                    <Package className="w-5 h-5 text-muted-foreground" />
                    <span className="text-muted-foreground">{t('products.gender')}:</span>
                    <span className="font-medium capitalize">
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
          <div className="lg:sticky lg:top-24 h-fit animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
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
                <p className="text-sm text-muted-foreground">Price range across all stores</p>
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
                <div className="flex items-center gap-2 mb-6 pb-6 border-b border-white/6">
                  {/* Search */}
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder={t('productDetail.searchStores')}
                      value={storeSearch}
                      onChange={(e) => setStoreSearch(e.target.value)}
                      className="pl-10 bg-black/30 border-white/6 text-white"
                    />
                  </div>

                  {/* Sort */}
                  <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
                    <SelectTrigger className="w-[50px] bg-black/30 border-white/6 text-white">
                      <SortAsc className="h-4 w-4" />
                    </SelectTrigger>
                    <SelectContent className="bg-black/80 border-white/10 text-white">
                      <SelectItem value="name">
                        <div className="flex items-center gap-2">
                          <Tag className="h-4 w-4" />
                          {t('productDetail.name')}
                        </div>
                      </SelectItem>
                      <SelectItem value="price-asc">
                        <div className="flex items-center gap-2">
                          <SortAsc className="h-4 w-4" />
                          {t('productDetail.priceAsc')}
                        </div>
                      </SelectItem>
                      <SelectItem value="price-desc">
                        <div className="flex items-center gap-2">
                          <ChevronDown className="h-4 w-4" />
                          {t('productDetail.priceDesc')}
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Recommended Only Toggle */}
                  <Button
                    variant={showRecommendedOnly ? "default" : "outline"}
                    onClick={() => setShowRecommendedOnly(!showRecommendedOnly)}
                    className="w-[50px] p-0"
                    size="icon"
                    title={t('productDetail.recommendedOnly')}
                  >
                    <Star className={`h-4 w-4 ${showRecommendedOnly ? 'fill-current' : ''}`} />
                  </Button>
                </div>
              )}

              {/* Stores List */}
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                {filteredStores.length > 0 ? (
                  <>
                    {filteredStores
                      .slice((currentStorePage - 1) * storesPerPage, currentStorePage * storesPerPage)
                      .map((store) => (
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
                          <h3 className="font-semibold mb-1">{store.name}</h3>
                          {store.is_recommended && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-xs text-purple-400">
                              ⭐ {t('productDetail.recommended')}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Price */}
                      {store.price && (
                        <div className="mb-3">
                          <p className="font-display text-2xl font-bold">₴{store.price}</p>
                        </div>
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
                              <FaTelegram className="w-4 h-4 mr-1" />
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
                              <FaInstagram className="w-4 h-4 mr-1" />
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
                      ← Previous
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
                      Next →
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

        {/* Related Products Section */}
        {product && (
          <RelatedProducts 
            productId={String(id)} 
            className="mb-16 animate-fade-in-up" 
          />
        )}
      </div>

      <Footer />
    </div>
  );
};

export default ProductDetail;

