import { useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import api from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { isAuthenticated, getAuthData } from "@/utils/authStorage";
import { useStoreRatings, useUserStoreRating } from "@/hooks/useApi";
import { useQueryClient } from "@tanstack/react-query";

interface StoreRatingProps {
  storeId: string;
  storeName: string;
  productId?: string;
  averageRating?: number;  // Optional: from store data
  totalRatings?: number;   // Optional: from store data
}

export const StoreRating = ({ 
  storeId, 
  storeName, 
  productId,
  averageRating: propsAverageRating,
  totalRatings: propsTotalRatings 
}: StoreRatingProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  const authData = getAuthData();
  const isLoggedIn = isAuthenticated();
  
  // Use React Query hooks for ratings only if not provided via props
  const shouldFetchRatings = propsAverageRating === undefined || propsTotalRatings === undefined;
  const { data: storeRatingsData } = useStoreRatings(storeId, { enabled: shouldFetchRatings });
  const { data: userRating } = useUserStoreRating(authData?.userId, storeId);
  
  // Use props if provided, otherwise use fetched data
  const averageRating = propsAverageRating ?? storeRatingsData?.average ?? 0;
  const totalRatings = propsTotalRatings ?? storeRatingsData?.count ?? 0;

  const submitRating = async (rating: number) => {
    if (!isLoggedIn) {
      toast({
        title: "Login Required",
        description: "Please login to rate stores. Click the user icon in navigation.",
        variant: "destructive",
      });
      return;
    }

    if (!productId) {
      toast({
        title: "Cannot Rate",
        description: "Product ID is missing. Please try refreshing the page.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Backend expects: POST /ratings with { storeId, productId, rating }
      await api.post('/ratings', {
        storeId: storeId,
        productId: productId,
        rating: rating,
      });

      // Invalidate to refresh on next access (not immediate refetch)
      queryClient.invalidateQueries({ queryKey: ['storeRatings', storeId] });
      queryClient.invalidateQueries({ queryKey: ['userStoreRating', authData?.userId, storeId] });
      
      toast({
        title: "Success",
        description: `You rated ${storeName} ${rating} stars`,
      });
    } catch (error: any) {
      console.error('Rating failed:', error.response?.data || error.message);
      const errorMsg = error.response?.data?.error || error.response?.data?.message || "Failed to submit rating. Please try again.";
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
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
          <p className="text-sm text-muted-foreground select-none">
            {userRating > 0 ? 'Update your rating:' : 'Rate this store:'}
          </p>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => submitRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                disabled={loading}
                className="transition-all hover:scale-125 disabled:opacity-50 cursor-pointer active:scale-95"
                title={`Rate ${star} star${star > 1 ? 's' : ''}`}
              >
                <Star
                  className={`w-7 h-7 transition-colors ${
                    star <= (hoverRating || userRating || 0)
                      ? "fill-yellow-400 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]"
                      : "text-gray-400 hover:text-gray-300"
                  }`}
                />
              </button>
            ))}
          </div>
          {userRating > 0 && (
            <p className="text-xs text-green-400 select-none flex items-center gap-1">
              ✓ You rated this store {userRating} star{userRating > 1 ? 's' : ''}
            </p>
          )}
        </div>
      )}
      
      {!isLoggedIn && (
        <p className="text-xs text-muted-foreground select-none">
          Login to rate this store
        </p>
      )}
    </div>
  );
};
