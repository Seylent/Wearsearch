/**
 * Store Menu Dashboard Page
 * Main dashboard for store management
 */

'use client';

import React from 'react';
import Link from 'next/link';
import {
  Store,
  Package,
  Users,
  PlusCircle,
  Edit,
  CheckCircle,
  Star,
  ExternalLink,
  TrendingUp,
} from 'lucide-react';
import { StoreMenuLayout } from '@/features/store-menu/components/StoreMenuLayout';
import { useStoreDashboard } from '@/features/store-menu/hooks/useStoreMenu';
import { useStoreContext } from '@/features/store-menu/context/StoreContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { OptimizedImage } from '@/components/OptimizedImage';

function StatCard({
  title,
  value,
  icon: Icon,
  description,
}: {
  title: string;
  value: number;
  icon: React.ElementType;
  description?: string;
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="mt-2 text-3xl font-bold">{value.toLocaleString('uk-UA')}</p>
            {description && <p className="mt-1 text-xs text-muted-foreground">{description}</p>}
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
            <Icon className="h-6 w-6 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(2)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-20" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-40" />
        </CardContent>
      </Card>
    </div>
  );
}

function DashboardContent({ storeId }: { storeId: string }) {
  const { data, isLoading, error } = useStoreDashboard(storeId);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardContent className="p-6">
          <p className="text-destructive">
            Помилка завантаження даних. Спробуйте оновити сторінку.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardContent className="p-6">
          <p>Дані не знайдено</p>
        </CardContent>
      </Card>
    );
  }

  const { store, stats, recent_products } = data;

  return (
    <div className="space-y-6">
      {/* Store Info Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-6 md:flex-row md:items-start">
            {/* Store Logo & Name */}
            <div className="flex items-start gap-4">
              <div className="h-20 w-20 overflow-hidden rounded-lg border">
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
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold">{store.name}</h2>
                  {store.is_verified && (
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      <CheckCircle className="mr-1 h-3 w-3" />
                      Verified
                    </Badge>
                  )}
                  {store.is_recommended && (
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                      <Star className="mr-1 h-3 w-3" />
                      Recommended
                    </Badge>
                  )}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {store.access_type === 'owner' ? 'Власник' : 'Менеджер'}
                </p>
                {store.brand_id && (
                  <Badge variant="outline" className="mt-2">
                    Офіційний магазин
                  </Badge>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-2 md:ml-auto">
              <Link href="/store-menu/products/new">
                <Button variant="pill" size="pill">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Додати товар
                </Button>
              </Link>
              <Link href="/store-menu/store">
                <Button variant="pillOutline" size="pill">
                  <Edit className="mr-2 h-4 w-4" />
                  Редагувати магазин
                </Button>
              </Link>
              <Link href={`/stores/${store.id}`} target="_blank">
                <Button variant="ghost" size="icon">
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Social Links */}
          {(store.telegram_url || store.instagram_url || store.tiktok_url || store.website_url) && (
            <div className="mt-4 flex flex-wrap gap-2">
              {store.telegram_url && (
                <a
                  href={store.telegram_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-primary"
                >
                  Telegram
                </a>
              )}
              {store.instagram_url && (
                <a
                  href={store.instagram_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-primary"
                >
                  Instagram
                </a>
              )}
              {store.tiktok_url && (
                <a
                  href={store.tiktok_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-primary"
                >
                  TikTok
                </a>
              )}
              {store.website_url && (
                <a
                  href={store.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-primary"
                >
                  Website
                </a>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Всього товарів"
          value={stats.total_products}
          icon={Package}
          description="У вашому магазині"
        />
        <StatCard
          title="Менеджерів"
          value={stats.total_managers}
          icon={Users}
          description={store.access_type === 'owner' ? 'Ви можете керувати' : 'Тільки для власника'}
        />
      </div>

      {/* Recent Products */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Останні товари</CardTitle>
            <CardDescription>5 останніх доданих товарів</CardDescription>
          </div>
          <Link href="/store-menu/products/my">
            <Button variant="ghost" size="sm">
              Переглянути всі
              <TrendingUp className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {recent_products.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Фото</TableHead>
                  <TableHead>Назва</TableHead>
                  <TableHead className="text-right">Ціна</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recent_products.map(product => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="h-12 w-12 overflow-hidden rounded-md">
                        <OptimizedImage
                          src={product.image_url}
                          alt={product.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell className="text-right">
                      {product.store_price.toLocaleString('uk-UA')} грн
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="py-8 text-center">
              <Package className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-2 text-muted-foreground">У вашому магазині ще немає товарів</p>
              <Link href="/store-menu/products/new" className="mt-4 inline-block">
                <Button variant="pill" size="pill">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Додати перший товар
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function StoreMenuPage() {
  const { selectedStoreId, isLoading } = useStoreContext();

  // The layout will handle loading states and store selection
  // This page only renders when a store is selected
  if (isLoading || !selectedStoreId) {
    return (
      <StoreMenuLayout>
        <DashboardSkeleton />
      </StoreMenuLayout>
    );
  }

  return (
    <StoreMenuLayout>
      <DashboardContent storeId={selectedStoreId} />
    </StoreMenuLayout>
  );
}
