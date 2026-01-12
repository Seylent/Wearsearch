'use client';

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

// Heart burst particles component
const HeartBurst = ({ show }: { show: boolean }) => {
  if (!show) return null;
  
  return (
    <div className="absolute inset-0 pointer-events-none overflow-visible">
      {/* Expanding ring */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-4 h-4 rounded-full border-2 border-red-400 animate-ping opacity-75" />
      </div>
      
      {/* Mini hearts bursting out */}
      {Array.from({ length: 6 }, (_, i) => (
        <div
          key={`heart-${i}`}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{
            animation: `heartBurst 0.6s ease-out forwards`,
            animationDelay: `${i * 0.05}s`,
            transform: `rotate(${i * 60}deg)`,
          }}
        >
          <Heart 
            className="w-2 h-2 fill-red-400 text-red-400"
            style={{
              animation: `heartFade 0.6s ease-out forwards`,
              animationDelay: `${i * 0.05}s`,
            }}
          />
        </div>
      ))}
      
      {/* CSS for custom animations */}
      <style>{`
        @keyframes heartBurst {
          0% { transform: rotate(var(--rotate, 0deg)) translateY(0); }
          100% { transform: rotate(var(--rotate, 0deg)) translateY(-20px); }
        }
        @keyframes heartFade {
          0% { opacity: 1; transform: scale(1); }
          100% { opacity: 0; transform: scale(0.5); }
        }
      `}</style>
    </div>
  );
};

export function FavoriteButton({ 
  productId, 
  className = '', 
  size = 'icon',
  variant = 'ghost',
  showText = false
}: Readonly<FavoriteButtonProps>) {
  const { toast } = useToast();
  const { t } = useTranslation();
  const isLoggedIn = isAuthenticated();
  const [guestFavorited, setGuestFavorited] = useState(false);
  const [showBurst, setShowBurst] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  
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

  const triggerBurstAnimation = () => {
    setShowBurst(true);
    setIsAnimating(true);
    setTimeout(() => setShowBurst(false), 700);
    setTimeout(() => setIsAnimating(false), 300);
  };

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
        triggerBurstAnimation();
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
        triggerBurstAnimation();
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
        'transition-all relative overflow-visible',
        isFavorited ? 'text-red-500 md:hover:text-red-600' : 'md:hover:text-red-400',
        className
      )}
      title={isFavorited ? t('products.removeFromFavorites') : t('products.addToFavorites')}
      aria-label={isFavorited ? t('products.removeFromFavorites') : t('products.addToFavorites')}
      aria-pressed={isFavorited}
      role="button"
    >
      <HeartBurst show={showBurst} />
      <Heart 
        className={cn(
          'h-5 w-5 transition-all duration-200',
          showText && 'mr-2',
          isFavorited ? 'fill-red-500' : '',
          isAnimating && 'scale-125',
          !isAnimating && isFavorited && 'scale-110',
          !isAnimating && !isFavorited && 'md:hover:scale-110'
        )}
        aria-hidden="true"
      />
      {showText && (isFavorited ? `❤️ ${t('products.saved')}` : t('products.save'))}
    </Button>
  );
}

export default FavoriteButton;
