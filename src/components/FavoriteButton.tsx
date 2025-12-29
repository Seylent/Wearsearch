import { Heart } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAddFavorite, useRemoveFavorite } from '@/hooks/useApi';
import { isAuthenticated } from '@/utils/authStorage';
import { 
  isGuestFavorite, 
  addGuestFavorite, 
  removeGuestFavorite 
} from '@/services/guestFavorites';
import { useTranslation } from 'react-i18next';
import { translateSuccessCode, translateErrorCode } from '@/utils/errorTranslation';
import { useFavoritesContext } from '@/contexts/FavoritesContext';
import { cn } from '@/lib/utils';

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
  const { t } = useTranslation();
  const isLoggedIn = isAuthenticated();
  const [guestFavorited, setGuestFavorited] = useState(false);
  
  // Use context instead of direct hook call (prevents multiple API requests)
  const { isFavorited: isInFavorites, isLoading: isFavoritesLoading } = useFavoritesContext();
  const addFavorite = useAddFavorite();
  const removeFavorite = useRemoveFavorite();

  // Check guest favorites on mount and when productId changes
  useEffect(() => {
    if (!isLoggedIn) {
      setGuestFavorited(isGuestFavorite(productId));
    }
  }, [productId, isLoggedIn]);

  // Check if current product is in favorites (from context - no extra API calls!)
  const isFavorited = isLoggedIn
    ? isInFavorites(productId)
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
          title: translateSuccessCode('FAVORITE_REMOVED'),
          description: t('common.success'),
        });
      } else {
        addGuestFavorite(productId);
        setGuestFavorited(true);
        toast({
          title: translateSuccessCode('FAVORITE_ADDED'),
          description: t('products.saved'),
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
      className={cn(
        'transition-all',
        isFavorited ? 'text-red-500 hover:text-red-600' : 'hover:text-red-400',
        className
      )}
      title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
      aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
      aria-pressed={isFavorited}
    >
      <Heart 
        className={cn(
          'h-5 w-5 transition-all',
          showText && 'mr-2',
          isFavorited ? 'fill-red-500 scale-110' : 'hover:scale-110'
        )}
        aria-hidden="true"
      />
      {showText && (isFavorited ? `❤️ ${t('products.saved')}` : t('products.save'))}
    </Button>
  );
}

export default FavoriteButton;
