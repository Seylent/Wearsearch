import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Combobox } from "@/components/ui/combobox";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/layout/Navigation";
import Footer from "@/components/layout/Footer";
import { Package, Store, Plus, Edit, Trash2, Search, ShieldCheck } from "lucide-react";
import { ImageUploader } from "@/components/ImageUploader";
import { productService } from "@/services/productService";
import { storeService } from "@/services/storeService";
import { brandsApi } from "@/services/api/brands.api";
import { useAdminDashboardData } from "@/hooks/useAggregatedData";
import { getCategoryTranslation, getColorTranslation } from "@/utils/translations";
import { useProducts, useStores, useBrands } from "@/hooks/useApi";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useSEO } from "@/hooks/useSEO";

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null;

const getRecord = (value: unknown, key: string): Record<string, unknown> | undefined => {
  if (!isRecord(value)) return undefined;
  const nested = value[key];
  return isRecord(nested) ? nested : undefined;
};

const getArray = (value: unknown, key: string): unknown[] | undefined => {
  if (!isRecord(value)) return undefined;
  const nested = value[key];
  return Array.isArray(nested) ? nested : undefined;
};

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  if (isRecord(error) && typeof error.message === "string") return error.message;
  return "Unknown error";
};

const Admin = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { toast } = useToast();
  const { isAdmin, isAuthenticated, isLoading: authLoading } = useAuth();
  const didInitRef = useRef(false);

  const normalizeCategoryValue = useCallback((raw: unknown): string => {
    const value = String(raw || '').trim();
    if (!value) return '';
    const lower = value.toLowerCase();

    if (lower === 'tshirts' || lower === 't-shirts' || lower === 'tshirts ') return 'T-shirts';
    if (lower === 't-shirts' || lower === 'tshirts') return 'T-shirts';

    // Keep canonical values used by SelectItem.value
    if (lower === 'jackets') return 'jackets';
    if (lower === 'hoodies') return 'hoodies';
    if (lower === 'pants') return 'pants';
    if (lower === 'jeans') return 'jeans';
    if (lower === 'shorts') return 'shorts';
    if (lower === 'shoes') return 'shoes';
    if (lower === 'accessories') return 'accessories';

    // If backend already returns the canonical casing, keep it
    if (value === 'T-shirts') return 'T-shirts';

    return value;
  }, []);

  useSEO({
    title: 'Admin',
    description: 'Admin dashboard for managing marketplace content.',
    keywords: 'admin, dashboard',
    type: 'website',
    noindex: true,
  });
  
  // v1: Single dashboard request for initial admin load
  const {
    data: dashboardData,
    isLoading: _dashboardLoading,
    refetch: refetchDashboard,
  } = useAdminDashboardData();

  // Legacy hooks kept for now (mutations and non-dashboard flows may still rely on them)
  // NOTE: They are not used for the initial lists anymore.
  const { data: productsData = [] } = useProducts({ enabled: false });
  const { data: storesData = [] } = useStores({ enabled: false });
  const { data: brandsData = [] } = useBrands({ enabled: false });
  
  // Normalize data (handle different API response formats)
  const products = useMemo(() => {
    const body: unknown = dashboardData;
    const items = getArray(getRecord(body, "products"), "items");
    if (items) return items;

    // Fallback (should not be the main path)
    if (Array.isArray(productsData)) return productsData;
    if (isRecord(productsData) && productsData.success === true) {
      const data = productsData.data;
      return Array.isArray(data) ? data : [];
    }
    if (isRecord(productsData) && Array.isArray(productsData.products)) return productsData.products;
    return [];
  }, [dashboardData, productsData]);
  
  const stores = useMemo(() => {
    const body: unknown = dashboardData;
    const items = getArray(getRecord(body, "stores"), "items");
    if (items) return items;

    // Fallback
    if (Array.isArray(storesData)) return storesData;
    if (isRecord(storesData) && storesData.success === true) {
      const data = storesData.data;
      return Array.isArray(data) ? data : [];
    }
    return [];
  }, [dashboardData, storesData]);
  
  const brands = useMemo(() => {
    const body: unknown = dashboardData;
    const items = getArray(getRecord(body, "brands"), "items");
    if (items) return items;

    // Fallback
    if (Array.isArray(brandsData)) return brandsData;

    if (isRecord(brandsData)) {
      const data = brandsData.data;
      if (isRecord(data) && Array.isArray(data.brands)) return data.brands;
      if (Array.isArray(brandsData.brands)) return brandsData.brands;
      if (Array.isArray(data)) return data;
      if (brandsData.success === true && Array.isArray(data)) return data;
    }
    return [];
  }, [dashboardData, brandsData]);
  
  // Product form state - always initialize with empty string to avoid controlled/uncontrolled issues
  const [productName, setProductName] = useState("");
  const [productCategory, setProductCategory] = useState("");
  const [productColor, setProductColor] = useState("");
  const [productGender, setProductGender] = useState("");
  const [productBrandId, setProductBrandId] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [productImageUrl, setProductImageUrl] = useState("");
  
  // Multi-store selection state
  const [selectedStores, setSelectedStores] = useState<Array<{ store_id: string; store_name: string; price: number }>>([]);
  const [currentStore, setCurrentStore] = useState("");
  const [currentStorePrice, setCurrentStorePrice] = useState("");
  const [storeSearchQuery, setStoreSearchQuery] = useState("");
  
  // Editing state (for tracking which product is being edited)
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  
  // Tab state
  const [activeTab, setActiveTab] = useState("add-product");
  
  // Contacts state
  const [contactTelegram, setContactTelegram] = useState("@wearsearch");
  const [contactInstagram, setContactInstagram] = useState("@wearsearch");
  const [contactTiktok, setContactTiktok] = useState("@wearsearch");
  const [contactEmail, setContactEmail] = useState("support@wearsearch.com");
  const [savingContacts, setSavingContacts] = useState(false);
  
  // Store form state
  const [storeName, setStoreName] = useState("");
  const [storeTelegram, setStoreTelegram] = useState("");
  const [storeInstagram, setStoreInstagram] = useState("");
  const [storeTiktok, setStoreTiktok] = useState("");
  const [storeShipping, setStoreShipping] = useState("");
  const [storeLogoUrl, setStoreLogoUrl] = useState("");
  const [storeRecommended, setStoreRecommended] = useState<boolean>(false);
  const [editingStore, setEditingStore] = useState<Record<string, unknown> | null>(null);
  
  const [submitting, setSubmitting] = useState(false);
  
  // Predefined colors
  const COLORS = [
    "Black", "White", "Gray", "Beige", "Brown",
    "Red", "Blue", "Navy", "Green", "Olive",
    "Yellow", "Orange", "Pink", "Purple", "Cream"
  ];

  const editProduct = useCallback((product: unknown) => {
    if (!isRecord(product)) return;

    // Load product data into form
    setProductName(typeof product.name === "string" ? product.name : String(product.name ?? ""));

    const rawCategory = product.type ?? product.category ?? "";
    const categoryValue = normalizeCategoryValue(rawCategory);
    setProductCategory(categoryValue);
    setProductColor(typeof product.color === "string" ? product.color : String(product.color ?? ""));
    setProductGender(typeof product.gender === "string" ? product.gender : String(product.gender ?? ""));
    setProductBrandId(typeof product.brand_id === "string" ? product.brand_id : String(product.brand_id ?? ""));
    setProductDescription(typeof product.description === "string" ? product.description : String(product.description ?? ""));
    setProductImageUrl(typeof product.image_url === "string" ? product.image_url : String(product.image_url ?? ""));
    
    // Load stores from product_stores
    const productStoresRaw = product.product_stores;
    if (Array.isArray(productStoresRaw) && productStoresRaw.length > 0) {
      const productStores = productStoresRaw
        .map((ps: unknown) => {
          if (!isRecord(ps)) return null;

          const storesObj = isRecord(ps.stores) ? ps.stores : undefined;
          const storeId = typeof ps.store_id === "string" ? ps.store_id : String(ps.store_id ?? "");
          const storeName =
            (storesObj && typeof storesObj.name === "string" ? storesObj.name : undefined) ??
            (typeof ps.store_name === "string" ? ps.store_name : undefined) ??
            "Unknown Store";

          const priceRaw = ps.price ?? (storesObj ? storesObj.price : undefined) ?? 0;
          const price = typeof priceRaw === "number" ? priceRaw : Number(priceRaw || 0);

          if (!storeId) return null;
          return { store_id: storeId, store_name: storeName, price };
        })
        .filter(Boolean) as Array<{ store_id: string; store_name: string; price: number }>;

      setSelectedStores(productStores);
    } else {
      setSelectedStores([]);
    }
    
    // Store product ID for update
    const productIdValue = product.id;
    const normalizedProductId = typeof productIdValue === "string" ? productIdValue : productIdValue != null ? String(productIdValue) : null;
    if (normalizedProductId) setEditingProductId(normalizedProductId);
    
    // Switch to "Add Product" tab (which is now dual-purpose)
    setActiveTab("add-product");
    
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [normalizeCategoryValue]);

  const loadProductForEdit = useCallback(async (productId: string) => {
    try {
      // Do not fail the whole edit flow if stores endpoint fails.
      const [productSettled, storesSettled] = await Promise.allSettled([
        productService.getProductById(productId),
        productService.getProductStores(productId),
      ]);

      if (productSettled.status !== 'fulfilled') {
        throw productSettled.reason;
      }

      const productResult: unknown = productSettled.value;
      const productDataCandidate =
        (isRecord(productResult) ? productResult.item : undefined) ||
        (getRecord(productResult, "data") ? getRecord(productResult, "data")!.item : undefined) ||
        (isRecord(productResult) ? productResult.data : undefined) ||
        (isRecord(productResult) ? productResult.product : undefined) ||
        productResult;

      if (!isRecord(productDataCandidate)) return;
      const productData: Record<string, unknown> = { ...productDataCandidate };

      let rawStores: unknown[] = [];
      if (storesSettled.status === "fulfilled") {
        const storesValue: unknown = storesSettled.value;
        rawStores = getArray(storesValue, "items") ?? (Array.isArray(storesValue) ? storesValue : []);
      } else {
        const fromProduct = productData.product_stores;
        rawStores = Array.isArray(fromProduct) ? (fromProduct as unknown[]) : [];
      }

      if (!productData?.id) return;

      const normalizedStores: unknown[] = Array.isArray(rawStores) ? rawStores : [];

      if (normalizedStores.length > 0) {
        productData.product_stores = normalizedStores
          .map((store: unknown) => {
            if (!isRecord(store)) return null;

            const storesObj = (isRecord(store.stores) ? store.stores : undefined) ?? (isRecord(store.store) ? store.store : undefined);

            const storeId =
              (typeof store.store_id === "string" ? store.store_id : undefined) ??
              (typeof store.id === "string" ? store.id : undefined) ??
              (storesObj && typeof storesObj.id === "string" ? storesObj.id : undefined);

            const storeName =
              (typeof store.store_name === "string" ? store.store_name : undefined) ??
              (typeof store.name === "string" ? store.name : undefined) ??
              (storesObj && typeof storesObj.name === "string" ? storesObj.name : undefined);

            const storePrice = store.price ?? store.store_price ?? store.product_price;

            if (!storeId) return null;

            const resolvedStoresObj = storesObj ?? {
              id: storeId,
              name: storeName || "Unknown Store",
            };

            return {
              store_id: storeId,
              store_name: storeName || (isRecord(resolvedStoresObj) && typeof resolvedStoresObj.name === "string" ? resolvedStoresObj.name : undefined) || "Unknown Store",
              price: typeof storePrice === 'number' ? storePrice : Number(storePrice || 0),
              stores: resolvedStoresObj,
            };
          })
          .filter(Boolean);
      } else {
        productData.product_stores = [];
      }

      editProduct(productData);
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to load product for editing',
        variant: 'destructive',
      });
    }
  }, [editProduct, toast]);

  // Auth / access guard
  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }

    if (!isAdmin) {
      toast({
        title: "Access Denied",
        description: "Admin access required",
        variant: "destructive",
      });
      navigate('/');
    }
  }, [authLoading, isAuthenticated, isAdmin, navigate, toast]);

  // One-time admin-only initialization
  useEffect(() => {
    if (!isAdmin) return;
    if (didInitRef.current) return;
    didInitRef.current = true;

    // Load saved contacts from localStorage
    const savedContacts = localStorage.getItem('site_contacts');
    if (savedContacts) {
      try {
        const contacts = JSON.parse(savedContacts);
        if (contacts.telegram) setContactTelegram(contacts.telegram);
        if (contacts.instagram) setContactInstagram(contacts.instagram);
        if (contacts.tiktok) setContactTiktok(contacts.tiktok);
        if (contacts.email) setContactEmail(contacts.email);
      } catch (_e) {
        console.error('Failed to load saved contacts');
      }
    }

    // Check if we should edit a product from URL
    const urlParams = new URLSearchParams(window.location.search);
    const editProductId = urlParams.get('editProduct');
    if (editProductId) {
      loadProductForEdit(editProductId);
    }
  }, [isAdmin, loadProductForEdit]);

  const addStoreToProduct = () => {
    if (!currentStore || !currentStorePrice) {
      toast({
        title: "Error",
        description: "Please select a store and enter a price",
        variant: "destructive",
      });
      return;
    }

    const store = stores.find(s => s.name === currentStore);
    if (!store) {
      toast({
        title: "Error",
        description: "Store not found",
        variant: "destructive",
      });
      return;
    }

    // Check if store already added
    if (selectedStores.some(s => s.store_id === store.id)) {
      toast({
        title: "Error",
        description: "This store is already added",
        variant: "destructive",
      });
      return;
    }

    setSelectedStores([
      ...selectedStores,
      {
        store_id: store.id,
        store_name: store.name,
        price: parseFloat(currentStorePrice)
      }
    ]);

    // Reset current selection
    setCurrentStore("");
    setCurrentStorePrice("");
  };

  const removeStoreFromProduct = (storeId: string) => {
    setSelectedStores(selectedStores.filter(s => s.store_id !== storeId));
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingProductId) return;

    if (selectedStores.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one store",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    try {
      const avgPrice = selectedStores.reduce((sum, store) => sum + store.price, 0) / selectedStores.length;

      const updateData = {
        name: productName,
        price: avgPrice,
        type: productCategory,
        category: productCategory,
        color: productColor,
        gender: productGender || null,
        brand_id: productBrandId || null,
        description: productDescription || null,
        image_url: productImageUrl,
        stores: selectedStores.map(store => ({
          store_id: store.store_id,
          price: store.price
        }))
      };

      const result: unknown = await productService.updateProduct(editingProductId, updateData);

      if (isRecord(result) && result.success === false) {
        const apiError = typeof result.error === "string" ? result.error : undefined;
        throw new Error(apiError || "Failed to update product");
      }

      {
        const normalized = isRecord(result) && "data" in result ? (result.data as unknown) : result;

        // Backend may not return stores in response; fall back to selectedStores.
        const storesCount =
          isRecord(normalized) && Array.isArray(normalized.stores)
            ? normalized.stores.length
            : selectedStores.length;
        
        toast({
          title: "Success",
          description: `Product and ${storesCount} store(s) updated successfully!`,
        });

        // Reset form
        setEditingProductId(null);
        setProductName("");
        setProductCategory("");
        setProductColor("");
        setProductGender("");
        setProductBrandId("");
        setProductDescription("");
        setProductImageUrl("");
        setSelectedStores([]);
        setCurrentStore("");
        setCurrentStorePrice("");
        refetchDashboard();
        
        // Clear URL param
        window.history.replaceState({}, '', '/admin');
      }
    } catch (error: unknown) {
      toast({
        variant: "destructive",
        title: "Error",
        description: getErrorMessage(error) || "Failed to update product",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const cancelEdit = () => {
    setEditingProductId(null);
    setProductName("");
    setProductCategory("");
    setProductColor("");
    setProductGender("");
    setProductBrandId("");
    setProductDescription("");
    setProductImageUrl("");
    setSelectedStores([]);
    setCurrentStore("");
    setCurrentStorePrice("");
    window.history.replaceState({}, '', '/admin');
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedStores.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one store",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    try {
      // Calculate average price for the main product record
      const avgPrice = selectedStores.reduce((sum, store) => sum + store.price, 0) / selectedStores.length;

      const createData = {
        name: productName,
        price: avgPrice,
        type: productCategory,
        category: productCategory,
        color: productColor,
        gender: productGender || null,
        brand_id: productBrandId || null,
        description: productDescription || null,
        image_url: productImageUrl,
        stores: selectedStores.map(store => ({
          store_id: store.store_id,
          price: store.price
        }))
      };

      // Try NEW format first: Create ONE product with multiple stores.
      // NOTE: productService throws on HTTP errors; don't rely on { success: false } envelopes.
      try {
        const result: unknown = await productService.createProduct(createData);

        if (isRecord(result) && result.success === false) {
          const apiError = typeof result.error === "string" ? result.error : undefined;
          throw new Error(apiError || "Failed to create product");
        }

        toast({
          title: "Success",
          description: `Product created and added to ${selectedStores.length} store(s)!`,
        });

        // Reset form
        setEditingProductId(null);
        setProductName("");
        setProductCategory("");
        setProductColor("");
        setProductGender("");
        setProductBrandId("");
        setProductDescription("");
        setProductImageUrl("");
        setSelectedStores([]);
        setCurrentStore("");
        setCurrentStorePrice("");
        refetchDashboard();

        // Clear URL param if editing
        window.history.replaceState({}, '', '/admin');
        return;
      } catch (err: unknown) {
        const message = getErrorMessage(err);
        const looksLikeMultiStoreNotSupported =
          /stores|store_id|product_stores/i.test(message);

        if (!looksLikeMultiStoreNotSupported) {
          throw err;
        }

        console.warn('⚠️ Backend doesn\'t support multi-store format, using fallback...', message);

        // OLD FORMAT: Create separate product for each store
        const results = await Promise.allSettled(
          selectedStores.map(async (store) => {
            const fallbackData = {
              name: productName,
              price: store.price,
              store_price: store.price,
              type: productCategory,
              category: productCategory,
              color: productColor,
              gender: productGender || null,
              brand_id: productBrandId || null,
              description: productDescription || null,
              image_url: productImageUrl,
              store_id: store.store_id,
            };
            return await productService.createProduct(fallbackData);
          })
        );

        const successCount = results.filter((r) => {
          if (r.status !== 'fulfilled') return false;
          const value: unknown = r.value;
          return !(isRecord(value) && value.success === false);
        }).length;

        if (successCount > 0) {
          toast({
            title: "Success",
            description: `Product created in ${successCount} store(s) using fallback`,
          });

          // Reset form
          setEditingProductId(null);
          setProductName("");
          setProductCategory("");
          setProductColor("");
          setProductGender("");
          setProductBrandId("");
          setProductDescription("");
          setProductImageUrl("");
          setSelectedStores([]);
          setCurrentStore("");
          setCurrentStorePrice("");
          refetchDashboard();

          // Clear URL param if editing
          window.history.replaceState({}, '', '/admin');
        } else {
          console.error('❌ All fallback attempts failed');
          throw new Error('Failed to create products in any store');
        }
      }
      
      // Clear URL param if editing
      window.history.replaceState({}, '', '/admin');
    } catch (error: unknown) {
      toast({
        variant: "destructive",
        title: "Error",
        description: getErrorMessage(error) || "Failed to create product",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const loadStoreForEdit = (store: unknown) => {
    if (!isRecord(store)) return;
    setEditingStore(store);
    setStoreName(typeof store.name === "string" ? store.name : "");
    setStoreTelegram(typeof store.telegram_url === "string" ? store.telegram_url : "");
    setStoreInstagram(typeof store.instagram_url === "string" ? store.instagram_url : "");
    setStoreTiktok(typeof store.tiktok_url === "string" ? store.tiktok_url : "");
    setStoreShipping(typeof store.shipping_info === "string" ? store.shipping_info : "");
    setStoreLogoUrl(typeof store.logo_url === "string" ? store.logo_url : "");
    setStoreRecommended(Boolean(store.is_recommended));
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelStoreEdit = () => {
    setEditingStore(null);
    setStoreName("");
    setStoreTelegram("");
    setStoreInstagram("");
    setStoreTiktok("");
    setStoreShipping("");
    setStoreLogoUrl("");
    setStoreRecommended(false);
  };

  const handleCreateStore = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload = {
        name: storeName,
        telegram_url: storeTelegram || null,
        instagram_url: storeInstagram || null,
        tiktok_url: storeTiktok || null,
        shipping_info: storeShipping || null,
        logo_url: storeLogoUrl || null,
        is_recommended: storeRecommended,
      };

      const editingStoreId = editingStore && typeof editingStore.id === "string" ? editingStore.id : undefined;
      if (editingStore && !editingStoreId) {
        throw new Error("Invalid store id");
      }

      const result: unknown = editingStoreId
        ? await storeService.updateStore(editingStoreId, payload)
        : await storeService.createStore(payload);

      if (isRecord(result) && result.success === false) {
        const apiError = typeof result.error === "string" ? result.error : undefined;
        throw new Error(apiError || `Failed to ${editingStore ? 'update' : 'create'} store`);
      }

      {
        toast({
          title: "Success",
          description: editingStore ? "Store updated successfully" : "Store created successfully",
        });
        // Reset form
        setEditingStore(null);
        setStoreName("");
        setStoreTelegram("");
        setStoreInstagram("");
        setStoreTiktok("");
        setStoreShipping("");
        setStoreLogoUrl("");
        setStoreRecommended(false);
        refetchDashboard();
      }
    } catch (error: unknown) {
      toast({
        variant: "destructive",
        title: "Error",
        description: getErrorMessage(error) || `Failed to ${editingStore ? 'update' : 'create'} store`,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <Navigation />
      
      {/* Header */}
      <section className="relative pt-28 pb-12 border-b border-border/30">
        <div className="absolute inset-0 opacity-30 pointer-events-none overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-foreground/5 rounded-full blur-[120px]" />
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border/50 bg-card/30 backdrop-blur-sm mb-6">
            <ShieldCheck className="w-4 h-4" />
            <span className="text-xs text-foreground tracking-wider uppercase font-medium">{t('admin.title')}</span>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-bold mb-3">
            {t('admin.dashboard')}
          </h1>
          <p className="text-lg text-muted-foreground">
            {t('admin.manageProducts')}, {t('admin.manageStores')}, and marketplace content
          </p>
        </div>
      </section>

      {/* Admin Tabs */}
      <section className="py-6 md:py-12 overflow-visible">
        <div className="container mx-auto px-4 md:px-6 overflow-visible">
          <Tabs defaultValue="add-product" className="max-w-6xl mx-auto overflow-visible" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="flex w-full overflow-x-auto md:grid md:grid-cols-5 bg-card/40 border border-border/50 backdrop-blur-sm mb-4 md:mb-8 p-1 rounded-xl gap-1">
              <TabsTrigger 
                value="add-product"
                className="flex-shrink-0 data-[state=active]:bg-foreground data-[state=active]:text-background rounded-lg transition-all text-xs md:text-sm px-3 py-2.5 min-h-[44px]"
              >
                <Plus className="w-4 h-4 md:mr-2" />
                <span className="hidden md:inline ml-1">{t('admin.addProduct')}</span>
                <span className="md:hidden ml-1">{t('admin.add')}</span>
              </TabsTrigger>
              <TabsTrigger 
                value="manage-products"
                className="flex-shrink-0 data-[state=active]:bg-foreground data-[state=active]:text-background rounded-lg transition-all text-xs md:text-sm px-3 py-2.5 min-h-[44px]"
              >
                <Package className="w-4 h-4 md:mr-2" />
                <span className="hidden md:inline ml-1">{t('common.products')} ({products.length})</span>
                <span className="md:hidden ml-1">{t('admin.list')}</span>
              </TabsTrigger>
              <TabsTrigger 
                value="stores"
                className="flex-shrink-0 data-[state=active]:bg-foreground data-[state=active]:text-background rounded-lg transition-all text-xs md:text-sm px-3 py-2.5 min-h-[44px]"
              >
                <Store className="w-4 h-4 md:mr-2" />
                <span className="hidden md:inline ml-1">{t('admin.stores')}</span>
                <span className="md:hidden ml-1">{t('admin.stores')}</span>
              </TabsTrigger>
              <TabsTrigger 
                value="brands"
                className="flex-shrink-0 data-[state=active]:bg-foreground data-[state=active]:text-background rounded-lg transition-all text-xs md:text-sm px-3 py-2.5 min-h-[44px]"
              >
                <Package className="w-4 h-4 md:mr-2" />
                <span className="hidden md:inline ml-1">{t('admin.brands')}</span>
                <span className="md:hidden ml-1">{t('admin.brands')}</span>
              </TabsTrigger>
              <TabsTrigger 
                value="contacts"
                className="flex-shrink-0 data-[state=active]:bg-foreground data-[state=active]:text-background rounded-lg transition-all text-xs md:text-sm px-3 py-2.5 min-h-[44px]"
              >
                <Package className="w-4 h-4 md:mr-2" />
                <span className="hidden md:inline ml-1">{t('admin.contacts')}</span>
                <span className="md:hidden ml-1">{t('admin.contact')}</span>
              </TabsTrigger>
            </TabsList>

            {/* ADD/EDIT PRODUCT TAB */}
            <TabsContent value="add-product" className="space-y-4 md:space-y-8">
              {/* Add/Edit Product Form */}
              <div className="p-4 md:p-8 rounded-xl md:rounded-2xl border border-border/50 bg-card/40 backdrop-blur-sm overflow-visible">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="font-display text-lg md:text-2xl font-bold flex items-center gap-2">
                    {editingProductId ? <Edit className="w-4 h-4 md:w-6 md:h-6" /> : <Plus className="w-4 h-4 md:w-6 md:h-6" />}
                    {editingProductId ? 'Edit Product' : 'Add New Product'}
                </h2>
                  {editingProductId && (
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={cancelEdit}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      Cancel Edit
                    </Button>
                  )}
                </div>
                <p className="text-muted-foreground mb-6">
                  {editingProductId ? 'Update product information and prices' : 'Create a new product with multiple stores and prices'}
                </p>

                <form onSubmit={editingProductId ? handleUpdateProduct : handleCreateProduct} className="space-y-6 overflow-visible">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 overflow-visible">
                    <div className="space-y-2">
                      <Label>{t('admin.productName')}</Label>
                      <Input
                        value={productName}
                        onChange={(e) => setProductName(e.target.value)}
                        placeholder={t('admin.productNamePlaceholder')}
                        required
                        className="h-12 bg-card/50 border-border/50 rounded-lg"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Category *</Label>
                      <Combobox
                        value={productCategory}
                        onValueChange={setProductCategory}
                        placeholder={t('admin.categoryPlaceholder')}
                        searchPlaceholder="Search category..."
                        items={[
                          { value: 'jackets', label: getCategoryTranslation('jackets') },
                          { value: 'hoodies', label: getCategoryTranslation('hoodies') },
                          { value: 'T-shirts', label: getCategoryTranslation('T-shirts') },
                          { value: 'pants', label: getCategoryTranslation('pants') },
                          { value: 'jeans', label: getCategoryTranslation('jeans') },
                          { value: 'shorts', label: getCategoryTranslation('shorts') },
                          { value: 'shoes', label: getCategoryTranslation('shoes') },
                          { value: 'accessories', label: getCategoryTranslation('accessories') },
                        ]}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>{t('admin.color')}</Label>
                      <Combobox
                        value={productColor}
                        onValueChange={setProductColor}
                        placeholder={t('admin.colorPlaceholder')}
                        searchPlaceholder="Search color..."
                        items={COLORS.map(color => ({ value: color, label: color }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>{t('admin.gender')}</Label>
                      <Combobox
                        value={productGender}
                        onValueChange={setProductGender}
                        placeholder={t('admin.genderPlaceholder')}
                        searchPlaceholder="Search gender..."
                        items={[
                          { value: 'men', label: t('admin.men') },
                          { value: 'women', label: t('admin.women') },
                          { value: 'unisex', label: t('admin.unisex') },
                        ]}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Brand (Optional)</Label>
                      <Combobox
                        value={productBrandId || "none"}
                        onValueChange={(value) => setProductBrandId(value === "none" ? "" : value)}
                        placeholder={t('admin.brandPlaceholder')}
                        searchPlaceholder="Search brand..."
                        items={[
                          { value: 'none', label: 'No Brand' },
                          ...brands.map(brand => ({ value: brand.id, label: brand.name })),
                        ]}
                      />
                    </div>

                  </div>

                  {/* Store Selection Section */}
                  <div className="space-y-4 p-6 rounded-xl border border-border/50 bg-card/20 overflow-visible">
                    <Label className="text-lg font-semibold">{t('admin.addStorePrice')}</Label>
                    <p className="text-sm text-muted-foreground">
                      {t('admin.manageStores')}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-2 space-y-2">
                        <Label>{t('admin.storeName')}</Label>
                        <Combobox
                          value={currentStore}
                          onValueChange={(value) => {
                            setCurrentStore(value);
                            setStoreSearchQuery("");
                          }}
                          placeholder={t('admin.storeNamePlaceholder')}
                          searchPlaceholder={t('admin.searchStores')}
                          searchValue={storeSearchQuery}
                          onSearchChange={setStoreSearchQuery}
                          items={stores
                            .filter(store => !selectedStores.some(s => s.store_id === store.id))
                            .map(store => ({ value: store.name, label: store.name }))}
                          emptyMessage="No stores found"
                          className="pl-10"
                        />
                        <Search className="absolute left-3 top-10 w-4 h-4 text-muted-foreground pointer-events-none" />
                      </div>

                      <div className="space-y-2">
                        <Label>{t('admin.price')} ($)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={currentStorePrice}
                          onChange={(e) => setCurrentStorePrice(e.target.value)}
                          placeholder={t('admin.pricePlaceholder')}
                          className="h-12 bg-card/50 border-border/50 rounded-lg"
                        />
                      </div>
                    </div>

                    <Button
                      type="button"
                      onClick={addStoreToProduct}
                      className="w-full md:w-auto bg-primary hover:bg-primary/90 text-primary-foreground"
                      disabled={!currentStore || !currentStorePrice}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      {t('admin.addStore')}
                    </Button>

                    {/* List of added stores */}
                    {selectedStores.length > 0 && (
                      <div className="space-y-2 mt-4">
                        <Label className="text-sm text-muted-foreground">Added Stores ({selectedStores.length})</Label>
                        <div className="space-y-2">
                          {selectedStores.map((store) => (
                            <div
                              key={store.store_id}
                              className="flex items-center justify-between p-3 rounded-lg bg-card/40 border border-border/50"
                            >
                              <div className="flex items-center gap-3">
                                <Store className="w-4 h-4 text-primary" />
                                <div>
                                  <p className="font-medium">{store.store_name}</p>
                                  <p className="text-sm text-muted-foreground">${store.price}</p>
                                </div>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeStoreFromProduct(store.store_id)}
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      value={productDescription}
                      onChange={(e) => setProductDescription(e.target.value)}
                      placeholder="Detailed product description..."
                      className="min-h-24 bg-card/50 border-border/50 rounded-lg"
                    />
                  </div>

                  <div className="space-y-2">
                    <ImageUploader
                      onImageUpload={setProductImageUrl}
                      currentImage={productImageUrl}
                      label="Product Image"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Or paste Image URL directly</Label>
                    <Input
                      placeholder="https://example.com/image.jpg"
                      value={productImageUrl}
                      onChange={(e) => setProductImageUrl(e.target.value)}
                      className="bg-card/50 border-border/50 rounded-lg"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={submitting}
                    className="w-full h-12 bg-foreground text-background hover:bg-foreground/90 hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] rounded-lg font-medium transition-all"
                  >
                    {submitting 
                      ? (editingProductId ? 'Updating Product...' : 'Creating Product...') 
                      : (editingProductId ? 'Update Product' : 'Create Product')
                    }
                  </Button>
                </form>
              </div>

            </TabsContent>

            {/* MANAGE PRODUCTS TAB - List with search and multi-select delete */}
            <TabsContent value="manage-products" className="space-y-6">
              <div className="p-8 rounded-2xl border border-border/50 bg-card/40 backdrop-blur-sm">
                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-6">
                  <div>
                    <h3 className="font-display text-2xl font-bold mb-2">All Products</h3>
                    <p className="text-muted-foreground">{products.length} total products</p>
                  </div>
                  <div className="flex gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search products..."
                        className="pl-10 bg-card/50 border-border/50"
                      />
                    </div>
                  </div>
                </div>
                
                {products.length > 0 ? (
                  <div className="space-y-3">
                    {products.map((product) => (
                      <div
                        key={product.id}
                        className="group flex items-center gap-4 p-4 rounded-xl border border-border/50 bg-card/20 hover:bg-card/40 hover:border-foreground/30 transition-all"
                      >
                        {product.image_url && (
                          <div className="w-20 h-24 rounded-lg overflow-hidden bg-muted/30 flex-shrink-0 border border-border/50">
                            <img
                              src={product.image_url}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-lg mb-1">{product.name}</h4>
                          <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                            <span className="px-2 py-0.5 rounded bg-foreground/10">${product.price}</span>
                            <span className="px-2 py-0.5 rounded bg-foreground/10">{getCategoryTranslation(product.type || product.category)}</span>
                            <span className="px-2 py-0.5 rounded bg-foreground/10">{getColorTranslation(product.color)}</span>
                            {product.brand && <span className="px-2 py-0.5 rounded bg-foreground/10">{product.brand}</span>}
                          </div>
                        </div>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="outline"
                            size="sm"
                            className="hover:bg-foreground/10 border-border/50"
                            onClick={() => {
                              // Fetch fresh product data with stores
                              loadProductForEdit(product.id);
                              // Switch to add-product tab
                              setActiveTab("add-product");
                            }}
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="hover:bg-red-500/20 hover:text-red-400 border-border/50"
                            onClick={async () => {
                              if (window.confirm(`Delete "${product.name}"?`)) {
                                try {
                                  await productService.deleteProduct(product.id);
                                  toast({
                                    title: "Success",
                                    description: "Product deleted",
                                  });
                                  refetchDashboard();
                                } catch (error: unknown) {
                                  toast({
                                    variant: "destructive",
                                    title: "Error",
                                    description: getErrorMessage(error) || "Failed to delete",
                                  });
                                }
                              }
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20 border border-dashed border-border/50 rounded-xl">
                    <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground text-lg mb-2">No products yet</p>
                    <p className="text-sm text-muted-foreground">Create your first product in the Add Product tab</p>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Stores Tab */}
            <TabsContent value="stores" className="space-y-8">
              {/* Create/Edit Store Form */}
              <div className="p-8 rounded-2xl border border-border/50 bg-card/40 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-display text-2xl font-bold flex items-center gap-2">
                    {editingStore ? <Edit className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
                    {editingStore ? 'Edit Store' : 'Add New Store'}
                </h2>
                  {editingStore && (
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={cancelStoreEdit}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      Cancel Edit
                    </Button>
                  )}
                </div>

                <form onSubmit={handleCreateStore} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Store Name</Label>
                      <Input
                        value={storeName}
                        onChange={(e) => setStoreName(e.target.value)}
                        placeholder="Atlas Studio"
                        required
                        className="h-12 bg-card/50 border-border/50 rounded-lg"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Telegram URL</Label>
                      <Input
                        value={storeTelegram}
                        onChange={(e) => setStoreTelegram(e.target.value)}
                        placeholder="https://t.me/storename"
                        className="h-12 bg-card/50 border-border/50 rounded-lg"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Instagram URL</Label>
                      <Input
                        value={storeInstagram}
                        onChange={(e) => setStoreInstagram(e.target.value)}
                        placeholder="https://instagram.com/storename"
                        className="h-12 bg-card/50 border-border/50 rounded-lg"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>TikTok URL</Label>
                      <Input
                        value={storeTiktok}
                        onChange={(e) => setStoreTiktok(e.target.value)}
                        placeholder="https://tiktok.com/@storename"
                        className="h-12 bg-card/50 border-border/50 rounded-lg"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Shipping Info</Label>
                      <Input
                        value={storeShipping}
                        onChange={(e) => setStoreShipping(e.target.value)}
                        placeholder="Worldwide shipping"
                        className="h-12 bg-card/50 border-border/50 rounded-lg"
                      />
                    </div>
                    
                    {/* Store Logo Field */}
                    <div className="space-y-2 md:col-span-2">
                      <Label>Store Logo (Optional)</Label>
                      <ImageUploader
                        onImageUpload={(url) => setStoreLogoUrl(url)}
                        currentImage={storeLogoUrl}
                        label=""
                      />
                      <Input
                        value={storeLogoUrl}
                        onChange={(e) => setStoreLogoUrl(e.target.value)}
                        placeholder="Or paste image URL"
                        className="h-12 bg-card/50 border-border/50 rounded-lg mt-2"
                      />
                    </div>

                    {/* Recommended Checkbox */}
                    <div className="space-y-2 md:col-span-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="recommended"
                          checked={storeRecommended}
                          onCheckedChange={(checked) => setStoreRecommended(checked as boolean)}
                          className="border-foreground/20 data-[state=checked]:bg-purple-500 data-[state=checked]:text-white"
                        />
                        <Label htmlFor="recommended" className="cursor-pointer">
                          ⭐ Recommended Store (Featured)
                        </Label>
                      </div>
                      <p className="text-sm text-muted-foreground ml-6">
                        Mark this store as recommended/verified to feature it prominently on the platform
                      </p>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={submitting}
                    className="w-full h-12 bg-foreground text-background hover:bg-foreground/90 hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] rounded-lg font-medium transition-all"
                  >
                    {submitting ? (editingStore ? 'Updating...' : 'Creating...') : (editingStore ? 'Update Store' : 'Create Store')}
                  </Button>
                </form>
              </div>

              {/* Stores List */}
              <div className="p-8 rounded-2xl border border-border/50 bg-card/40 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-display text-xl font-bold">
                    All Stores ({stores.length})
                  </h3>
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search stores..."
                      value={storeSearchQuery}
                      onChange={(e) => setStoreSearchQuery(e.target.value)}
                      className="h-10 pl-10 bg-card/50 border-border/50 rounded-lg"
                    />
                  </div>
                </div>
                
                {stores.filter(store => 
                  store.name.toLowerCase().includes(storeSearchQuery.toLowerCase())
                ).length > 0 ? (
                  <div className="space-y-4">
                    {stores.filter(store => 
                      store.name.toLowerCase().includes(storeSearchQuery.toLowerCase())
                    ).map((store) => (
                      <div
                        key={store.id}
                        className="flex items-center gap-4 p-4 rounded-lg border border-border/50 bg-card/20 hover:bg-card/40 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold">{store.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {store.shipping_info || 'No shipping info'}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="hover:bg-white/10 hover:text-white border border-white/20"
                            onClick={() => loadStoreForEdit(store)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="hover:bg-red-500/20 hover:text-red-400 border border-white/20"
                            onClick={async () => {
                              if (window.confirm(`Delete "${store.name}"?`)) {
                                try {
                                  await storeService.deleteStore(store.id);
                                  toast({
                                    title: "Success",
                                    description: "Store deleted successfully",
                                  });
                                  refetchDashboard();
                                } catch (error: unknown) {
                                  toast({
                                    variant: "destructive",
                                    title: "Error",
                                    description: getErrorMessage(error) || "Failed to delete store",
                                  });
                                }
                              }
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    No stores yet
                  </div>
                )}
              </div>
            </TabsContent>

            {/* BRANDS TAB - Manage brands */}
            <TabsContent value="brands" className="space-y-8">
              {/* Create Brand Form */}
              <div className="p-8 rounded-2xl border border-border/50 bg-card/40 backdrop-blur-sm">
                <h2 className="font-display text-2xl font-bold mb-6 flex items-center gap-2">
                  <Plus className="w-6 h-6" />
                  Add New Brand
                </h2>

                <form onSubmit={async (e) => {
                  e.preventDefault();
                  const form = e.target as HTMLFormElement;
                  const brandName = (form.elements.namedItem('brandName') as HTMLInputElement).value;
                  
                  if (!brandName.trim()) {
                    toast({
                      variant: "destructive",
                      title: "Error",
                      description: "Brand name is required",
                    });
                    return;
                  }

                  try {
                    await brandsApi.create({ name: brandName });

                    toast({
                      title: "Success",
                      description: "Brand created successfully",
                    });
                    refetchDashboard();
                    (form.elements.namedItem('brandName') as HTMLInputElement).value = '';
                  } catch (error: unknown) {
                    toast({
                      variant: "destructive",
                      title: "Error",
                      description: getErrorMessage(error) || "Failed to create brand",
                    });
                  }
                }} className="space-y-6">
                  <div className="space-y-2">
                    <Label>Brand Name</Label>
                    <Input
                      name="brandName"
                      placeholder="Nike, Adidas, Supreme..."
                      required
                      className="h-12 bg-card/50 border-border/50 rounded-lg"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 bg-foreground text-background hover:bg-foreground/90 hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] rounded-lg font-medium transition-all"
                  >
                    Create Brand
                  </Button>
                </form>
              </div>

              {/* Brands List */}
              <div className="p-8 rounded-2xl border border-border/50 bg-card/40 backdrop-blur-sm">
                <h3 className="font-display text-xl font-bold mb-6">
                  All Brands ({brands.length})
                </h3>
                
                {brands.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {brands.map((brand) => (
                      <div
                        key={brand.id}
                        className="flex items-center justify-between p-4 rounded-lg border border-border/50 bg-card/20 hover:bg-card/40 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold truncate">{brand.name}</h4>
                          <p className="text-xs text-muted-foreground">ID: {brand.id}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="hover:bg-red-500/20 hover:text-red-400 border border-white/20 ml-2"
                          onClick={async () => {
                            if (window.confirm(`Delete brand "${brand.name}"?`)) {
                              try {
                                await brandsApi.delete(brand.id);

                                toast({
                                  title: "Success",
                                  description: "Brand deleted successfully",
                                });
                                refetchDashboard();
                              } catch (error: unknown) {
                                toast({
                                  variant: "destructive",
                                  title: "Error",
                                  description: getErrorMessage(error) || "Failed to delete brand",
                                });
                              }
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    No brands yet
                  </div>
                )}
              </div>
            </TabsContent>

            {/* CONTACTS TAB */}
            <TabsContent value="contacts" className="space-y-6">
              <div className="p-8 rounded-2xl border border-border/50 bg-card/40 backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-foreground/5 flex items-center justify-center">
                    <Package className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Contact Information</h2>
                    <p className="text-sm text-muted-foreground">Manage site contact details displayed in the Contacts dialog</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="contact-telegram">Telegram Username</Label>
                    <Input
                      id="contact-telegram"
                      type="text"
                      placeholder="@wearsearch"
                      value={contactTelegram}
                      onChange={(e) => setContactTelegram(e.target.value)}
                      className="mt-1.5"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Include the @ symbol</p>
                  </div>

                  <div>
                    <Label htmlFor="contact-instagram">Instagram Username</Label>
                    <Input
                      id="contact-instagram"
                      type="text"
                      placeholder="@wearsearch"
                      value={contactInstagram}
                      onChange={(e) => setContactInstagram(e.target.value)}
                      className="mt-1.5"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Include the @ symbol</p>
                  </div>

                  <div>
                    <Label htmlFor="contact-tiktok">TikTok Username</Label>
                    <Input
                      id="contact-tiktok"
                      type="text"
                      placeholder="@wearsearch"
                      value={contactTiktok}
                      onChange={(e) => setContactTiktok(e.target.value)}
                      className="mt-1.5"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Include the @ symbol</p>
                  </div>

                  <div>
                    <Label htmlFor="contact-email">Support Email</Label>
                    <Input
                      id="contact-email"
                      type="email"
                      placeholder="support@wearsearch.com"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      className="mt-1.5"
                    />
                  </div>

                  <Button
                    onClick={() => {
                      setSavingContacts(true);
                      // Save to localStorage for now (later can be saved to backend)
                      localStorage.setItem('site_contacts', JSON.stringify({
                        telegram: contactTelegram,
                        instagram: contactInstagram,
                        tiktok: contactTiktok,
                        email: contactEmail
                      }));
                      setTimeout(() => {
                        setSavingContacts(false);
                        toast({
                          title: "Success",
                          description: "Contact information saved successfully",
                        });
                      }, 500);
                    }}
                    disabled={savingContacts}
                    className="w-full"
                  >
                    {savingContacts ? "Saving..." : "Save Contact Information"}
                  </Button>
                </div>

                <div className="mt-6 p-4 rounded-lg bg-foreground/5 border border-foreground/10">
                  <p className="text-xs text-muted-foreground">
                    💡 <strong>Note:</strong> These contact details will be displayed in the Contacts dialog 
                    accessible from the main navigation menu.
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Admin;

