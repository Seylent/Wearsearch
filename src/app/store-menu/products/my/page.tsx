/**
 * My Products Page
 * Store products management page
 */

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useStoreContext } from '@/features/store-menu/context/StoreContext';
import {
  Package,
  PlusCircle,
  Search,
  Edit,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  Filter,
  X,
} from 'lucide-react';
import { StoreMenuLayout } from '@/features/store-menu/components/StoreMenuLayout';
import { useStoreProducts, useDeleteStoreProduct } from '@/features/store-menu/hooks/useStoreMenu';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

const ITEMS_PER_PAGE = 25;

function DeleteProductDialog({
  productId,
  productName,
  storeId,
  isOpen,
  onClose,
}: {
  productId: string;
  productName: string;
  storeId: string;
  isOpen: boolean;
  onClose: () => void;
}) {
  const deleteMutation = useDeleteStoreProduct();

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync({ storeId, productId });
      toast.success('Товар видалено з магазину');
      onClose();
    } catch {
      toast.error('Помилка при видаленні товару');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Видалити товар?</DialogTitle>
          <DialogDescription>
            Ви впевнені, що хочете видалити товар &quot;{productName}&quot; з вашого магазину? Цю
            дію не можна скасувати.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="pillOutline" size="pill" onClick={onClose}>
            Скасувати
          </Button>
          <Button
            variant="destructive"
            size="pill"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? 'Видалення...' : 'Видалити'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ProductsContent({ storeId }: { storeId: string }) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'price' | 'name'>('date');
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    productId: string;
    productName: string;
  }>({ isOpen: false, productId: '', productName: '' });

  const { data, isLoading, error } = useStoreProducts(
    storeId,
    page,
    ITEMS_PER_PAGE,
    search,
    category,
    sortBy
  );

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleCategoryChange = (value: string) => {
    setCategory(value === 'all' ? '' : value);
    setPage(1);
  };

  const handleSortChange = (value: string) => {
    setSortBy(value as 'date' | 'price' | 'name');
    setPage(1);
  };

  const clearFilters = () => {
    setSearch('');
    setCategory('');
    setSortBy('date');
    setPage(1);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardContent className="p-6">
          <p className="text-destructive">
            Помилка завантаження товарів. Спробуйте оновити сторінку.
          </p>
        </CardContent>
      </Card>
    );
  }

  const products = data?.items || [];
  const meta = data?.meta;
  const hasFilters = search || category || sortBy !== 'date';

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Мої товари</h1>
          <p className="text-muted-foreground">Керуйте товарами у вашому магазині</p>
        </div>
        <Link href="/store-menu/products/new">
          <Button variant="pill" size="pill">
            <PlusCircle className="mr-2 h-4 w-4" />
            Додати товар
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Пошук за назвою..."
                value={search}
                onChange={e => handleSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <Select value={category || 'all'} onValueChange={handleCategoryChange}>
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

              <Select value={sortBy} onValueChange={handleSortChange}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Сортування" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">За датою</SelectItem>
                  <SelectItem value="price">За ціною</SelectItem>
                  <SelectItem value="name">За назвою</SelectItem>
                </SelectContent>
              </Select>

              {hasFilters && (
                <Button variant="ghost" size="icon" onClick={clearFilters}>
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardContent className="p-0">
          {products.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[80px]">Фото</TableHead>
                      <TableHead>Назва</TableHead>
                      <TableHead>Категорія</TableHead>
                      <TableHead>Ціна</TableHead>
                      <TableHead>Розміри</TableHead>
                      <TableHead>Статус</TableHead>
                      <TableHead className="text-right">Дії</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map(product => (
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
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">{product.name}</span>
                            {product.is_own_product && (
                              <Badge variant="secondary" className="mt-1 w-fit text-xs">
                                Власний товар
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{product.category}</TableCell>
                        <TableCell>{product.store_price.toLocaleString('uk-UA')} грн</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {product.sizes.slice(0, 3).map(size => (
                              <Badge key={size} variant="outline" className="text-xs">
                                {size}
                              </Badge>
                            ))}
                            {product.sizes.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{product.sizes.length - 3}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={product.status === 'active' ? 'default' : 'secondary'}
                            className={
                              product.status === 'active'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }
                          >
                            {product.status === 'active' ? 'Активний' : 'Неактивний'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-2">
                            <Link href={`/products/${product.product_id}`} target="_blank">
                              <Button variant="ghost" size="icon">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Link href={`/store-menu/products/edit/${product.id}`}>
                              <Button variant="ghost" size="icon">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive"
                              onClick={() =>
                                setDeleteDialog({
                                  isOpen: true,
                                  productId: product.id,
                                  productName: product.name,
                                })
                              }
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {meta && meta.totalPages > 1 && (
                <div className="flex items-center justify-between border-t p-4">
                  <p className="text-sm text-muted-foreground">
                    Показано {(page - 1) * ITEMS_PER_PAGE + 1} -{' '}
                    {Math.min(page * ITEMS_PER_PAGE, meta.totalItems)} з {meta.totalItems}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => p - 1)}
                      disabled={page === 1}
                    >
                      <ChevronLeft className="mr-2 h-4 w-4" />
                      Назад
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => p + 1)}
                      disabled={page >= meta.totalPages}
                    >
                      Вперед
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="py-12 text-center">
              <Package className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-lg font-medium">Товарів не знайдено</p>
              <p className="text-muted-foreground">
                {hasFilters
                  ? 'Спробуйте змінити фільтри пошуку'
                  : 'Додайте товари до вашого магазину'}
              </p>
              {!hasFilters && (
                <Link href="/store-menu/products/new" className="mt-4 inline-block">
                  <Button variant="pill" size="pill">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Додати товар
                  </Button>
                </Link>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <DeleteProductDialog
        productId={deleteDialog.productId}
        productName={deleteDialog.productName}
        storeId={storeId}
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, productId: '', productName: '' })}
      />
    </div>
  );
}

export default function MyProductsPage() {
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
      <ProductsContent storeId={selectedStoreId} />
    </StoreMenuLayout>
  );
}
