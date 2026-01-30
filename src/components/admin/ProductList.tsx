/**
 * Product Management Component
 * Lists and manages existing products with search, filter, and bulk operations
 */

'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useTranslation } from 'react-i18next';
import { Package, Edit, Trash2, Search, LayoutGrid, Table as TableIcon } from 'lucide-react';
import { getCategoryTranslation, getColorTranslation } from '@/utils/translations';

type NormalizedProduct = {
  id: string;
  name: string;
  brand: string;
  category: string;
  color: string;
  price: number;
  image: string;
  raw: Record<string, unknown>;
};

const getString = (value: unknown, fallback = ''): string =>
  typeof value === 'string' ? value : fallback;

const getNumber = (value: unknown, fallback = 0): number =>
  typeof value === 'number' ? value : Number(value) || fallback;

const normalizeProduct = (product: Record<string, unknown>): NormalizedProduct => {
  const id = String(product.id ?? product.product_id ?? product.uuid ?? '');
  const name = getString(product.name ?? product.title ?? product.product_name, 'Untitled');
  const brand = getString(product.brand ?? product.brand_name, '');
  const category = getString(product.category ?? product.type, '');
  const color = getString(product.color, '');
  const price = getNumber(product.price ?? product.product_price, 0);
  const image = getString(product.image ?? product.image_url ?? product.thumbnail, '');

  return {
    id,
    name,
    brand,
    category,
    color,
    price,
    image,
    raw: product,
  };
};

interface ProductListProps {
  // Data
  products: Array<Record<string, unknown>>;

  // Search and filters
  searchProducts: string;
  onSearchProductsChange: (value: string) => void;

  // View options
  viewMode: 'grid' | 'table';
  onViewModeChange: (mode: 'grid' | 'table') => void;

  // Selection
  isSelectMode: boolean;
  selectedProductIds: Set<string>;
  onToggleSelectMode: () => void;
  onToggleProductSelection: (productId: string) => void;
  onSelectAllProducts: () => void;

  // Actions
  onEditProduct: (product: Record<string, unknown>) => void;
  onDeleteProduct: (product: Record<string, unknown>) => void;
  onBulkDelete: () => void;

  // Export/Import
  onExportToCSV: () => void;
  onExportToJSON: () => void;
  onDownloadTemplate: () => void;
  loadingExport: boolean;
}

export const ProductList: React.FC<ProductListProps> = ({
  products,
  searchProducts,
  onSearchProductsChange,
  viewMode,
  onViewModeChange,
  isSelectMode,
  selectedProductIds,
  onToggleSelectMode,
  onToggleProductSelection,
  onSelectAllProducts,
  onEditProduct,
  onDeleteProduct,
  onBulkDelete,
  onExportToCSV,
  onExportToJSON,
  onDownloadTemplate,
  loadingExport,
}) => {
  const { t } = useTranslation();

  const normalizedProducts = products.map(normalizeProduct);
  const searchLower = searchProducts.toLowerCase();
  const filteredProducts = normalizedProducts.filter(
    product =>
      product.name.toLowerCase().includes(searchLower) ||
      product.brand.toLowerCase().includes(searchLower) ||
      product.category.toLowerCase().includes(searchLower)
  );

  return (
    <div className="p-8 rounded-2xl border border-border/50 bg-card/40 backdrop-blur-sm overflow-visible">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-2xl font-bold flex items-center gap-3">
            <Package className="w-6 h-6" />
            {t('admin.manageProducts', { count: filteredProducts.length })}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">{t('admin.manageProductsSubtitle')}</p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={onToggleSelectMode}
            variant={isSelectMode ? 'default' : 'outline'}
            size="sm"
            className="border-border/50"
          >
            {isSelectMode ? t('admin.exitSelect') : t('admin.selectMode')}
          </Button>

          <div className="flex items-center border border-border/50 rounded-lg">
            <Button
              onClick={() => onViewModeChange('grid')}
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              className="rounded-r-none border-r border-border/50"
            >
              <LayoutGrid className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => onViewModeChange('table')}
              variant={viewMode === 'table' ? 'default' : 'ghost'}
              size="sm"
              className="rounded-l-none"
            >
              <TableIcon className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {isSelectMode && selectedProductIds.size > 0 && (
        <div className="mb-4 p-4 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-between">
          <span className="text-sm font-medium">
            {t('admin.selectedCount', { count: selectedProductIds.size })}
          </span>
          <Button
            onClick={onBulkDelete}
            variant="destructive"
            size="sm"
            className="bg-destructive/80"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            {t('admin.deleteSelected')}
          </Button>
        </div>
      )}

      {/* Search and Filters */}
      {!isSelectMode && (
        <div className="mb-6 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={searchProducts}
                onChange={e => onSearchProductsChange(e.target.value)}
                placeholder={t('admin.searchProducts', 'Search products, brands, categories...')}
                className="pl-10 bg-card/50 border-border/50"
              />
            </div>
          </div>
        </div>
      )}

      {/* Products Grid/Table */}
      <div className="overflow-visible">
        {(() => {
          if (filteredProducts.length === 0) {
            return (
              <div className="text-center py-12 text-muted-foreground">
                <p>{t('products.noResults', 'No products found')}</p>
              </div>
            );
          }

          return viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-visible">
              {filteredProducts.map(product => (
                <div
                  key={product.id || product.name}
                  className="group p-4 rounded-xl border border-border/30 bg-card/30 backdrop-blur-sm hover:bg-card/50 transition-colors overflow-visible"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {isSelectMode && (
                        <Checkbox
                          checked={selectedProductIds.has(product.id)}
                          onCheckedChange={() => onToggleProductSelection(product.id)}
                        />
                      )}

                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-6 h-6 text-muted-foreground" />
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-sm truncate">{product.name}</h3>
                        <p className="text-xs text-muted-foreground">${product.price}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-3">
                    {product.category && (
                      <span className="px-2 py-0.5 rounded text-xs bg-foreground/10">
                        {getCategoryTranslation(product.category)}
                      </span>
                    )}
                    {product.color && (
                      <span className="px-2 py-0.5 rounded text-xs bg-blue-500/10 text-blue-600">
                        {getColorTranslation(product.color)}
                      </span>
                    )}
                    {product.brand && (
                      <span className="px-2 py-0.5 rounded text-xs bg-foreground/10">
                        {product.brand}
                      </span>
                    )}
                  </div>

                  {!isSelectMode && (
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="outline"
                        size="sm"
                        className="hover:bg-foreground/10 border-border/50 text-xs flex-1"
                        onClick={() => onEditProduct(product.raw)}
                      >
                        <Edit className="w-3 h-3 mr-1" />
                        {t('common.edit')}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="hover:bg-destructive/20 hover:text-destructive border-border/50 text-xs"
                        onClick={() => onDeleteProduct(product.raw)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/30">
                    <th className="text-left p-4">
                      {isSelectMode && (
                        <Checkbox
                          checked={selectedProductIds.size === filteredProducts.length}
                          onCheckedChange={onSelectAllProducts}
                        />
                      )}
                    </th>
                    <th className="text-left p-4 font-medium">{t('admin.tableProduct')}</th>
                    <th className="text-left p-4 font-medium">{t('admin.tableCategory')}</th>
                    <th className="text-left p-4 font-medium">{t('admin.tableBrand')}</th>
                    <th className="text-left p-4 font-medium">{t('admin.tablePrice')}</th>
                    <th className="text-left p-4 font-medium">{t('admin.tableColor')}</th>
                    {!isSelectMode && (
                      <th className="text-left p-4 font-medium">{t('admin.tableActions')}</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map(product => (
                    <tr
                      key={product.id || product.name}
                      className="border-b border-border/20 hover:bg-card/20 transition-colors group"
                    >
                      <td className="p-4">
                        {isSelectMode && (
                          <Checkbox
                            checked={selectedProductIds.has(product.id)}
                            onCheckedChange={() => onToggleProductSelection(product.id)}
                          />
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                            {product.image ? (
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package className="w-5 h-5 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{product.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {t('admin.tableId', { id: product.id })}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-1 rounded-full text-xs bg-foreground/10">
                          {getCategoryTranslation(product.category)}
                        </span>
                      </td>
                      <td className="p-4">{product.brand || '-'}</td>
                      <td className="p-4 font-medium">${product.price}</td>
                      <td className="p-4">
                        {product.color && (
                          <span className="px-2 py-1 rounded-full text-xs bg-blue-500/10 text-blue-600">
                            {getColorTranslation(product.color)}
                          </span>
                        )}
                      </td>
                      {!isSelectMode && (
                        <td className="p-4">
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="outline"
                              size="sm"
                              className="hover:bg-foreground/10 border-border/50"
                              onClick={() => onEditProduct(product.raw)}
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              {t('common.edit')}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="hover:bg-destructive/20 hover:text-destructive border-border/50"
                              onClick={() => onDeleteProduct(product.raw)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        })()}
      </div>
    </div>
  );
};
