import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ImageDebugger from "./ImageDebugger";
import { convertS3UrlToHttps } from "@/lib/utils";

interface ProductCardProps {
  id: number;
  name: string;
  image: string;
  price: string;
  category: string;
}

const ProductCard = ({ id, name, image, price, category }: ProductCardProps) => {
  const { toast } = useToast();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const httpsImageUrl = convertS3UrlToHttps(image);

  useEffect(() => {
    checkFavoriteStatus();
    console.log(`Product ${id} - Original URL:`, image);
    console.log(`Product ${id} - Converted URL:`, httpsImageUrl);
  }, [id, image, httpsImageUrl]);

  const checkFavoriteStatus = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setIsLoggedIn(!!session);
    
    if (session) {
      const { data } = await supabase
        .from("favorites")
        .select("id")
        .eq("user_id", session.user.id)
        .eq("product_id", String(id))
        .maybeSingle();
      
      setIsFavorite(!!data);
    }
  };

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

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

  return (
    <Link to={`/product/${id}`} className="group block h-full">
      <Card className="border-border overflow-hidden transition-all duration-300 hover:shadow-strong relative rounded-3xl h-full flex flex-col">
        {isLoggedIn && (
          <button
            onClick={toggleFavorite}
            className="absolute top-3 right-3 z-10 p-2.5 rounded-full bg-background/90 backdrop-blur-sm hover:bg-background hover:scale-110 transition-all shadow-md cursor-pointer"
          >
            <Heart 
              className={`w-5 h-5 transition-colors ${
                isFavorite ? "fill-red-500 text-red-500" : "text-foreground"
              }`}
            />
          </button>
        )}
        <div className="aspect-square overflow-hidden bg-muted">
          <ImageDebugger
            src={httpsImageUrl}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
        <CardContent className="p-5 bg-gradient-card flex-1 flex flex-col justify-between">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 font-medium select-none">
              {category}
            </p>
            <h3 className="text-lg font-semibold mb-2 group-hover:text-accent transition-colors line-clamp-2 select-none">
              {name}
            </h3>
          </div>
          <p className="text-base font-semibold text-foreground select-none">${price}</p>
        </CardContent>
      </Card>
    </Link>
  );
};  

export default ProductCard;
