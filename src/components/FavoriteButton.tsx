import { Heart } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useFavorites, useAddFavorite, useRemoveFavorite } from '@/hooks/useApi';
import { isAuthenticated } from '@/utils/authStorage';
import { 
  isGuestFavorite, 
  addGuestFavorite, 
  removeGuestFavorite 
} from '@/services/guestFavorites';

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
  const isLoggedIn = isAuthenticated();
  const [guestFavorited, setGuestFavorited] = useState(false);
  
  // Use React Query hooks (only when logged in)
  const { data: favoritesData, isLoading: isFavoritesLoading } = useFavorites();
  const addFavorite = useAddFavorite();
  const removeFavorite = useRemoveFavorite();

  // Extract favorites array from response
  const favorites = favoritesData?.favorites || [];

  // Check guest favorites on mount and when productId changes
  useEffect(() => {
    if (!isLoggedIn) {
      setGuestFavorited(isGuestFavorite(productId));
    }
  }, [productId, isLoggedIn]);

  // Check if current product is in favorites
  // Backend returns: { favorites: [{ id, product_id, created_at, product: {...} }] }
  const isFavorited = isLoggedIn
    ? Array.isArray(favorites) && favorites.some(
        (fav: any) => {
          const favProductId = fav.product_id || fav.productId;
          return String(favProductId) === String(productId);
        }
      )
    : guestFavorited;

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Guest users: manage favorites in localStorage
    if (!isLoggedIn) {
      if (guestFavorited) {
        removeGuestFavorite(productId);
        setGuestFavorited(false);
        toast({
          title: 'Видалено',
          description: 'Товар видалено з обраного',
        });
      } else {
        addGuestFavorite(productId);
        setGuestFavorited(true);
        toast({
          title: 'Додано',
          description: 'Увійдіть щоб зберегти назавжди',
        });
      }
      return;
    }

    // Logged-in users: sync with backend
    try {
      if (isFavorited) {
        await removeFavorite.mutateAsync(productId);
        toast({
          title: 'Успішно',
          description: 'Товар видалено з обраного',
        });
      } else {
        await addFavorite.mutateAsync(productId);
        toast({
          title: 'Успішно',
          description: 'Товар додано в обране',
        });
      }
    } catch (error: any) {
      console.error('Favorite action failed:', error);
      const errorMsg = error.response?.data?.error || error.response?.data?.message || error.message || 'Помилка при оновленні обраного';
      toast({
        title: 'Помилка',
        description: errorMsg,
        variant: 'destructive',
      });
    }
  };

  return (
    <Button
      onClick={handleToggleFavorite}
      disabled={isLoggedIn && (addFavorite.isPending || removeFavorite.isPending || isFavoritesLoading)}
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
