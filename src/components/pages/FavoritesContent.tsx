'use client';

import { useState, useMemo, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/hooks/use-toast';
import ProductCard from '@/components/ProductCard';
import { ProductGridSkeleton } from '@/components/common/SkeletonLoader';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Heart, Share2, FolderHeart } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { isAuthenticated } from '@/utils/authStorage';
import { useDebounce } from '@/hooks/useDebounce';
import { useFavoritesContext } from '@/contexts/FavoritesContext';
import { useFavoritesPage } from '@/hooks/useApi';
import { useSEO } from '@/hooks/useSEO';
import WishlistPrivacySettings from '@/components/WishlistPrivacySettings';
import SavedStoresList from '@/components/SavedStoresList';
import CollectionManager from '@/components/CollectionManager';
import { useCollections } from '@/hooks/useCollections';
import collectionsService from '@/services/collectionsService';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function getString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function getNumberOrString(value: unknown, fallback: number | string): number | string {
  return typeof value === 'number' || typeof value === 'string' ? value : fallback;
}

// Component to handle search params safely
function FavoritesWithParams() {
  const router = useRouter();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [activeTab, setActiveTab] = useState<'favorites' | 'collections'>('favorites');
  const { collections } = useCollections();
  const [activeCollectionId, setActiveCollectionId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const debouncedSearch = useDebounce(searchQuery, 300);

  useEffect(() => {
    if (!activeCollectionId && collections.length > 0) {
      setActiveCollectionId(collections[0].id);
    }
  }, [activeCollectionId, collections]);

  const { data: collectionItems, isLoading: collectionItemsLoading } = useQuery({
    queryKey: ['collectionItems', activeCollectionId],
    queryFn: () => collectionsService.getCollectionItems(activeCollectionId as string),
    enabled: Boolean(activeCollectionId),
    staleTime: 1000 * 60 * 2,
  });

  useSEO({
    title: t('favorites.seoTitle', 'Favorites'),
    description: t('favorites.seoDescription', 'View and manage your favorite products.'),
    keywords: 'favorites, wishlist, saved products',
    type: 'website',
  });

  const itemsPerPage = 24;

  // Use context for favorites (prevents duplicate requests)
  const { favorites: favoritesArray, isLoading: loading } = useFavoritesContext();

  // Extract favorites array (memoized to keep stable deps)
  const favorites = useMemo(
    () => (Array.isArray(favoritesArray) ? favoritesArray : []),
    [favoritesArray]
  );

  // v1 paginated list (full products + favorited_at)
  const {
    data: favoritesPageData,
    isLoading: favoritesPageLoading,
    isFetching: favoritesPageFetching,
  } = useFavoritesPage({
    page: currentPage,
    limit: itemsPerPage,
  });

  const pagination =
    favoritesPageData && typeof favoritesPageData === 'object' && 'pagination' in favoritesPageData
      ? favoritesPageData.pagination
      : null;
  const pageInfo =
    pagination && typeof pagination === 'object' && 'totalPages' in pagination
      ? (pagination as { totalPages: number; page: number; hasPrev: boolean; hasNext: boolean })
      : null;

  // Check authentication on mount
  useEffect(() => {
    if (!isAuthenticated()) {
      toast({
        title: 'Login Required',
        description: 'Please login to view your favorites',
        variant: 'destructive',
      });
      router.push('/auth');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toast]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  // v1 BFF returns full product objects (plus optional favorited_at)
  const products = useMemo(() => {
    const pageItems =
      favoritesPageData && typeof favoritesPageData === 'object' && 'items' in favoritesPageData
        ? favoritesPageData.items
        : null;

    if (Array.isArray(pageItems)) return pageItems;
    if (Array.isArray(favorites)) return favorites;
    return [];
  }, [favoritesPageData, favorites]);

  const filteredFavorites = Array.isArray(products)
    ? products.filter(product => {
        if (!product) return false;
        const name = product.name || product.product_name || product.item_name || '';
        const hasValidData =
          name && (product.price || product.product_price || product.image_url || product.image);
        if (!hasValidData) return false;
        return name.toLowerCase().includes(debouncedSearch.toLowerCase());
      })
    : [];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="container mx-auto px-6 pt-28 pb-16">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-start justify-between">
            <div>
              <div className="inline-flex items-center gap-2 mb-4 select-none">
                <Heart className="w-4 h-4 text-red-500" />
                <span className="text-xs text-muted-foreground uppercase tracking-wider">
                  {t('favorites.yourCollection')}
                </span>
              </div>
              <h1 className="font-display text-4xl sm:text-5xl font-bold mb-3 select-none">
                {t('favorites.title')}
              </h1>
              <p className="text-muted-foreground text-lg select-none">{t('favorites.subtitle')}</p>
            </div>

            {/* Settings Button with hint */}
            <div className="shrink-0 mt-2 text-right">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSettings(!showSettings)}
                className="gap-2"
              >
                <Share2 className="w-4 h-4" />
                {t('wishlist.shareWithFriends')}
              </Button>
              <p className="text-xs text-muted-foreground mt-1">{t('wishlist.shareHint')}</p>
            </div>
          </div>

          {/* Privacy Settings Panel */}
          {showSettings && <WishlistPrivacySettings className="mt-6 max-w-lg" />}
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap items-center gap-2 mb-8">
          <Button
            variant={activeTab === 'favorites' ? 'default' : 'outline'}
            size="sm"
            className="rounded-full"
            onClick={() => setActiveTab('favorites')}
          >
            <Heart className="w-4 h-4 mr-2" />
            {t('favorites.products', 'Favorite Products')}
          </Button>
          <Button
            variant={activeTab === 'collections' ? 'default' : 'outline'}
            size="sm"
            className="rounded-full"
            onClick={() => setActiveTab('collections')}
          >
            <FolderHeart className="w-4 h-4 mr-2" />
            {t('collections.title', 'Wishlists')}
          </Button>
        </div>

        {/* Search */}
        {activeTab === 'favorites' && favorites.length > 0 && (
          <div className="relative max-w-md mb-10 group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-foreground/10 to-foreground/5 rounded-full blur opacity-0 group-hover:opacity-30 transition duration-500"></div>
            <div className="relative flex items-center">
              <Search className="absolute left-4 w-5 h-5 text-muted-foreground group-focus-within:text-foreground transition-colors" />
              <Input
                type="text"
                placeholder={t('products.searchPlaceholder', 'Search your favorites...')}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 h-12 bg-card/50 border-border/50 rounded-full text-foreground placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-foreground/30 transition-all backdrop-blur-sm"
              />
            </div>
          </div>
        )}

        {/* Favorite Products Section */}
        {activeTab === 'favorites' && (
          <div className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-2 h-8 bg-gradient-to-b from-foreground to-foreground/50 rounded-full"></div>
              <h2 className="font-display text-2xl font-bold">
                {t('favorites.products', 'Favorite Products')}
              </h2>
              <span className="text-sm text-muted-foreground">({filteredFavorites.length})</span>
            </div>

            {(() => {
              if (loading || favoritesPageLoading) {
                return <ProductGridSkeleton count={12} columns={4} />;
              }

              if (filteredFavorites.length === 0) {
                return (
                  <div className="text-center py-16 border border-dashed border-border/30 rounded-2xl bg-card/5">
                    <div className="w-14 h-14 rounded-full border-2 border-border/30 flex items-center justify-center mx-auto mb-4 select-none">
                      <Heart className="w-7 h-7 text-muted-foreground" />
                    </div>
                    <h3 className="font-display text-lg font-semibold mb-2 select-none">
                      {searchQuery
                        ? t('favorites.noSearchResults', 'No products match your search')
                        : t('favorites.noFavorites', 'No favorite products yet')}
                    </h3>
                    <p className="text-muted-foreground mb-4 max-w-md mx-auto text-sm select-none">
                      {searchQuery
                        ? 'Try adjusting your search terms'
                        : 'Start exploring and save products you love to see them here'}
                    </p>
                    <Button
                      onClick={() => router.push('/products')}
                      className="rounded-full"
                      size="sm"
                    >
                      Browse Products
                    </Button>
                  </div>
                );
              }

              return (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {filteredFavorites.map((product: unknown, index: number) => {
                    const record = isRecord(product) ? product : {};
                    const productId = getNumberOrString(record['id'], index);
                    const productName = getString(record['name'], 'Unknown');

                    const productImage =
                      getString(record['image_url']) || getString(record['image']);
                    const priceValue = record['price'];
                    let productPrice: string;
                    if (typeof priceValue === 'number') {
                      productPrice = priceValue.toString();
                    } else if (typeof priceValue === 'string') {
                      productPrice = priceValue;
                    } else {
                      productPrice = '0';
                    }
                    const productCategory = getString(record['type']);

                    const brandsValue = record['brands'];
                    const brandFromBrands = isRecord(brandsValue) ? brandsValue['name'] : undefined;
                    const productBrand = getString(record['brand']) || getString(brandFromBrands);

                    return (
                      <ProductCard
                        key={`${productId}-${index}`}
                        id={productId}
                        name={productName}
                        image={productImage}
                        price={productPrice}
                        category={productCategory}
                        brand={productBrand}
                      />
                    );
                  })}
                </div>
              );
            })()}
          </div>
        )}

        {activeTab === 'favorites' && pageInfo && pageInfo.totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 mt-12">
            <Button
              variant="outline"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={!pageInfo.hasPrev || favoritesPageFetching}
            >
              Prev
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {pageInfo.page} of {pageInfo.totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() => setCurrentPage(p => p + 1)}
              disabled={!pageInfo.hasNext || favoritesPageFetching}
            >
              Next
            </Button>
          </div>
        )}

        {activeTab === 'favorites' && (
          <div className="border-t border-border/20 pt-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-2 h-8 bg-gradient-to-b from-foreground/80 to-foreground/30 rounded-full"></div>
              <h2 className="font-display text-2xl font-bold">
                {t('favorites.stores', 'Favorite Stores')}
              </h2>
            </div>
            <SavedStoresList showClearButton={true} />
          </div>
        )}

        {/* Collections Section */}
        {activeTab === 'collections' && (
          <div className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-2 h-8 bg-gradient-to-b from-foreground to-foreground/50 rounded-full"></div>
              <h2 className="font-display text-2xl font-bold">
                {t('collections.title', 'Wishlists')}
              </h2>
              <span className="text-sm text-muted-foreground">({collections.length})</span>
            </div>

            <CollectionManager className="mb-6" />

            {collections.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {collections.map(collection => (
                  <Button
                    key={collection.id}
                    variant={activeCollectionId === collection.id ? 'default' : 'outline'}
                    size="sm"
                    className="rounded-full"
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
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <h3 className="font-display text-xl font-bold">
                    {collections.find(c => c.id === activeCollectionId)?.name}
                  </h3>
                </div>

                {collectionItemsLoading && <ProductGridSkeleton count={8} columns={4} />}

                {!collectionItemsLoading && (!collectionItems || collectionItems.length === 0) && (
                  <div className="text-center py-16 border border-dashed border-border/30 rounded-2xl bg-card/5">
                    <p className="text-muted-foreground">
                      {t('collections.empty', 'No products in this wishlist yet')}
                    </p>
                  </div>
                )}

                {collectionItems && collectionItems.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {collectionItems.map(item => {
                      const product = (item.product || item) as unknown as Record<string, unknown>;
                      const productId = getNumberOrString(product['id'], item.productId);
                      const productName = getString(product['name'], 'Unknown');
                      const productImage =
                        getString(product['image_url']) || getString(product['image']);
                      const priceValue = product['price'];
                      const productPrice =
                        typeof priceValue === 'number'
                          ? priceValue.toString()
                          : getString(priceValue, '0');
                      const productBrand = getString(product['brand']);

                      return (
                        <ProductCard
                          key={productId}
                          id={productId}
                          name={productName}
                          image={productImage}
                          price={productPrice}
                          brand={productBrand}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

// Main component with Suspense boundary
export default function Favorites() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-foreground"></div>
        </div>
      }
    >
      <FavoritesWithParams />
    </Suspense>
  );
}
