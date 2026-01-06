import React from 'react';
import { useTranslation } from 'react-i18next';
import { Heart, Share2, ZoomIn, Store } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileActionBarProps {
  productId: string;
  productName: string;
  isFavorited?: boolean;
  onFavoriteClick: () => void;
  onShareClick: () => void;
  onZoomClick: () => void;
  onBuyClick?: () => void;
  storesCount?: number;
  className?: string;
}

const MobileActionBar: React.FC<MobileActionBarProps> = ({
  isFavorited = false,
  onFavoriteClick,
  onShareClick,
  onZoomClick,
  onBuyClick,
  storesCount = 0,
  className,
}) => {
  const { t } = useTranslation();

  return (
    <div 
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 md:hidden",
        "bg-black/90 backdrop-blur-xl border-t border-white/10",
        "safe-area-inset-bottom",
        className
      )}
    >
      <div className="flex items-stretch justify-around px-2 py-2">
        {/* Zoom */}
        <button
          onClick={onZoomClick}
          className="flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-xl active:bg-white/10 transition-colors touch-manipulation min-w-[64px]"
          aria-label={t('mobileActions.zoom')}
        >
          <ZoomIn className="w-5 h-5 text-white/80" />
          <span className="text-[10px] text-white/60 font-medium">
            {t('mobileActions.zoom')}
          </span>
        </button>

        {/* Favorite */}
        <button
          onClick={onFavoriteClick}
          className="flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-xl active:bg-white/10 transition-colors touch-manipulation min-w-[64px]"
          aria-label={isFavorited ? t('products.removeFromFavorites') : t('products.addToFavorites')}
        >
          <Heart 
            className={cn(
              "w-5 h-5 transition-all",
              isFavorited ? "fill-red-500 text-red-500" : "text-white/80"
            )} 
          />
          <span className={cn(
            "text-[10px] font-medium",
            isFavorited ? "text-red-400" : "text-white/60"
          )}>
            {isFavorited ? t('mobileActions.saved') : t('mobileActions.save')}
          </span>
        </button>

        {/* Share */}
        <button
          onClick={onShareClick}
          className="flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-xl active:bg-white/10 transition-colors touch-manipulation min-w-[64px]"
          aria-label={t('mobileActions.share')}
        >
          <Share2 className="w-5 h-5 text-white/80" />
          <span className="text-[10px] text-white/60 font-medium">
            {t('mobileActions.share')}
          </span>
        </button>

        {/* Buy / View Stores - Main CTA */}
        {onBuyClick && storesCount > 0 && (
          <button
            onClick={onBuyClick}
            className="flex flex-col items-center justify-center gap-1 px-5 py-2 rounded-xl bg-white text-black active:bg-white/90 transition-colors touch-manipulation min-w-[80px]"
            aria-label={t('mobileActions.viewStores')}
          >
            <Store className="w-5 h-5" />
            <span className="text-[10px] font-semibold">
              {t('mobileActions.stores', { count: storesCount })}
            </span>
          </button>
        )}
      </div>
    </div>
  );
};

export default MobileActionBar;
