/**
 * Add Product Form Component
 * Handles creating and editing products
 */

'use client';

import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Combobox } from "@/components/ui/combobox";
import { Plus, Edit, BookTemplate, X } from "lucide-react";
import { ImageUploader } from "@/components/ImageUploader";
import { getCategoryTranslation } from "@/utils/translations";

interface AddProductFormProps {
  // Form data
  editingProductId: string | null;
  productName: string;
  productCategory: string;
  productColor: string;
  productGender: string;
  productBrandId: string;
  productDescription: string;
  productImageUrl: string;
  productImages: string[];
  primaryImageIndex: number;
  publishAt: string;
  unpublishAt: string;
  productStatus: "draft" | "published";
  
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
  savedTemplates: Array<{id: string; name: string; data: Record<string, unknown>}>;
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
  onProductImageUrlChange: (value: string) => void;
  onProductImagesChange: (images: string[]) => void;
  onPrimaryImageIndexChange: (index: number) => void;
  onPublishAtChange: (value: string) => void;
  onUnpublishAtChange: (value: string) => void;
  onProductStatusChange: (status: "draft" | "published") => void;
  
  // Store handlers
  onCurrentStoreChange: (value: string) => void;
  onCurrentStorePriceChange: (value: string) => void;
  onCurrentSizeInputChange: (value: string) => void;
  onAddSize: () => void;
  onRemoveSize: (index: number) => void;
  onAddStore: () => void;
  onRemoveStore: (index: number) => void;
  
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
  productImageUrl: _productImageUrl,
  productImages,
  primaryImageIndex,
  publishAt,
  unpublishAt,
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
  onProductImageUrlChange,
  onProductImagesChange,
  onPrimaryImageIndexChange,
  onPublishAtChange,
  onUnpublishAtChange,
  onProductStatusChange,
  
  // Store handlers
  onCurrentStoreChange,
  onCurrentStorePriceChange,
  onCurrentSizeInputChange,
  onAddSize,
  onRemoveSize,
  onAddStore,
  onRemoveStore,
  
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
  const isUpdating = !!editingProductId;
  let submitText: string;
  if (submitting) {
    submitText = t('admin.submitting');
  } else {
    submitText = isUpdating ? t('admin.updateProduct') : t('admin.createProduct');
  }
  const productSubmitText = submitText;

  // Завантаження категорій з backend
  const [backendCategories, setBackendCategories] = useState<Array<{ id?: string; slug?: string; name: string }>>([]);
  
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
    label: cat.name
  }));

  const COLORS = [
    { value: "red", label: t('colors.red') },
    { value: "blue", label: t('colors.blue') },
    { value: "green", label: t('colors.green') },
    { value: "yellow", label: t('colors.yellow') },
    { value: "black", label: t('colors.black') },
    { value: "white", label: t('colors.white') },
    { value: "gray", label: t('colors.gray') },
    { value: "brown", label: t('colors.brown') },
    { value: "pink", label: t('colors.pink') },
    { value: "purple", label: t('colors.purple') },
    { value: "orange", label: t('colors.orange') },
    { value: "navy", label: t('colors.navy') },
    { value: "beige", label: t('colors.beige') },
    { value: "multicolor", label: t('colors.multicolor') },
  ];

  // Стандартні значення gender з backend (men, women, unisex)
  const GENDERS = [
    { value: "unisex", label: t('genders.unisex') },
    { value: "men", label: t('genders.men') },
    { value: "women", label: t('genders.women') },
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
          {editingProductId ? <Edit className="w-4 h-4 md:w-6 md:h-6" /> : <Plus className="w-4 h-4 md:w-6 md:h-6" />}
          {editingProductId ? t('admin.editProduct') : t('admin.addNewProduct')}
        </h2>
        
        {editingProductId && (
          <Button
            type="button"
            onClick={() => {/* Handle cancel edit */}}
            variant="outline"
            size="sm"
            className="text-xs"
          >
            <X className="w-4 h-4 mr-2" />
            Cancel Edit
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
                onChange={(e) => onProductNameChange(e.target.value)}
                placeholder={t('admin.productNamePlaceholder')}
                required
                className="h-12 bg-card/50 border-border/50 rounded-lg"
              />
            </div>

            {/* Category */}
            <div className="space-y-2 overflow-visible">
              <Label>Category</Label>
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
              <Label>Brand</Label>
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
              <Label>Color</Label>
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
              <Label>Gender</Label>
              <Combobox
                value={productGender}
                onValueChange={onProductGenderChange}
                items={GENDERS}
                placeholder={t('admin.selectGender')}
                className="bg-card/50 border-border/50"
              />
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4 md:space-y-6">
            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="productDescription">{t('admin.description')}</Label>
              <Textarea
                id="productDescription"
                value={productDescription}
                onChange={(e) => onProductDescriptionChange(e.target.value)}
                placeholder={t('admin.descriptionPlaceholder')}
                className="min-h-[120px] bg-card/50 border-border/50 rounded-lg resize-none"
              />
              
              {/* Auto-translate checkbox */}
              <div className="flex items-center space-x-2 pt-2">
                <Checkbox
                  id="autoTranslateDescription"
                  checked={autoTranslateDescription}
                  onCheckedChange={(checked) => onAutoTranslateDescriptionChange?.(!!checked)}
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
              <Label>Images</Label>
              
              {/* Image Uploader */}
              <ImageUploader
                onImageUpload={(url: string) => {
                  if (productImages.length === 0) {
                    onProductImageUrlChange(url);
                  }
                  onProductImagesChange([...productImages, url]);
                }}
              />

              {/* Image Gallery */}
              {productImages.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {productImages.map((image, index) => (
                    <div key={`product-image-${index}-${image.slice(-10)}`} className="relative group">
                      <button
                        type="button"
                        className={`w-full h-20 object-cover rounded-lg border-2 cursor-pointer transition-all bg-cover bg-center ${
                          index === primaryImageIndex 
                            ? 'border-primary ring-2 ring-primary/20' 
                            : 'border-border/50 hover:border-border'
                        }`}
                        style={{ backgroundImage: `url(${image})` }}
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
                          Primary
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Publishing Schedule */}
            <div className="space-y-4 p-4 rounded-lg border border-border/50 bg-card/20">
              <Label className="text-sm font-medium">{t('admin.publishingOptions')}</Label>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={productStatus === "published"}
                    onCheckedChange={(checked) => onProductStatusChange(checked ? "published" : "draft")}
                  />
                  <Label className="text-sm">Publish immediately</Label>
                </div>
                
                {productStatus === "draft" && (
                  <div className="space-y-2">
                    <Label htmlFor="publishAt" className="text-xs">Schedule publish time</Label>
                    <Input
                      id="publishAt"
                      type="datetime-local"
                      value={publishAt}
                      onChange={(e) => onPublishAtChange(e.target.value)}
                      className="h-9 bg-card/50 border-border/50 text-xs"
                    />
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="unpublishAt" className="text-xs">Auto-unpublish time (optional)</Label>
                  <Input
                    id="unpublishAt"
                    type="datetime-local"
                    value={unpublishAt}
                    onChange={(e) => onUnpublishAtChange(e.target.value)}
                    className="h-9 bg-card/50 border-border/50 text-xs"
                  />
                </div>
              </div>
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
                onChange={(e) => onCurrentStorePriceChange(e.target.value)}
                placeholder={t('admin.pricePlaceholder')}
                className="h-10 bg-card/50 border-border/50"
              />
            </div>
            
            <div>
              <Label className="text-sm">{t('admin.addSize')}</Label>
              <div className="flex gap-2">
                <Input
                  value={currentSizeInput}
                  onChange={(e) => onCurrentSizeInputChange(e.target.value)}
                  placeholder={t('admin.sizePlaceholder')}
                  className="h-10 bg-card/50 border-border/50"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
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
                Add Store
              </Button>
            </div>
          </div>

          {/* Current Sizes */}
          {currentStoreSizes.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {currentStoreSizes.map((size, index) => (
                <div key={`store-size-${index}-${size}`} className="flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full">
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
              <h4 className="font-medium">Selected Stores:</h4>
              <div className="space-y-2">
                {selectedStores.map((store, index) => (
                  <div key={`selected-store-${index}-${store.store_name}`} className="flex items-center justify-between p-3 rounded-lg bg-card/40 border border-border/30">
                    <div className="flex-1">
                      <p className="font-medium">{store.store_name}</p>
                      <p className="text-sm text-muted-foreground">
                        ${store.price} • {store.sizes.length > 0 ? store.sizes.join(", ") : t('admin.noSizes')}
                      </p>
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
          <div className={`w-3 h-3 rounded-full ${productStatus === "published" ? "bg-green-500" : "bg-yellow-500"}`} />
          <span className="text-sm">
            Status: <span className="font-medium capitalize">{productStatus}</span>
          </span>
          {publishAt && productStatus === "draft" && (
            <p className="text-xs text-muted-foreground">
              🕒 Will publish on {new Date(publishAt).toLocaleString()}
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
              onClick={() => onSaveAsTemplate?.('Product Template')}
              variant="outline"
              className="h-12 px-6"
              disabled={!productCategory && !productBrandId}
            >
              <BookTemplate className="w-4 h-4 mr-2" />
              Save as Template
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
              {showTemplates ? t('admin.hide') : t('admin.show')} {t('admin.templates')} ({savedTemplates.length})
            </Button>
            
            {showTemplates && (
              <div className="mt-3 space-y-2">
                {savedTemplates.map(template => (
                  <div key={template.id} className="flex items-center gap-2 p-3 rounded-lg bg-card/50 border border-border/50">
                    <button
                      type="button"
                      onClick={() => onLoadTemplate(template)}
                      className="flex-1 text-left hover:text-primary transition-colors"
                    >
                      <span className="font-medium">{template.name}</span>
                      <p className="text-xs text-muted-foreground">
                        {template.data.category && getCategoryTranslation(template.data.category)}
                        {template.data.brand_id && brands.find(b => b.id === template.data.brand_id)?.name && 
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