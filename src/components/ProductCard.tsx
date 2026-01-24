'use client';

import React, { memo, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';
import FavoriteButton from './FavoriteButton';
import { ProductDescription } from './ProductDescription';
import { useCurrencyConversion } from '@/hooks/useCurrencyConversion';
import type { CurrencyCode } from '@/utils/currencyStorage';

// Skeleton loader component
export const ProductCardSkeleton: React.FC = () => (
  <div className="relative h-full flex flex-col rounded-lg sm:rounded-xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur-[25px] animate-pulse">
    <div className="relative aspect-[3/4] sm:aspect-[4/5] bg-gray-800" />
    <div className="flex-1 flex flex-col justify-between p-3 sm:p-4">
      <div className="space-y-2">
        <div className="h-3 bg-gray-700 rounded w-1/2" />
        <div className="h-4 bg-gray-700 rounded w-3/4" />
      </div>
      <div className="space-y-2 mt-3">
        <div className="h-5 bg-gray-700 rounded w-1/3" />
        <div className="h-3 bg-gray-700 rounded w-1/2" />
      </div>
    </div>
  </div>
);

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
  description?: string;
  description_en?: string;
  description_ua?: string;
  priceCurrency?: CurrencyCode;
}

const ProductCard: React.FC<ProductCardProps> = memo(
  ({
    id,
    name,
    image,
    price,
    minPrice,
    maxPrice,
    storeCount,
    category: _category,
    brand,
    isNew,
    description,
    description_en,
    description_ua,
  }) => {
    const { t } = useTranslation();
    const { formatPrice } = useCurrencyConversion();

    const toNumber = (value?: string | number): number | null => {
      if (value === undefined || value === null) return null;
      const num = typeof value === 'number' ? value : Number.parseFloat(String(value));
      return Number.isFinite(num) ? num : null;
    };
    const cardRef = useRef<HTMLDivElement>(null);

    // Safety checks
    if (!id || !name) {
      return null;
    }

    // Backend sends prices in correct currency via ?currency=UAH/USD
    // Just use the values as-is, no conversion needed
    const displayMinPrice = toNumber(minPrice ?? price);
    const displayMaxPrice = toNumber(maxPrice);
    const showPriceRange =
      displayMinPrice !== null && displayMaxPrice !== null && displayMinPrice !== displayMaxPrice;

    // Handle both 'image' and 'image_url' from different API responses
    const imgSrc = image || '/placeholder-product.jpg';

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

      requestAnimationFrame(() => {
        if (card) {
          card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
        }
      });
    };

    const handleMouseLeave = () => {
      if (!cardRef.current) return;
      requestAnimationFrame(() => {
        if (cardRef.current) {
          cardRef.current.style.transform =
            'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)';
        }
      });
    };

    return (
      <Link
        href={`/products/${id}`}
        className="group block h-full"
        aria-label={t('aria.viewProduct', { product: name })}
      >
        <div
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="relative h-full flex flex-col rounded-lg sm:rounded-xl overflow-hidden border border-foreground/10 bg-foreground/5 backdrop-blur-[25px] transition-all duration-300 ease-out md:hover:border-foreground/25 md:hover:bg-foreground/8 md:hover:shadow-[0_20px_50px_-15px_rgba(0,0,0,0.12)] md:hover:z-10 dark:border-white/10 dark:bg-white/5 dark:md:hover:border-white/25 dark:md:hover:bg-white/8 dark:md:hover:shadow-[0_20px_50px_-15px_rgba(255,255,255,0.1)]"
          role="article"
          aria-labelledby={`product-name-${id}`}
          style={{
            contain: 'layout style paint',
            willChange: 'transform',
            transformStyle: 'preserve-3d',
          }}
        >
          {/* Image Container - Reduced aspect ratio with subtle pattern background */}
          <div
            className="relative aspect-[3/4] sm:aspect-[4/5] overflow-hidden"
            style={{ background: 'var(--product-card-media-bg)' }}
          >
            <Image
              src={imgSrc}
              alt={name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
              className="object-cover transition-transform duration-500 md:group-hover:scale-105 filter grayscale md:group-hover:grayscale-0"
              style={{
                filter: 'grayscale(100%) contrast(1.1) brightness(1.05)',
              }}
              loading="lazy"
              quality={75}
            />

            {/* Subtle gradient on hover - NO WHITE GLOW */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 md:group-hover:opacity-100 transition-opacity duration-300" />

            {/* New Badge - Glassmorphism */}
            {isNew && (
              <div className="absolute top-2 sm:top-2 left-2 sm:left-2 px-2 sm:px-2.5 py-1 rounded-full bg-foreground/15 backdrop-blur-md border border-foreground/25 text-foreground text-[10px] sm:text-xs font-medium uppercase tracking-wider dark:bg-white/15 dark:border-white/25 dark:text-white">
                New
              </div>
            )}

            {/* Favorite Button - larger touch target on mobile */}
            <div className="absolute top-2 sm:top-2 right-2 sm:right-2 z-10 transition-all duration-300">
              <FavoriteButton
                productId={String(id)}
                variant="ghost"
                size="icon"
                className="w-10 h-10 sm:w-9 sm:h-9 rounded-full bg-foreground/20 backdrop-blur-sm active:bg-foreground/30 text-foreground dark:bg-black/40 dark:text-white"
              />
            </div>
          </div>

          {/* Content */}
          <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between">
            <div>
              {/* Brand */}
              {brand && (
                <p className="text-[10px] sm:text-xs text-foreground/50 uppercase tracking-[0.15em] mb-1 dark:text-white/50">
                  {brand}
                </p>
              )}

              {/* Product Name */}
              <h3
                id={`product-name-${id}`}
                className="font-display font-semibold text-sm sm:text-base text-foreground line-clamp-2 mb-1.5 dark:text-white"
              >
                {name}
              </h3>

              {/* Description */}
              {(description || description_en || description_ua) && (
                <ProductDescription
                  product={{
                    description,
                    description_en,
                    description_ua,
                  }}
                  maxLength={80}
                  showReadMore={false}
                  className="mb-2 text-xs text-foreground/70 dark:text-white/70"
                />
              )}
            </div>

            {/* Price */}
            <div className="mt-2">
              {showPriceRange ? (
                <p className="font-display text-sm sm:text-base font-bold text-foreground dark:text-white">
                  {formatPrice(displayMinPrice ?? 0)} - {formatPrice(displayMaxPrice ?? 0)}
                </p>
              ) : displayMinPrice !== null ? (
                <p className="font-display text-sm sm:text-base font-bold text-foreground dark:text-white">
                  {t('common.from')} {formatPrice(displayMinPrice)}
                </p>
              ) : (
                <p className="font-display text-sm sm:text-base font-bold text-foreground/50 dark:text-white/50">
                  {t('products.priceUnavailable', 'Price unavailable')}
                </p>
              )}
              {!!(storeCount && storeCount > 0) && (
                <p className="text-xs text-foreground/50 mt-0.5 dark:text-white/50">
                  {t('quickView.availableIn', { count: storeCount })}
                </p>
              )}
            </div>
          </div>
        </div>
      </Link>
    );
  }
);

ProductCard.displayName = 'ProductCard';

export default ProductCard;
