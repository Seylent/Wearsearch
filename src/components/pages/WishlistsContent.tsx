'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FolderHeart, Search, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import CollectionManager from '@/components/CollectionManager';
import ProductCard from '@/components/ProductCard';
import { useCollections } from '@/hooks/useCollections';
import { useIsAuthenticated } from '@/hooks/useIsAuthenticated';
import { useQuery } from '@tanstack/react-query';
import collectionsService from '@/services/collectionsService';
import { cn } from '@/lib/utils';
import WishlistPrivacySettings from '@/components/WishlistPrivacySettings';
import { mapCollectionItemsResponse } from '@/utils/apiMappers';
import { useCurrency } from '@/contexts/CurrencyContext';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const getString = (value: unknown, fallback = ''): string =>
  typeof value === 'string' && value.trim() ? value : fallback;

const toNumber = (value: unknown): number | undefined => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number.parseFloat(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return undefined;
};

const getStorePrices = (value: unknown): number[] => {
  const record = isRecord(value) ? value : {};
  const stores = Array.isArray(record.product_stores)
    ? record.product_stores
    : Array.isArray(record.stores)
      ? record.stores
      : [];

  return stores
    .map(store => {
      if (!isRecord(store)) return undefined;
      return toNumber(store.price ?? store.price_min ?? store.min_price);
    })
    .filter((price): price is number => typeof price === 'number');
};

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
                  const itemRecord = isRecord(item) ? item : {};
                  const productRecord = isRecord(itemRecord.product)
                    ? itemRecord.product
                    : itemRecord;
                  const storePrices = [
                    ...getStorePrices(itemRecord),
                    ...getStorePrices(productRecord),
                  ];
                  const storeMinPrice = storePrices.length ? Math.min(...storePrices) : undefined;
                  const storeMaxPrice = storePrices.length ? Math.max(...storePrices) : undefined;
                  const productId = String(
                    productRecord?.id ??
                      productRecord?.product_id ??
                      (isRecord(item) ? item.product_id : undefined) ??
                      index
                  );
                  const productName = getString(productRecord?.name, 'Unknown');
                  const productImage =
                    getString(productRecord?.image_url) ||
                    getString(productRecord?.image) ||
                    undefined;
                  const minPrice = toNumber(
                    itemRecord?.price_min ??
                      itemRecord?.min_price ??
                      storeMinPrice ??
                      productRecord?.price_min ??
                      productRecord?.min_price
                  );
                  const maxPrice = toNumber(
                    itemRecord?.max_price ?? storeMaxPrice ?? productRecord?.max_price
                  );
                  const price = toNumber(
                    itemRecord?.price ??
                      itemRecord?.price_min ??
                      storeMinPrice ??
                      productRecord?.price ??
                      productRecord?.price_min
                  );
                  const productBrand = getString(productRecord?.brand);
                  const productCurrency =
                    typeof itemRecord?.currency === 'string'
                      ? itemRecord.currency
                      : typeof productRecord?.currency === 'string'
                        ? productRecord.currency
                        : undefined;

                  return (
                    <ProductCard
                      key={`${productId}-${index}`}
                      id={productId}
                      name={productName}
                      image={productImage}
                      minPrice={minPrice}
                      maxPrice={maxPrice}
                      price={price}
                      brand={productBrand}
                      priceCurrency={productCurrency as any}
                    />
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
