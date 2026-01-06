import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Heart, User } from 'lucide-react';
import Navigation from '@/components/layout/Navigation';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/ProductCard';
import { ProductGridSkeleton } from '@/components/common/SkeletonLoader';
import { useSEO } from '@/hooks/useSEO';
import { getPublicWishlist, type PublicWishlist } from '@/services/wishlistService';

const SharedWishlist = () => {
  const { shareId } = useParams<{ shareId: string }>();
  const { t } = useTranslation();
  const [wishlist, setWishlist] = useState<PublicWishlist | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useSEO({
    title: wishlist 
      ? t('wishlist.sharedTitle', { name: wishlist.owner_name })
      : t('wishlist.shared'),
    description: t('wishlist.sharedDescription'),
    type: 'website',
  });

  useEffect(() => {
    if (!shareId) {
      setError('Invalid share link');
      setIsLoading(false);
      return;
    }

    const loadWishlist = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getPublicWishlist(shareId);
        setWishlist(data);
      } catch (err) {
        console.error('Failed to load shared wishlist:', err);
        setError(t('wishlist.notFoundOrPrivate'));
      } finally {
        setIsLoading(false);
      }
    };

    loadWishlist();
  }, [shareId, t]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      
      <main className="container mx-auto px-6 pt-28 pb-16">
        {isLoading ? (
          <>
            <div className="mb-10 animate-pulse">
              <div className="h-4 w-24 bg-white/10 rounded mb-4"></div>
              <div className="h-10 w-64 bg-white/10 rounded mb-3"></div>
              <div className="h-5 w-48 bg-white/10 rounded"></div>
            </div>
            <ProductGridSkeleton count={8} columns={4} />
          </>
        ) : error ? (
          <div className="text-center py-20 border border-dashed border-border/30 rounded-3xl bg-card/10">
            <div className="w-16 h-16 rounded-full border-2 border-border/30 flex items-center justify-center mx-auto mb-6">
              <Heart className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-display text-xl font-semibold mb-2">
              {t('wishlist.notFound')}
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              {error}
            </p>
          </div>
        ) : wishlist ? (
          <>
            {/* Header */}
            <div className="mb-10">
              <div className="inline-flex items-center gap-2 mb-4">
                <Heart className="w-4 h-4 text-red-500" />
                <span className="text-xs text-muted-foreground uppercase tracking-wider">
                  {t('wishlist.sharedWishlist')}
                </span>
              </div>
              <h1 className="font-display text-4xl sm:text-5xl font-bold mb-3 flex items-center gap-3">
                <User className="w-8 h-8 text-white/50" />
                {wishlist.owner_name}
              </h1>
              <p className="text-muted-foreground text-lg">
                {t('wishlist.itemsCount', { count: wishlist.items_count })}
              </p>
            </div>

            {/* Products Grid */}
            {wishlist.items.length === 0 ? (
              <div className="text-center py-20 border border-dashed border-border/30 rounded-3xl bg-card/10">
                <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {t('wishlist.emptyShared')}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {wishlist.items.map((item, index) => (
                  <ProductCard
                    key={item.id || index}
                    id={item.id}
                    name={item.name}
                    image={item.image_url}
                    price={item.price}
                    brand={item.brand}
                  />
                ))}
              </div>
            )}
          </>
        ) : null}
      </main>

      <Footer />
    </div>
  );
};

export default SharedWishlist;
