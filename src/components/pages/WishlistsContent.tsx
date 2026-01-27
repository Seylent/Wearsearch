'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { FolderHeart, Search, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import CollectionManager from '@/components/CollectionManager';
import { useCollections } from '@/hooks/useCollections';
import { useIsAuthenticated } from '@/hooks/useIsAuthenticated';
import { useQuery } from '@tanstack/react-query';
import collectionsService from '@/services/collectionsService';
import { cn } from '@/lib/utils';
import WishlistPrivacySettings from '@/components/WishlistPrivacySettings';
import { mapCollectionItemsResponse } from '@/utils/apiMappers';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useCurrencyConversion } from '@/hooks/useCurrencyConversion';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const getString = (value: unknown, fallback = ''): string =>
  typeof value === 'string' && value.trim() ? value : fallback;

export default function WishlistsContent({ className }: { className?: string }) {
  const { t } = useTranslation();
  const { collections } = useCollections();
  const isLoggedIn = useIsAuthenticated();
  const [activeCollectionId, setActiveCollectionId] = useState<string | null>(
    collections[0]?.id ?? null
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    if (!activeCollectionId && collections.length > 0) {
      setActiveCollectionId(collections[0].id);
    }
  }, [activeCollectionId, collections]);

  const { currency } = useCurrency();
  const { formatPrice } = useCurrencyConversion();

  const { data: collectionItems, isLoading: collectionItemsLoading } = useQuery({
    queryKey: ['collectionItems', activeCollectionId, currency],
    queryFn: () => collectionsService.getCollectionItems(activeCollectionId as string, currency),
    enabled: isLoggedIn && Boolean(activeCollectionId),
    staleTime: 1000 * 60 * 2,
    retry: false,
    refetchOnWindowFocus: false,
  });
  const mappedItems = useMemo(() => {
    if (!collectionItems) return [] as any[];
    if (Array.isArray(collectionItems)) return collectionItems as any[];
    const { items } = mapCollectionItemsResponse(collectionItems, currency);
    return items ?? [];
  }, [collectionItems, currency]);

  return (
    <div className={cn('min-h-screen bg-background text-foreground', className)}>
      <main className="container mx-auto px-4 sm:px-6 pt-24 sm:pt-28 pb-16">
        <div className="mb-10">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 mb-4 select-none">
                <FolderHeart className="w-4 h-4 text-foreground" />
                <span className="text-xs text-muted-foreground uppercase tracking-wider">
                  {t('collections.title', 'Wishlists')}
                </span>
              </div>
              <h1 className="font-display text-3xl sm:text-5xl font-bold mb-3 select-none">
                {t('collections.title', 'Wishlists')}
              </h1>
              <p className="text-muted-foreground text-base sm:text-lg select-none">
                {t('collections.subtitle', 'Group items you love into collections')}
              </p>
            </div>
            <div className="shrink-0 text-left sm:text-right">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSettings(!showSettings)}
                className="gap-2 w-full sm:w-auto"
              >
                <Share2 className="w-4 h-4" />
                {t('wishlist.shareWithFriends')}
              </Button>
              <p className="text-xs text-muted-foreground mt-2">{t('wishlist.shareHint')}</p>
            </div>
          </div>
        </div>

        {showSettings && <WishlistPrivacySettings className="mt-6 max-w-lg" />}

        <div className="relative w-full max-w-md mb-8 sm:mb-10 group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-foreground/10 to-foreground/5 rounded-full blur opacity-0 group-hover:opacity-30 transition duration-500"></div>
          <div className="relative flex items-center">
            <Search className="absolute left-4 w-5 h-5 text-muted-foreground group-focus-within:text-foreground transition-colors" />
            <Input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={t('collections.searchPlaceholder', 'Search wishlists...')}
              className="pl-12 pr-4 py-5 rounded-full bg-card/30 border-border/50 focus:border-foreground/40 focus:ring-foreground/20"
            />
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
          <CollectionManager
            className="lg:sticky lg:top-28"
            activeCollectionId={activeCollectionId}
            onSelect={setActiveCollectionId}
            filterQuery={searchQuery}
          />

          <div className="mb-16">
            <div className="flex items-center gap-2 sm:gap-3 mb-6">
              <div className="w-2 h-8 bg-gradient-to-b from-foreground to-foreground/50 rounded-full"></div>
              <h2 className="font-display text-xl sm:text-2xl font-bold">
                {collections.find(c => c.id === activeCollectionId)?.name ??
                  t('collections.title', 'Wishlists')}
              </h2>
            </div>

            {!activeCollectionId ? (
              <div className="text-center py-12 border border-dashed border-border/30 rounded-2xl bg-card/5">
                {t('collections.empty', 'Create a wishlist to get started')}
              </div>
            ) : collectionItemsLoading ? (
              <div className="text-center py-12 text-muted-foreground">Loading...</div>
            ) : mappedItems && mappedItems.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {mappedItems.map((item: any, index: number) => {
                  const productRecord = isRecord(item) ? item.product : item;
                  const productId =
                    productRecord?.id ??
                    productRecord?.product_id ??
                    (isRecord(item) ? item.product_id : undefined) ??
                    index;
                  const productName = getString(productRecord?.name, 'Unknown');
                  const productImage = productRecord?.image_url || productRecord?.image;
                  const priceValue =
                    productRecord?.price_min ?? productRecord?.price ?? productRecord?.min_price;
                  const numericPrice =
                    typeof priceValue === 'number'
                      ? priceValue
                      : typeof priceValue === 'string'
                        ? Number(priceValue)
                        : NaN;
                  const productPrice = Number.isFinite(numericPrice)
                    ? formatPrice(numericPrice)
                    : '—';
                  const productBrand = getString(productRecord?.brand);

                  return (
                    <Link
                      key={`${productId}-${index}`}
                      href={`/products/${productId}`}
                      className="group overflow-hidden rounded-2xl border border-border/40 bg-card/50 shadow-sm transition hover:border-foreground/40"
                    >
                      <div className="relative aspect-[3/4] bg-muted/30">
                        {productImage && (
                          <img
                            src={productImage}
                            alt={productName}
                            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                          />
                        )}
                      </div>
                      <div className="p-3 sm:p-4">
                        <div className="text-sm sm:text-base font-semibold leading-snug line-clamp-2">
                          {productName}
                        </div>
                        {productBrand && (
                          <div className="text-xs text-muted-foreground mt-1">{productBrand}</div>
                        )}
                        <div className="text-sm sm:text-base font-semibold mt-2 sm:mt-3">
                          {productPrice}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 border border-dashed border-border/30 rounded-2xl bg-card/5">
                {t('collections.empty', 'No products in this wishlist yet')}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
