'use client';

import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FolderHeart, Plus, Search, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import CollectionManager from '@/components/CollectionManager';
import { useCollections } from '@/hooks/useCollections';
import { useIsAuthenticated } from '@/hooks/useIsAuthenticated';
import { useQuery } from '@tanstack/react-query';
import collectionsService from '@/services/collectionsService';
import { cn } from '@/lib/utils';
import WishlistPrivacySettings from '@/components/WishlistPrivacySettings';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const getString = (value: unknown, fallback = ''): string =>
  typeof value === 'string' && value.trim() ? value : fallback;

const getNumberOrString = (value: unknown, fallback: number): string | number => {
  if (typeof value === 'string' || typeof value === 'number') return value;
  return fallback;
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

  const { data: collectionItems, isLoading: collectionItemsLoading } = useQuery({
    queryKey: ['collectionItems', activeCollectionId],
    queryFn: () => collectionsService.getCollectionItems(activeCollectionId as string),
    enabled: isLoggedIn && Boolean(activeCollectionId),
    staleTime: 1000 * 60 * 2,
    retry: false,
    refetchOnWindowFocus: false,
  });

  const filteredCollections = useMemo(() => {
    if (!searchQuery.trim()) return collections;
    const query = searchQuery.toLowerCase();
    return collections.filter(collection => collection.name.toLowerCase().includes(query));
  }, [collections, searchQuery]);

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
              <Button variant="outline" size="sm" className="gap-2 w-full sm:w-auto">
                <Plus className="w-4 h-4" />
                {t('collections.create', 'Create wishlist')}
              </Button>
              <div className="mt-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSettings(!showSettings)}
                  className="gap-2 w-full sm:w-auto"
                >
                  <Share2 className="w-4 h-4" />
                  {t('wishlist.shareWithFriends')}
                </Button>
                <p className="text-xs text-muted-foreground mt-1">{t('wishlist.shareHint')}</p>
              </div>
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

        <CollectionManager className="mb-6" />

        {filteredCollections.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 mb-6">
            {filteredCollections.map(collection => (
              <Button
                key={collection.id}
                variant={activeCollectionId === collection.id ? 'default' : 'outline'}
                size="sm"
                className="rounded-full shrink-0"
                onClick={() => setActiveCollectionId(collection.id)}
              >
                <span className="mr-2">{collection.emoji || '❤️'}</span>
                {collection.name}
                <span className="ml-2 text-xs text-muted-foreground">
                  {collection.productCount ?? collection.items.length}
                </span>
              </Button>
            ))}
          </div>
        )}

        {activeCollectionId && (
          <div className="mb-16">
            <div className="flex items-center gap-2 sm:gap-3 mb-6">
              <div className="w-2 h-8 bg-gradient-to-b from-foreground to-foreground/50 rounded-full"></div>
              <h2 className="font-display text-xl sm:text-2xl font-bold">
                {collections.find(c => c.id === activeCollectionId)?.name}
              </h2>
            </div>

            {collectionItemsLoading ? (
              <div className="text-center py-12 text-muted-foreground">Loading...</div>
            ) : collectionItems && collectionItems.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {collectionItems.map((product: unknown, index: number) => {
                  const record = isRecord(product) ? product : {};
                  const productRecord = isRecord(record['product']) ? record['product'] : record;
                  const productId =
                    getNumberOrString(productRecord['id'], index) ??
                    getNumberOrString(record['product_id'], index);
                  const productName = getString(productRecord['name'], 'Unknown');
                  const productImage =
                    getString(productRecord['image_url']) || getString(productRecord['image']);
                  const priceValue =
                    productRecord['price_min'] ??
                    productRecord['price'] ??
                    productRecord['min_price'];
                  const productPrice =
                    typeof priceValue === 'number' || typeof priceValue === 'string'
                      ? String(priceValue)
                      : '0';
                  const productBrand = getString(productRecord['brand']);

                  return (
                    <div
                      key={`${productId}-${index}`}
                      className="rounded-2xl border border-border/40 p-4"
                    >
                      <div className="text-sm font-semibold">{productName}</div>
                      {productBrand && (
                        <div className="text-xs text-muted-foreground">{productBrand}</div>
                      )}
                      <div className="text-sm font-semibold mt-2">{productPrice}</div>
                      {productImage && (
                        <div className="mt-3 h-32 w-full rounded-xl bg-muted/30 overflow-hidden">
                          <img
                            src={productImage}
                            alt={productName}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 border border-dashed border-border/30 rounded-2xl bg-card/5">
                {t('collections.empty', 'No products in this wishlist yet')}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
