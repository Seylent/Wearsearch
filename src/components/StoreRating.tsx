import { useState, useEffect } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import api from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { isAuthenticated, getAuthData } from "@/utils/authStorage";

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
    const authenticated = isAuthenticated();
    setIsLoggedIn(authenticated);

    // Load average rating
    await loadAverageRating();

    // Load user's rating if logged in (rating is per store, not per product)
    if (authenticated) {
      const authData = getAuthData();
      if (authData?.userId) {
        await loadUserRating(authData.userId);
      }
    }
  };

  const loadAverageRating = async () => {
    try {
      const response = await api.get(`/ratings/store/${storeId}`);
      const data = response.data;
      
      if (data && data.ratings) {
        const ratings = data.ratings.map((r: any) => r.rating);
        const avg = ratings.length > 0 
          ? ratings.reduce((sum: number, r: number) => sum + r, 0) / ratings.length 
          : 0;
        setAverageRating(Number(avg.toFixed(1)));
        setTotalRatings(ratings.length);
      }
    } catch (error) {
      // Backend endpoint not ready yet - fail silently
      console.log('Rating endpoint not available yet');
    }
  };

  const loadUserRating = async (userId: string) => {
    try {
      // Get user's rating for this store (global, not per product)
      const response = await api.get(`/ratings/user/${userId}/store/${storeId}`);
      const data = response.data;
      
      if (data && data.rating) {
        setUserRating(data.rating);
      }
    } catch (error) {
      // Backend endpoint not ready yet or no rating found - fail silently
      console.log('User rating not found');
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

    setLoading(true);

    try {
      // Submit rating (store_id only, no product_id needed)
      await api.post('/ratings', {
        store_id: storeId,
        rating: rating,
      });

      setUserRating(rating);
      // Reload average rating immediately to show update
      await loadAverageRating();
      toast({
        title: "Success",
        description: "Rating submitted successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to submit rating",
        variant: "destructive",
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

      {isLoggedIn && (
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
