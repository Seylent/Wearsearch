'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SaveStoreButton } from '@/components/SaveStoreButton';
import {
  Filter,
  MapPin,
  SortAsc,
  Tag,
  ChevronDown,
  Star,
  Send,
  Instagram,
  Package,
} from 'lucide-react';
import type { TFunction } from 'i18next';

type NormalizedStore = {
  id: string;
  name: string;
  logo_url?: string;
  is_recommended?: boolean;
  price?: number;
  sizes?: string[];
  shipping_info?: string;
  telegram_url?: string;
  instagram_url?: string;
};

interface ProductStoresPanelProps {
  priceRange: string | null;
  stores: NormalizedStore[];
  filteredStores: NormalizedStore[];
  paginatedStores: NormalizedStore[];
  storeSearch: string;
  setStoreSearch: (value: string) => void;
  showRecommendedOnly: boolean;
  setShowRecommendedOnly: (value: boolean) => void;
  sortBy: 'name' | 'price-asc' | 'price-desc';
  setSortBy: (value: 'name' | 'price-asc' | 'price-desc') => void;
  currentStorePage: number;
  setCurrentStorePage: React.Dispatch<React.SetStateAction<number>>;
  storesPerPage: number;
  isFilterOpen: boolean;
  setIsFilterOpen: (value: boolean) => void;
  filterButtonRef: React.RefObject<HTMLButtonElement>;
  filterDropdownRef: React.RefObject<HTMLDivElement>;
  isAdmin: boolean;
  t: TFunction;
  formatPrice: (value: number) => string;
}

const ProductStoresPanel: React.FC<ProductStoresPanelProps> = ({
  priceRange,
  stores,
  filteredStores,
  paginatedStores,
  storeSearch,
  setStoreSearch,
  showRecommendedOnly,
  setShowRecommendedOnly,
  sortBy,
  setSortBy,
  currentStorePage,
  setCurrentStorePage,
  storesPerPage,
  isFilterOpen,
  setIsFilterOpen,
  filterButtonRef,
  filterDropdownRef,
  isAdmin,
  t,
  formatPrice,
}) => {
  return (
    <div
      id="stores-section"
      className="h-fit animate-fade-in-up"
      style={{ animationDelay: '0.3s' }}
    >
      <div className="rounded-2xl border border-white/6 bg-white/5 p-6">
        {/* Price Range */}
        <div className="mb-6 pb-6 border-b border-border/50">
          <div className="flex items-baseline gap-2 mb-2">
            {priceRange ? (
              <span className="font-display text-3xl font-extrabold">{priceRange}</span>
            ) : (
              <span className="font-display text-2xl font-bold text-white/60">Price N/A</span>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {t('productDetail.priceRangeAcrossStores')}
          </p>
        </div>

        {/* Header */}
        <div className="mb-6">
          <h2 className="font-display text-2xl font-bold mb-2">{t('productDetail.availableAt')}</h2>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span>
              {stores.length} {t('productDetail.stores')}
            </span>
          </div>
        </div>

        {/* Search & Filters */}
        {stores.length > 0 && (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6 pb-6 border-b border-white/6">
            <div className="relative flex-1">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder={t('productDetail.searchStores')}
                value={storeSearch}
                onChange={e => setStoreSearch(e.target.value)}
                className="pl-10 bg-black/30 border-white/6 text-white h-10"
              />
            </div>

            <div className="relative">
              <Button
                ref={filterButtonRef}
                variant="outline"
                size="default"
                className="border-white/20 bg-black/30 text-white hover:bg-black/50 hover:border-white/30 w-full sm:w-auto h-10"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
              >
                <Filter className="w-4 h-4 mr-2" />
                <span className="sm:inline">{t('products.filters')}</span>
                {(showRecommendedOnly || sortBy !== 'name') && (
                  <span className="ml-2 bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold">
                    {(showRecommendedOnly ? 1 : 0) + (sortBy === 'name' ? 0 : 1)}
                  </span>
                )}
              </Button>

              {isFilterOpen && (
                <div
                  ref={filterDropdownRef}
                  className="absolute left-0 top-full mt-2 w-64 max-h-[80vh] overflow-y-auto z-[1100] rounded-2xl border border-white/10 bg-zinc-900/95 backdrop-blur-2xl text-white p-1.5 shadow-[0_8px_32px_rgba(0,0,0,0.4)] animate-in fade-in-0 zoom-in-95 slide-in-from-top-2"
                >
                  <div className="text-xs uppercase tracking-widest text-muted-foreground px-3 py-2 font-medium">
                    {t('productDetail.sortBy')}
                  </div>

                  <button
                    onClick={() => setSortBy('name')}
                    className="w-full flex items-center cursor-pointer mx-1 rounded-lg px-3 py-2.5 text-sm text-white/80 hover:bg-white/10 hover:text-white transition-colors"
                  >
                    <Tag className="h-4 w-4 mr-3 text-muted-foreground" />
                    <span className="flex-1 text-left">{t('productDetail.name')}</span>
                    {sortBy === 'name' && <span className="ml-2 text-primary">✓</span>}
                  </button>

                  <button
                    onClick={() => setSortBy('price-asc')}
                    className="w-full flex items-center cursor-pointer mx-1 rounded-lg px-3 py-2.5 text-sm text-white/80 hover:bg-white/10 hover:text-white transition-colors"
                  >
                    <SortAsc className="h-4 w-4 mr-3 text-muted-foreground" />
                    <span className="flex-1 text-left">{t('productDetail.priceAsc')}</span>
                    {sortBy === 'price-asc' && <span className="ml-2 text-primary">✓</span>}
                  </button>

                  <button
                    onClick={() => setSortBy('price-desc')}
                    className="w-full flex items-center cursor-pointer mx-1 rounded-lg px-3 py-2.5 text-sm text-white/80 hover:bg-white/10 hover:text-white transition-colors"
                  >
                    <ChevronDown className="h-4 w-4 mr-3 text-muted-foreground" />
                    <span className="flex-1 text-left">{t('productDetail.priceDesc')}</span>
                    {sortBy === 'price-desc' && <span className="ml-2 text-primary">✓</span>}
                  </button>

                  <div className="my-2 h-px bg-border/50 mx-1" />

                  <div className="text-xs uppercase tracking-widest text-muted-foreground px-3 py-2 font-medium">
                    {t('common.recommended')}
                  </div>

                  <button
                    onClick={() => setShowRecommendedOnly(!showRecommendedOnly)}
                    className="w-full flex items-center cursor-pointer mx-1 rounded-lg px-3 py-2.5 text-sm text-white/80 hover:bg-white/10 hover:text-white transition-colors"
                  >
                    <Star className="h-4 w-4 mr-3 text-muted-foreground" />
                    <span className="flex-1 text-left">{t('productDetail.recommendedOnly')}</span>
                    <div
                      className={`w-4 h-4 rounded border ${
                        showRecommendedOnly ? 'bg-primary border-primary' : 'border-white/30'
                      } flex items-center justify-center`}
                    >
                      {showRecommendedOnly && <span className="text-[10px]">✓</span>}
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Stores List */}
        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
          {(() => {
            if (filteredStores.length > 0) {
              return (
                <>
                  {paginatedStores.map(store => (
                    <div
                      key={store.id}
                      className="p-4 rounded-xl border border-white/6 bg-black/20 hover:bg-white/6 transition-colors"
                    >
                      <div className="flex items-start gap-3 mb-3">
                        {store.logo_url && (
                          <div className="w-12 h-12 rounded-lg overflow-hidden bg-white/5 flex-shrink-0">
                            <img
                              src={store.logo_url}
                              alt={store.name}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          </div>
                        )}

                        <div className="flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <h3 className="font-semibold">{store.name}</h3>
                            <SaveStoreButton
                              storeId={store.id}
                              storeName={store.name}
                              storeLogo={store.logo_url}
                              size="icon"
                              showText={false}
                              variant="ghost"
                              className="h-7 w-7 flex-shrink-0"
                            />
                          </div>
                          {store.is_recommended && (
                            <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-white/10 border border-white/20 text-white mt-1">
                              <Star className="w-3 h-3 fill-current" />
                              <span className="text-xs font-medium">
                                {t('productDetail.recommended')}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {Boolean(store.price) && (
                        <div className="mb-3">
                          <p className="font-display text-2xl font-bold">
                            {formatPrice(store.price || 0)}
                          </p>
                        </div>
                      )}

                      {Array.isArray(store.sizes) && store.sizes.length > 0 && (
                        <p className="text-sm text-muted-foreground mb-3">
                          {t('productDetail.sizes', 'Sizes')}: {store.sizes.join(', ')}
                        </p>
                      )}

                      {store.shipping_info && (
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {store.shipping_info}
                        </p>
                      )}

                      <div className="flex gap-2">
                        {store.telegram_url && (
                          <a
                            href={store.telegram_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1"
                          >
                            <Button variant="outline" size="sm" className="w-full">
                              <Send className="w-4 h-4 mr-1" />
                              Telegram
                            </Button>
                          </a>
                        )}
                        {store.instagram_url && (
                          <a
                            href={store.instagram_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1"
                          >
                            <Button variant="outline" size="sm" className="w-full">
                              <Instagram className="w-4 h-4 mr-1" />
                              Instagram
                            </Button>
                          </a>
                        )}
                      </div>
                    </div>
                  ))}

                  {filteredStores.length > storesPerPage && (
                    <div className="flex items-center justify-between pt-4 border-t border-white/6">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentStorePage(prev => Math.max(1, prev - 1))}
                        disabled={currentStorePage === 1}
                        className="gap-2"
                      >
                        {t('common.previous', 'Previous')}
                      </Button>
                      <span className="text-sm text-white/70">
                        Page {currentStorePage} of{' '}
                        {Math.ceil(filteredStores.length / storesPerPage)}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setCurrentStorePage(prev =>
                            Math.min(Math.ceil(filteredStores.length / storesPerPage), prev + 1)
                          )
                        }
                        disabled={
                          currentStorePage === Math.ceil(filteredStores.length / storesPerPage)
                        }
                        className="gap-2"
                      >
                        {t('common.next', 'Next')}
                      </Button>
                    </div>
                  )}
                </>
              );
            }

            if (stores.length > 0) {
              return (
                <div className="text-center py-8 text-muted-foreground">
                  <p>{t('productDetail.noStoresMatch')}</p>
                  <Button
                    variant="link"
                    onClick={() => {
                      setStoreSearch('');
                      setShowRecommendedOnly(false);
                    }}
                    className="mt-2"
                  >
                    {t('productDetail.clearFilters')}
                  </Button>
                </div>
              );
            }

            return (
              <div className="text-center py-8 border border-dashed border-border/50 rounded-xl">
                <Package className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                <p className="text-muted-foreground select-none mb-2">
                  {t('productDetail.noStoresAvailable')}
                </p>
                {isAdmin && (
                  <p className="text-xs text-muted-foreground">{t('productDetail.addStores')}</p>
                )}
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
};

export default ProductStoresPanel;
