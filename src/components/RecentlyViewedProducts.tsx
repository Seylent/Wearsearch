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
          <History className="w-5 h-5 text-earth/60" aria-hidden="true" />
          <h2 className="font-display text-lg sm:text-xl font-semibold text-earth">
            {title || t('recentlyViewed.title', 'Recently Viewed')}
          </h2>
          <span className="text-sm text-earth/50">({filteredItems.length})</span>
        </div>

        {showClearButton && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAll}
            className="text-earth/50 hover:text-earth hover:bg-sand/40"
            aria-label={t('recentlyViewed.clearAll', 'Clear all')}
          >
            <Trash2 className="w-4 h-4 mr-1" />
            <span className="hidden sm:inline">{t('recentlyViewed.clearAll', 'Clear all')}</span>
          </Button>
        )}
      </div>

      <div className="flex gap-3 sm:gap-4 mobile-x-scroll pb-4 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent md:flex-wrap md:pb-0">
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
  const { currency, exchangeRate } = useCurrency();
  const rawPrice =
    typeof item.price === 'number'
      ? item.price
      : typeof item.price === 'string'
        ? Number.parseFloat(item.price)
        : undefined;
  const itemCurrency = item.currency === 'USD' || item.currency === 'UAH' ? item.currency : null;
  const shouldConvert = itemCurrency && itemCurrency !== currency;
  let displayPrice = rawPrice;
  if (shouldConvert && exchangeRate?.rate && rawPrice !== undefined) {
    displayPrice = currency === 'USD' ? rawPrice / exchangeRate.rate : rawPrice * exchangeRate.rate;
  }
  const priceCurrency = shouldConvert && exchangeRate?.rate ? currency : itemCurrency || currency;
  return (
    <div className="relative group flex-shrink-0 w-[180px] sm:w-[200px] md:w-[220px]">
      <ProductCard
        id={item.id}
        name={item.name}
        image={item.image_url || item.image || ''}
        price={displayPrice ?? item.price}
        priceCurrency={priceCurrency}
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
