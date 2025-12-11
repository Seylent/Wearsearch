import { Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useFavorites, useAddFavorite, useRemoveFavorite } from '@/hooks/useApi';
import { isAuthenticated } from '@/utils/authStorage';

interface FavoriteButtonProps {
  productId: string;
  className?: string;
  size?: 'default' | 'sm' | 'lg' | 'icon';
  variant?: 'default' | 'outline' | 'ghost';
  showText?: boolean;
}

export function FavoriteButton({ 
  productId, 
  className = '', 
  size = 'icon',
  variant = 'ghost',
  showText = false
}: FavoriteButtonProps) {
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Use React Query hooks
  const { data: favoritesData, isLoading: isFavoritesLoading } = useFavorites();
  const addFavorite = useAddFavorite();
  const removeFavorite = useRemoveFavorite();

  // Extract favorites array from response
  const favorites = favoritesData?.favorites || favoritesData || [];

  // Check if current product is in favorites
  // Handle different response formats from backend
  const isFavorited = Array.isArray(favorites) && favorites.some(
    (fav: any) => {
      // Handle different possible field names
      const favProductId = fav.product_id || fav.productId || fav.item_id || fav.id;
      const match = String(favProductId) === String(productId);
      return match;
    }
  );

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated()) {
      toast({
        title: 'Login Required',
        description: 'Please login to save products. Click the user icon in the navigation.',
        variant: 'destructive',
      });
      return;
    }

    try {
      if (isFavorited) {
        await removeFavorite.mutateAsync(productId);
        toast({
          title: 'Success',
          description: 'Removed from favorites',
        });
      } else {
        await addFavorite.mutateAsync(productId);
        toast({
          title: 'Success',
          description: 'Added to favorites',
        });
      }
    } catch (error: any) {
      console.error('Toggle favorite error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update favorites',
        variant: 'destructive',
      });
    }
  };

  return (
    <Button
      onClick={handleToggleFavorite}
      disabled={addFavorite.isPending || removeFavorite.isPending || isFavoritesLoading}
      variant={variant}
      size={size}
      className={`${className} transition-all ${isFavorited ? 'text-red-500 hover:text-red-600' : 'hover:text-red-400'}`}
      title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
    >
      <Heart 
        className={`h-5 w-5 ${showText ? 'mr-2' : ''} transition-all ${
          isFavorited ? 'fill-red-500 scale-110' : 'hover:scale-110'
        }`}
      />
      {showText && (isFavorited ? '❤️ Saved' : 'Save')}
    </Button>
  );
}

export default FavoriteButton;
