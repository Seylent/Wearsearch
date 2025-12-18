/**
 * Empty State Components
 * Reusable components for empty, loading, and error states
 */

import { AlertCircle, Package, Store, ShoppingBag, Search } from 'lucide-react';
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
    <div className="text-center py-32 border border-dashed border-border rounded-3xl bg-muted/30">
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
        {icon}
      </div>
      <h3 className="font-display text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground mb-6 max-w-md mx-auto">
        {description}
      </p>
      {action && (
        <Button onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
};

export const ErrorState = ({ 
  title = 'Something went wrong',
  description = 'We encountered an error while loading the data. Please try again.',
  onRetry 
}: { 
  title?: string;
  description?: string;
  onRetry?: () => void;
}) => {
  return (
    <div className="text-center py-32 border border-dashed border-destructive/30 rounded-3xl bg-destructive/5">
      <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6">
        <AlertCircle className="w-8 h-8 text-destructive" />
      </div>
      <h3 className="font-display text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground mb-6 max-w-md mx-auto">
        {description}
      </p>
      {onRetry && (
        <Button onClick={onRetry}>
          Try Again
        </Button>
      )}
    </div>
  );
};

// Specific empty states
export const NoProductsFound = ({ hasFilters = false }: { hasFilters?: boolean }) => (
  <EmptyState
    icon={<Package className="w-8 h-8 text-muted-foreground" />}
    title={hasFilters ? 'No products match your filters' : 'No products found'}
    description={
      hasFilters
        ? 'Try adjusting your filters or search query to find what you\'re looking for.'
        : 'There are no products available at the moment. Please check back later.'
    }
    action={
      hasFilters
        ? {
            label: 'Clear Filters',
            onClick: () => window.location.href = '/products',
          }
        : undefined
    }
  />
);

export const NoStoreProducts = ({ storeName }: { storeName?: string }) => (
  <EmptyState
    icon={<ShoppingBag className="w-8 h-8 text-muted-foreground" />}
    title="No products yet"
    description={
      storeName
        ? `${storeName} hasn't added any products yet. Check back soon!`
        : 'This store hasn\'t added any products yet. Check back soon!'
    }
  />
);

export const NoStoresFound = () => (
  <EmptyState
    icon={<Store className="w-8 h-8 text-muted-foreground" />}
    title="No stores found"
    description="There are no stores available at the moment. Please check back later."
  />
);

export const NoSearchResults = ({ query }: { query: string }) => (
  <EmptyState
    icon={<Search className="w-8 h-8 text-muted-foreground" />}
    title="No results found"
    description={`We couldn't find any products matching "${query}". Try a different search term.`}
  />
);
