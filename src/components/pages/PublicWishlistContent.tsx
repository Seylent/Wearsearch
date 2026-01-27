'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { getPublicWishlist, type PublicWishlist } from '@/services/wishlistService';
import { useCurrencyConversion } from '@/hooks/useCurrencyConversion';
import { cn } from '@/lib/utils';

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

export default function PublicWishlistContent({ shareId, className }: PublicWishlistContentProps) {
  const { t } = useTranslation();
  const { formatPrice } = useCurrencyConversion();
  const [data, setData] = useState<PublicWishlist | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    getPublicWishlist(shareId)
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
  }, [shareId]);

  const items = useMemo(() => data?.items ?? [], [data]);

  return (
    <div className={cn('min-h-screen bg-background text-foreground', className)}>
      <main className="container mx-auto px-4 sm:px-6 pt-24 sm:pt-28 pb-16">
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
            {items.map(item => {
              const price = getNumber(item.price);
              return (
                <Link
                  key={item.id}
                  href={item.id ? `/products/${item.id}` : '#'}
                  className="group overflow-hidden rounded-2xl border border-border/40 bg-card/50 shadow-sm transition hover:border-foreground/40"
                >
                  <div className="relative aspect-[4/5] bg-muted/30">
                    {item.image_url && (
                      <img
                        src={item.image_url}
                        alt={item.name || 'Product'}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
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
                    <div className="text-base font-semibold mt-3">
                      {price !== undefined ? formatPrice(price) : '—'}
                    </div>
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
