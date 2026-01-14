/**
 * Admin Hook - Manages admin panel state and logic
 * Extracted from AdminContent component for better separation of concerns
 */

'use client';

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { adminApi } from "@/services/api/admin.api";
import { advancedApi } from "@/services/api/advanced.api";
import { useAuth } from "@/features/auth/hooks/useAuth";

const isRecord = (value: unknown): value is Record<string, unknown> => 
  typeof value === "object" && value !== null;

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  if (isRecord(error) && typeof error.message === "string") return error.message;
  return "Unknown error";
};

export const useAdmin = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { isAuthenticated, isAdmin } = useAuth();

  // Dashboard data
  const [dashboardData, setDashboardData] = useState<{
    products?: { items: unknown[] };
    stores?: { items: unknown[] };
    brands?: { items: unknown[] };
  } | null>(null);
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(true);

  // Active tab
  const [activeTab, setActiveTab] = useState("add-product");

  // Product form state
  const [productName, setProductName] = useState("");
  const [productCategory, setProductCategory] = useState("");
  const [productColor, setProductColor] = useState("");
  const [productGender, setProductGender] = useState("");
  const [productBrandId, setProductBrandId] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [productImageUrl, setProductImageUrl] = useState("");
  const [productImages, setProductImages] = useState<string[]>([]);
  const [primaryImageIndex, setPrimaryImageIndex] = useState<number>(0);
  
  // Store management
  const [selectedStores, setSelectedStores] = useState<Array<{
    store_id: string;
    store_name: string;
    price: number;
    sizes: string[];
  }>>([]);
  const [currentStore, setCurrentStore] = useState("");
  const [currentStorePrice, setCurrentStorePrice] = useState("");
  const [currentStoreSizes, setCurrentStoreSizes] = useState<string[]>([]);
  const [currentSizeInput, setCurrentSizeInput] = useState("");

  // Edit state
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Templates
  const [savedTemplates, setSavedTemplates] = useState<Array<{
    id: string;
    name: string;
    data: Record<string, unknown>;
  }>>([]);
  const [showTemplates, setShowTemplates] = useState(false);

  // Publishing
  const [publishAt, setPublishAt] = useState<string>("");
  const [unpublishAt, setUnpublishAt] = useState<string>("");
  const [productStatus, setProductStatus] = useState<"draft" | "published">("published");

  // Translation
  const [autoTranslateDescription, setAutoTranslateDescription] = useState<boolean>(false);

  // Product management
  const [searchProducts, setSearchProducts] = useState("");
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
  const priceHistory: Record<string, Array<{
    id: string;
    store_id: string;
    store_name: string;
    price: number;
    changed_at: string;
  }>> = {}; // Price history feature pending backend implementation
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

  // Initialize dashboard
  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      loadDashboard();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, isAdmin]);

  // Derived data
  const products = useMemo(() => {
    return dashboardData?.products?.items || [];
  }, [dashboardData]);
  
  const stores = useMemo(() => {
    return dashboardData?.stores?.items || [];
  }, [dashboardData]);
  
  const brands = useMemo(() => {
    return dashboardData?.brands?.items || [];
  }, [dashboardData]);

  // Load product data when editing
  useEffect(() => {
    if (editingProductId && products.length > 0) {
      const product = products.find((p: { id: string }) => p.id === editingProductId) as Record<string, unknown> | undefined;
      if (product) {
        console.log('Loading product for edit:', product);
        setProductName((product.name as string) || "");
        setProductCategory((product.type as string) || "");
        setProductColor((product.color as string) || "");
        setProductGender((product.gender as string) || "unisex");
        setProductBrandId((product.brand_id as string) || "");
        setProductDescription((product.description as string) || (product.description_en as string) || "");
        setProductImageUrl((product.image_url as string) || "");
        
        // Handle images - backend може повертати або масив або одиночне фото
        if (product.images && Array.isArray(product.images)) {
          setProductImages(product.images as string[]);
        } else if (product.image_url) {
          setProductImages([product.image_url as string]);
        } else {
          setProductImages([]);
        }
        
        setPrimaryImageIndex(0);
        setProductStatus((product.status as "draft" | "published") || "published");
        setPublishAt((product.publish_at as string) || "");
        setUnpublishAt((product.unpublish_at as string) || "");
        
        // Load stores - backend повертає product_stores масив
        if (product.product_stores && Array.isArray(product.product_stores)) {
          const storesData = (product.product_stores as Array<Record<string, unknown>>).map((ps) => {
            // ps може мати вкладений об'єкт stores або просто store_id
            const storeId = (ps.store_id as string) || ((ps.stores as Record<string, unknown>)?.id as string) || "";
            const storeName = (ps.store_name as string) || ((ps.stores as Record<string, unknown>)?.name as string) || (stores.find((s: { id: string }) => s.id === storeId) as { name?: string })?.name || "Unknown Store";
            return {
              store_id: storeId,
              store_name: storeName,
              price: (ps.price as number) || 0,
              sizes: (ps.sizes as string[]) || []
            };
          });
          setSelectedStores(storesData);
        } else {
          setSelectedStores([]);
        }
      }
    }
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
      setCurrentSizeInput("");
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
    setCurrentStore("");
    setCurrentStorePrice("");
    setCurrentStoreSizes([]);
  }, [currentStore, currentStorePrice, currentStoreSizes, stores]);

  const removeStore = useCallback((index: number) => {
    setSelectedStores(prev => prev.filter((_, i) => i !== index));
  }, []);

  // Form reset
  const resetForm = useCallback(() => {
    setEditingProductId(null);
    setProductName("");
    setProductCategory("");
    setProductColor("");
    setProductGender("");
    setProductBrandId("");
    setProductDescription("");
    setProductImageUrl("");
    setProductImages([]);
    setPrimaryImageIndex(0);
    setSelectedStores([]);
    setCurrentStore("");
    setCurrentStorePrice("");
    setCurrentStoreSizes([]);
    setPublishAt("");
    setUnpublishAt("");
    setProductStatus("published");
    setAutoTranslateDescription(false);
    router.replace("/admin");
  }, [router]);

  // Product submission
  const handleProductSubmit = useCallback(async (e: React.FormEvent) => {
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
              to: 'en'
            })
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
          console.warn('Continuing without translation - description will be saved only in Ukrainian');
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
          sizes: s.sizes || []
        }))
      };
      
      // Add description - backend expects description_uk and optionally description_en
      if (finalDescriptionUk) {
        productData.description_uk = finalDescriptionUk;
      }
      if (autoTranslateDescription && finalDescriptionEn) {
        productData.description_en = finalDescriptionEn;
      }
      // Також можна використати autoTranslateDescription для backend
      if (autoTranslateDescription && !finalDescriptionEn) {
        productData.autoTranslateDescription = true;
      }
      
      console.log('Sending product data to backend:', productData);

      let result;
      if (editingProductId) {
        result = await adminApi.updateProduct(editingProductId, productData);
        console.log('Product updated, response:', result);
      } else {
        result = await adminApi.createProduct(productData);
        console.log('Product created, response:', result);
      }

      toast({
        title: "Success",
        description: result.message || `Product ${editingProductId ? 'updated' : 'created'} successfully!`,
      });

      localStorage.removeItem('admin_product_draft');
      resetForm();
      await loadDashboard(); // Додав await для синхронізації
    } catch (error: unknown) {
      console.error('Failed to save product:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: getErrorMessage(error),
      });
    } finally {
      setSubmitting(false);
    }
  }, [
    productName, productCategory, productColor, productGender, productBrandId,
    productDescription, productImageUrl,
    productStatus, publishAt, unpublishAt, selectedStores, editingProductId,
    autoTranslateDescription, resetForm, loadDashboard, toast
  ]);

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
      console.error("Failed to load templates from API, using localStorage fallback", error);
      const saved = localStorage.getItem('admin_product_templates');
      if (saved) {
        try {
          setSavedTemplates(JSON.parse(saved));
        } catch (e) {
          console.error("Failed to load templates", e);
        }
      }
    }
  }, []);

  const saveAsTemplate = useCallback(async () => {
    const templateName = prompt("Enter template name:");
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
      }
    };

    try {
      await advancedApi.createTemplate(templateData);
      await loadTemplates();
      toast({
        title: "Template saved",
        description: `Template "${templateName}" has been saved`,
      });
    } catch (error) {
      console.error("Failed to save template to API, using localStorage", error);
      // Fallback to localStorage
      const templates = [...savedTemplates, { 
        id: Date.now().toString(), 
        name: templateName, 
        data: templateData.template_data 
      }];
      setSavedTemplates(templates);
      localStorage.setItem('admin_product_templates', JSON.stringify(templates));
      toast({
        title: "Template saved locally",
        description: `Template "${templateName}" has been saved to browser storage`,
      });
    }
  }, [productCategory, productColor, productGender, productBrandId, productDescription, savedTemplates, loadTemplates, toast]);

  const loadTemplate = useCallback((template: { data?: Record<string, unknown> }) => {
    if (template.data) {
      setProductCategory((template.data.category as string) || "");
      setProductColor((template.data.color as string) || "");
      setProductGender((template.data.gender as string) || "");
      setProductBrandId((template.data.brand_id as string) || "");
      setProductDescription((template.data.description as string) || "");
    }
  }, []);

  const deleteTemplate = useCallback(async (templateId: string) => {
    try {
      await advancedApi.deleteTemplate(templateId);
      await loadTemplates();
      toast({
        title: "Template deleted",
        description: "Template has been removed",
      });
    } catch (error) {
      console.error("Failed to delete template from API, removing from localStorage", error);
      const updated = savedTemplates.filter(t => t.id !== templateId);
      setSavedTemplates(updated);
      localStorage.setItem('admin_product_templates', JSON.stringify(updated));
      toast({
        title: "Template deleted",
        description: "Template has been removed from browser storage",
      });
    }
  }, [savedTemplates, loadTemplates, toast]);

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