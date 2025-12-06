import { useState, useEffect } from "react";
import { Star, Edit2, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface StoreRatingProps {
  storeId: string;
  storeName: string;
  productId?: string;
  initialData?: {
    averageRating: number;
    totalRatings: number;
  };
}

export const StoreRating = ({ storeId, storeName, productId, initialData }: StoreRatingProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [userRating, setUserRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [averageRating, setAverageRating] = useState<number>(initialData?.averageRating || 0);
  const [totalRatings, setTotalRatings] = useState<number>(initialData?.totalRatings || 0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [ratingId, setRatingId] = useState<string | null>(null);

  useEffect(() => {
    checkAuthAndLoadUserRating();
  }, [storeId, productId]);

  const checkAuthAndLoadUserRating = async () => {
    const token = localStorage.getItem('access_token');
    setIsLoggedIn(!!token);
    
    if (token) {
      try {
        const response = await fetch('http://localhost:3000/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          const userData = data.data || data.user || data;
          if (userData && userData.id) {
            setUserId(userData.id);
            await loadUserRating(userData.id);
          }
        }
      } catch (error) {
        console.error('Failed to check auth:', error);
        setIsLoggedIn(false);
        setUserId(null);
      }
    } else {
      setUserId(null);
    }
  };

  const loadUserRating = async (userId: string) => {
    if (!productId) return;

    try {
      const response = await fetch(`http://localhost:3000/api/ratings/user/${userId}`);
      
      if (!response.ok) return;

      const result = await response.json();
      
      if (result.success && result.data) {
        // Find the rating for this specific store and product
        const userStoreRating = result.data.find(
          (r: any) => r.store_id === storeId && r.product_id === productId
        );
        
        if (userStoreRating) {
          setUserRating(userStoreRating.rating);
          setRatingId(userStoreRating.id);
        }
      }
    } catch (error) {
      // Fail silently - backend might not be available
      console.error('Failed to load user rating:', error);
    }
  };

  const submitRating = async (rating: number) => {
    if (!isLoggedIn || !userId) {
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

    try {
      const response = await fetch('http://localhost:3000/api/ratings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          store_id: storeId,
          product_id: productId,
          user_id: userId,
          rating: rating,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit rating');
      }

      const result = await response.json();

      if (result.success) {
        setUserRating(rating);
        
        // Reload product ratings to get updated average
        await loadProductRatings();
        
        toast({
          title: "Success",
          description: "Rating submitted successfully",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit rating. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadProductRatings = async () => {
    if (!productId) return;

    try {
      const response = await fetch(`http://localhost:3000/api/ratings/product/${productId}`);
      
      if (!response.ok) return;

      const result = await response.json();
      
      if (result.success && result.data && result.data[storeId]) {
        const storeData = result.data[storeId];
        setAverageRating(storeData.averageRating || 0);
        setTotalRatings(storeData.totalRatings || 0);
      }
    } catch (error) {
      console.error('Failed to load product ratings:', error);
    }
  };

  const deleteRating = async () => {
    if (!ratingId || !userId) return;

    setLoading(true);

    try {
      const response = await fetch(`http://localhost:3000/api/ratings/${ratingId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete rating');
      }

      const result = await response.json();

      if (result.success) {
        setUserRating(0);
        setRatingId(null);
        setIsEditing(false);
        
        await loadProductRatings();
        
        toast({
          title: "Deleted",
          description: "Rating deleted successfully",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete rating. Please try again.",
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

      {!isLoggedIn ? (
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            // Store the current location to return after login
            const currentPath = window.location.pathname + window.location.search;
            localStorage.setItem('returnTo', currentPath);
            navigate('/auth');
          }}
        >
          Rate Store
        </Button>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground select-none">Your rating:</p>
            {userRating > 0 && (
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => setIsEditing(!isEditing)}
                  disabled={loading}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-destructive hover:text-destructive"
                  onClick={deleteRating}
                  disabled={loading}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
          {(userRating === 0 || isEditing) && (
            <div className="flex items-center gap-1">
              <span className="text-sm text-muted-foreground mr-2">Click to rate:</span>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => {
                    if (productId) {
                      submitRating(star);
                      setIsEditing(false);
                    } else {
                      toast({
                        title: "Error",
                        description: "Product information is required to rate",
                        variant: "destructive",
                      });
                    }
                  }}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  disabled={loading || !productId}
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
          )}
          {userRating > 0 && !isEditing && (
            <div className="flex items-center gap-1">
              <span className="text-sm text-muted-foreground mr-2">You rated:</span>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setIsEditing(true)}
                  className="cursor-pointer transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-7 h-7 ${
                      star <= userRating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
