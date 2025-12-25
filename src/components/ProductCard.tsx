import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ImageDebugger from './ImageDebugger';
import FavoriteButton from './FavoriteButton';

interface ProductCardProps {
  id: number | string;
  name: string;
  image?: string;
  price?: string | number;
  category?: string;
  brand?: string;
  isNew?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = memo(({ id, name, image, price, category, brand, isNew }) => {
  const { t } = useTranslation();
  // Handle both 'image' and 'image_url' from different API responses
  const imgSrc = image || '';

  return (
    <Link to={`/product/${id}`} className="group block h-full">
      <div className="relative h-full flex flex-col rounded-lg sm:rounded-xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur-[25px] transition-all duration-300 hover:border-white/20 hover:bg-white/8 hover:z-10">
        {/* Image Container - Reduced aspect ratio with subtle pattern background */}
        <div className="relative aspect-[3/4] sm:aspect-[4/5] overflow-hidden" style={{
          background: 'radial-gradient(circle at 20% 30%, rgba(255,255,255,0.05) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(255,255,255,0.03) 0%, transparent 50%), linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(20,20,20,0.95) 100%)'
        }}>
          <ImageDebugger 
            src={imgSrc} 
            alt={name} 
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 filter grayscale group-hover:grayscale-0" 
            style={{
              filter: 'grayscale(100%) contrast(1.2) brightness(1.1)',
            }}
          />
          
          {/* Subtle gradient on hover - NO WHITE GLOW */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* New Badge - Glassmorphism */}
          {isNew && (
            <div className="absolute top-1.5 sm:top-2 left-1.5 sm:left-2 px-1.5 sm:px-2 py-0.5 rounded-full bg-white/15 backdrop-blur-md border border-white/25 text-white text-[8px] sm:text-[9px] font-medium uppercase tracking-wider">
              New
            </div>
          )}
          
          {/* Favorite Button */}
          <div className="absolute top-1.5 sm:top-2 right-1.5 sm:right-2 z-10 transition-all duration-300 scale-90 sm:scale-100">
            <FavoriteButton productId={String(id)} variant="ghost" size="icon" />
          </div>
        </div>

        {/* Content - Reduced padding */}
        <div className="p-2 sm:p-3 flex-1 flex flex-col justify-between">
          <div>
            {/* Brand */}
            {brand && (
              <p className="text-[8px] sm:text-[9px] text-white/50 uppercase tracking-[0.15em] mb-0.5 sm:mb-1">
                {brand}
              </p>
            )}
            
            {/* Product Name */}
            <h3 className="font-display font-semibold text-[11px] sm:text-xs text-white line-clamp-2 mb-1 sm:mb-1.5">
              {name}
            </h3>
          </div>
          
          {/* Price */}
          <div className="mt-1 sm:mt-2">
            <p className="font-display text-xs sm:text-sm font-bold text-white">
              {t('common.from')} ₴{price ?? '0'}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
});

ProductCard.displayName = 'ProductCard';

export default ProductCard;
