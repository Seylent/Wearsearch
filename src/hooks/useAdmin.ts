/**
 * Admin Hook - Manages admin panel state and logic
 * Extracted from AdminContent component for better separation of concerns
 */

'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { adminApi } from '@/services/api/admin.api';
import { advancedApi } from '@/services/api/advanced.api';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { api } from '@/services/api';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  if (isRecord(error) && typeof error.message === 'string') return error.message;
  return 'Unknown error';
};

const isUuid = (value: string): boolean =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);

export const useAdmin = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { isAuthenticated, canAccessAdminPanel, isAdmin } = useAuth();

  // Dashboard data
  const [dashboardData, setDashboardData] = useState<{
    products?: { items: unknown[] };
    stores?: { items: unknown[] };
    brands?: { items: unknown[] };
  } | null>(null);
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(true);

  // Active tab
  const [activeTab, setActiveTab] = useState('add-product');

  // Product form state
  const [productName, setProductName] = useState('');
  const [productCategory, setProductCategory] = useState('');
  const [productColor, setProductColor] = useState('');
  const [productGender, setProductGender] = useState('');
  const [productBrandId, setProductBrandId] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [productMaterialIds, setProductMaterialIds] = useState<string[]>([]);
  const [productTechnologyIds, setProductTechnologyIds] = useState<string[]>([]);
  const [productSizeIds, setProductSizeIds] = useState<string[]>([]);
  const [productImageUrl, setProductImageUrl] = useState('');
  const [productImages, setProductImages] = useState<string[]>([]);
  const [primaryImageIndex, setPrimaryImageIndex] = useState<number>(0);

  // Store management
  const [selectedStores, setSelectedStores] = useState<
    Array<{
      store_id: string;
      store_name: string;
      price: number;
      sizes: string[];
    }>
  >([]);
  const [currentStore, setCurrentStore] = useState('');
  const [currentStorePrice, setCurrentStorePrice] = useState('');
  const [currentStoreSizes, setCurrentStoreSizes] = useState<string[]>([]);
  const [currentSizeInput, setCurrentSizeInput] = useState('');

  // Edit state
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Templates
  const [savedTemplates, setSavedTemplates] = useState<
    Array<{
      id: string;
      name: string;
      data: Record<string, unknown>;
    }>
  >([]);
  const [showTemplates, setShowTemplates] = useState(false);

  // Publishing
  const [publishAt, setPublishAt] = useState<string>('');
  const [unpublishAt, setUnpublishAt] = useState<string>('');
  const [productStatus, setProductStatus] = useState<'draft' | 'published'>('published');

  // Translation
  const [autoTranslateDescription, setAutoTranslateDescription] = useState<boolean>(false);

  // Product management
  const [searchProducts, setSearchProducts] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedProductIds, setSelectedProductIds] = useState<Set<string>>(new Set());
  const [loadingExport, setLoadingExport] = useState(false);

  // Analytics
  const [showPriceHistory, setShowPriceHistory] = useState(false);
  const [showActivityLog, setShowActivityLog] = useState(false);
  // Price history and activity log are not yet implemented
  const loadingPriceHistory = false;
  const loadingActivityLog = false;
  const [selectedProductForHistory, setSelectedProductForHistory] = useState<string | null>(null);
  const priceHistory: Record<
    string,
    Array<{
      id: string;
      store_id: string;
      store_name: string;
      price: number;
      changed_at: string;
    }>
  > = {}; // Price history feature pending backend implementation
  const activityLog: Array<{
    id: string;
    action: string;
    entity_type: string;
    entity_id: string;
    user_name: string;
    created_at: string;
    changes?: Record<string, unknown>;
  }> = []; // Activity log placeholder

  // Load dashboard data
  const loadDashboard = useCallback(async () => {
    try {
      setIsLoadingDashboard(true);
      const data = await adminApi.getDashboard({
        productsLimit: 100,
        storesLimit: 100,
        brandsLimit: 100,
      });
      setDashboardData(data);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
      toast({
        variant: 'destructive',
        title: 'Failed to load dashboard',
        description: getErrorMessage(error),
      });
    } finally {
      setIsLoadingDashboard(false);
    }
  }, [toast]);

  const updateStorePrice = useCallback((index: number, value: string) => {
    setSelectedStores(prev =>
      prev.map((store, i) =>
        i === index
          ? { ...store, price: Number.isFinite(Number(value)) ? Number(value) : 0 }
          : store
      )
    );
  }, []);

  const addStoreSize = useCallback((index: number, size: string) => {
    const trimmed = size.trim();
    if (!trimmed) return;
    setSelectedStores(prev =>
      prev.map((store, i) =>
        i === index
          ? {
              ...store,
              sizes: store.sizes.includes(trimmed) ? store.sizes : [...store.sizes, trimmed],
            }
          : store
      )
    );
  }, []);

  const removeStoreSize = useCallback((index: number, sizeIndex: number) => {
    setSelectedStores(prev =>
      prev.map((store, i) =>
        i === index
          ? { ...store, sizes: store.sizes.filter((_, sIndex) => sIndex !== sizeIndex) }
          : store
      )
    );
  }, []);

  // Initialize dashboard
  useEffect(() => {
    if (isAuthenticated && canAccessAdminPanel && isAdmin) {
      loadDashboard();
      return;
    }
    if (isAuthenticated && canAccessAdminPanel && !isAdmin) {
      setIsLoadingDashboard(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, canAccessAdminPanel, isAdmin]);

  // Derived data
  const products = useMemo(() => {
    return dashboardData?.products?.items || [];
  }, [dashboardData]);

  const stores = useMemo(() => {
    return (dashboardData?.stores?.items || []) as Array<{ id: string; name: string }>;
  }, [dashboardData]);

  const brands = useMemo(() => {
    return dashboardData?.brands?.items || [];
  }, [dashboardData]);

  // Load product data when editing
  useEffect(() => {
    if (!editingProductId || products.length === 0) return;

    let cancelled = false;

    const normalizeStores = (product: Record<string, unknown>) => {
      // 1) Newer shape: product.product_stores
      if (Array.isArray(product.product_stores)) {
        return (product.product_stores as Array<Record<string, unknown>>).map(ps => {
          const nestedStore = (ps.stores as Record<string, unknown> | undefined) ?? undefined;
          const storeId = (ps.store_id as string) || (nestedStore?.id as string) || '';
          const storeName =
            (ps.store_name as string) ||
            (nestedStore?.name as string) ||
            (stores.find((s: { id: string }) => s.id === storeId) as { name?: string } | undefined)
              ?.name ||
            'Unknown Store';

          return {
            store_id: storeId,
            store_name: storeName,
            price: Number(ps.price) || 0,
            sizes: (ps.sizes as string[]) || [],
          };
        });
      }

      // 2) Admin API contract: product.stores
      if (Array.isArray(product.stores)) {
        return (product.stores as Array<Record<string, unknown>>).map(s => {
          const storeId = (s.store_id as string) || (s.id as string) || '';
          const storeName =
            (s.store_name as string) ||
            (
              stores.find((st: { id: string }) => st.id === storeId) as
                | { name?: string }
                | undefined
            )?.name ||
            'Unknown Store';

          return {
            store_id: storeId,
            store_name: storeName,
            price: Number(s.price) || 0,
            sizes: (s.sizes as string[]) || [],
          };
        });
      }

      return null;
    };

    const extractIdList = (value: unknown): string[] => {
      if (!Array.isArray(value)) return [];
      return value
        .map(item => {
          if (typeof item === 'string' || typeof item === 'number') return String(item);
          if (isRecord(item)) {
            const idCandidate =
              item.id ??
              item.uuid ??
              item.slug ??
              item.value ??
              item.material_id ??
              item.technology_id ??
              item.size_id;
            return typeof idCandidate === 'string' || typeof idCandidate === 'number'
              ? String(idCandidate)
              : '';
          }
          return '';
        })
        .filter(Boolean);
    };

    const base = products.find((p: { id: string }) => p.id === editingProductId) as
      | Record<string, unknown>
      | undefined;
    if (!base) return;

    // Fill basic fields from dashboard list item
    console.log('Loading product for edit:', base);
    setProductName((base.name as string) || '');
    setProductCategory(
      (base.category_slug as string) || (base.category as string) || (base.type as string) || ''
    );
    setProductColor((base.color as string) || '');
    setProductGender((base.gender as string) || 'unisex');
    setProductBrandId((base.brand_id as string) || '');
    setProductDescription(
      (base.description_uk as string) ||
        (base.description as string) ||
        (base.description_en as string) ||
        ''
    );
    setProductMaterialIds(
      extractIdList(
        (base.materials as unknown) ??
          (base.material_ids as unknown) ??
          (base.materialIds as unknown)
      )
    );
    setProductTechnologyIds(
      extractIdList(
        (base.technologies as unknown) ??
          (base.technology_ids as unknown) ??
          (base.technologyIds as unknown)
      )
    );
    setProductSizeIds(
      extractIdList(
        (base.sizes as unknown) ?? (base.size_ids as unknown) ?? (base.sizeIds as unknown)
      )
    );
    setProductImageUrl((base.image_url as string) || '');

    if (base.images && Array.isArray(base.images)) {
      setProductImages(base.images as string[]);
    } else if (base.image_url) {
      setProductImages([base.image_url as string]);
    } else {
      setProductImages([]);
    }

    setPrimaryImageIndex(0);
    setProductStatus((base.status as 'draft' | 'published') || 'published');
    setPublishAt((base.publish_at as string) || '');
    setUnpublishAt((base.unpublish_at as string) || '');

    // Stores often are NOT included in dashboard list item.
    // Try to read stores from the base item, otherwise fetch full product details.
    (async () => {
      const needsDetail =
        (!base.description && !base.description_uk && !base.description_en) ||
        !base.type ||
        !base.color ||
        !base.gender;

      if (needsDetail) {
        try {
          const detailRes = await api.get(`/products/${editingProductId}/detail`);
          const body: unknown = detailRes.data;
          const payload =
            (isRecord(body) && isRecord(body.data) ? body.data : undefined) ??
            (isRecord(body) && isRecord(body.item) ? body.item : undefined) ??
            (isRecord(body) ? body : undefined) ??
            {};
          const product = isRecord(payload.product) ? payload.product : null;

          if (!cancelled && product) {
            if (!base.type && typeof product.type === 'string') setProductCategory(product.type);
            if (!base.category && typeof product.category === 'string')
              setProductCategory(product.category);
            if (!base.category_slug && typeof product.category_slug === 'string')
              setProductCategory(product.category_slug);
            if (!base.color && typeof product.color === 'string') setProductColor(product.color);
            if (!base.gender && typeof product.gender === 'string')
              setProductGender(product.gender);

            setProductMaterialIds(
              extractIdList(
                (product.materials as unknown) ??
                  (product.material_ids as unknown) ??
                  (product.materialIds as unknown)
              )
            );
            setProductTechnologyIds(
              extractIdList(
                (product.technologies as unknown) ??
                  (product.technology_ids as unknown) ??
                  (product.technologyIds as unknown)
              )
            );
            setProductSizeIds(
              extractIdList(
                (product.sizes as unknown) ??
                  (product.size_ids as unknown) ??
                  (product.sizeIds as unknown)
              )
            );

            if (!base.description && !base.description_uk && !base.description_en) {
              const fallbackDescription =
                (product.description_uk as string) ||
                (product.description as string) ||
                (product.description_en as string);
              if (fallbackDescription) setProductDescription(fallbackDescription);
            }
          }
        } catch (error) {
          console.warn('Failed to load product details for edit:', error);
        }
      }

      const fromBase = normalizeStores(base);
      if (fromBase) {
        if (!cancelled) setSelectedStores(fromBase);
        return;
      }

      // Dashboard list often doesn't include stores. Fetch them from canonical endpoint.
      try {
        const storesRes = await api.get(`/items/${editingProductId}/stores`);
        const body: unknown = storesRes.data;
        const items =
          (Array.isArray(body)
            ? body
            : isRecord(body) &&
              (Array.isArray(body.items)
                ? body.items
                : Array.isArray(body.stores)
                  ? body.stores
                  : null)) ?? [];

        const mapped = (items as Array<Record<string, unknown>>).map(s => {
          const storeId = (s.store_id as string) || (s.id as string) || '';
          const storeName =
            (s.store_name as string) ||
            (s.name as string) ||
            (
              stores.find((st: { id: string }) => st.id === storeId) as
                | { name?: string }
                | undefined
            )?.name ||
            'Unknown Store';

          const priceRaw =
            (s.price as unknown) ?? (s.product_price as unknown) ?? (s.productPrice as unknown);
          const price = typeof priceRaw === 'number' ? priceRaw : Number(priceRaw);

          const sizesRaw =
            (s.sizes as unknown) ??
            (s.available_sizes as unknown) ??
            (s.availableSizes as unknown) ??
            (s.size_list as unknown);
          const sizes = Array.isArray(sizesRaw) ? sizesRaw.map(size => String(size)) : [];

          return {
            store_id: storeId,
            store_name: storeName,
            price: Number.isFinite(price) ? price : 0,
            sizes,
          };
        });

        if (!cancelled) setSelectedStores(mapped);
      } catch (error) {
        console.warn('Failed to load product stores for edit:', error);
        if (!cancelled) setSelectedStores([]);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [editingProductId, products, stores]);

  // Handle URL parameter for editing product
  useEffect(() => {
    const editProductId = searchParams.get('editProduct');
    if (editProductId && products.length > 0) {
      setEditingProductId(editProductId);
      setActiveTab('add-product');
    }
  }, [searchParams, products]);

  // Analytics calculations
  const analytics = useMemo(() => {
    if (products.length === 0) {
      return {
        totalProducts: 0,
        totalStores: stores.length,
        totalBrands: brands.length,
        avgPrice: 0,
        minPrice: 0,
        maxPrice: 0,
        categoriesCount: {},
        topBrands: [],
      };
    }

    const prices = products.map((p: { price: number }) => p.price);
    const avgPrice = prices.reduce((a: number, b: number) => a + b, 0) / prices.length;
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    const categoriesCount: Record<string, number> = {};
    products.forEach((p: { type?: string; category?: string }) => {
      const cat = p.type || p.category || 'uncategorized';
      categoriesCount[cat] = (categoriesCount[cat] || 0) + 1;
    });

    const brandCount: Record<string, { name: string; count: number }> = {};
    products.forEach((p: { brand?: string }) => {
      if (p.brand) {
        brandCount[p.brand] = brandCount[p.brand] || { name: p.brand, count: 0 };
        brandCount[p.brand].count++;
      }
    });

    const topBrands = Object.values(brandCount)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalProducts: products.length,
      totalStores: stores.length,
      totalBrands: brands.length,
      avgPrice,
      minPrice,
      maxPrice,
      categoriesCount,
      topBrands,
    };
  }, [products, stores, brands]);

  // Store management functions
  const addSize = useCallback(() => {
    if (currentSizeInput.trim() && !currentStoreSizes.includes(currentSizeInput.trim())) {
      setCurrentStoreSizes(prev => [...prev, currentSizeInput.trim()]);
      setCurrentSizeInput('');
    }
  }, [currentSizeInput, currentStoreSizes]);

  const removeSize = useCallback((index: number) => {
    setCurrentStoreSizes(prev => prev.filter((_, i) => i !== index));
  }, []);

  const addStore = useCallback(() => {
    if (!currentStore || !currentStorePrice) return;

    const store = stores.find(s => s.id === currentStore);
    if (!store) return;

    const newStore = {
      store_id: currentStore,
      store_name: store.name,
      price: Number.parseFloat(currentStorePrice),
      sizes: [...currentStoreSizes],
    };

    setSelectedStores(prev => [...prev, newStore]);
    setCurrentStore('');
    setCurrentStorePrice('');
    setCurrentStoreSizes([]);
  }, [currentStore, currentStorePrice, currentStoreSizes, stores]);

  const removeStore = useCallback((index: number) => {
    setSelectedStores(prev => prev.filter((_, i) => i !== index));
  }, []);

  // Form reset
  const resetForm = useCallback(() => {
    setEditingProductId(null);
    setProductName('');
    setProductCategory('');
    setProductColor('');
    setProductGender('');
    setProductBrandId('');
    setProductDescription('');
    setProductMaterialIds([]);
    setProductTechnologyIds([]);
    setProductSizeIds([]);
    setProductImageUrl('');
    setProductImages([]);
    setPrimaryImageIndex(0);
    setSelectedStores([]);
    setCurrentStore('');
    setCurrentStorePrice('');
    setCurrentStoreSizes([]);
    setPublishAt('');
    setUnpublishAt('');
    setProductStatus('published');
    setAutoTranslateDescription(false);
    router.replace('/admin');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Product submission
  const handleProductSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!productName.trim()) return;

      setSubmitting(true);
      try {
        // Handle auto-translation if enabled
        const finalDescriptionUk = productDescription;
        let finalDescriptionEn = '';

        if (autoTranslateDescription && productDescription) {
          try {
            const response = await fetch('/api/translate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                text: productDescription,
                from: 'uk',
                to: 'en',
              }),
            });

            if (response.ok) {
              const data = await response.json();
              if (data.success && data.translated) {
                finalDescriptionEn = data.translated;
              }
            } else {
              console.warn('Translation API failed, description will be saved only in Ukrainian');
            }
          } catch (error) {
            console.error('Translation failed:', error);
            console.warn(
              'Continuing without translation - description will be saved only in Ukrainian'
            );
          }
        }

        const productData: Record<string, unknown> = {
          name: productName,
          type: productCategory,
          color: productColor,
          gender: productGender,
          brand_id: productBrandId || null,
          price: selectedStores.length > 0 ? selectedStores[0].price : 0,
          image_url: productImageUrl || null,
          status: productStatus,
          publish_at: publishAt || null,
          unpublish_at: unpublishAt || null,
          stores: selectedStores.map(s => ({
            store_id: s.store_id,
            price: Number(s.price),
            sizes: s.sizes || [],
          })),
        };

        const categoryValue = productCategory.trim();
        if (categoryValue) {
          if (isUuid(categoryValue)) {
            productData.category_id = categoryValue;
          } else {
            productData.category_slug = categoryValue;
          }
        }

        if (productMaterialIds.length > 0) {
          productData.material_ids = productMaterialIds;
        }
        if (productTechnologyIds.length > 0) {
          productData.technology_ids = productTechnologyIds;
        }
        if (productSizeIds.length > 0) {
          productData.size_ids = productSizeIds;
        }

        // Add description - backend expects description_uk and optionally description_en
        if (finalDescriptionUk) {
          productData.description = finalDescriptionUk;
          productData.description_uk = finalDescriptionUk;
        }
        if (autoTranslateDescription && finalDescriptionEn) {
          productData.description_en = finalDescriptionEn;
        }
        // Також можна використати autoTranslateDescription для backend
        if (autoTranslateDescription && !finalDescriptionEn) {
          productData.autoTranslateDescription = true;
          productData.auto_translate_description = true;
        }

        console.log('Sending product data to backend:', productData);

        let result;
        if (editingProductId) {
          result = await adminApi.updateProduct(editingProductId, productData as any);
          console.log('Product updated, response:', result);
        } else {
          result = await adminApi.createProduct(productData as any);
          console.log('Product created, response:', result);
        }

        toast({
          title: 'Success',
          description:
            result.message || `Product ${editingProductId ? 'updated' : 'created'} successfully!`,
        });

        localStorage.removeItem('admin_product_draft');
        resetForm();
        await loadDashboard(); // Додав await для синхронізації
      } catch (error: unknown) {
        console.error('Failed to save product:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: getErrorMessage(error),
        });
      } finally {
        setSubmitting(false);
      }
    },
    [
      productName,
      productCategory,
      productColor,
      productGender,
      productBrandId,
      productDescription,
      productMaterialIds,
      productTechnologyIds,
      productSizeIds,
      productImageUrl,
      productStatus,
      publishAt,
      unpublishAt,
      selectedStores,
      editingProductId,
      autoTranslateDescription,
      resetForm,
      loadDashboard,
      toast,
    ]
  );

  // Selection management
  const toggleSelectMode = useCallback(() => {
    setIsSelectMode(!isSelectMode);
    setSelectedProductIds(new Set());
  }, [isSelectMode]);

  const toggleProductSelection = useCallback((productId: string) => {
    setSelectedProductIds(prev => {
      const newSelected = new Set(prev);
      if (newSelected.has(productId)) {
        newSelected.delete(productId);
      } else {
        newSelected.add(productId);
      }
      return newSelected;
    });
  }, []);

  const selectAllProducts = useCallback(() => {
    if (selectedProductIds.size === products.length) {
      setSelectedProductIds(new Set());
    } else {
      setSelectedProductIds(new Set(products.map((p: { id: string }) => p.id)));
    }
  }, [selectedProductIds.size, products]);

  // Templates
  const loadTemplates = useCallback(async () => {
    try {
      const response = await advancedApi.getTemplates();
      if (response?.templates || Array.isArray(response)) {
        setSavedTemplates(response.templates || response);
      }
    } catch (error) {
      console.error('Failed to load templates from API, using localStorage fallback', error);
      const saved = localStorage.getItem('admin_product_templates');
      if (saved) {
        try {
          setSavedTemplates(JSON.parse(saved));
        } catch (e) {
          console.error('Failed to load templates', e);
        }
      }
    }
  }, []);

  const saveAsTemplate = useCallback(async () => {
    const templateName = prompt('Enter template name:');
    if (!templateName) return;

    const templateData = {
      name: templateName,
      category: productCategory,
      template_data: {
        category: productCategory,
        color: productColor,
        gender: productGender,
        brand_id: productBrandId,
        description: productDescription,
      },
    };

    try {
      await advancedApi.createTemplate(templateData);
      await loadTemplates();
      toast({
        title: 'Template saved',
        description: `Template "${templateName}" has been saved`,
      });
    } catch (error) {
      console.error('Failed to save template to API, using localStorage', error);
      // Fallback to localStorage
      const templates = [
        ...savedTemplates,
        {
          id: Date.now().toString(),
          name: templateName,
          data: templateData.template_data,
        },
      ];
      setSavedTemplates(templates);
      localStorage.setItem('admin_product_templates', JSON.stringify(templates));
      toast({
        title: 'Template saved locally',
        description: `Template "${templateName}" has been saved to browser storage`,
      });
    }
  }, [
    productCategory,
    productColor,
    productGender,
    productBrandId,
    productDescription,
    savedTemplates,
    loadTemplates,
    toast,
  ]);

  const loadTemplate = useCallback((template: { data?: Record<string, unknown> }) => {
    if (template.data) {
      setProductCategory((template.data.category as string) || '');
      setProductColor((template.data.color as string) || '');
      setProductGender((template.data.gender as string) || '');
      setProductBrandId((template.data.brand_id as string) || '');
      setProductDescription((template.data.description as string) || '');
    }
  }, []);

  const deleteTemplate = useCallback(
    async (templateId: string) => {
      try {
        await advancedApi.deleteTemplate(templateId);
        await loadTemplates();
        toast({
          title: 'Template deleted',
          description: 'Template has been removed',
        });
      } catch (error) {
        console.error('Failed to delete template from API, removing from localStorage', error);
        const updated = savedTemplates.filter(t => t.id !== templateId);
        setSavedTemplates(updated);
        localStorage.setItem('admin_product_templates', JSON.stringify(updated));
        toast({
          title: 'Template deleted',
          description: 'Template has been removed from browser storage',
        });
      }
    },
    [savedTemplates, loadTemplates, toast]
  );

  // Load templates on mount
  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  return {
    // State
    activeTab,
    setActiveTab,
    isLoadingDashboard,

    // Data
    products,
    stores,
    brands,
    analytics,

    // Product form
    productName,
    setProductName,
    productCategory,
    setProductCategory,
    productColor,
    setProductColor,
    productGender,
    setProductGender,
    productBrandId,
    setProductBrandId,
    productDescription,
    setProductDescription,
    productMaterialIds,
    setProductMaterialIds,
    productTechnologyIds,
    setProductTechnologyIds,
    productSizeIds,
    setProductSizeIds,
    productImageUrl,
    setProductImageUrl,
    productImages,
    setProductImages,
    primaryImageIndex,
    setPrimaryImageIndex,

    // Store management
    selectedStores,
    currentStore,
    setCurrentStore,
    currentStorePrice,
    setCurrentStorePrice,
    currentStoreSizes,
    currentSizeInput,
    setCurrentSizeInput,
    addSize,
    removeSize,
    addStore,
    removeStore,
    updateStorePrice,
    addStoreSize,
    removeStoreSize,

    // Publishing
    publishAt,
    setPublishAt,
    unpublishAt,
    setUnpublishAt,
    productStatus,
    setProductStatus,

    // Translation
    autoTranslateDescription,
    setAutoTranslateDescription,

    // Edit state
    editingProductId,
    setEditingProductId,
    submitting,

    // Templates
    savedTemplates,
    showTemplates,
    setShowTemplates,
    saveAsTemplate,
    loadTemplate,
    deleteTemplate,

    // Product management
    searchProducts,
    setSearchProducts,
    viewMode,
    setViewMode,
    isSelectMode,
    selectedProductIds,
    toggleSelectMode,
    toggleProductSelection,
    selectAllProducts,
    loadingExport,
    setLoadingExport,

    // Analytics
    showPriceHistory,
    setShowPriceHistory,
    showActivityLog,
    setShowActivityLog,
    loadingPriceHistory,
    loadingActivityLog,
    selectedProductForHistory,
    setSelectedProductForHistory,
    priceHistory,
    activityLog,

    // Functions
    handleProductSubmit,
    resetForm,
    loadDashboard,
  };
};
