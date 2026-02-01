/**
 * Recently Viewed Products Component
 * Displays a horizontal scrollable list of recently viewed products
 */

'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { History, X, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProductCard from '@/components/ProductCard';
import { useRecentlyViewed, type RecentlyViewedItem } from '@/hooks/useRecentlyViewed';
import { cn } from '@/lib/utils';
import { useCurrency } from '@/contexts/CurrencyContext';

interface RecentlyViewedProductsProps {
  className?: string;
  maxItems?: number;
  showClearButton?: boolean;
  title?: string;
  excludeProductId?: string; // Exclude current product from list
}

const RecentlyViewedProducts: React.FC<RecentlyViewedProductsProps> = ({
  className,
  maxItems = 10,
  showClearButton = true,
  title,
  excludeProductId,
}) => {
  const { t } = useTranslation();
  const { items, removeItem, clearAll, refreshPrices } = useRecentlyViewed();
  const { currency } = useCurrency();

  React.useEffect(() => {
    refreshPrices(currency);
  }, [currency, refreshPrices]);

  // Filter out excluded product
  const filteredItems = excludeProductId
    ? items.filter(item => String(item.id) !== excludeProductId)
    : items;

  if (filteredItems.length === 0) {
    return null;
  }

  const displayItems = filteredItems.slice(0, maxItems);

  return (
    <section className={cn('py-6 sm:py-8', className)}>
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-white/60" aria-hidden="true" />
          <h2 className="font-display text-lg sm:text-xl font-semibold text-white">
            {title || t('recentlyViewed.title', 'Recently Viewed')}
          </h2>
          <span className="text-sm text-white/40">({filteredItems.length})</span>
        </div>

        {showClearButton && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAll}
            className="text-white/40 hover:text-white hover:bg-white/10"
            aria-label={t('recentlyViewed.clearAll', 'Clear all')}
          >
            <Trash2 className="w-4 h-4 mr-1" />
            <span className="hidden sm:inline">{t('recentlyViewed.clearAll', 'Clear all')}</span>
          </Button>
        )}
      </div>

      <div
        className="flex gap-3 sm:gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {displayItems.map(item => (
          <RecentlyViewedCard key={item.id} item={item} onRemove={() => removeItem(item.id)} />
        ))}
      </div>
    </section>
  );
};

interface RecentlyViewedCardProps {
  item: RecentlyViewedItem;
  onRemove: () => void;
}

const RecentlyViewedCard: React.FC<RecentlyViewedCardProps> = ({ item, onRemove }) => {
  const { t } = useTranslation();
  return (
    <div
      className="relative group flex-shrink-0 w-[180px] sm:w-[200px]"
      style={{ scrollSnapAlign: 'start' }}
    >
      <ProductCard
        id={item.id}
        name={item.name}
        image={item.image_url || item.image || ''}
        price={item.price}
        brand={item.brand}
      />

      {/* Remove button */}
      <button
        onClick={e => {
          e.preventDefault();
          e.stopPropagation();
          onRemove();
        }}
        className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white border border-border flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-muted text-foreground"
        aria-label={t('recentlyViewed.remove', 'Remove from recently viewed')}
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
};

export default RecentlyViewedProducts;
