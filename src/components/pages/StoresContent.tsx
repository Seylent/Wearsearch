"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import { NeonAbstractions } from "@/components/NeonAbstractions";
import { NoStoresFound, ErrorState } from "@/components/common/EmptyState";
import { StoreGridSkeleton } from "@/components/common/SkeletonLoader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ExternalLink, Star, Package, Send, Instagram } from "lucide-react";
import { useStoresPageData } from "@/hooks/useAggregatedData";
import { SaveStoreButton } from "@/components/SaveStoreButton";

interface StoresContentProps {
  storeId?: string;
}

const StoresContent: React.FC<StoresContentProps> = ({ storeId: _storeId }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslation();
  
  // Local state
  const [searchQuery, setSearchQuery] = useState("");
  // Server-driven pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 24;

  // Initialize page from URL on mount
  useEffect(() => {
    const rawPage = searchParams.get('page');
    const parsedPage = rawPage ? Number(rawPage) : NaN;
    if (Number.isFinite(parsedPage) && parsedPage >= 1) {
      setCurrentPage(Math.floor(parsedPage));
    }

    const initialSearch = searchParams.get('search');
    if (typeof initialSearch === 'string' && initialSearch.trim() !== '') {
      setSearchQuery(initialSearch);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount

  // Keep URL in sync with currentPage and searchQuery
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(currentPage));

    const trimmed = searchQuery.trim();
    if (trimmed) {
      params.set('search', trimmed);
    } else {
      params.delete('search');
    }

    const queryString = params.toString();
    const currentQueryString = searchParams.toString();
    
    // Only push if changed
    // Note: searchParams.toString() might reorder keys differently than URLSearchParams, 
    // but typically it's fine. 
    // To be precise we can compare params.
    if (queryString !== currentQueryString) {
      router.push(`/stores?${queryString}`);
    }
  }, [currentPage, searchQuery, router, searchParams]);

  // Reset page when search changes
  useEffect(() => {
    // Only if query changed effectively from what's likely the previous state
    // For now, strict reset on search input change might be too aggressive if typing.
    // The original code did: useEffect(() => setCurrentPage(1), [searchQuery]);
    // This implies typing resets page.
    // We should strictly follow original logic, but check if it causes issues.
    // Original: useEffect(() => { setCurrentPage(1); }, [searchQuery]); 
    // This was triggered on EVERY keystroke.
    // I will keep it but it might be better to debounce. Original didn't have debounce visible here.
    // Actually, let's keep it to preserve behavior.
    // Use a ref to track if it's the initial mount to avoid resetting page 1 on hydration?
    // The mount effect sets the state. Then this effect runs?
    // If we type, query changes, page resets. That's fine.
  }, [searchQuery]);

  // However, updating state in effect that depends on state can be tricky.
  // We'll trust the original logic's intent: changing search resets to page 1.
  
  const storesQueryParams = useMemo(
    () => ({
      page: currentPage,
      limit: itemsPerPage,
      search: searchQuery || undefined,
    }),
    [currentPage, itemsPerPage, searchQuery]
  );

  // Use aggregated hook for better performance
  const { data: pageData, isLoading: loading, isFetching, error } = useStoresPageData(storesQueryParams);
  const pageDataObj = pageData as Record<string, unknown> | undefined;
  const storesData = pageDataObj?.['stores'];
  const pagination = pageDataObj?.['pagination'];
  
  const stores = useMemo(() => {
    if (!storesData) return [];
    return Array.isArray(storesData) ? storesData : [];
  }, [storesData]);

  const filteredStores = stores;

  const _handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans">

      {/* Hero Section */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden pt-28">
        <NeonAbstractions />
        
        <div className="container mx-auto px-4 sm:px-6 relative z-10 text-center">
          <h1 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-6 tracking-tight animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <span className="block">{t('stores.discover', 'Discover')}</span>
            <span className="block neon-text">{t('stores.premium', 'Premium')}</span>
            <span className="block text-gradient">{t('stores.storesTitle', 'Stores')}</span>
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            {t('stores.description', 'Explore our curated collection of online fashion stores. Find the best shops for your style.')}
          </p>

          {/* Search */}
          <div className="max-w-lg mx-auto animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-foreground/20 to-foreground/10 rounded-full blur opacity-0 md:group-hover:opacity-30 transition duration-500"></div>
              <div className="relative flex items-center">
                <Search className="absolute left-4 w-5 h-5 text-muted-foreground group-focus-within:text-foreground transition-colors" />
                <Input
                  type="text"
                  placeholder={t('stores.searchPlaceholder', 'Search stores...')}
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1); // Reset page on search
                  }}
                  className="w-full pl-12 pr-4 h-14 bg-card/50 border-border/50 rounded-full text-foreground placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-foreground/30 focus-visible:border-foreground/30 transition-all backdrop-blur-sm"
                />
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="flex justify-center gap-12 mt-16 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <div className="text-center">
              <p className="font-display text-3xl sm:text-4xl font-bold mb-1">
                {(pagination as any)?.totalItems ?? stores.length}+
              </p>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Stores</p>
            </div>
            <div className="text-center">
              <p className="font-display text-3xl sm:text-4xl font-bold mb-1">{stores.filter(s => s.is_recommended).length}</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">{t('common.recommended', 'Recommended')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stores Grid */}
      <section className="py-24 relative">
        <div className="container mx-auto px-4 sm:px-6" id="main-content">
          {loading ? (
            <StoreGridSkeleton count={9} />
          ) : error ? (
            <ErrorState 
              title="Failed to load stores"
              description="We couldn't load the stores. Please check your connection and try again."
              onRetry={() => window.location.reload()}
              technicalDetails={error instanceof Error ? error.message : String(error)}
            />
          ) : filteredStores.length === 0 ? (
            searchQuery ? (
              <NoStoresFound 
                hasSearch={true}
                onClearSearch={() => {
                  setSearchQuery('');
                  setCurrentPage(1);
                }}
              />
            ) : (
              <NoStoresFound hasSearch={false} />
            )
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {filteredStores.map((store, index) => (
                <div
                  key={store.id}
                  className="group relative animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  {/* Store Card */}
                  <div className="relative h-80 md:h-80 rounded-2xl overflow-hidden border border-border/50 bg-card/40 backdrop-blur-sm transition-all duration-500 md:hover:border-foreground/30 md:hover:shadow-[0_0_40px_-10px_rgba(255,255,255,0.2)] md:hover:-translate-y-1">
                    {/* Background gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 md:group-hover:opacity-100 transition-opacity duration-500" />
                    
                    {/* Content */}
                    <div className="relative h-full flex flex-col justify-between p-6 md:p-8">
                      {/* Header */}
                      <div>
                        <div className="flex items-start justify-between mb-6">
                          <div className="flex-1 flex items-start gap-4">
                            {/* Store Logo */}
                            {store.logo_url && (
                              <div className="w-16 h-16 rounded-xl overflow-hidden bg-white/5 flex-shrink-0 border border-border/50">
                                <img 
                                  src={store.logo_url} 
                                  alt={store.name}
                                  className="w-full h-full object-cover"
                                  loading="lazy"
                                  decoding="async"
                                />
                              </div>
                            )}
                            
                            <div className="flex-1">
                              <h3 className="font-display text-2xl font-bold mb-2 md:group-hover:text-foreground/80 transition-colors">
                                {store.name}
                              </h3>
                              {store.is_recommended && (
                                <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-white/10 border border-white/20 text-white">
                                  <Star className="w-3 h-3 fill-current" />
                                  <span className="text-xs font-medium">{t('stores.recommended', 'Recommended')}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Stats */}
                        <div className="space-y-2 mb-6">
                          {store.product_count !== undefined && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Package className="w-4 h-4" />
                              <span>{store.product_count} {t('stores.products', 'Products')}</span>
                            </div>
                          )}
                          {store.brand_count !== undefined && store.brand_count > 0 && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Package className="w-4 h-4" />
                              <span>{store.brand_count} {t(store.brand_count === 1 ? 'stores.brand' : 'stores.brands', 'Brands')}</span>
                            </div>
                          )}
                        </div>

                        {/* Shipping Info */}
                        {store.shipping_info && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {store.shipping_info}
                          </p>
                        )}
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between">
                        {/* Social Links */}
                        <div className="flex gap-2">
                          {/* Save Store Button */}
                          <SaveStoreButton
                            storeId={String(store.id)}
                            storeName={store.name}
                            storeLogo={store.logo_url}
                            size="icon"
                            variant="ghost"
                            showText={false}
                          />
                          {store.telegram_url && (
                            <a
                              href={store.telegram_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-9 h-9 rounded-full bg-card md:hover:bg-foreground md:hover:text-background active:bg-foreground active:text-background flex items-center justify-center transition-all"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Send className="w-4 h-4" />
                            </a>
                          )}
                          {store.instagram_url && (
                            <a
                              href={store.instagram_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-9 h-9 rounded-full bg-card md:hover:bg-foreground md:hover:text-background active:bg-foreground active:text-background flex items-center justify-center transition-all"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Instagram className="w-4 h-4" />
                            </a>
                          )}
                        </div>

                        {/* View Button */}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="opacity-0 md:group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/products?store_id=${store.id}`);
                          }}
                        >
                          {t('stores.viewProducts', 'View Products')}
                          <ExternalLink className="ml-2 w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Hover glow effect */}
                    <div className="absolute inset-0 opacity-0 md:group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-foreground/20 to-transparent" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {!!pagination && (pagination as any).totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-12">
              <Button
                variant="outline"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={!(pagination as any).hasPrev || isFetching}
              >
                Prev
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {(pagination as any).page} of {(pagination as any).totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setCurrentPage((p) => p + 1)}
                disabled={!(pagination as any).hasNext || isFetching}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default StoresContent;
