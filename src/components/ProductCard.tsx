'use client';

import React, { memo, useRef } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { LazyImage } from './common/LazyImage';
import FavoriteButton from './FavoriteButton';
import { useCurrencyConversion } from '@/hooks/useCurrencyConversion';

interface ProductCardProps {
  id: number | string;
  name: string;
  image?: string;
  price?: string | number;
  minPrice?: string | number;
  maxPrice?: string | number;
  storeCount?: number;
  category?: string;
  brand?: string;
  isNew?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = memo(({ id, name, image, price, minPrice, maxPrice, storeCount, category: _category, brand, isNew }) => {
  const { t } = useTranslation();
  const { formatPrice } = useCurrencyConversion();
  const cardRef = useRef<HTMLDivElement>(null);
  
  // Backend sends prices in correct currency via ?currency=UAH/USD
  // Just use the values as-is, no conversion needed
  const displayMinPrice = minPrice ?? price;
  const displayMaxPrice = maxPrice;
  const showPriceRange = displayMinPrice && displayMaxPrice && displayMinPrice !== displayMaxPrice;
  
  // Handle both 'image' and 'image_url' from different API responses
  const imgSrc = image || '';

  // 3D tilt effect on mouse move (desktop only)
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || window.innerWidth < 768) return;
    
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = (y - centerY) / 20;
    const rotateY = (centerX - x) / 20;
    
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
  };

  const handleMouseLeave = () => {
    if (!cardRef.current) return;
    cardRef.current.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)';
  };

  return (
    <Link 
      href={`/product/${id}`} 
      className="group block h-full"
      aria-label={t('aria.viewProduct', { product: name })}
    >
      <div 
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative h-full flex flex-col rounded-lg sm:rounded-xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur-[25px] transition-all duration-300 ease-out md:hover:border-white/25 md:hover:bg-white/8 md:hover:shadow-[0_20px_50px_-15px_rgba(255,255,255,0.1)] md:hover:z-10" 
        role="article"
        aria-labelledby={`product-name-${id}`}
        style={{
          contain: 'layout style paint',
          willChange: 'transform',
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Image Container - Reduced aspect ratio with subtle pattern background */}
        <div className="relative aspect-[3/4] sm:aspect-[4/5] overflow-hidden" style={{
          background: 'radial-gradient(circle at 20% 30%, rgba(255,255,255,0.05) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(255,255,255,0.03) 0%, transparent 50%), linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(20,20,20,0.95) 100%)'
        }}>
          <LazyImage 
            src={imgSrc} 
            alt={name} 
            rootMargin="200px"
            className="w-full h-full object-cover transition-transform duration-500 md:group-hover:scale-105 filter grayscale md:group-hover:grayscale-0" 
            style={{
              filter: 'grayscale(100%) contrast(1.2) brightness(1.1)',
            }}
          />
          
          {/* Subtle gradient on hover - NO WHITE GLOW */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 md:group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* New Badge - Glassmorphism */}
          {isNew && (
            <div className="absolute top-2 sm:top-2 left-2 sm:left-2 px-2 sm:px-2.5 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/25 text-white text-[10px] sm:text-xs font-medium uppercase tracking-wider">
              New
            </div>
          )}
          
          {/* Favorite Button - larger touch target on mobile */}
          <div className="absolute top-2 sm:top-2 right-2 sm:right-2 z-10 transition-all duration-300">
            <FavoriteButton 
              productId={String(id)} 
              variant="ghost" 
              size="icon"
              className="w-10 h-10 sm:w-9 sm:h-9 rounded-full bg-black/40 backdrop-blur-sm active:bg-white/20"
            />
          </div>
        </div>

        {/* Content */}
        <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between">
          <div>
            {/* Brand */}
            {brand && (
              <p className="text-[10px] sm:text-xs text-white/50 uppercase tracking-[0.15em] mb-1">
                {brand}
              </p>
            )}
            
            {/* Product Name */}
            <h3 
              id={`product-name-${id}`}
              className="font-display font-semibold text-sm sm:text-base text-white line-clamp-2 mb-1.5"
            >
              {name}
            </h3>
          </div>
          
          {/* Price */}
          <div className="mt-2">
            {showPriceRange ? (
              <p className="font-display text-sm sm:text-base font-bold text-white">
                {formatPrice(Number(displayMinPrice) || 0)} - {formatPrice(Number(displayMaxPrice) || 0)}
              </p>
            ) : (
              <p className="font-display text-sm sm:text-base font-bold text-white">
                {t('common.from')} {formatPrice(Number(displayMinPrice) || 0)}
              </p>
            )}
            {!!(storeCount && storeCount > 0) && (
              <p className="text-xs text-white/50 mt-0.5">
                {t('quickView.availableIn', { count: storeCount })}
              </p>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
});

ProductCard.displayName = 'ProductCard';

export default ProductCard;
