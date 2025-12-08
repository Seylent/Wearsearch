import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { ArrowLeft, Edit, Package, Tag, MapPin, Search, Filter, ChevronDown, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Navigation from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { NeonAbstractions } from "@/components/NeonAbstractions";
import { FaTelegram, FaInstagram } from "react-icons/fa";
import { useToast } from "@/hooks/use-toast";
import { convertS3UrlToHttps } from "@/lib/utils";
import { FavoriteButton } from "@/components/FavoriteButton";
import { StoreRating } from "@/components/StoreRating";
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
  const [product, setProduct] = useState<any>(null);
  const [stores, setStores] = useState<any[]>([]);
  const [filteredStores, setFilteredStores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const [brand, setBrand] = useState<any>(null);
  
  // Store filters
  const [storeSearch, setStoreSearch] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "price-asc" | "price-desc" | "rating">("name");
  const [showVerifiedOnly, setShowVerifiedOnly] = useState(false);

  useEffect(() => {
    fetchProduct();
    fetchStores();
    checkAdmin();
  }, [id]);

  useEffect(() => {
    filterAndSortStores();
  }, [stores, storeSearch, sortBy, showVerifiedOnly]);

  const checkAdmin = () => {
    // First try to get from localStorage user
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setIsAdmin(user.role === 'admin');
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
        setIsAdmin(payload.role === 'admin');
      } catch (e) {
        setIsAdmin(false);
      }
    }
  };

  const filterAndSortStores = () => {
    let filtered = [...stores];

    // Search filter
    if (storeSearch) {
      filtered = filtered.filter(store =>
        store.name.toLowerCase().includes(storeSearch.toLowerCase())
      );
    }

    // Verified filter
    if (showVerifiedOnly) {
      filtered = filtered.filter(store => store.is_verified);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "price-asc":
          return (a.price || 0) - (b.price || 0);
        case "price-desc":
          return (b.price || 0) - (a.price || 0);
        case "rating":
          return (b.average_rating || 0) - (a.average_rating || 0);
        default:
          return 0;
      }
    });

    setFilteredStores(filtered);
  };

  const fetchProduct = async () => {
    try {
      console.log('🔍 Fetching product:', id);
      const response = await fetch(`http://localhost:3000/api/items/${id}`);
      const result = await response.json();
      console.log('📦 Product response:', result);
      
      if (result.success) {
        // Handle both response formats: {success: true, data: {...}} and {success: true, ...data}
        const productData = result.data || result;
        delete productData.success;
        console.log('✅ Product data:', productData);
        console.log('🖼️ Image URL:', productData.image_url);
        console.log('🏷️ Brand ID:', productData.brand_id);
        console.log('🏷️ Brand (legacy):', productData.brand);
        setProduct(productData);
        
        // Fetch brand if brand_id exists
        if (productData.brand_id) {
          fetchBrand(productData.brand_id);
        }
      } else {
        console.error('❌ Product fetch failed:', result);
      }
    } catch (error) {
      console.error("❌ Error fetching product:", error);
      toast({
        title: "Error",
        description: "Failed to load product",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchBrand = async (brandId: string) => {
    try {
      console.log('🏷️ Fetching brand:', brandId);
      const response = await fetch(`http://localhost:3000/api/brands/${brandId}`);
      const result = await response.json();
      console.log('🏷️ Brand response:', result);
      
      if (result.success && result.data) {
        setBrand(result.data);
      } else if (result.id) {
        // Direct brand object response
        setBrand(result);
      }
    } catch (error) {
      console.error("❌ Error fetching brand:", error);
    }
  };

  const fetchStores = async () => {
    try {
      console.log('🏪 Fetching stores for product:', id);
      const response = await fetch(`http://localhost:3000/api/items/${id}/stores`);
      const result = await response.json();
      console.log('🏪 Stores response:', result);
      
      if (result.success && result.stores) {
        console.log('✅ Stores data:', result.stores);
        setStores(result.stores);
      } else if (result.stores) {
        // Some APIs might not have success field
        console.log('✅ Stores data (no success field):', result.stores);
        setStores(result.stores);
      } else {
        console.warn('⚠️ No stores found in response');
      }
    } catch (error) {
      console.error("❌ Error fetching stores:", error);
    }
  };

  const getPriceRange = () => {
    if (stores.length === 0) return null;
    
    const prices = stores.map(s => s.price).filter(p => p != null);
    if (prices.length === 0) return null;
    
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    
    if (min === max) return `$${min}`;
    return `$${min} - $${max}`;
  };

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
            Back
          </Button>
          
          {isAdmin && (
            <Button
              variant="outline"
              onClick={() => navigate(`/admin?editProduct=${id}`)}
              className="gap-2"
            >
              <Edit className="w-4 h-4" />
              Edit Product
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
                <div className="w-full bg-[#0b0b0c] rounded-3xl flex items-center justify-center p-8">
                  <img
                    src={httpsImageUrl}
                    alt={product.name}
                    className="max-h-[72vh] object-contain select-none"
                    draggable={false}
                  />
                </div>
              </div>
            </div>

            {/* Product Info */}
            <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              {/* Brand */}
              {(brand?.name || product.brand) && (
                <p className="text-sm text-muted-foreground uppercase tracking-[0.2em] mb-3 select-none">
                  {brand?.name || product.brand}
                </p>
              )}

              {/* Title */}
              <h1 className="font-display text-4xl md:text-5xl font-bold mb-4 tracking-tight">
                {product.name}
              </h1>

              {/* Gender Badge */}
              {product.gender && (
                <div className="mb-8 pb-8 border-b border-border/50">
                  <span className="inline-block text-sm text-muted-foreground uppercase tracking-wider px-3 py-1 border border-border/50 rounded-full select-none">
                    {product.gender}
                  </span>
                </div>
              )}

              {/* Details */}
              <div className="space-y-4 mb-8">
                {product.type && (
                  <div className="flex items-center gap-3">
                    <Tag className="w-5 h-5 text-muted-foreground" />
                    <span className="text-muted-foreground select-none">Category:</span>
                    <span className="font-medium">{product.type}</span>
                  </div>
                )}
                {product.color && (
                  <div className="flex items-center gap-3">
                    <Package className="w-5 h-5 text-muted-foreground" />
                    <span className="text-muted-foreground select-none">Color:</span>
                    <span className="font-medium">{product.color}</span>
                  </div>
                )}
              </div>

              {/* Description */}
              {product.description && (
                <div className="mb-8 p-6 rounded-xl border border-border/50 bg-card/40 backdrop-blur-sm">
                  <h3 className="font-semibold mb-2 select-none">Description</h3>
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
                <p className="text-sm text-muted-foreground select-none">Price range across all stores</p>
              </div>

              {/* Header */}
              <div className="mb-6">
                <h2 className="font-display text-2xl font-bold mb-2">Available At</h2>
                <div className="flex items-center gap-2 text-sm text-muted-foreground select-none">
                  <MapPin className="w-4 h-4" />
                  <span>{stores.length} {stores.length === 1 ? 'store' : 'stores'}</span>
                </div>
              </div>

              {/* Search & Filters */}
              {stores.length > 0 && (
                <div className="space-y-3 mb-6 pb-6 border-b border-white/6">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Search stores..."
                      value={storeSearch}
                      onChange={(e) => setStoreSearch(e.target.value)}
                      className="pl-10 bg-black/30 border-white/6 text-white"
                    />
                  </div>

                  {/* Sort */}
                  <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
                    <SelectTrigger className="bg-black/30 border-white/6 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-black/80 border-white/10 text-white">
                      <SelectItem value="name">Name</SelectItem>
                      <SelectItem value="price-asc">Price: Low to High</SelectItem>
                      <SelectItem value="price-desc">Price: High to Low</SelectItem>
                      <SelectItem value="rating">Rating</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Verified Only Toggle */}
                  <Button
                    variant={showVerifiedOnly ? "default" : "outline"}
                    onClick={() => setShowVerifiedOnly(!showVerifiedOnly)}
                    className="w-full"
                    size="sm"
                  >
                    {showVerifiedOnly ? "✓" : ""} Verified Only
                  </Button>
                </div>
              )}

              {/* Stores List */}
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                {filteredStores.length > 0 ? (
                  filteredStores.map((store) => (
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
                            />
                          </div>
                        )}
                        
                        <div className="flex-1">
                          <h3 className="font-semibold mb-1">{store.name}</h3>
                          {store.is_verified && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/20 text-xs text-green-400 select-none">
                              ✓ Verified
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Price */}
                      {store.price && (
                        <div className="mb-3">
                          <p className="font-display text-2xl font-bold">${store.price}</p>
                        </div>
                      )}

                      {/* Interactive Rating Component */}
                      <div className="mb-3">
                        <StoreRating
                          storeId={store.id}
                          storeName={store.name}
                          productId={id}
                        />
                        </div>

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
                ) : stores.length > 0 ? (
                  <div className="text-center py-8 text-muted-foreground select-none">
                    <p>No stores match your filters</p>
                    <Button
                      variant="link"
                      onClick={() => {
                        setStoreSearch("");
                        setShowVerifiedOnly(false);
                      }}
                      className="mt-2"
                    >
                      Clear filters
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8 border border-dashed border-border/50 rounded-xl">
                    <Package className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                    <p className="text-muted-foreground select-none mb-2">No stores available yet</p>
                    {isAdmin && (
                      <p className="text-xs text-muted-foreground">
                        Click "Edit Product" to add stores
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ProductDetail;
