import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { userService } from '@/services/userService';

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
  const [isFavorited, setIsFavorited] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
    checkFavoriteStatus();
  }, [productId]);

  const checkAuth = () => {
    const token = localStorage.getItem('access_token');
    setIsCheckingAuth(!token);
  };

  const checkFavoriteStatus = async () => {
    try {
      const result = await userService.checkFavorite(productId);
      if (result && typeof result.is_favorited === 'boolean') {
        setIsFavorited(result.is_favorited);
      } else {
        // Fallback: check if product is in favorites list
        const isFav = await userService.isFavorite(productId);
        setIsFavorited(isFav);
      }
    } catch (error) {
      console.error('Failed to check favorite status:', error);
      // Fallback to false on error
      setIsFavorited(false);
    }
  };

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const token = localStorage.getItem('access_token');
    if (!token) {
      toast({
        title: 'Login Required',
        description: 'Please login to save products',
        variant: 'destructive',
      });
      navigate('/auth');
      return;
    }

    setIsLoading(true);

    try {
      const result = await userService.toggleFavorite(productId);
      setIsFavorited(result.is_favorited);
      
      toast({
        title: 'Success',
        description: result.message,
      });
    } catch (error: any) {
      console.error('Toggle favorite error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update favorites',
        variant: 'destructive',
      });
      // Refresh status to sync with backend state
      await checkFavoriteStatus();
    } finally {
      setIsLoading(false);
    }
  };

  if (isCheckingAuth) {
    return null;
  }

  return (
    <Button
      onClick={handleToggleFavorite}
      disabled={isLoading}
      variant={variant}
      size={size}
      className={`${className} ${isFavorited ? 'text-red-500' : ''}`}
      title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
    >
      <Heart 
        className={`h-5 w-5 ${showText ? 'mr-2' : ''} ${isFavorited ? 'fill-red-500' : ''}`}
      />
      {showText && (isFavorited ? 'Saved' : 'Save')}
    </Button>
  );
}

export default FavoriteButton;
