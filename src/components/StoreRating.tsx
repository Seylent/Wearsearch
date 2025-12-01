import { useState, useEffect } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface StoreRatingProps {
  storeId: string;
  storeName: string;
  productId?: string;
}

export const StoreRating = ({ storeId, storeName, productId }: StoreRatingProps) => {
  const { toast } = useToast();
  const [userRating, setUserRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [averageRating, setAverageRating] = useState<number>(0);
  const [totalRatings, setTotalRatings] = useState<number>(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkAuthAndLoadRatings();
  }, [storeId]);

  const checkAuthAndLoadRatings = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setIsLoggedIn(!!session);

    // Load average rating
    await loadAverageRating();

    // Load user's rating if logged in
    if (session && productId) {
      await loadUserRating(session.user.id);
    }
  };

  const loadAverageRating = async () => {
    const { data, error } = await supabase
      .from("store_ratings" as any)
      .select("rating")
      .eq("store_id", storeId);

    if (error) {
      // Table doesn't exist yet - fail silently
      return;
    }

    if (data) {
      const ratings = data.map((r: any) => r.rating);
      const avg = ratings.length > 0 
        ? ratings.reduce((sum: number, r: number) => sum + r, 0) / ratings.length 
        : 0;
      setAverageRating(Number(avg.toFixed(1)));
      setTotalRatings(ratings.length);
    }
  };

  const loadUserRating = async (userId: string) => {
    if (!productId) return;

    const { data, error } = await supabase
      .from("store_ratings" as any)
      .select("rating")
      .eq("store_id", storeId)
      .eq("product_id", productId)
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      // Table doesn't exist yet - fail silently
      return;
    }

    if (data) {
      setUserRating((data as any).rating);
    }
  };

  const submitRating = async (rating: number) => {
    if (!isLoggedIn) {
      toast({
        title: "Login Required",
        description: "Please login to rate stores",
        variant: "destructive",
      });
      return;
    }

    if (!productId) {
      toast({
        title: "Error",
        description: "Product information is required to rate",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { error } = await supabase
      .from("store_ratings" as any)
      .upsert({
        store_id: storeId,
        product_id: productId,
        user_id: session.user.id,
        rating: rating,
      }, {
        onConflict: "store_id,product_id,user_id"
      });

    if (error) {
      toast({
        title: "Feature Not Available",
        description: "Store ratings feature is coming soon",
        variant: "destructive",
      });
    } else {
      setUserRating(rating);
      await loadAverageRating();
      toast({
        title: "Success",
        description: "Rating submitted successfully",
      });
    }

    setLoading(false);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg select-none">Rate {storeName}</h3>
        <div className="flex items-center gap-2">
          <div className="flex items-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-5 h-5 ${
                  star <= averageRating
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-300"
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-muted-foreground select-none">
            {averageRating.toFixed(1)} ({totalRatings} {totalRatings === 1 ? 'rating' : 'ratings'})
          </span>
        </div>
      </div>

      {isLoggedIn && productId && (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground select-none">Your rating:</p>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => submitRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                disabled={loading}
                className="transition-transform hover:scale-110 disabled:opacity-50 cursor-pointer"
              >
                <Star
                  className={`w-7 h-7 ${
                    star <= (hoverRating || userRating)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              </button>
            ))}
          </div>
          {userRating > 0 && (
            <p className="text-xs text-muted-foreground select-none">
              You rated this store {userRating} stars
            </p>
          )}
        </div>
      )}
    </div>
  );
};
