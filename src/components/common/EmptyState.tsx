/**
 * Empty State Components
 * Reusable components for empty, loading, and error states
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertCircle, Package, Store, ShoppingBag, Search, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const EmptyState = ({ icon, title, description, action }: EmptyStateProps) => {
  return (
    <div className="text-center py-24 sm:py-32 px-6 animate-in fade-in-0 duration-500">
      <div className="max-w-md mx-auto">
        {/* Icon with gentle pulse animation */}
        <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-6 animate-in zoom-in-95 duration-300">
          <div className="animate-pulse-gentle">
            {icon}
          </div>
        </div>
        
        <h3 className="font-display text-xl sm:text-2xl font-semibold mb-3 text-foreground">
          {title}
        </h3>
        <p className="text-sm sm:text-base text-muted-foreground mb-8 leading-relaxed">
          {description}
        </p>
        
        {action && (
          <Button 
            onClick={action.onClick}
            size="lg"
            className="animate-in slide-in-from-bottom-4 duration-500 delay-200"
          >
            {action.label}
          </Button>
        )}
      </div>
    </div>
  );
};

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  technicalDetails?: string;
}

export const ErrorState = ({ 
  title = 'Something went wrong',
  description = 'We encountered an error while loading the data. Please try again.',
  onRetry,
  technicalDetails
}: ErrorStateProps) => {
  const [isRetrying, setIsRetrying] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const handleRetry = async () => {
    if (!onRetry) return;
    setIsRetrying(true);
    try {
      await Promise.resolve(onRetry());
    } finally {
      // Keep spinning for a moment for visual feedback
      setTimeout(() => setIsRetrying(false), 500);
    }
  };

  return (
    <div className="text-center py-24 sm:py-32 px-6 animate-in fade-in-0 duration-500">
      <div className="max-w-md mx-auto">
        {/* Error icon with shake animation */}
        <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6 animate-in zoom-in-95 duration-300">
          <div className={isRetrying ? 'animate-spin' : 'animate-shake'}>
            {isRetrying ? (
              <RefreshCw className="w-8 h-8 text-destructive" />
            ) : (
              <AlertCircle className="w-8 h-8 text-destructive" />
            )}
          </div>
        </div>
        
        <h3 className="font-display text-xl sm:text-2xl font-semibold mb-3 text-foreground">
          {title}
        </h3>
        <p className="text-sm sm:text-base text-muted-foreground mb-8 leading-relaxed">
          {description}
        </p>
        
        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {onRetry && (
            <Button 
              onClick={handleRetry}
              disabled={isRetrying}
              size="lg"
              className="animate-in slide-in-from-bottom-4 duration-500 delay-200"
            >
              {isRetrying ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Retrying...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </>
              )}
            </Button>
          )}
        </div>

        {/* Technical details (collapsible) */}
        {technicalDetails && (
          <div className="mt-8 animate-in fade-in-0 duration-500 delay-300">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors underline"
            >
              {showDetails ? 'Hide' : 'Show'} technical details
            </button>
            {showDetails && (
              <pre className="mt-3 p-4 bg-muted/30 rounded-lg text-left text-xs text-muted-foreground overflow-x-auto animate-in slide-in-from-top-2 duration-300">
                {technicalDetails}
              </pre>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Specific empty states
export const NoProductsFound = ({ hasFilters = false, onClearFilters }: { hasFilters?: boolean; onClearFilters?: () => void }) => {
  const { t } = useTranslation();
  
  return (
    <EmptyState
      icon={<Package className="w-10 h-10 text-muted-foreground" />}
      title={hasFilters ? t('emptyStates.noProductsMatch', 'No products match your filters') : t('emptyStates.noProductsAvailable', 'No products available')}
      description={
        hasFilters
          ? t('emptyStates.tryAdjustingFilters', 'Try adjusting your filters or search criteria to discover more products.')
          : t('emptyStates.checkBackSoon', 'We don\'t have any products available at the moment. Please check back soon for new arrivals!')
      }
      action={
        hasFilters && onClearFilters
          ? {
              label: t('emptyStates.clearAllFilters', 'Clear All Filters'),
              onClick: onClearFilters,
            }
          : undefined
      }
    />
  );
};

export const NoStoreProducts = ({ storeName }: { storeName?: string }) => (
  <EmptyState
    icon={<ShoppingBag className="w-10 h-10 text-muted-foreground" />}
    title="No products yet"
    description={
      storeName
        ? `${storeName} hasn't added any products yet. Check back soon for new items!`
        : 'This store hasn\'t added any products yet. Follow them to get notified when they add new items.'
    }
  />
);

export const NoStoresFound = ({ hasSearch = false, onClearSearch }: { hasSearch?: boolean; onClearSearch?: () => void }) => (
  <EmptyState
    icon={<Store className="w-10 h-10 text-muted-foreground" />}
    title={hasSearch ? 'No stores match your search' : 'No stores found'}
    description={
      hasSearch 
        ? 'Try a different search term or browse all stores.'
        : 'There are no stores available at the moment. Please check back later as new stores join our platform!'
    }
    action={
      hasSearch && onClearSearch
        ? {
            label: 'Clear Search',
            onClick: onClearSearch,
          }
        : undefined
    }
  />
);

export const NoSearchResults = ({ query, onClearSearch }: { query: string; onClearSearch?: () => void }) => (
  <EmptyState
    icon={<Search className="w-10 h-10 text-muted-foreground" />}
    title={`No results for "${query}"`}
    description="We couldn't find anything matching your search. Try different keywords or browse our categories."
    action={
      onClearSearch
        ? {
            label: 'Clear Search',
            onClick: onClearSearch,
          }
        : undefined
    }
  />
);

export const NoFavoritesYet = ({ onBrowse }: { onBrowse?: () => void }) => (
  <EmptyState
    icon={<Package className="w-10 h-10 text-muted-foreground" />}
    title="No favorites yet"
    description="Start building your collection by adding products you love to your favorites."
    action={
      onBrowse
        ? {
            label: 'Browse Products',
            onClick: onBrowse,
          }
        : undefined
    }
  />
);

// Data source indicator for partial results
export const DataSourceIndicator = ({ 
  availableSources, 
  totalSources, 
  className 
}: { 
  availableSources: number; 
  totalSources: number; 
  className?: string; 
}) => {
  const { t } = useTranslation();
  
  if (availableSources === totalSources) return null;
  
  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-600 dark:text-yellow-400 text-sm ${className}`}>
      <AlertCircle className="w-4 h-4" />
      <span>
        {t('dataSource.partialResults', 'Showing results from {{available}} of {{total}} sources', {
          available: availableSources,
          total: totalSources
        })}
      </span>
    </div>
  );
};
