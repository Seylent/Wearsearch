'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { NeonAbstractions } from '@/components/NeonAbstractions';
import ProductCard from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Filter, Search, Grid3x3, LayoutGrid, Columns3 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from '@/components/ui/pagination';
import FilterPanel from '@/components/FilterPanel';
import type { Product } from '@/types';
import type { Brand } from '@/services/brandService';
import type { Category } from '@/services/categoryService';

interface ProductsPageContentProps {
  products: Product[];
  totalProducts: number;
  currentPage: number;
  totalPages: number;
  categories: Category[];
  brands: Brand[];
  searchParams: Record<string, string | undefined>;
}

export default function ProductsPageContent({
  products,
  totalProducts: _totalProducts,
  currentPage,
  totalPages,
  categories,
  brands,
  searchParams
}: Readonly<ProductsPageContentProps>) {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useSearchParams();
  const [searchInput, setSearchInput] = useState(searchParams.search || '');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [gridColumns, setGridColumns] = useState<2 | 3 | 4 | 6>(6);

  const { search, category, brand, color, gender, minPrice, maxPrice, sort, store } = searchParams;

  const hasFilters = Boolean(
    search || category || brand || color || gender || minPrice || maxPrice || store
  );

  const _getTitle = () => {
    if (search) return `"${search}"`;
    if (category) return category;
    if (store) return `${store} Products`;
    return t('products.allProducts', 'All Products');
  };

  const handleFilterChange = (filters: Record<string, string | number | undefined>) => {
    const newParams = new URLSearchParams(params.toString());
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        newParams.set(key, String(value));
      } else {
        newParams.delete(key);
      }
    });
    
    newParams.delete('page');
    router.push(`/products?${newParams.toString()}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleFilterChange({ search: searchInput });
  };

  const handleClearFilters = () => {
    router.push('/products');
    setSearchInput('');
  };

  const handlePageChange = (page: number) => {
    const newParams = new URLSearchParams(params.toString());
    newParams.set('page', String(page));
    router.push(`/products?${newParams.toString()}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const currentFilters = {
    category: category || null,
    brand: brand || null,
    color: color || null,
    gender: gender || null,
    minPrice: minPrice ? Number(minPrice) : undefined,
    maxPrice: maxPrice ? Number(maxPrice) : undefined,
    store: store || null,
  };

  const gridClass = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3',
    4: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4',
    6: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'
  }[gridColumns];

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <section className="relative pt-24 pb-12 px-4 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 z-0">
          <NeonAbstractions />
        </div>

        {/* Background Effects */}
        <div className="absolute inset-0 opacity-20 z-[1]">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-white/3 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto text-center relative z-10">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
            {t('products.title', 'Всі товари')}
          </h1>
          <p className="text-base text-white/70 mb-6 max-w-2xl mx-auto">
            {t('products.subtitle', 'Знайдіть найкращий одяг у топових магазинах')}
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto">
            <div className="relative flex items-center">
              <Search className="absolute left-4 w-5 h-5 text-gray-500 z-10" />
              <Input
                type="text"
                placeholder={t('products.searchPlaceholder', 'Шукати товари...')}
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-12 pr-4 h-12 w-full bg-zinc-900 border-zinc-800 text-white placeholder-gray-500 rounded-lg focus:ring-2 focus:ring-zinc-700 focus:border-transparent"
              />
            </div>
          </form>
        </div>
      </section>

      {/* Controls Bar */}
      <div className="sticky top-20 z-30 bg-black/90 backdrop-blur-xl border-y border-white/5">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            {/* Filters Button */}
            <Dialog open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-zinc-800 gap-2 h-9"
                >
                  <Filter className="w-4 h-4" />
                  <span className="hidden sm:inline text-sm">{t('products.filters', 'Фільтри')}</span>
                  {hasFilters && <div className="w-2 h-2 rounded-full bg-white animate-pulse" />}
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-zinc-900 text-white border-zinc-800 max-w-md max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-white">{t('products.filters', 'Фільтри')}</DialogTitle>
                </DialogHeader>
                <FilterPanel
                  categories={categories}
                  brands={brands}
                  currentFilters={currentFilters}
                  onFilterChange={handleFilterChange}
                />
              </DialogContent>
            </Dialog>

            {/* Grid Controls */}
            <div className="flex gap-1 bg-zinc-900 p-1 rounded-lg">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setGridColumns(6)}
                className={`${gridColumns === 6 ? 'bg-white text-black' : 'text-gray-400'} hover:bg-zinc-800 rounded-md h-8 w-8`}
              >
                <Columns3 className="w-3.5 h-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setGridColumns(4)}
                className={`${gridColumns === 4 ? 'bg-white text-black' : 'text-gray-400'} hover:bg-zinc-800 rounded-md h-8 w-8`}
              >
                <Grid3x3 className="w-3.5 h-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setGridColumns(2)}
                className={`${gridColumns === 2 ? 'bg-white text-black' : 'text-gray-400'} hover:bg-zinc-800 rounded-md h-8 w-8`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </Button>
            </div>

            {/* Sort */}
            <Select
              value={sort || 'newest'}
              onValueChange={(value) => handleFilterChange({ sort: value })}
            >
              <SelectTrigger className="w-[160px] h-9 bg-zinc-900 border-zinc-800 text-white text-sm">
                <SelectValue placeholder={t('products.sortBy', 'За замовчуванням')} />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                <SelectItem value="newest">{t('sort.newest', 'Спочатку нові')}</SelectItem>
                <SelectItem value="price-asc">{t('sort.priceAsc', 'Ціна: зростання')}</SelectItem>
                <SelectItem value="price-desc">{t('sort.priceDesc', 'Ціна: спадання')}</SelectItem>
                <SelectItem value="name-asc">{t('sort.nameAsc', 'Назва: А-Я')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 relative z-10">
        {/* Product Count */}
        <div className="mb-6 text-gray-400 text-sm">
          {t('products.priceRange', `Ціни в долл. (курс NEW) [09.01, 10:00]`)}
        </div>

        {/* Products Grid */}
        {products.length > 0 ? (
          <>
            <div className={`grid ${gridClass} gap-3 sm:gap-4`}>
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  image={product.image_url || product.image || ''}
                  price={product.price}
                  brand={product.brand}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-12 flex justify-center sticky bottom-6 z-20">
                <div className="bg-zinc-900/90 backdrop-blur-xl border border-zinc-800 rounded-full px-2 py-1 shadow-2xl">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            if (currentPage > 1) handlePageChange(currentPage - 1);
                          }}
                          className={currentPage > 1 ? 'cursor-pointer text-white' : 'pointer-events-none opacity-50 text-gray-600'}
                        />
                      </PaginationItem>

                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const page = i + 1;
                        return (
                          <PaginationItem key={page}>
                            <PaginationLink
                              href="#"
                              isActive={currentPage === page}
                              onClick={(e) => {
                                e.preventDefault();
                                handlePageChange(page);
                              }}
                              className={currentPage === page ? 'bg-white text-black' : 'text-white hover:bg-zinc-800'}
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      })}

                      {totalPages > 5 && (
                        <>
                          <PaginationItem>
                            <PaginationEllipsis className="text-white" />
                          </PaginationItem>
                          <PaginationItem>
                            <PaginationLink
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                handlePageChange(totalPages);
                              }}
                              className="text-white hover:bg-zinc-800"
                            >
                              {totalPages}
                            </PaginationLink>
                          </PaginationItem>
                        </>
                      )}

                      <PaginationItem>
                        <PaginationNext
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            if (currentPage < totalPages) handlePageChange(currentPage + 1);
                          }}
                          className={currentPage < totalPages ? 'cursor-pointer text-white' : 'pointer-events-none opacity-50 text-gray-600'}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-24">
            <h3 className="text-2xl font-bold text-white mb-2">
              {t('products.noProducts', 'Товари не знайдені')}
            </h3>
            <p className="text-gray-400 mb-8">
              {hasFilters
                ? t('products.tryAdjustingFilters', 'Спробуйте змінити фільтри або пошуковий запит')
                : t('products.checkBackLater', 'Повертайтесь пізніше')}
            </p>
            {hasFilters && (
              <Button
                onClick={handleClearFilters}
                className="bg-white text-black hover:bg-gray-200"
              >
                {t('products.clearAllFilters', 'Очистити всі фільтри')}
              </Button>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
