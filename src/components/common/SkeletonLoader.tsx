import React from 'react';

/**
 * Product Card Skeleton Loader
 */
export const ProductCardSkeleton: React.FC = () => {
  return (
    <div className="h-full flex flex-col rounded-lg overflow-hidden border border-white/10 bg-white/5 backdrop-blur-[25px] animate-pulse">
      {/* Image skeleton */}
      <div className="relative aspect-[4/5] bg-gradient-to-br from-white/10 to-white/5" />
      
      {/* Content skeleton */}
      <div className="p-3 flex-1 flex flex-col justify-between space-y-2">
        <div className="space-y-2">
          {/* Brand */}
          <div className="h-3 w-20 bg-white/10 rounded" />
          
          {/* Product name */}
          <div className="space-y-1">
            <div className="h-3 w-full bg-white/10 rounded" />
            <div className="h-3 w-3/4 bg-white/10 rounded" />
          </div>
        </div>
        
        {/* Price */}
        <div className="h-4 w-24 bg-white/10 rounded" />
      </div>
    </div>
  );
};

/**
 * Grid of Product Skeletons
 */
interface GridSkeletonProps {
  count?: number;
  columns?: 2 | 3 | 4 | 6;
}

export const ProductGridSkeleton: React.FC<GridSkeletonProps> = ({ 
  count = 6, 
  columns = 4 
}) => {
  const gridClass = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
    6: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6'
  }[columns];

  return (
    <div className={`grid ${gridClass} gap-6`}>
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
};

/**
 * Store Card Skeleton
 */
export const StoreCardSkeleton: React.FC = () => {
  return (
    <div className="p-6 rounded-xl border border-border/50 bg-card/20 space-y-4 animate-pulse">
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <div className="h-6 w-40 bg-muted/30 rounded" />
          <div className="h-4 w-32 bg-muted/20 rounded" />
        </div>
        <div className="w-16 h-16 rounded-lg bg-muted/30" />
      </div>
      
      <div className="space-y-2">
        <div className="h-3 w-full bg-muted/20 rounded" />
        <div className="h-3 w-5/6 bg-muted/20 rounded" />
      </div>
      
      <div className="flex gap-2 pt-2">
        <div className="h-9 w-28 bg-muted/30 rounded-lg" />
        <div className="h-9 w-28 bg-muted/30 rounded-lg" />
      </div>
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
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div 
          key={i} 
          className="h-4 bg-muted/30 rounded animate-pulse"
          style={{ width: `${100 - (i * 10)}%` }}
        />
      ))}
    </div>
  );
};
