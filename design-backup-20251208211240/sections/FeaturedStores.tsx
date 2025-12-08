import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { storeService, Store } from "@/services/storeService";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export const FeaturedStores = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [featuredStores, setFeaturedStores] = useState<Store[]>([]);

  useEffect(() => {
    const fetchStores = async () => {
      try {
        const stores = await storeService.getAllStores();
        if (stores && Array.isArray(stores)) {
          const featured = stores.filter(s => s.is_verified).slice(0, 3);
          setFeaturedStores(featured.length > 0 ? featured : stores.slice(0, 3));
        } else {
          console.warn('No stores found or invalid response format');
          setFeaturedStores([]);
        }
      } catch (error) {
        console.error("Failed to fetch stores:", error);
        setFeaturedStores([]);
      }
    };
    fetchStores();
  }, []);

  return (
    <section className="py-24 border-y border-white/5 bg-background relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(ellipse_at_top,rgba(var(--primary),0.05),transparent_70%)] pointer-events-none" />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl font-bold mb-2 text-white">Featured Stores</h2>
            <p className="text-muted-foreground">Top rated sellers verified by our team</p>
          </div>
          <Button 
            variant="ghost" 
            className="text-white hover:text-primary group"
            onClick={() => navigate('/stores')}
          >
            View All <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featuredStores.length > 0 ? (
            featuredStores.map((store) => (
              <div 
                key={store.id} 
                className="group relative h-64 rounded-3xl overflow-hidden border border-white/10 bg-card transition-all duration-500 hover:border-primary/30 hover:shadow-[0_0_30px_-5px_rgba(255,255,255,0.1)] cursor-pointer"
                onClick={() => {
                  const params = new URLSearchParams(location.search);
                  params.set('store_id', store.id);
                  navigate(`/?${params.toString()}#products`);
                }}
              >
                {/* Store Logo Background */}
                {store.logo_url ? (
                  <>
                    <div className="absolute inset-0">
                      <img 
                        src={store.logo_url} 
                        alt={store.name}
                        className="w-full h-full object-cover opacity-20 group-hover:opacity-30 transition-opacity duration-500"
                      />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-black/95 z-10" />
                  </>
                ) : (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/90 z-10" />
                    <div className={`absolute inset-0 bg-gradient-to-br from-white/5 to-white/0 opacity-20 group-hover:scale-105 transition-transform duration-700`} />
                  </>
                )}
                
                <div className="absolute bottom-0 left-0 right-0 p-8 z-20">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-2xl font-bold text-white group-hover:text-primary transition-colors">{store.name}</h3>
                    <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all transform translate-y-4 group-hover:translate-y-0 duration-300">
                      <ArrowRight className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-white/60">
                    <span>{store.product_count || 0} Products</span>
                    {store.brand_count !== undefined && store.brand_count > 0 && (
                      <span>{store.brand_count} Brand{store.brand_count !== 1 ? 's' : ''}</span>
                    )}
                    {store.is_verified && (
                      <span className="text-primary flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-xs font-medium">
                        Verified
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-3 text-center py-12 text-muted-foreground">
              Loading stores...
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

