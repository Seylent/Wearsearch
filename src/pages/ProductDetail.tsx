import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { ArrowLeft, ExternalLink, Heart, Package, Tag, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { FaTelegram, FaInstagram } from "react-icons/fa";
import { useToast } from "@/hooks/use-toast";
import { convertS3UrlToHttps } from "@/lib/utils";
import { FavoriteButton } from "@/components/FavoriteButton";

const ProductDetail = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [product, setProduct] = useState<any>(null);
  const [stores, setStores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    fetchProduct();
    fetchStores();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/items/${id}`);
      const result = await response.json();
      
      if (result.success) {
        // API returns product data directly in root (not in result.data)
        const { success, ...productData } = result;
        setProduct(productData);
      }
    } catch (error) {
      console.error("Error fetching product:", error);
      toast({
        title: "Error",
        description: "Failed to load product",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStores = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/items/${id}/stores`);
      const result = await response.json();
      
      if (result.success && result.stores) {
        setStores(result.stores);
      }
    } catch (error) {
      console.error("Error fetching stores:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-2 border-foreground border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
        <Button onClick={() => navigate('/')}>Go Home</Button>
      </div>
    );
  }

  const productImages = product.image_url ? [product.image_url] : [];
  const httpsImageUrl = convertS3UrlToHttps(productImages[selectedImage] || '/placeholder.svg');

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <Navigation />
      
      <div className="container mx-auto px-6 py-12 pt-24">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back
        </Button>

        {/* Product Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Image Section */}
          <div className="relative animate-fade-in">
            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-border/50 bg-card mb-4 group">
              {product && (
                <div className="absolute top-4 right-4 z-10">
                  <FavoriteButton 
                    productId={String(id)}
                    variant="ghost"
                    className="w-12 h-12 rounded-full bg-background/80 backdrop-blur-sm text-foreground hover:bg-foreground hover:text-background transition-all"
                  />
                </div>
              )}
              
              <img
                src={httpsImageUrl}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
          </div>

          {/* Product Info */}
          <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            {/* Brand */}
            {product.brand && (
              <p className="text-sm text-muted-foreground uppercase tracking-[0.2em] mb-3">
                {product.brand}
              </p>
            )}

            {/* Title */}
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4 tracking-tight">
              {product.name}
            </h1>

            {/* Price */}
            <div className="flex items-baseline gap-4 mb-8 pb-8 border-b border-border/50">
              <span className="font-display text-5xl font-bold">${product.price}</span>
              {product.gender && (
                <span className="text-sm text-muted-foreground uppercase tracking-wider px-3 py-1 border border-border/50 rounded-full">
                  {product.gender}
                </span>
              )}
            </div>

            {/* Details */}
            <div className="space-y-4 mb-8">
              {product.type && (
                <div className="flex items-center gap-3">
                  <Tag className="w-5 h-5 text-muted-foreground" />
                  <span className="text-muted-foreground">Category:</span>
                  <span className="font-medium">{product.type}</span>
                </div>
              )}
              {product.color && (
                <div className="flex items-center gap-3">
                  <Package className="w-5 h-5 text-muted-foreground" />
                  <span className="text-muted-foreground">Color:</span>
                  <span className="font-medium">{product.color}</span>
                </div>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <div className="mb-8 p-6 rounded-xl border border-border/50 bg-card/40 backdrop-blur-sm">
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-muted-foreground leading-relaxed">{product.description}</p>
              </div>
            )}

            {/* Available Stores Count */}
            {stores.length > 0 && (
              <div className="p-4 rounded-xl border border-border/50 bg-card/40 backdrop-blur-sm mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4" />
                  <span className="text-muted-foreground">Available at</span>
                  <span className="font-semibold">{stores.length} {stores.length === 1 ? 'store' : 'stores'}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Stores Section */}
        {stores.length > 0 && (
          <section className="animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <div className="mb-8">
              <h2 className="font-display text-3xl font-bold mb-2">Available At</h2>
              <p className="text-muted-foreground">Purchase this item from verified stores</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stores.map((store, index) => (
                <div
                  key={store.id}
                  className="group relative animate-fade-in-up"
                  style={{ animationDelay: `${0.5 + index * 0.1}s` }}
                >
                  <div className="relative h-full p-6 rounded-2xl border border-border/50 bg-card/40 backdrop-blur-sm hover:border-foreground/30 hover:shadow-[0_0_40px_-10px_rgba(255,255,255,0.2)] hover:-translate-y-1 transition-all duration-500">
                    {/* Store Name */}
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-display text-xl font-bold mb-1">{store.name}</h3>
                        {store.is_verified && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-foreground/10 border border-foreground/20 text-xs">
                            ✓ Verified
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Price */}
                    <div className="mb-4 pb-4 border-b border-border/50">
                      <p className="font-display text-2xl font-bold">${store.price}</p>
                    </div>

                    {/* Shipping Info */}
                    {store.shipping_info && (
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {store.shipping_info}
                      </p>
                    )}

                    {/* Actions */}
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
                            className="w-full border-border/50 hover:bg-foreground hover:text-background transition-all"
                          >
                            <FaTelegram className="w-4 h-4 mr-2" />
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
                            className="w-full border-border/50 hover:bg-foreground hover:text-background transition-all"
                          >
                            <FaInstagram className="w-4 h-4 mr-2" />
                            Instagram
                          </Button>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {stores.length === 0 && (
          <div className="text-center py-16 border border-dashed border-border/50 rounded-2xl">
            <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No Stores Available</h3>
            <p className="text-muted-foreground">
              This product is currently not available at any stores
            </p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default ProductDetail;
