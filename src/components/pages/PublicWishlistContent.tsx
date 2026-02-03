'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';
import { getPublicWishlist, type PublicWishlist } from '@/services/wishlistService';
import { useCurrency } from '@/contexts/CurrencyContext';
import { cn } from '@/lib/utils';
import { usePresignedImages } from '@/hooks/usePresignedImage';

interface PublicWishlistContentProps {
  shareId: string;
  className?: string;
}

const getNumber = (value: unknown): number | undefined => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
};

const normalizeCurrency = (value: unknown): 'USD' | 'UAH' =>
  typeof value === 'string' && value.toUpperCase() === 'USD' ? 'USD' : 'UAH';

const formatPriceValue = (price: number, currency: 'USD' | 'UAH'): string => {
  const symbol = currency === 'USD' ? '$' : '₴';
  return currency === 'USD' ? `${symbol}${price.toFixed(2)}` : `${price.toFixed(0)} ${symbol}`;
};

const formatPriceRangeValue = (
  minPrice: number,
  maxPrice: number,
  currency: 'USD' | 'UAH'
): string => {
  const symbol = currency === 'USD' ? '$' : '₴';
  return currency === 'USD'
    ? `${symbol}${minPrice.toFixed(2)} - ${symbol}${maxPrice.toFixed(2)}`
    : `${minPrice.toFixed(0)} ${symbol} - ${maxPrice.toFixed(0)} ${symbol}`;
};

export default function PublicWishlistContent({ shareId, className }: PublicWishlistContentProps) {
  const { t } = useTranslation();
  const { currency } = useCurrency();
  const [data, setData] = useState<PublicWishlist | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    getPublicWishlist(shareId, currency)
      .then(result => {
        if (isMounted) setData(result);
      })
      .catch(() => {
        if (isMounted) setData(null);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [shareId, currency]);

  const items = useMemo(() => data?.items ?? [], [data]);
  const resolvedImages = usePresignedImages(items.map(item => item.image_url ?? ''));

  return (
    <div className={cn('min-h-screen bg-background text-foreground', className)}>
      <main className="max-w-[1800px] mx-auto px-6 md:px-12 lg:px-16 pt-24 sm:pt-28 pb-16">
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 mb-3 select-none">
            <span className="text-xs text-muted-foreground uppercase tracking-wider">
              {t('wishlist.publicTitle', 'Public wishlist')}
            </span>
          </div>
          <h1 className="font-display text-3xl sm:text-5xl font-bold mb-2">
            {data?.owner_name ? `${data.owner_name}` : t('wishlist.sharedList', 'Shared list')}
          </h1>
          <p className="text-muted-foreground">
            {t('wishlist.publicSubtitle', 'Items saved in this wishlist')}
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-16 text-muted-foreground">Loading...</div>
        ) : items.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item, index) => {
              const minPrice = getNumber(item.price) ?? getNumber(item.price_min);
              const maxPrice = getNumber(item.max_price);
              const itemCurrency = normalizeCurrency(item.currency);
              const hasRange =
                minPrice !== undefined && maxPrice !== undefined && maxPrice !== minPrice;

              const priceLabel =
                minPrice === undefined
                  ? '—'
                  : hasRange
                    ? formatPriceRangeValue(minPrice, maxPrice, itemCurrency)
                    : formatPriceValue(minPrice, itemCurrency);
              return (
                <Link
                  key={item.id}
                  href={item.id ? `/products/${item.id}` : '#'}
                  className="group overflow-hidden rounded-2xl border border-border/40 bg-card/50 shadow-sm transition hover:border-foreground/40"
                >
                  <div className="relative aspect-[4/5] bg-muted/30">
                    {(resolvedImages[index] || item.image_url) && (
                      <Image
                        src={resolvedImages[index] || item.image_url || ''}
                        alt={item.name || 'Product'}
                        fill
                        sizes="(max-width: 768px) 50vw, 25vw"
                        className="object-cover transition duration-300 group-hover:scale-[1.02]"
                      />
                    )}
                  </div>
                  <div className="p-4">
                    <div className="text-sm font-semibold leading-snug line-clamp-2">
                      {item.name || t('products.unknown', 'Unknown product')}
                    </div>
                    {item.brand && (
                      <div className="text-xs text-muted-foreground mt-1">{item.brand}</div>
                    )}
                    <div className="text-base font-semibold mt-3">{priceLabel}</div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 border border-dashed border-border/30 rounded-2xl bg-card/5">
            {t('wishlist.emptyPublic', 'No products in this wishlist yet')}
          </div>
        )}
      </main>
    </div>
  );
}
