import { useState, useMemo, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/layout/Navigation";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/ProductCard";
import { ProductGridSkeleton } from "@/components/common/SkeletonLoader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Heart, Settings } from "lucide-react";
import { isAuthenticated } from "@/utils/authStorage";
import { useDebounce } from "@/hooks/useDebounce";
import { useFavoritesContext } from "@/contexts/FavoritesContext";
import { useFavoritesPage } from "@/hooks/useApi";
import { useSEO } from "@/hooks/useSEO";
import WishlistPrivacySettings from "@/components/WishlistPrivacySettings";
import SavedStoresList from "@/components/SavedStoresList";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function getNumberOrString(value: unknown, fallback: number | string): number | string {
  return typeof value === "number" || typeof value === "string" ? value : fallback;
}

const Favorites = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const debouncedSearch = useDebounce(searchQuery, 300);

  useSEO({
    title: t('favorites.seoTitle', 'Favorites'),
    description: t('favorites.seoDescription', 'View and manage your favorite products.'),
    keywords: 'favorites, wishlist, saved products',
    type: 'website',
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 24;

  // Initialize page from URL
  useEffect(() => {
    const raw = searchParams.get('page');
    const parsed = raw ? Number(raw) : NaN;
    if (Number.isFinite(parsed) && parsed >= 1) {
      setCurrentPage(Math.floor(parsed));
    }

    const initialSearch = searchParams.get('search');
    if (typeof initialSearch === 'string' && initialSearch.trim() !== '') {
      setSearchQuery(initialSearch);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep URL in sync with currentPage
  useEffect(() => {
    const next = new URLSearchParams(searchParams);
    next.set('page', String(currentPage));

    const trimmed = searchQuery.trim();
    if (trimmed) next.set('search', trimmed);
    else next.delete('search');

    if (next.toString() !== searchParams.toString()) {
      setSearchParams(next, { replace: true });
    }
  }, [currentPage, searchQuery, searchParams, setSearchParams]);
  
  // Use context for favorites (prevents duplicate requests)
  const { favorites: favoritesArray, isLoading: loading } = useFavoritesContext();
  
  // Extract favorites array (memoized to keep stable deps)
  const favorites = useMemo(
    () => (Array.isArray(favoritesArray) ? favoritesArray : []),
    [favoritesArray]
  );

  // v1 paginated list (full products + favorited_at)
  const { data: favoritesPageData, isLoading: favoritesPageLoading, isFetching: favoritesPageFetching } = useFavoritesPage({
    page: currentPage,
    limit: itemsPerPage,
  });

  const pagination = favoritesPageData?.pagination;
  
  // Check authentication on mount
  useEffect(() => {
    if (!isAuthenticated()) {
      toast({
        title: "Login Required",
        description: "Please login to view your favorites",
        variant: "destructive",
      });
      navigate("/auth");
    }
  }, [navigate, toast]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  // v1 BFF returns full product objects (plus optional favorited_at)
  const products = useMemo(() => {
    const pageItems = favoritesPageData?.items;
    return Array.isArray(pageItems) ? pageItems : Array.isArray(favorites) ? favorites : [];
  }, [favoritesPageData, favorites]);

  const filteredFavorites = Array.isArray(products) 
    ? products.filter(product => {
        if (!product) return false;
        const name = product.name || product.product_name || product.item_name || '';
        const hasValidData = name && (product.price || product.product_price || product.image_url || product.image);
        if (!hasValidData) return false;
        return name.toLowerCase().includes(debouncedSearch.toLowerCase());
      })
    : [];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      
      <main className="container mx-auto px-6 pt-28 pb-16">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-start justify-between">
            <div>
              <div className="inline-flex items-center gap-2 mb-4 select-none">
                <Heart className="w-4 h-4 text-red-500" />
                <span className="text-xs text-muted-foreground uppercase tracking-wider">{t('favorites.yourCollection')}</span>
              </div>
              <h1 className="font-display text-4xl sm:text-5xl font-bold mb-3 select-none">{t('favorites.title')}</h1>
              <p className="text-muted-foreground text-lg select-none">{t('favorites.subtitle')}</p>
            </div>
            
            {/* Settings Button with hint */}
            <div className="shrink-0 mt-2 text-right">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSettings(!showSettings)}
              >
                <Settings className="w-4 h-4 mr-2" />
                {t('wishlist.shareWithFriends')}
              </Button>
              <p className="text-xs text-muted-foreground mt-1">
                {t('wishlist.shareHint')}
              </p>
            </div>
          </div>
          
          {/* Privacy Settings Panel */}
          {showSettings && (
            <WishlistPrivacySettings className="mt-6 max-w-lg" />
          )}
        </div>

        {/* Search */}
        {favorites.length > 0 && (
          <div className="relative max-w-md mb-10 group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-foreground/10 to-foreground/5 rounded-full blur opacity-0 group-hover:opacity-30 transition duration-500"></div>
            <div className="relative flex items-center">
              <Search className="absolute left-4 w-5 h-5 text-muted-foreground group-focus-within:text-foreground transition-colors" />
              <Input
                type="text"
                placeholder="Search your favorites..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 h-12 bg-card/50 border-border/50 rounded-full text-foreground placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-foreground/30 transition-all backdrop-blur-sm"
              />
            </div>
          </div>
        )}

        {/* Content */}
        {loading || favoritesPageLoading ? (
          <ProductGridSkeleton count={12} columns={4} />
        ) : filteredFavorites.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-border/30 rounded-3xl bg-card/10">
            <div className="w-16 h-16 rounded-full border-2 border-border/30 flex items-center justify-center mx-auto mb-6 select-none">
              <Heart className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-display text-xl font-semibold mb-2 select-none">
              {searchQuery ? "No favorites match your search" : "No favorites yet"}
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto select-none">
              {searchQuery 
                ? "Try adjusting your search terms" 
                : "Start exploring and save items you love to see them here"}
            </p>
            <Button 
              onClick={() => navigate("/products")}
              className="rounded-full"
            >
              Browse Products
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredFavorites.map((product: unknown, index: number) => {
              const record = isRecord(product) ? product : {};
              const productId = getNumberOrString(record["id"], index);
              const productName = getString(record["name"], "Unknown");

              const productImage = getString(record["image_url"]) || getString(record["image"]);
              const productPrice = String(record["price"] ?? "0");
              const productCategory = getString(record["type"]);

              const brandsValue = record["brands"];
              const brandFromBrands = isRecord(brandsValue) ? brandsValue["name"] : undefined;
              const productBrand = getString(record["brand"]) || getString(brandFromBrands);
              
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
        )}

        {!!pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 mt-12">
            <Button
              variant="outline"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={!pagination.hasPrev || favoritesPageFetching}
            >
              Prev
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() => setCurrentPage((p) => p + 1)}
              disabled={!pagination.hasNext || favoritesPageFetching}
            >
              Next
            </Button>
          </div>
        )}

        {/* Saved Stores Section */}
        <div className="mt-16 pt-12 border-t border-border/20">
          <SavedStoresList showClearButton={true} />
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Favorites;
