import React from 'react';
import { useTranslation } from 'react-i18next';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/**
 * Base Skeleton Component with shimmer effect
 */
const skeletonVariants = cva(
  'bg-muted/40 rounded',
  {
    variants: {
      animation: {
        shimmer: 'animate-shimmer bg-gradient-to-r from-muted/40 via-muted/60 to-muted/40 bg-[length:200%_100%]',
        pulse: 'animate-pulse',
      },
    },
    defaultVariants: {
      animation: 'shimmer',
    },
  }
);

interface SkeletonProps extends VariantProps<typeof skeletonVariants> {
  className?: string;
}

const Skeleton = ({ className = '', animation = 'shimmer' }: SkeletonProps) => (
  <div className={cn(skeletonVariants({ animation }), className)} />
);

/**
 * Product Card Skeleton Loader with shimmer effect
 */
export const ProductCardSkeleton: React.FC = () => {
  return (
    <div className="h-full flex flex-col rounded-lg overflow-hidden border border-white/10 bg-white/5 backdrop-blur-[25px] animate-in fade-in-0 duration-300">
      {/* Image skeleton with shimmer */}
      <Skeleton className="relative aspect-[4/5]" />
      
      {/* Content skeleton */}
      <div className="p-3 flex-1 flex flex-col justify-between space-y-2">
        <div className="space-y-2">
          {/* Brand */}
          <Skeleton className="h-3 w-20" />
          
          {/* Product name */}
          <div className="space-y-1.5">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-3/4" />
          </div>
        </div>
        
        {/* Price */}
        <Skeleton className="h-4 w-24 mt-2" />
      </div>
    </div>
  );
};

/**
 * Grid of Product Skeletons with staggered animation
 */
interface GridSkeletonProps {
  count?: number;
  columns?: 2 | 3 | 4 | 6;
}

export const ProductGridSkeleton: React.FC<GridSkeletonProps> = ({ 
  count = 6, 
  columns = 4 
}) => {
  const { t } = useTranslation();
  const itemKeys = useMemo(() => Array.from({ length: count }, (_, idx) => `product-skeleton-${idx + 1}`), [count]);
  
  const gridClass = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
    6: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'
  }[columns];

  return (
    <div className={`grid ${gridClass} gap-3 sm:gap-4 md:gap-6`} aria-busy="true">
      <output className="sr-only" aria-live="polite">
        {t('aria.loadingProducts')}
      </output>
      {itemKeys.map((key, idx) => (
        <div 
          key={key}
          style={{ animationDelay: `${idx * 50}ms` }}
          className="animate-in fade-in-0 slide-in-from-bottom-4 duration-500"
        >
          <ProductCardSkeleton />
        </div>
      ))}
    </div>
  );
};

/**
 * Store Card Skeleton with shimmer
 */
export const StoreCardSkeleton: React.FC = () => {
  return (
    <div className="p-6 rounded-xl border border-border/50 bg-card/20 space-y-4 animate-in fade-in-0 duration-300">
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="w-16 h-16 rounded-lg" />
      </div>
      
      <div className="space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
      </div>
      
      <div className="flex gap-2 pt-2">
        <Skeleton className="h-9 w-28 rounded-lg" />
        <Skeleton className="h-9 w-28 rounded-lg" />
      </div>
    </div>
  );
};

/**
 * Grid of Store Skeletons with staggered animation
 */
export const StoreGridSkeleton: React.FC<{ count?: number }> = ({ count = 6 }) => {
  const { t } = useTranslation();
  const itemKeys = useMemo(() => Array.from({ length: count }, (_, idx) => `store-skeleton-${idx + 1}`), [count]);
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8" aria-busy="true">
      <output className="sr-only" aria-live="polite">
        {t('aria.loadingStores')}
      </output>
      {itemKeys.map((key, idx) => (
        <div
          key={key}
          style={{ animationDelay: `${idx * 50}ms` }}
          className="animate-in fade-in-0 slide-in-from-bottom-4 duration-500"
        >
          <StoreCardSkeleton />
        </div>
      ))}
    </div>
  );
};

/**
 * Text Skeleton (for titles, paragraphs)
 */
interface TextSkeletonProps {
  className?: string;
  lines?: number;
}

export const TextSkeleton: React.FC<TextSkeletonProps> = ({ 
  className = '', 
  lines = 1 
}) => {
  const lineKeys = useMemo(() => Array.from({ length: lines }, (_, idx) => `text-skeleton-${idx + 1}`), [lines]);
  return (
    <div className={`space-y-2 ${className}`}>
      {lineKeys.map((key, idx) => (
        <div 
          key={key} 
          className="h-4 bg-muted/30 rounded animate-pulse"
          style={{ width: `${100 - (idx * 10)}%` }}
        />
      ))}
    </div>
  );
};
