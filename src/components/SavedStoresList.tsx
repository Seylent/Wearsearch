/**
 * Saved Stores Component
 * Displays user's saved/favorite stores
 */

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { Store, Bookmark, Trash2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSavedStores } from '@/hooks/useSavedStores';
import { cn } from '@/lib/utils';

interface SavedStoresListProps {
  className?: string;
  maxItems?: number;
  showClearButton?: boolean;
}

export const SavedStoresList: React.FC<SavedStoresListProps> = ({
  className,
  maxItems,
  showClearButton = true,
}) => {
  const { t } = useTranslation();
  const { stores, removeStore, clearAll, count, isLoading } = useSavedStores();

  if (isLoading) {
    return (
      <div className={cn('animate-pulse', className)}>
        <div className="h-6 w-40 bg-white/10 rounded mb-4"></div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 bg-white/5 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  if (count === 0) {
    return (
      <div className={cn('text-center py-12', className)}>
        <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4">
          <Bookmark className="w-8 h-8 text-white/30" />
        </div>
        <h3 className="text-lg font-semibold mb-2">{t('stores.noSavedStores')}</h3>
        <p className="text-sm text-muted-foreground">{t('stores.startSaving')}</p>
      </div>
    );
  }

  const displayStores = maxItems ? stores.slice(0, maxItems) : stores;

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Bookmark className="w-5 h-5 text-white/60" />
          <h2 className="font-display text-lg font-semibold">{t('stores.savedStores')}</h2>
          <span className="text-sm text-white/40">({count})</span>
        </div>

        {showClearButton && count > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAll}
            className="text-white/40 hover:text-white hover:bg-white/10"
          >
            <Trash2 className="w-4 h-4 mr-1" />
            <span className="hidden sm:inline">{t('recentlyViewed.clearAll')}</span>
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayStores.map(store => (
          <div
            key={store.id}
            className="group relative p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all"
          >
            <div className="flex items-center gap-3">
              {store.logo_url ? (
                <Image
                  src={store.logo_url}
                  alt={store.name}
                  width={48}
                  height={48}
                  className="w-12 h-12 rounded-lg object-cover bg-white/5"
                />
              ) : (
                <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center">
                  <Store className="w-6 h-6 text-white/40" />
                </div>
              )}

              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-white truncate">{store.name}</h3>
                <p className="text-xs text-white/40">
                  {new Date(store.savedAt).toLocaleDateString()}
                </p>
              </div>

              <div className="flex items-center gap-1">
                <Link
                  href={`/products?store_id=${store.id}`}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <ExternalLink className="w-4 h-4 text-white/60" />
                </Link>

                <button
                  onClick={() => removeStore(store.id)}
                  className="p-2 rounded-lg hover:bg-red-500/20 transition-colors"
                >
                  <Trash2 className="w-4 h-4 text-white/60 hover:text-red-400" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SavedStoresList;
