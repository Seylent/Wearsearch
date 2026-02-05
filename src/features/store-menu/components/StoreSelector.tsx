/**
 * Store Selector Component
 * Shows store selection when user has multiple stores
 */

'use client';

import React from 'react';
import { Store, CheckCircle } from 'lucide-react';
import { useStoreContext } from '../context/StoreContext';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { OptimizedImage } from '@/components/OptimizedImage';

export function StoreSelector() {
  const { stores, selectedStoreId, setSelectedStore, isLoading, hasNoStores } = useStoreContext();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10" />
        <div className="grid gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  if (hasNoStores) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center p-8 sm:p-12 text-center">
          <Store className="h-14 w-14 sm:h-16 sm:w-16 text-muted-foreground" />
          <h2 className="mt-4 text-lg sm:text-xl font-semibold">У вас ще немає магазинів</h2>
          <p className="mt-2 text-muted-foreground text-sm sm:text-base">
            Зв&apos;яжіться з адміністрацією для створення магазину
          </p>
        </CardContent>
      </Card>
    );
  }

  if (stores.length === 1) {
    // Single store - auto-selected, show confirmation
    const store = stores[0];
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center p-8 sm:p-12 text-center">
          <div className="h-16 w-16 sm:h-20 sm:w-20 overflow-hidden rounded-lg border">
            {store.logo_url ? (
              <OptimizedImage
                src={store.logo_url}
                alt={store.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-muted">
                <Store className="h-8 w-8 text-muted-foreground" />
              </div>
            )}
          </div>
          <h2 className="mt-4 text-lg sm:text-xl font-semibold">{store.name}</h2>
        </CardContent>
      </Card>
    );
  }

  // Multiple stores - show selection
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold">Виберіть магазин</h2>
        <p className="text-muted-foreground text-sm sm:text-base">
          У вас є доступ до кількох магазинів
        </p>
      </div>

      <div className="grid gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3">
        {stores.map(store => (
          <Card
            key={store.id}
            className={`cursor-pointer transition-all ${
              selectedStoreId === store.id
                ? 'border-primary ring-2 ring-primary'
                : 'hover:border-primary/50'
            }`}
            onClick={() => setSelectedStore(store.id)}
          >
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="h-12 w-12 sm:h-16 sm:w-16 overflow-hidden rounded-lg border">
                  {store.logo_url ? (
                    <OptimizedImage
                      src={store.logo_url}
                      alt={store.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-muted">
                      <Store className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{store.name}</h3>
                </div>
                {selectedStoreId === store.id && (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <CheckCircle className="h-4 w-4" />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
