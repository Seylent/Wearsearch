/**
 * Add Product Form Component
 * Handles creating and editing products
 */

'use client';

import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useClientOnly } from '@/hooks/useClientOnly';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Combobox } from '@/components/ui/combobox';
import { Plus, Edit, BookTemplate, X } from 'lucide-react';
import { ImageUploader } from '@/components/ImageUploader';
import { uploadService } from '@/services/uploadService';
import { getCategoryTranslation } from '@/utils/translations';
import { useCatalogFilters } from '@/hooks/useCatalogFilters';

interface AddProductFormProps {
  // Form data
  editingProductId: string | null;
  productName: string;
  productCategory: string;
  productColor: string;
  productGender: string;
  productBrandId: string;
  productDescription: string;
  productMaterialIds: string[];
  productTechnologyIds: string[];
  productSizeIds: string[];
  productImageUrl: string;
  productImages: string[];
  primaryImageIndex: number;
  publishAt: string;
  unpublishAt: string;
  productStatus: 'draft' | 'published';

  // Store management
  selectedStores: Array<{
    store_id: string;
    store_name: string;
    price: number;
    sizes: string[];
  }>;
  currentStore: string;
  currentStorePrice: string;
  currentStoreSizes: string[];
  currentSizeInput: string;

  // Templates
  savedTemplates: Array<{ id: string; name: string; data: Record<string, unknown> }>;
  showTemplates: boolean;

  // Data
  stores: Array<{ id: string; name: string }>;
  brands: Array<{ id: string; name: string }>;

  // Handlers
  onProductNameChange: (value: string) => void;
  onProductCategoryChange: (value: string) => void;
  onProductColorChange: (value: string) => void;
  onProductGenderChange: (value: string) => void;
  onProductBrandIdChange: (value: string) => void;
  onProductDescriptionChange: (value: string) => void;
  onProductMaterialIdsChange: (value: string[]) => void;
  onProductTechnologyIdsChange: (value: string[]) => void;
  onProductSizeIdsChange: (value: string[]) => void;
  onProductImageUrlChange: (value: string) => void;
  onProductImagesChange: (images: string[]) => void;
  onPrimaryImageIndexChange: (index: number) => void;
  onPublishAtChange: (value: string) => void;
  onUnpublishAtChange: (value: string) => void;
  onProductStatusChange: (status: 'draft' | 'published') => void;

  // Store handlers
  onCurrentStoreChange: (value: string) => void;
  onCurrentStorePriceChange: (value: string) => void;
  onCurrentSizeInputChange: (value: string) => void;
  onAddSize: () => void;
  onRemoveSize: (index: number) => void;
  onAddStore: () => void;
  onRemoveStore: (index: number) => void;
  onUpdateStorePrice: (index: number, value: string) => void;
  onAddStoreSize: (index: number, size: string) => void;
  onRemoveStoreSize: (index: number, sizeIndex: number) => void;

  // Auto-translate checkbox
  autoTranslateDescription?: boolean;
  onAutoTranslateDescriptionChange?: (checked: boolean) => void;
  onDeleteTemplate: (id: string) => void;
  onToggleTemplates: () => void;

  // Template handlers
  onSaveAsTemplate?: (templateName: string) => void;
  onLoadTemplate?: (templateData: Record<string, unknown>) => void;

  // Submit
  onSubmit: (e: React.FormEvent) => void;
  submitting: boolean;
}

export const AddProductForm: React.FC<AddProductFormProps> = ({
  // Form data
  editingProductId,
  productName,
  productCategory,
  productColor,
  productGender,
  productBrandId,
  productDescription,
  productMaterialIds,
  productTechnologyIds,
  productSizeIds,
  productImages,
  primaryImageIndex,
  publishAt,
  productStatus,

  // Store data
  selectedStores,
  currentStore,
  currentStorePrice,
  currentStoreSizes,
  currentSizeInput,

  // Templates
  savedTemplates,
  showTemplates,

  // Data
  stores,
  brands,

  // Auto-translate
  autoTranslateDescription = false,

  // Handlers
  onProductNameChange,
  onProductCategoryChange,
  onProductColorChange,
  onProductGenderChange,
  onProductBrandIdChange,
  onProductDescriptionChange,
  onProductMaterialIdsChange,
  onProductTechnologyIdsChange,
  onProductSizeIdsChange,
  onProductImageUrlChange,
  onProductImagesChange,
  onPrimaryImageIndexChange,

  // Store handlers
  onCurrentStoreChange,
  onCurrentStorePriceChange,
  onCurrentSizeInputChange,
  onAddSize,
  onRemoveSize,
  onAddStore,
  onRemoveStore,
  onUpdateStorePrice,
  onAddStoreSize,
  onRemoveStoreSize,

  // Template handlers
  onSaveAsTemplate,
  onLoadTemplate,
  onDeleteTemplate,
  onToggleTemplates,

  // Auto-translate handler
  onAutoTranslateDescriptionChange,

  // Submit
  onSubmit,
  submitting,
}) => {
  const { t } = useTranslation();
  const isMounted = useClientOnly();
  const [resolvedImages, setResolvedImages] = useState<string[]>([]);
  const [storeSizeInputs, setStoreSizeInputs] = useState<Record<string, string>>({});
  const { data: catalogFilters } = useCatalogFilters();
  const isUpdating = !!editingProductId;
  let submitText: string;
  if (submitting) {
    submitText = t('admin.submitting');
  } else {
    submitText = isUpdating ? t('admin.updateProduct') : t('admin.createProduct');
  }
  const productSubmitText = submitText;

  const isDirectUrl = (value: string) =>
    value.startsWith('http://') ||
    value.startsWith('https://') ||
    value.startsWith('/') ||
    value.startsWith('data:') ||
    value.startsWith('blob:');

  useEffect(() => {
    let isActive = true;

    const resolveImages = async () => {
      if (productImages.length === 0) {
        if (isActive) setResolvedImages([]);
        return;
      }

      const resolved = await Promise.all(
        productImages.map(async image => {
          if (!image) return '';
          if (isDirectUrl(image)) return image;
          try {
            const result = await uploadService.getImageUrl(image);
            return result.url;
          } catch {
            return '';
          }
        })
      );

      if (isActive) setResolvedImages(resolved);
    };

    resolveImages();

    return () => {
      isActive = false;
    };
  }, [productImages]);

  const handleStoreSizeInputChange = (storeId: string, value: string) => {
    setStoreSizeInputs(prev => ({ ...prev, [storeId]: value }));
  };

  const handleAddStoreSize = (index: number, storeId: string) => {
    const value = (storeSizeInputs[storeId] || '').trim();
    if (!value) return;
    onAddStoreSize(index, value);
    setStoreSizeInputs(prev => ({ ...prev, [storeId]: '' }));
  };

  const toggleSelection = (current: string[], id: string, onChange: (value: string[]) => void) => {
    const normalized = id.trim();
    if (!normalized) return;
    onChange(
      current.includes(normalized)
        ? current.filter(item => item !== normalized)
        : [...current, normalized]
    );
  };

  // Завантаження категорій з backend
  const [backendCategories, setBackendCategories] = useState<
    Array<{ id?: string; slug?: string; name: string }>
  >([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories?lang=uk');
        const data = await response.json();
        // Backend повертає {success: true, categories: [...]}
        if (data.success && Array.isArray(data.categories)) {
          setBackendCategories(data.categories);
        }
      } catch (error) {
        console.error('Failed to load categories:', error);
      }
    };
    fetchCategories();
  }, []);

  const CATEGORIES = backendCategories.map(cat => ({
    value: cat.slug || cat.id || cat.name.toLowerCase(),
    label: cat.name,
  }));

  const materials = catalogFilters?.materials ?? [];
  const technologies = catalogFilters?.technologies ?? [];
  const sizes = catalogFilters?.sizes ?? [];

  const COLORS = [
    { value: 'red', label: t('colors.red') },
    { value: 'blue', label: t('colors.blue') },
    { value: 'green', label: t('colors.green') },
    { value: 'yellow', label: t('colors.yellow') },
    { value: 'black', label: t('colors.black') },
    { value: 'white', label: t('colors.white') },
    { value: 'gray', label: t('colors.gray') },
    { value: 'brown', label: t('colors.brown') },
    { value: 'pink', label: t('colors.pink') },
    { value: 'purple', label: t('colors.purple') },
    { value: 'orange', label: t('colors.orange') },
    { value: 'navy', label: t('colors.navy') },
    { value: 'beige', label: t('colors.beige') },
    { value: 'multicolor', label: t('colors.multicolor') },
  ];

  // Стандартні значення gender з backend (men, women, unisex)
  const GENDERS = [
    { value: 'unisex', label: t('genders.unisex') },
    { value: 'men', label: t('genders.men') },
    { value: 'women', label: t('genders.women') },
  ];

  const storeOptions = (stores || []).map(store => ({
    value: store.id,
    label: store.name,
  }));

  const brandOptions = (brands || []).map(brand => ({
    value: brand.id,
    label: brand.name,
  }));

  return (
    <div className="p-4 md:p-8 rounded-xl md:rounded-2xl border border-border/50 bg-card/40 backdrop-blur-sm overflow-visible">
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-display text-lg md:text-2xl font-bold flex items-center gap-2">
          {editingProductId ? (
            <Edit className="w-4 h-4 md:w-6 md:h-6" />
          ) : (
            <Plus className="w-4 h-4 md:w-6 md:h-6" />
          )}
          {editingProductId ? t('admin.editProduct') : t('admin.addNewProduct')}
        </h2>

        {editingProductId && (
          <Button
            type="button"
            onClick={() => {
              /* Handle cancel edit */
            }}
            variant="outline"
            size="sm"
            className="text-xs"
          >
            <X className="w-4 h-4 mr-2" />
            {t('admin.cancelEdit')}
          </Button>
        )}
      </div>

      <p className="text-sm text-muted-foreground mb-6 md:mb-8">
        {editingProductId ? t('admin.updateProductDesc') : t('admin.addProductDesc')}
      </p>

      <form onSubmit={onSubmit} className="space-y-6 md:space-y-8 overflow-visible">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 overflow-visible">
          {/* Left Column */}
          <div className="space-y-4 md:space-y-6 overflow-visible">
            {/* Product Name */}
            <div className="space-y-2">
              <Label htmlFor="productName">{t('admin.productName')}</Label>
              <Input
                id="productName"
                value={productName}
                onChange={e => onProductNameChange(e.target.value)}
                placeholder={t('admin.productNamePlaceholder')}
                required
                className="h-12 bg-card/50 border-border/50 rounded-lg"
              />
            </div>

            {/* Category */}
            <div className="space-y-2 overflow-visible">
              <Label>{t('admin.category')}</Label>
              <Combobox
                value={productCategory}
                onValueChange={onProductCategoryChange}
                items={CATEGORIES}
                placeholder={t('admin.selectCategory')}
                className="bg-card/50 border-border/50"
              />
            </div>

            {/* Brand */}
            <div className="space-y-2 overflow-visible">
              <Label>{t('admin.brand')}</Label>
              <Combobox
                value={productBrandId}
                onValueChange={onProductBrandIdChange}
                items={brandOptions}
                placeholder={t('admin.selectBrand')}
                className="bg-card/50 border-border/50"
              />
            </div>

            {/* Color */}
            <div className="space-y-2 overflow-visible">
              <Label>{t('admin.color')}</Label>
              <Combobox
                value={productColor}
                onValueChange={onProductColorChange}
                items={COLORS}
                placeholder={t('admin.selectColor')}
                className="bg-card/50 border-border/50"
              />
            </div>

            {/* Gender */}
            <div className="space-y-2 overflow-visible">
              <Label>{t('admin.gender')}</Label>
              <Combobox
                value={productGender}
                onValueChange={onProductGenderChange}
                items={GENDERS}
                placeholder={t('admin.selectGender')}
                className="bg-card/50 border-border/50"
              />
            </div>

            {!!materials.length && (
              <div className="space-y-2">
                <Label>{t('products.materials', 'Materials')}</Label>
                <div className="max-h-32 overflow-y-auto space-y-2 rounded-lg border border-border/40 bg-card/30 p-3">
                  {materials.map(material => {
                    const materialId = material.id || material.slug || material.name;
                    const materialSelected =
                      productMaterialIds.includes(materialId) ||
                      (material.id ? productMaterialIds.includes(material.id) : false) ||
                      (material.slug ? productMaterialIds.includes(material.slug) : false);
                    return (
                      <div key={materialId} className="flex items-center gap-2">
                        <Checkbox
                          id={`material-${materialId}`}
                          checked={materialSelected}
                          onCheckedChange={() =>
                            toggleSelection(
                              productMaterialIds,
                              materialId,
                              onProductMaterialIdsChange
                            )
                          }
                        />
                        <Label htmlFor={`material-${materialId}`} className="text-sm font-normal">
                          {material.name}
                        </Label>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {!!technologies.length && (
              <div className="space-y-2">
                <Label>{t('products.technologies', 'Technologies')}</Label>
                <div className="max-h-32 overflow-y-auto space-y-2 rounded-lg border border-border/40 bg-card/30 p-3">
                  {technologies.map(technology => {
                    const technologyId = technology.id || technology.slug || technology.name;
                    const technologySelected =
                      productTechnologyIds.includes(technologyId) ||
                      (technology.id ? productTechnologyIds.includes(technology.id) : false) ||
                      (technology.slug ? productTechnologyIds.includes(technology.slug) : false);
                    return (
                      <div key={technologyId} className="flex items-center gap-2">
                        <Checkbox
                          id={`technology-${technologyId}`}
                          checked={technologySelected}
                          onCheckedChange={() =>
                            toggleSelection(
                              productTechnologyIds,
                              technologyId,
                              onProductTechnologyIdsChange
                            )
                          }
                        />
                        <Label
                          htmlFor={`technology-${technologyId}`}
                          className="text-sm font-normal"
                        >
                          {technology.name}
                        </Label>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {!!sizes.length && (
              <div className="space-y-2">
                <Label>{t('products.sizes', 'Sizes')}</Label>
                <div className="max-h-32 overflow-y-auto space-y-2 rounded-lg border border-border/40 bg-card/30 p-3">
                  {sizes.map(size => {
                    const sizeId = size.id || size.slug || size.label;
                    const sizeSelected =
                      productSizeIds.includes(sizeId) ||
                      (size.id ? productSizeIds.includes(size.id) : false) ||
                      (size.slug ? productSizeIds.includes(size.slug) : false);
                    return (
                      <div key={sizeId} className="flex items-center gap-2">
                        <Checkbox
                          id={`size-${sizeId}`}
                          checked={sizeSelected}
                          onCheckedChange={() =>
                            toggleSelection(productSizeIds, sizeId, onProductSizeIdsChange)
                          }
                        />
                        <Label htmlFor={`size-${sizeId}`} className="text-sm font-normal">
                          {size.label}
                        </Label>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-4 md:space-y-6">
            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="productDescription">{t('admin.description')}</Label>
              <Textarea
                id="productDescription"
                value={productDescription}
                onChange={e => onProductDescriptionChange(e.target.value)}
                placeholder={t('admin.descriptionPlaceholder')}
                className="min-h-[120px] bg-card/50 border-border/50 rounded-lg resize-none"
              />

              {/* Auto-translate checkbox */}
              <div className="flex items-center space-x-2 pt-2">
                <Checkbox
                  id="autoTranslateDescription"
                  checked={autoTranslateDescription}
                  onCheckedChange={checked => onAutoTranslateDescriptionChange?.(!!checked)}
                />
                <Label
                  htmlFor="autoTranslateDescription"
                  className="text-sm font-normal cursor-pointer"
                >
                  {t('translation.autoTranslate')}
                </Label>
              </div>
              {/* Translation info */}
              {autoTranslateDescription && (
                <div className="text-xs text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400 p-2 rounded border">
                  ℹ️ {t('translation.willTranslate')}
                </div>
              )}
            </div>

            {/* Image Management */}
            <div className="space-y-4">
              <Label>{t('admin.images')}</Label>

              {/* Image Uploader */}
              <ImageUploader
                onImageUpload={image => {
                  if (productImages.length === 0) {
                    onProductImageUrlChange(image.key);
                  }
                  onProductImagesChange([...productImages, image.key]);
                }}
              />

              {/* Image Gallery */}
              {productImages.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {productImages.map((image, index) => (
                    <div
                      key={`product-image-${index}-${image.slice(-10)}`}
                      className="relative group"
                    >
                      <button
                        type="button"
                        className={`w-full h-20 object-cover rounded-lg border-2 cursor-pointer transition-all bg-cover bg-center ${
                          index === primaryImageIndex
                            ? 'border-primary ring-2 ring-primary/20'
                            : 'border-border/50 hover:border-border'
                        }`}
                        style={{ backgroundImage: `url(${resolvedImages[index] || ''})` }}
                        onClick={() => onPrimaryImageIndexChange(index)}
                        aria-label={`Select image ${index + 1} as primary`}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newImages = productImages.filter((_, i) => i !== index);
                          onProductImagesChange(newImages);
                          if (index === primaryImageIndex && newImages.length > 0) {
                            onPrimaryImageIndexChange(0);
                            onProductImageUrlChange(newImages[0]);
                          } else if (newImages.length === 0) {
                            onProductImageUrlChange('');
                          }
                        }}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                      >
                        <X className="w-3 h-3" />
                      </button>
                      {index === primaryImageIndex && (
                        <div className="absolute bottom-1 left-1 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded">
                          {t('admin.primary')}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Store Management Section */}
        <div className="space-y-6 p-6 rounded-xl border border-border/30 bg-card/20">
          <h3 className="font-semibold text-lg">{t('admin.storeAssignments')}</h3>

          {/* Add Store Form */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 rounded-lg bg-card/30 border border-border/40">
            <div className="overflow-visible">
              <Label className="text-sm">{t('admin.store')}</Label>
              <Combobox
                value={currentStore}
                onValueChange={onCurrentStoreChange}
                items={storeOptions}
                placeholder={t('admin.selectStore')}
                className="bg-card/50 border-border/50"
              />
            </div>

            <div>
              <Label className="text-sm">{t('admin.price')}</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={currentStorePrice}
                onChange={e => onCurrentStorePriceChange(e.target.value)}
                placeholder={t('admin.pricePlaceholder')}
                className="h-10 bg-card/50 border-border/50"
              />
            </div>

            <div>
              <Label className="text-sm">{t('admin.addSize')}</Label>
              <div className="flex gap-2">
                <Input
                  value={currentSizeInput}
                  onChange={e => onCurrentSizeInputChange(e.target.value)}
                  placeholder={t('admin.sizePlaceholder')}
                  className="h-10 bg-card/50 border-border/50"
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      onAddSize();
                    }
                  }}
                />
                <Button
                  type="button"
                  onClick={onAddSize}
                  variant="outline"
                  size="sm"
                  className="h-10 px-3"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="flex items-end">
              <Button
                type="button"
                onClick={onAddStore}
                disabled={!currentStore || !currentStorePrice}
                className="w-full h-10"
              >
                {t('admin.addStore')}
              </Button>
            </div>
          </div>

          {/* Current Sizes */}
          {currentStoreSizes.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {currentStoreSizes.map((size, index) => (
                <div
                  key={`store-size-${index}-${size}`}
                  className="flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full"
                >
                  <span className="text-sm">{size}</span>
                  <button
                    type="button"
                    onClick={() => onRemoveSize(index)}
                    className="hover:text-destructive"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Selected Stores List */}
          {selectedStores.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium">{t('admin.selectedStores')}</h4>
              <div className="space-y-2">
                {selectedStores.map((store, index) => (
                  <div
                    key={`selected-store-${index}-${store.store_name}`}
                    className="flex items-center justify-between p-3 rounded-lg bg-card/40 border border-border/30"
                  >
                    <div className="flex-1 space-y-2">
                      <p className="font-medium">{store.store_name}</p>

                      <div className="flex flex-wrap gap-2 items-center">
                        <Label className="text-xs text-muted-foreground">{t('admin.price')}</Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={String(store.price ?? '')}
                          onChange={e => onUpdateStorePrice(index, e.target.value)}
                          className="h-8 w-32 bg-card/50 border-border/50 text-xs"
                        />
                      </div>

                      <div className="flex flex-wrap gap-2 items-center">
                        <Label className="text-xs text-muted-foreground">
                          {t('admin.addSize')}
                        </Label>
                        <Input
                          value={storeSizeInputs[store.store_id] || ''}
                          onChange={e => handleStoreSizeInputChange(store.store_id, e.target.value)}
                          placeholder={t('admin.sizePlaceholder')}
                          className="h-8 w-32 bg-card/50 border-border/50 text-xs"
                          onKeyDown={e => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddStoreSize(index, store.store_id);
                            }
                          }}
                        />
                        <Button
                          type="button"
                          onClick={() => handleAddStoreSize(index, store.store_id)}
                          variant="outline"
                          size="sm"
                          className="h-8 px-2"
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {store.sizes.length > 0 ? (
                          store.sizes.map((size, sizeIndex) => (
                            <div
                              key={`${store.store_id}-size-${sizeIndex}`}
                              className="flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-full"
                            >
                              <span className="text-xs">{size}</span>
                              <button
                                type="button"
                                onClick={() => onRemoveStoreSize(index, sizeIndex)}
                                className="hover:text-destructive"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            {t('admin.noSizes')}
                          </span>
                        )}
                      </div>
                    </div>
                    <Button
                      type="button"
                      onClick={() => onRemoveStore(index)}
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Status Display */}
        <div className="flex items-center gap-4 p-4 rounded-lg bg-card/30 border border-border/40">
          <div
            className={`w-3 h-3 rounded-full ${productStatus === 'published' ? 'bg-green-500' : 'bg-yellow-500'}`}
          />
          <span className="text-sm">
            {t('admin.status')}: <span className="font-medium capitalize">{productStatus}</span>
          </span>
          {publishAt && productStatus === 'draft' && (
            <p className="text-xs text-muted-foreground">
              🕒 {t('admin.willPublishOn')} {isMounted ? new Date(publishAt).toLocaleString() : '-'}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            type="submit"
            disabled={submitting}
            className="flex-1 h-12 bg-foreground text-background hover:bg-foreground/90 hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] rounded-lg font-medium transition-all"
          >
            {productSubmitText}
          </Button>

          {!editingProductId && onSaveAsTemplate && (
            <Button
              type="button"
              onClick={() => onSaveAsTemplate?.(t('admin.productTemplate'))}
              variant="outline"
              className="h-12 px-6"
              disabled={!productCategory && !productBrandId}
            >
              <BookTemplate className="w-4 h-4 mr-2" />
              {t('admin.saveAsTemplate')}
            </Button>
          )}
        </div>

        {/* Templates Section */}
        {savedTemplates.length > 0 && (
          <div className="pt-4 border-t border-border/50">
            <Button
              type="button"
              onClick={onToggleTemplates}
              variant="ghost"
              size="sm"
              className="w-full"
            >
              <BookTemplate className="w-4 h-4 mr-2" />
              {showTemplates ? t('admin.hide') : t('admin.show')} {t('admin.templates')} (
              {savedTemplates.length})
            </Button>

            {showTemplates && (
              <div className="mt-3 space-y-2">
                {savedTemplates.map(template => (
                  <div
                    key={template.id}
                    className="flex items-center gap-2 p-3 rounded-lg bg-card/50 border border-border/50"
                  >
                    <button
                      type="button"
                      onClick={() => onLoadTemplate(template)}
                      className="flex-1 text-left hover:text-primary transition-colors"
                    >
                      <span className="font-medium">{template.name}</span>
                      <p className="text-xs text-muted-foreground">
                        {typeof template.data.category === 'string' &&
                          getCategoryTranslation(template.data.category)}
                        {template.data.brand_id &&
                          brands.find(b => b.id === template.data.brand_id)?.name &&
                          ` • ${brands.find(b => b.id === template.data.brand_id)?.name}`}
                      </p>
                    </button>
                    <Button
                      type="button"
                      onClick={() => onDeleteTemplate(template.id)}
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </form>
    </div>
  );
};
