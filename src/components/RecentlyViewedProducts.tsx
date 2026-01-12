/**
 * Recently Viewed Products Component
 * Displays a horizontal scrollable list of recently viewed products
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { History, X, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LazyImage } from '@/components/common/LazyImage';
import { useRecentlyViewed, type RecentlyViewedItem } from '@/hooks/useRecentlyViewed';
import { cn } from '@/lib/utils';

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
  const { items, removeItem, clearAll, count: _count } = useRecentlyViewed();

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
        {displayItems.map((item) => (
          <RecentlyViewedCard
            key={item.id}
            item={item}
            onRemove={() => removeItem(item.id)}
          />
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
  const imageSrc = item.image_url || item.image || '';

  return (
    <div 
      className="relative group flex-shrink-0 w-[140px] sm:w-[160px]"
      style={{ scrollSnapAlign: 'start' }}
    >
      <Link
        href={`/product/${item.id}`}
        className="block rounded-lg overflow-hidden border border-white/10 bg-white/5 backdrop-blur-sm transition-all duration-300 hover:border-white/20 hover:bg-white/10"
      >
        <div className="relative aspect-[3/4] overflow-hidden">
          <LazyImage
            src={imageSrc}
            alt={item.name}
            rootMargin="250px"
            className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 transition-all duration-300"
          />
        </div>
        
        <div className="p-2 sm:p-3">
          <h3 className="text-sm font-medium text-white truncate">
            {item.name}
          </h3>
          {item.brand && (
            <p className="text-xs text-white/60 truncate mt-0.5">
              {item.brand}
            </p>
          )}
          {item.price && (
            <p className="text-sm font-semibold text-white mt-1">
              ${typeof item.price === 'number' ? item.price.toFixed(2) : item.price}
            </p>
          )}
        </div>
      </Link>

      {/* Remove button */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onRemove();
        }}
        className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-black/80"
        aria-label={t('recentlyViewed.remove', 'Remove from recently viewed')}
      >
        <X className="w-3 h-3 text-white" />
      </button>
    </div>
  );
};

export default RecentlyViewedProducts;
