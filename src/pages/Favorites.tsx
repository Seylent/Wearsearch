import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";

const Favorites = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthAndFetchFavorites();
  }, []);

  const checkAuthAndFetchFavorites = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      toast({
        title: "Login Required",
        description: "Please login to view your favorites",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    fetchFavorites();
  };

  const fetchFavorites = async () => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) return;

    const { data, error } = await supabase
      .from("favorites")
      .select(`
        id,
        product_id,
        products (
          id,
          name,
          image_url,
          price,
          type,
          color
        )
      `)
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load favorites",
        variant: "destructive",
      });
    } else if (data) {
      setFavorites(data);
    }

    setLoading(false);
  };

  const filteredFavorites = favorites.filter(fav => 
    fav.products?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-serif font-bold mb-8">My Favorites</h1>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <p className="text-xl">Loading...</p>
          </div>
        ) : filteredFavorites.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-xl text-muted-foreground mb-4">
              {searchQuery ? "No favorites match your search" : "You haven't saved any items yet"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredFavorites.map((fav) => 
              fav.products ? (
                <ProductCard
                  key={fav.id}
                  id={fav.products.id}
                  name={fav.products.name}
                  image={fav.products.image_url || "/placeholder.svg"}
                  price={`$${fav.products.price}`}
                  category={fav.products.type}
                />
              ) : null
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Favorites;
