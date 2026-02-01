/**
 * All Site Products Page
 * Browse and add products from site catalog
 */

'use client';

import React, { useState } from 'react';
import { useStoreContext } from '@/features/store-menu/context/StoreContext';
import { Globe, Plus, Search, Filter, X, Check } from 'lucide-react';
import { StoreMenuLayout } from '@/features/store-menu/components/StoreMenuLayout';
import {
  useSiteProducts,
  useAddExistingProduct,
  useStoreDashboard,
} from '@/features/store-menu/hooks/useStoreMenu';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { OptimizedImage } from '@/components/OptimizedImage';
import { toast } from 'sonner';

const SIZES = [
  '36',
  '37',
  '38',
  '39',
  '40',
  '41',
  '42',
  '43',
  '44',
  '45',
  '46',
  'XS',
  'S',
  'M',
  'L',
  'XL',
  'XXL',
];

function AddProductDialog({
  product,
  storeId,
  isOpen,
  onClose,
}: {
  product: {
    id: string;
    name: string;
    image_url: string;
    brand: string;
    base_price: number;
  } | null;
  storeId: string;
  isOpen: boolean;
  onClose: () => void;
}) {
  const addMutation = useAddExistingProduct();
  const [storePrice, setStorePrice] = useState('');
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);

  if (!product) return null;

  const handleAdd = async () => {
    try {
      await addMutation.mutateAsync({
        storeId,
        data: {
          product_id: product.id,
          store_price: Number(storePrice),
          sizes: selectedSizes,
        },
      });
      toast.success('Товар додано до вашого магазину');
      onClose();
      setStorePrice('');
      setSelectedSizes([]);
    } catch {
      toast.error('Помилка при додаванні товару');
    }
  };

  const toggleSize = (size: string) => {
    setSelectedSizes(prev =>
      prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Додати товар до магазину</DialogTitle>
          <DialogDescription>{product.name}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="h-24 w-24 overflow-hidden rounded-md">
              <OptimizedImage
                src={product.image_url}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            </div>
            <div>
              <p className="font-medium">{product.brand}</p>
              <p className="text-sm text-muted-foreground">
                Базова ціна: {product.base_price.toLocaleString('uk-UA')} грн
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="store-price">Ваша ціна *</Label>
            <Input
              id="store-price"
              type="number"
              value={storePrice}
              onChange={e => setStorePrice(e.target.value)}
              placeholder="Введіть ціну в грн"
            />
          </div>

          <div className="space-y-2">
            <Label>Розміри в наявності *</Label>
            <div className="flex flex-wrap gap-2">
              {SIZES.map(size => (
                <Badge
                  key={size}
                  variant={selectedSizes.includes(size) ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => toggleSize(size)}
                >
                  {selectedSizes.includes(size) && <Check className="mr-1 h-3 w-3" />}
                  {size}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Скасувати
          </Button>
          <Button
            onClick={handleAdd}
            disabled={!storePrice || selectedSizes.length === 0 || addMutation.isPending}
          >
            {addMutation.isPending ? 'Додавання...' : 'Додати'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AllProductsContent({ storeId }: { storeId: string }) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [brand, setBrand] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<{
    id: string;
    name: string;
    image_url: string;
    brand: string;
    base_price: number;
  } | null>(null);

  const { data: dashboardData } = useStoreDashboard(storeId);
  const { data, isLoading } = useSiteProducts(storeId, 1, search, category, brand);
  const products = data?.items || [];

  const isOfficialStore = !!dashboardData?.store.brand_id;
  const brandName = dashboardData?.store.name || '';
  const hasFilters = search || category || brand;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Всі товари сайту</h1>
        <p className="text-muted-foreground">
          Виберіть товари з каталогу для додавання до вашого магазину
        </p>
      </div>

      {/* Official Store Badge */}
      {isOfficialStore && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5 text-blue-600" />
              <p className="text-sm text-blue-800">
                Ви переглядаєте товари бренду <strong>{brandName}</strong>
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Пошук товарів..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <Select
                value={category || 'all'}
                onValueChange={v => setCategory(v === 'all' ? '' : v)}
              >
                <SelectTrigger className="w-[150px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Категорія" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Всі категорії</SelectItem>
                  <SelectItem value="shoes">Взуття</SelectItem>
                  <SelectItem value="clothing">Одяг</SelectItem>
                  <SelectItem value="accessories">Аксесуари</SelectItem>
                </SelectContent>
              </Select>

              {!isOfficialStore && (
                <Select value={brand || 'all'} onValueChange={v => setBrand(v === 'all' ? '' : v)}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Бренд" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Всі бренди</SelectItem>
                    <SelectItem value="nike">Nike</SelectItem>
                    <SelectItem value="adidas">Adidas</SelectItem>
                    <SelectItem value="puma">Puma</SelectItem>
                  </SelectContent>
                </Select>
              )}

              {hasFilters && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setSearch('');
                    setCategory('');
                    setBrand('');
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {isLoading ? (
          <>
            {[...Array(8)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <Skeleton className="mb-4 h-40" />
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardContent>
              </Card>
            ))}
          </>
        ) : products.length > 0 ? (
          products.map(product => (
            <Card key={product.id} className="group overflow-hidden">
              <CardContent className="p-0">
                <div className="aspect-square overflow-hidden">
                  <OptimizedImage
                    src={product.image_url}
                    alt={product.name}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                </div>
                <div className="p-4">
                  <p className="text-sm text-muted-foreground">{product.brand}</p>
                  <h3 className="mt-1 font-medium line-clamp-2">{product.name}</h3>
                  <p className="mt-2 font-semibold">
                    {Number.isFinite(Number(product.base_price))
                      ? Number(product.base_price).toLocaleString('uk-UA')
                      : '—'}{' '}
                    грн
                  </p>
                  <Button
                    className="mt-3 w-full"
                    size="sm"
                    onClick={() => setSelectedProduct(product)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Додати до магазину
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full py-12 text-center">
            <Globe className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-lg font-medium">Товарів не знайдено</p>
            <p className="text-muted-foreground">Спробуйте змінити фільтри пошуку</p>
          </div>
        )}
      </div>

      <AddProductDialog
        product={selectedProduct}
        storeId={storeId}
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </div>
  );
}

export default function AllProductsPage() {
  const { selectedStoreId, isLoading } = useStoreContext();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <Skeleton className="h-20" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!selectedStoreId) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">
              ID магазину не вказано. Перейдіть зі списку ваших магазинів.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <StoreMenuLayout>
      <AllProductsContent storeId={selectedStoreId} />
    </StoreMenuLayout>
  );
}
