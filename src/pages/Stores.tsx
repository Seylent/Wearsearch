import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { NeonAbstractions } from "@/components/sections/NeonAbstractions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ArrowRight, ExternalLink, Star, Package } from "lucide-react";
import { storeService, Store } from "@/services/storeService";
import { FaTelegram, FaInstagram } from "react-icons/fa";

const Stores = () => {
  const navigate = useNavigate();
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    setLoading(true);
    try {
      const data = await storeService.getAllStores();
      if (data && Array.isArray(data)) {
        setStores(data);
      }
    } catch (error) {
      console.error("Error fetching stores:", error);
    }
    setLoading(false);
  };

  const filteredStores = stores.filter(store => 
    store.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden pt-28">
        <NeonAbstractions />
        
        <div className="container mx-auto px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border/50 bg-card/30 backdrop-blur-sm mb-8 animate-fade-in">
            <Package className="w-4 h-4" />
            <span className="text-xs text-muted-foreground tracking-wider uppercase">
              Verified Partners
            </span>
          </div>

          <h1 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-6 tracking-tight animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <span className="block">Discover</span>
            <span className="block neon-text">Premium</span>
            <span className="block text-gradient">Stores</span>
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            Curated stores offering the best in luxury fashion and streetwear. 
            Verified by our team for authenticity and exceptional service.
          </p>

          {/* Search */}
          <div className="max-w-lg mx-auto animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-foreground/20 to-foreground/10 rounded-full blur opacity-0 group-hover:opacity-30 transition duration-500"></div>
              <div className="relative flex items-center">
                <Search className="absolute left-4 w-5 h-5 text-muted-foreground group-focus-within:text-foreground transition-colors" />
                <Input
                  type="text"
                  placeholder="Search stores..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 h-14 bg-card/50 border-border/50 rounded-full text-foreground placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-foreground/30 focus-visible:border-foreground/30 transition-all backdrop-blur-sm"
                />
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="flex justify-center gap-12 mt-16 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <div className="text-center">
              <p className="font-display text-3xl sm:text-4xl font-bold mb-1">{stores.length}+</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Stores</p>
            </div>
            <div className="text-center">
              <p className="font-display text-3xl sm:text-4xl font-bold mb-1">{stores.filter(s => s.is_verified).length}</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Verified</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stores Grid */}
      <section className="py-24 relative">
        <div className="container mx-auto px-6">
          {loading ? (
            <div className="min-h-[400px] flex items-center justify-center">
              <div className="animate-spin w-8 h-8 border-2 border-foreground border-t-transparent rounded-full"></div>
            </div>
          ) : filteredStores.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredStores.map((store, index) => (
                <div
                  key={store.id}
                  className="group relative animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  {/* Store Card */}
                  <div className="relative h-80 rounded-2xl overflow-hidden border border-border/50 bg-card/40 backdrop-blur-sm transition-all duration-500 hover:border-foreground/30 hover:shadow-[0_0_40px_-10px_rgba(255,255,255,0.2)] hover:-translate-y-1">
                    {/* Background gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    {/* Content */}
                    <div className="relative h-full flex flex-col justify-between p-8">
                      {/* Header */}
                      <div>
                        <div className="flex items-start justify-between mb-6">
                          <div className="flex-1 flex items-start gap-4">
                            {/* Store Logo */}
                            {store.logo_url && (
                              <div className="w-16 h-16 rounded-xl overflow-hidden bg-white/5 flex-shrink-0 border border-border/50">
                                <img 
                                  src={store.logo_url} 
                                  alt={store.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                            
                            <div className="flex-1">
                              <h3 className="font-display text-2xl font-bold mb-2 group-hover:text-foreground/80 transition-colors">
                                {store.name}
                              </h3>
                              {store.is_verified && (
                                <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-foreground/10 border border-foreground/20">
                                  <Star className="w-3 h-3 fill-current" />
                                  <span className="text-xs font-medium">Verified</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="w-10 h-10 rounded-full bg-foreground/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all transform translate-y-4 group-hover:translate-y-0 duration-300">
                            <ArrowRight className="w-5 h-5" />
                          </div>
                        </div>

                        {/* Stats */}
                        <div className="space-y-2 mb-6">
                          {store.product_count !== undefined && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Package className="w-4 h-4" />
                              <span>{store.product_count} Products</span>
                            </div>
                          )}
                          {store.brand_count !== undefined && store.brand_count > 0 && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Package className="w-4 h-4" />
                              <span>{store.brand_count} Brand{store.brand_count !== 1 ? 's' : ''}</span>
                            </div>
                          )}
                          {store.average_rating > 0 && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Star className="w-4 h-4" />
                              <span>{store.average_rating.toFixed(1)} ({store.total_ratings} reviews)</span>
                            </div>
                          )}
                        </div>

                        {/* Shipping Info */}
                        {store.shipping_info && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {store.shipping_info}
                          </p>
                        )}
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between">
                        {/* Social Links */}
                        <div className="flex gap-2">
                          {store.telegram_url && (
                            <a
                              href={store.telegram_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-9 h-9 rounded-full bg-card hover:bg-foreground hover:text-background flex items-center justify-center transition-all"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <FaTelegram className="w-4 h-4" />
                            </a>
                          )}
                          {store.instagram_url && (
                            <a
                              href={store.instagram_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-9 h-9 rounded-full bg-card hover:bg-foreground hover:text-background flex items-center justify-center transition-all"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <FaInstagram className="w-4 h-4" />
                            </a>
                          )}
                        </div>

                        {/* View Button */}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => {
                            const params = new URLSearchParams();
                            params.set('store_id', store.id);
                            navigate(`/?${params.toString()}#products`);
                          }}
                        >
                          View Products
                          <ExternalLink className="ml-2 w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Hover glow effect */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-foreground/20 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-foreground/20 to-transparent" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="min-h-[400px] flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-full border-2 border-foreground/20 flex items-center justify-center mb-4">
                <Search className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No Stores Found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search or clear filters
              </p>
              <Button variant="outline" onClick={() => setSearchQuery("")}>
                Clear Search
              </Button>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Stores;
