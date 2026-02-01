'use client';

import React, { memo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';
import FavoriteButton from './FavoriteButton';
import { ProductDescription } from './ProductDescription';
import { useCurrencyConversion } from '@/hooks/useCurrencyConversion';
import type { CurrencyCode } from '@/utils/currencyStorage';

// Skeleton loader component
export const ProductCardSkeleton: React.FC = () => (
  <div className="relative h-full flex flex-col animate-pulse rounded-2xl border border-earth/10 bg-white overflow-hidden">
    <div className="relative aspect-[3/4] bg-muted" />
    <div className="flex-1 flex flex-col justify-between pt-4">
      <div className="space-y-2">
        <div className="h-3 bg-border w-1/3" />
        <div className="h-4 bg-border w-2/3" />
      </div>
      <div className="space-y-2 mt-3">
        <div className="h-5 bg-border w-1/4" />
        <div className="h-3 bg-border w-1/2" />
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
  priority?: boolean;
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
    brand,
    isNew,
    description,
    description_en,
    description_ua,
    priceCurrency,
    priority = false,
  }) => {
    const { t } = useTranslation();
    const { currency, formatPrice } = useCurrencyConversion();

    const toNumber = (value?: string | number): number | null => {
      if (value === undefined || value === null) return null;
      const num = typeof value === 'number' ? value : Number.parseFloat(String(value));
      return Number.isFinite(num) ? num : null;
    };

    // Safety checks
    if (!id || !name) {
      return null;
    }

    const resolveCurrency = (value?: CurrencyCode | string): CurrencyCode => {
      if (value === 'USD' || value === 'UAH') return value;
      return currency;
    };

    const formatWithCurrency = (value: number, override?: CurrencyCode | string) => {
      const active = resolveCurrency(override);
      if (override && active !== currency) {
        const symbol = active === 'USD' ? '$' : '₴';
        return active === 'USD' ? `${symbol}${value.toFixed(2)}` : `${value.toFixed(0)} ${symbol}`;
      }
      return formatPrice(value);
    };

    // Backend sends prices in correct currency via ?currency=UAH/USD
    // Just use the values as-is, no conversion needed
    const displayMinPrice = toNumber(minPrice ?? price);
    const displayMaxPrice = toNumber(maxPrice);
    const showPriceRange =
      displayMinPrice !== null && displayMaxPrice !== null && displayMinPrice !== displayMaxPrice;

    // Handle both 'image' and 'image_url' from different API responses
    const imgSrc = image || '/placeholder-product.jpg';

    return (
      <Link
        href={`/products/${id}`}
        className="group block h-full"
        aria-label={t('aria.viewProduct', { product: name })}
      >
        <div
          className="relative h-full flex flex-col rounded-2xl border border-earth/10 bg-white overflow-hidden transition-all duration-200 hover:border-earth/30 hover:shadow-[0_10px_30px_rgba(0,0,0,0.08)]"
          role="article"
          aria-labelledby={`product-name-${id}`}
        >
          <div className="relative aspect-[3/4] overflow-hidden bg-white">
            <Image
              src={imgSrc}
              alt={name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
              className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:scale-105"
              loading={priority ? undefined : 'lazy'}
              quality={75}
              priority={priority}
            />

            {isNew && (
              <div className="absolute top-3 left-3 px-2 py-1 text-[10px] uppercase tracking-[0.2em] bg-white text-earth border border-border">
                New
              </div>
            )}

            <div className="absolute top-3 right-3 z-10 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300">
              <FavoriteButton
                productId={String(id)}
                variant="ghost"
                size="icon"
                className="w-10 h-10 rounded-full bg-white text-earth border border-border hover:bg-muted"
              />
            </div>
          </div>

          <div className="pt-6 flex-1 flex flex-col justify-between">
            <div>
              {brand && (
                <p className="text-xs uppercase tracking-[0.2em] text-warm-gray mb-1">{brand}</p>
              )}

              <h3
                id={`product-name-${id}`}
                className="font-serif text-xl text-earth line-clamp-2 mb-2 transition-colors group-hover:text-warm-gray"
              >
                {name}
              </h3>

              {(description || description_en || description_ua) && (
                <ProductDescription
                  product={{
                    description,
                    description_en,
                    description_ua,
                  }}
                  maxLength={80}
                  showReadMore={false}
                  className="mb-2 text-sm text-warm-gray font-light"
                />
              )}
            </div>

            <div className="mt-2">
              {showPriceRange ? (
                <p className="text-base text-earth font-medium">
                  {formatWithCurrency(displayMinPrice ?? 0, priceCurrency)} -
                  {formatWithCurrency(displayMaxPrice ?? 0, priceCurrency)}
                </p>
              ) : displayMinPrice !== null ? (
                <p className="text-base text-earth font-medium">
                  {t('common.from')} {formatWithCurrency(displayMinPrice, priceCurrency)}
                </p>
              ) : (
                <p className="text-base text-warm-gray">
                  {t('products.priceUnavailable', 'Price unavailable')}
                </p>
              )}
              {!!(storeCount && storeCount > 0) && (
                <p className="text-xs text-warm-gray mt-1">
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
