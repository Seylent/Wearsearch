/**
 * Admin Hook - Manages admin panel state and logic
 * Extracted from AdminContent component for better separation of concerns
 */

'use client';

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
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
  const { toast } = useToast();
  const { isAuthenticated, isAdmin } = useAuth();

  // Dashboard data
  const [dashboardData, setDashboardData] = useState<any>(null);
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
    data: any;
  }>>([]);
  const [showTemplates, setShowTemplates] = useState(false);

  // Publishing
  const [publishAt, setPublishAt] = useState<string>("");
  const [unpublishAt, setUnpublishAt] = useState<string>("");
  const [productStatus, setProductStatus] = useState<"draft" | "published">("published");

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
    changes?: any;
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
  }, [isAuthenticated, isAdmin, loadDashboard]);

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

    const prices = products.map((p: any) => p.price);
    const avgPrice = prices.reduce((a: number, b: number) => a + b, 0) / prices.length;
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    const categoriesCount: Record<string, number> = {};
    products.forEach((p: any) => {
      const cat = p.type || p.category || 'uncategorized';
      categoriesCount[cat] = (categoriesCount[cat] || 0) + 1;
    });

    const brandCount: Record<string, { name: string; count: number }> = {};
    products.forEach((p: any) => {
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
    router.replace("/admin");
  }, [router]);

  // Product submission
  const handleProductSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName.trim()) return;

    setSubmitting(true);
    try {
      const productData = {
        name: productName,
        type: 'clothing' as const,
        category: productCategory,
        color: productColor,
        gender: productGender,
        brand_id: productBrandId,
        description: productDescription,
        price: selectedStores.length > 0 ? selectedStores[0].price : 0,
        image: productImageUrl,
        images: productImages,
        primary_image_index: primaryImageIndex,
        status: productStatus,
        publish_at: publishAt || null,
        unpublish_at: unpublishAt || null,
        stores: selectedStores,
      };

      let result;
      if (editingProductId) {
        result = await adminApi.updateProduct(editingProductId, productData);
      } else {
        result = await adminApi.createProduct(productData);
      }

      toast({
        title: "Success",
        description: result.message || `Product ${editingProductId ? 'updated' : 'created'} successfully!`,
      });

      localStorage.removeItem('admin_product_draft');
      resetForm();
      loadDashboard();
    } catch (error: unknown) {
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
    productDescription, productImageUrl, productImages, primaryImageIndex,
    productStatus, publishAt, unpublishAt, selectedStores, editingProductId,
    resetForm, loadDashboard, toast
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
      setSelectedProductIds(new Set(products.map((p: any) => p.id)));
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

  const loadTemplate = useCallback((template: any) => {
    if (template.data) {
      setProductCategory(template.data.category || "");
      setProductColor(template.data.color || "");
      setProductGender(template.data.gender || "");
      setProductBrandId(template.data.brand_id || "");
      setProductDescription(template.data.description || "");
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