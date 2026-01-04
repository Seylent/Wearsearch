import { Heart } from 'lucide-react';
import { useState, useEffect } from 'react';
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
import { translateSuccessCode } from '@/utils/errorTranslation';
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
    } catch (error: unknown) {
      console.error('Favorite action failed:', error);
      const errorMsg = (() => {
        if (!error || typeof error !== 'object') return 'Помилка при оновленні обраного';
        const maybeAxiosError = error as {
          response?: { data?: { error?: unknown; message?: unknown } };
          message?: unknown;
        };
        const apiError = maybeAxiosError.response?.data?.error;
        const apiMessage = maybeAxiosError.response?.data?.message;
        const message = maybeAxiosError.message;
        if (typeof apiError === 'string' && apiError) return apiError;
        if (typeof apiMessage === 'string' && apiMessage) return apiMessage;
        if (typeof message === 'string' && message) return message;
        return 'Помилка при оновленні обраного';
      })();
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
        isFavorited ? 'text-red-500 md:hover:text-red-600' : 'md:hover:text-red-400',
        className
      )}
      title={isFavorited ? t('products.removeFromFavorites') : t('products.addToFavorites')}
      aria-label={isFavorited ? t('products.removeFromFavorites') : t('products.addToFavorites')}
      aria-pressed={isFavorited}
      role="button"
    >
      <Heart 
        className={cn(
          'h-5 w-5 transition-all',
          showText && 'mr-2',
          isFavorited ? 'fill-red-500 scale-110' : 'md:hover:scale-110'
        )}
        aria-hidden="true"
      />
      {showText && (isFavorited ? `❤️ ${t('products.saved')}` : t('products.save'))}
    </Button>
  );
}

export default FavoriteButton;
