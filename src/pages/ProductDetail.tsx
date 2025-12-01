import { useParams, Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { ArrowLeft, ExternalLink, Heart, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { FaTelegram, FaInstagram } from "react-icons/fa";
import { useToast } from "@/hooks/use-toast";
import { convertS3UrlToHttps } from "@/lib/utils";
import { StoreRating } from "@/components/StoreRating";
import { SuggestedPrice } from "@/components/SuggestedPrice";

const ProductDetail = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [product, setProduct] = useState<any>(null);
  const [stores, setStores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    fetchProduct();
    checkFavoriteStatus();
    checkAdminStatus();
  }, [id]);

  const checkFavoriteStatus = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setIsLoggedIn(!!session);
    
    if (session && id) {
      const { data } = await supabase
        .from("favorites")
        .select("id")
        .eq("user_id", session.user.id)
        .eq("product_id", id)
        .maybeSingle();
      
      setIsFavorite(!!data);
    }
  };

  const checkAdminStatus = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .eq("role", "admin")
        .maybeSingle();
      
      setIsAdmin(!!data);
    }
  };

  const toggleFavorite = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      toast({
        title: "Login Required",
        description: "Please login to save favorites",
        variant: "destructive",
      });
      return;
    }

    if (isFavorite) {
      const { error } = await supabase
        .from("favorites")
        .delete()
        .eq("user_id", session.user.id)
        .eq("product_id", String(id));

      if (error) {
        toast({
          title: "Error",
          description: "Failed to remove from favorites",
          variant: "destructive",
        });
      } else {
        setIsFavorite(false);
        toast({
          title: "Removed",
          description: "Item removed from favorites",
        });
      }
    } else {
      const { error } = await supabase
        .from("favorites")
        .insert([{ user_id: session.user.id, product_id: String(id) }]);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to add to favorites",
          variant: "destructive",
        });
      } else {
        setIsFavorite(true);
        toast({
          title: "Saved",
          description: "Item added to favorites",
        });
      }
    }
  };

  const fetchProduct = async () => {
    setLoading(true);

    // Fetch product
    const { data: productData, error: productError } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (productData) {
      setProduct(productData);

      // Fetch stores for this product
      const { data: productStoresData } = await supabase
        .from("product_stores")
        .select("store_id")
        .eq("product_id", id);

      if (productStoresData && productStoresData.length > 0) {
        const storeIds = productStoresData.map((ps) => ps.store_id);
        const { data: storesData } = await supabase
          .from("stores")
          .select("*")
          .in("id", storeIds);

        if (storesData) {
          setStores(storesData);
        }
      }
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl">Loading...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-4">Product not found</h1>
          <Link to="/">
            <Button variant="outline">Back to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Link to="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Products
          </Button>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <div>
            {product.image_url && (
              <div className="aspect-[3/4] overflow-hidden rounded-3xl bg-muted mb-4 shadow-medium">
                <img
                  src={convertS3UrlToHttps(product.image_url)}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  crossOrigin="anonymous"
                  onError={(e) => {
                    console.error('Failed to load image:', product.image_url);
                    console.error('Converted URL:', convertS3UrlToHttps(product.image_url));
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>

          {/* Product Info & Stores */}
          <div>
            <p className="text-sm text-muted-foreground uppercase tracking-wider mb-2">
              {product.type}
            </p>
            <div className="flex items-start justify-between mb-4">
              <h1 className="text-4xl font-semibold flex-1">
                {product.name}
              </h1>
              <div className="flex gap-2 ml-4">
                {isAdmin && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => navigate(`/admin?editProduct=${id}`)}
                    title="Edit Product (Admin)"
                  >
                    <Edit className="w-5 h-5" />
                  </Button>
                )}
                {isLoggedIn && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleFavorite}
                  >
                    <Heart 
                      className={`w-6 h-6 ${
                        isFavorite ? "fill-red-500 text-red-500" : ""
                      }`}
                    />
                  </Button>
                )}
              </div>
            </div>
            <p className="text-2xl font-medium text-accent mb-6">
              ${product.price}
            </p>
            <p className="text-foreground/80 mb-8 leading-relaxed">
              {product.description}
            </p>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold mb-4">
                Available at these stores:
              </h2>
              
              {stores.length === 0 ? (
                <p className="text-muted-foreground select-none">No stores available yet</p>
              ) : (
                stores.map((store) => (
                  <Card key={store.id} className="shadow-soft hover:shadow-medium transition-shadow">
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold select-none">
                        {store.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {store.shipping_info && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground select-none">📦 Shipping:</span>
                          <span className="text-sm font-medium px-3 py-1.5 bg-primary/10 text-primary rounded-full select-none">
                            {store.shipping_info}
                          </span>
                        </div>
                      )}
                      
                      {/* Store Rating Component */}
                      <StoreRating
                        storeId={store.id}
                        storeName={store.name}
                        productId={id}
                      />

                      <div className="flex gap-3 pt-2">
                        {store.telegram_url && (
                          <a
                            href={store.telegram_url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-2"
                            >
                              <FaTelegram className="w-4 h-4" />
                              Telegram
                              <ExternalLink className="w-3 h-3" />
                            </Button>
                          </a>
                        )}
                        {store.instagram_url && (
                          <a
                            href={store.instagram_url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-2"
                            >
                              <FaInstagram className="w-4 h-4" />
                              Instagram
                              <ExternalLink className="w-3 h-3" />
                            </Button>
                          </a>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
              
              {/* Suggested Price Component */}
              {product && (
                <div className="mt-8">
                  <SuggestedPrice
                    productId={id!}
                    currentPrice={parseFloat(product.price)}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
