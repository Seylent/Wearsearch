/**
 * Admin Content - Refactored Component
 * Now uses smaller, focused components and custom hook
 */

'use client';

import { useTranslation } from "react-i18next";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShieldCheck, Plus, Package, Store, BarChart3 } from "lucide-react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useSEO } from "@/hooks/useSEO";
import { useAdmin } from "@/hooks/useAdmin";
import { AddProductForm, ProductList, AnalyticsDashboard } from "@/components/admin";

const AdminContent = () => {
  const { t } = useTranslation();
  const { isAuthenticated, isAdmin } = useAuth();
  const admin = useAdmin();

  useSEO({
    title: t('admin.title'),
    description: t('admin.description'),
    noindex: true,
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <ShieldCheck className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <p className="text-lg mb-4">{t('admin.loginRequired')}</p>
          <p className="text-sm text-muted-foreground">{t('admin.redirecting')}</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <ShieldCheck className="w-16 h-16 mx-auto mb-4 text-destructive" />
          <p className="text-lg mb-4">{t('admin.accessDenied')}</p>
          <p className="text-sm text-muted-foreground">{t('admin.adminOnly')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      {/* Header */}
      <section className="relative py-12 lg:py-24 overflow-hidden">
        <div className="container mx-auto px-4 md:px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border/50 bg-card/30 backdrop-blur-sm mb-4 lg:mb-8">
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
          <Tabs 
            defaultValue="add-product" 
            className="max-w-6xl mx-auto overflow-visible" 
            value={admin.activeTab} 
            onValueChange={admin.setActiveTab}
          >
            <TabsList className="flex w-full overflow-x-auto md:grid md:grid-cols-4 bg-card/40 border border-border/50 backdrop-blur-sm mb-4 md:mb-8 p-1 rounded-xl gap-1">
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
                <span className="hidden md:inline ml-1">{t('common.products')} ({admin.products.length})</span>
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
                value="analytics"
                className="flex-shrink-0 data-[state=active]:bg-foreground data-[state=active]:text-background rounded-lg transition-all text-xs md:text-sm px-3 py-2.5 min-h-[44px]"
              >
                <BarChart3 className="w-4 h-4 md:mr-2" />
                <span className="hidden md:inline ml-1">Analytics</span>
                <span className="md:hidden ml-1">Stats</span>
              </TabsTrigger>
            </TabsList>

            {/* ADD/EDIT PRODUCT TAB */}
            <TabsContent value="add-product" className="space-y-4 md:space-y-8 overflow-visible">
              <AddProductForm
                // Form data
                editingProductId={admin.editingProductId}
                productName={admin.productName}
                productCategory={admin.productCategory}
                productColor={admin.productColor}
                productGender={admin.productGender}
                productBrandId={admin.productBrandId}
                productDescription={admin.productDescription}
                productImageUrl={admin.productImageUrl}
                productImages={admin.productImages}
                primaryImageIndex={admin.primaryImageIndex}
                publishAt={admin.publishAt}
                unpublishAt={admin.unpublishAt}
                productStatus={admin.productStatus}
                
                // Store management
                selectedStores={admin.selectedStores}
                currentStore={admin.currentStore}
                currentStorePrice={admin.currentStorePrice}
                currentStoreSizes={admin.currentStoreSizes}
                currentSizeInput={admin.currentSizeInput}
                
                // Templates
                savedTemplates={admin.savedTemplates}
                showTemplates={admin.showTemplates}
                
                // Data
                stores={admin.stores}
                brands={admin.brands}
                
                // Handlers
                onProductNameChange={admin.setProductName}
                onProductCategoryChange={admin.setProductCategory}
                onProductColorChange={admin.setProductColor}
                onProductGenderChange={admin.setProductGender}
                onProductBrandIdChange={admin.setProductBrandId}
                onProductDescriptionChange={admin.setProductDescription}
                onProductImageUrlChange={admin.setProductImageUrl}
                onProductImagesChange={admin.setProductImages}
                onPrimaryImageIndexChange={admin.setPrimaryImageIndex}
                onPublishAtChange={admin.setPublishAt}
                onUnpublishAtChange={admin.setUnpublishAt}
                onProductStatusChange={admin.setProductStatus}
                
                // Store handlers
                onCurrentStoreChange={admin.setCurrentStore}
                onCurrentStorePriceChange={admin.setCurrentStorePrice}
                onCurrentSizeInputChange={admin.setCurrentSizeInput}
                onAddSize={admin.addSize}
                onRemoveSize={admin.removeSize}
                onAddStore={admin.addStore}
                onRemoveStore={admin.removeStore}
                
                // Template handlers
                onSaveAsTemplate={admin.saveAsTemplate}
                onLoadTemplate={admin.loadTemplate}
                onDeleteTemplate={admin.deleteTemplate}
                onToggleTemplates={() => admin.setShowTemplates(!admin.showTemplates)}
                
                // Submit
                onSubmit={admin.handleProductSubmit}
                submitting={admin.submitting}
              />
            </TabsContent>

            {/* MANAGE PRODUCTS TAB */}
            <TabsContent value="manage-products" className="space-y-6 overflow-visible">
              <ProductList
                products={admin.products}
                stores={admin.stores}
                brands={admin.brands}
                searchProducts={admin.searchProducts}
                onSearchProductsChange={admin.setSearchProducts}
                viewMode={admin.viewMode}
                onViewModeChange={admin.setViewMode}
                isSelectMode={admin.isSelectMode}
                selectedProductIds={admin.selectedProductIds}
                onToggleSelectMode={admin.toggleSelectMode}
                onToggleProductSelection={admin.toggleProductSelection}
                onSelectAllProducts={admin.selectAllProducts}
                onEditProduct={(product) => {
                  // Load product for editing and switch to add-product tab
                  admin.setEditingProductId(product.id);
                  admin.setActiveTab("add-product");
                }}
                onDeleteProduct={(product) => {
                  // TODO: Implement delete product
                  console.log('Delete product:', product);
                }}
                onBulkDelete={() => {
                  // TODO: Implement bulk delete
                  console.log('Bulk delete:', admin.selectedProductIds);
                }}
                onExportToCSV={() => {
                  // TODO: Implement CSV export
                  console.log('Export CSV');
                }}
                onExportToJSON={() => {
                  // TODO: Implement JSON export
                  console.log('Export JSON');
                }}
                onDownloadTemplate={() => {
                  // TODO: Implement template download
                  console.log('Download template');
                }}
                loadingExport={admin.loadingExport}
                resetFilters={() => admin.setSearchProducts("")}
              />
            </TabsContent>

            {/* STORES TAB - TODO: Extract to separate component */}
            <TabsContent value="stores" className="space-y-8 overflow-visible">
              <div className="p-8 rounded-2xl border border-border/50 bg-card/40 backdrop-blur-sm">
                <h2 className="font-display text-2xl font-bold mb-4">Store Management</h2>
                <p className="text-muted-foreground">Store management functionality will be implemented here.</p>
              </div>
            </TabsContent>

            {/* ANALYTICS TAB */}
            <TabsContent value="analytics" className="space-y-6">
              <AnalyticsDashboard
                analytics={admin.analytics}
                showPriceHistory={admin.showPriceHistory}
                onTogglePriceHistory={() => admin.setShowPriceHistory(!admin.showPriceHistory)}
                loadingPriceHistory={admin.loadingPriceHistory}
                selectedProductForHistory={admin.selectedProductForHistory}
                onSelectProductForHistory={admin.setSelectedProductForHistory}
                priceHistory={admin.priceHistory}
                showActivityLog={admin.showActivityLog}
                onToggleActivityLog={() => admin.setShowActivityLog(!admin.showActivityLog)}
                loadingActivityLog={admin.loadingActivityLog}
                activityLog={admin.activityLog}
                products={admin.products}
              />
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </div>
  );
};

export default AdminContent;

type NormalizedProductStore = {
  store_id: string;
  store_name: string;
  price: number;
  sizes: string[];
  stores?: unknown;
};

const normalizeProductStoreEntry = (store: unknown): NormalizedProductStore | null => {
  if (!isRecord(store)) return null;

  const storesObj =
    (isRecord(store.stores) ? store.stores : undefined) ??
    (isRecord(store.store) ? store.store : undefined);

  const storeId =
    (typeof store.store_id === "string" ? store.store_id : undefined) ??
    (typeof store.id === "string" ? store.id : undefined) ??
    (storesObj && typeof storesObj.id === "string" ? storesObj.id : undefined);

  if (!storeId) return null;

  const storeName =
    (typeof store.store_name === "string" ? store.store_name : undefined) ??
    (typeof store.name === "string" ? store.name : undefined) ??
    (storesObj && typeof storesObj.name === "string" ? storesObj.name : undefined) ??
    "Unknown Store";

  const storePrice = store.price ?? store.store_price ?? store.product_price;
  const price = typeof storePrice === "number" ? storePrice : Number(storePrice || 0);

  return {
    store_id: storeId,
    store_name: storeName,
    price,
    sizes: Array.isArray(store.sizes) ? (store.sizes as string[]) : [],
    stores: storesObj ?? { id: storeId, name: storeName },
  };
};

const Admin = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const { toast } = useToast();
  const { isAdmin, isAuthenticated, isLoading: authLoading } = useAuth();
  const didInitRef = useRef(false);

  const normalizeCategoryValue = useCallback((raw: unknown): string => {
    if (typeof raw !== "string") return "";
    const value = raw.trim();
    if (!value) return "";

    const lower = value.toLowerCase();
    const normalized = lower.replaceAll(/\s+/g, "");
    if (normalized.replaceAll(/[^a-z]/g, "") === "tshirts") return "T-shirts";

    const canonical: Record<string, string> = {
      jackets: "jackets",
      hoodies: "hoodies",
      pants: "pants",
      jeans: "jeans",
      shorts: "shorts",
      shoes: "shoes",
      accessories: "accessories",
    };

    return canonical[lower] ?? value;
  }, []);

  useSEO({
    title: 'Admin',
    description: 'Admin dashboard for managing marketplace content.',
    keywords: 'admin, dashboard',
    type: 'website',
    noindex: true,
  });
  
  // State for dashboard data
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [_isLoadingDashboard, setIsLoadingDashboard] = useState(true);
  
  // Load dashboard data using new API
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

  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      loadDashboard();
    }
  }, [isAuthenticated, isAdmin, loadDashboard]);

  const refetchDashboard = loadDashboard;
  
  // Normalize data from new API format
  const products = useMemo(() => {
    return dashboardData?.products?.items || [];
  }, [dashboardData]);
  
  const stores = useMemo(() => {
    return dashboardData?.stores?.items || [];
  }, [dashboardData]);
  
  const brands = useMemo(() => {
    return dashboardData?.brands?.items || [];
  }, [dashboardData]);
  
  // Product form state - always initialize with empty string to avoid controlled/uncontrolled issues
  const [productName, setProductName] = useState("");
  const [productCategory, setProductCategory] = useState("");
  const [productColor, setProductColor] = useState("");
  const [productGender, setProductGender] = useState("");
  const [productBrandId, setProductBrandId] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [productImageUrl, setProductImageUrl] = useState("");
  const [productImages, setProductImages] = useState<string[]>([]);
  const [primaryImageIndex, setPrimaryImageIndex] = useState<number>(0);
  
  // Templates state
  const [savedTemplates, setSavedTemplates] = useState<Array<{id: string, name: string, data: any}>>([]); 
  const [showTemplates, setShowTemplates] = useState(false);
  
  // Inventory/Stock state
  const [showStockManagement, setShowStockManagement] = useState(false);
  const [stockData, setStockData] = useState<Record<string, Record<string, number>>>({});
  
  // Scheduled publishing state
  const [publishAt, setPublishAt] = useState<string>("");
  const [unpublishAt, setUnpublishAt] = useState<string>("");
  const [productStatus, setProductStatus] = useState<"draft" | "published">("published");
  
  // Price History state
  const [priceHistory, setPriceHistory] = useState<Record<string, Array<{id: string, store_id: string, store_name: string, price: number, changed_at: string}>>>({});
  const [showPriceHistory, setShowPriceHistory] = useState(false);
  const [selectedProductForHistory, setSelectedProductForHistory] = useState<string | null>(null);
  
  // Activity Log state
  const [activityLog, setActivityLog] = useState<Array<{id: string, entity_type: string, entity_id: string, action: string, changes: any, user_name: string, created_at: string}>>([]);
  const [showActivityLog, setShowActivityLog] = useState(false);
  
  // Product Relations state
  const [productRelations, setProductRelations] = useState<Record<string, Array<{type: string, related_id: string}>>>({});
  const [showRelations, setShowRelations] = useState(false);
  const [selectedProductForRelations, setSelectedProductForRelations] = useState<string | null>(null);
  
  // Multi-store selection state
  const [selectedStores, setSelectedStores] = useState<Array<{ store_id: string; store_name: string; price: number; sizes: string[] }>>([]);
  const [currentStore, setCurrentStore] = useState("");
  const [currentStorePrice, setCurrentStorePrice] = useState("");
  const [currentStoreSizes, setCurrentStoreSizes] = useState<string[]>([]);
  const [currentSizeInput, setCurrentSizeInput] = useState("");
  const [storeSearchQuery, setStoreSearchQuery] = useState("");
  
  // Editing state for ProductΓåöStore rows (sizes/price)
  const [editingProductStore, setEditingProductStore] = useState<{store_id: string; price: number; sizes: string[]} | null>(null);
  const [editingProductStoreSizeInput, setEditingProductStoreSizeInput] = useState("");

  // Editing state for Store entity (Stores tab)
  const [editingStore, setEditingStore] = useState<Record<string, unknown> | null>(null);
  
  // Editing state (for tracking which product is being edited)
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  
  // Bulk operations state
  const [selectedProductIds, setSelectedProductIds] = useState<Set<string>>(new Set());
  const [isSelectMode, setIsSelectMode] = useState(false);
  
  // Preview state
  const [previewProduct, setPreviewProduct] = useState<any>(null);
  
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategories, setFilterCategories] = useState<Set<string>>(new Set());
  const [filterBrands, setFilterBrands] = useState<Set<string>>(new Set());
  const [priceRangeMin, setPriceRangeMin] = useState<number>(0);
  const [priceRangeMax, setPriceRangeMax] = useState<number>(1000);
  const [sortBy, setSortBy] = useState<"name" | "price-asc" | "price-desc" | "newest">("newest");
  const [viewMode, setViewMode] = useState<"card" | "table">("card");
  const [savedFilters, setSavedFilters] = useState<Array<{name: string, filters: any}>>([]); 
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  
  // Import file state
  const importFileRef = useRef<HTMLInputElement>(null);
  
  // Loading states for API calls
  const [loadingExport, setLoadingExport] = useState(false);
  const [loadingImport, setLoadingImport] = useState(false);
  const [loadingPriceHistory, setLoadingPriceHistory] = useState(false);
  const [loadingActivityLog, setLoadingActivityLog] = useState(false);
  const [loadingRelations, setLoadingRelations] = useState(false);
  
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
    setProductName(typeof product.name === "string" ? product.name : "");

    const rawCategory = product.type ?? product.category ?? "";
    const categoryValue = normalizeCategoryValue(rawCategory);
    setProductCategory(categoryValue);
    setProductColor(typeof product.color === "string" ? product.color : "");
    setProductGender(typeof product.gender === "string" ? product.gender : "");
    setProductBrandId(typeof product.brand_id === "string" ? product.brand_id : "");
    setProductDescription(typeof product.description === "string" ? product.description : "");
    setProductImageUrl(typeof product.image_url === "string" ? product.image_url : "");
    
    // Load stores from product_stores
    const productStoresRaw = product.product_stores;
    if (Array.isArray(productStoresRaw) && productStoresRaw.length > 0) {
      const productStores = productStoresRaw
        .map((ps: unknown) => {
          if (!isRecord(ps)) return null;

          const storesObj = isRecord(ps.stores) ? ps.stores : undefined;
          const storeId = typeof ps.store_id === "string" ? ps.store_id : "";
          const storeName =
            (storesObj && typeof storesObj.name === "string" ? storesObj.name : undefined) ??
            (typeof ps.store_name === "string" ? ps.store_name : undefined) ??
            "Unknown Store";

          const priceRaw = ps.price ?? (storesObj ? storesObj.price : undefined) ?? 0;
          const price = typeof priceRaw === "number" ? priceRaw : Number(priceRaw || 0);

          const sizes = Array.isArray(ps.sizes) ? (ps.sizes as string[]) : [];

          if (!storeId) return null;
          return { store_id: storeId, store_name: storeName, price, sizes };
        })
        .filter(
          (
            store
          ): store is { store_id: string; store_name: string; price: number; sizes: string[] } => store !== null
        );

      setSelectedStores(productStores);
    } else {
      setSelectedStores([]);
    }
    
    // Store product ID for update
    const normalizedProductId = normalizeId(product.id);
    if (normalizedProductId) setEditingProductId(normalizedProductId);
    
    // Switch to "Add Product" tab (which is now dual-purpose)
    setActiveTab("add-product");
    
    // Scroll to form
    globalThis.scrollTo({ top: 0, behavior: "smooth" });
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
        getRecord(productResult, "data")?.item ||
        (isRecord(productResult) ? productResult.data : undefined) ||
        (isRecord(productResult) ? productResult.product : undefined) ||
        productResult;

      if (!isRecord(productDataCandidate)) return;
      const productData: Record<string, unknown> = { ...productDataCandidate };

      // Merge stores from the dedicated stores endpoint with the product detail payload.
      // Some backends return richer data (like `sizes`) only in one of these responses.
      const rawFromProduct = Array.isArray(productDataCandidate.product_stores)
        ? (productDataCandidate.product_stores as unknown[])
        : [];

      let rawFromEndpoint: unknown[] = [];
      if (storesSettled.status === "fulfilled") {
        const storesValue: unknown = storesSettled.value;
        rawFromEndpoint = getArray(storesValue, "items") ?? (Array.isArray(storesValue) ? storesValue : []);
      }

      if (!productData?.id) return;

      const normalizedFromProduct = rawFromProduct
        .map(normalizeProductStoreEntry)
        .filter((store): store is NormalizedProductStore => store !== null);

      const normalizedFromEndpoint = (Array.isArray(rawFromEndpoint) ? rawFromEndpoint : [])
        .map(normalizeProductStoreEntry)
        .filter((store): store is NormalizedProductStore => store !== null);

      const mergedByStoreId = new Map<string, NormalizedProductStore>();
      for (const entry of normalizedFromProduct) {
        mergedByStoreId.set(entry.store_id, entry);
      }

      for (const entry of normalizedFromEndpoint) {
        const existing = mergedByStoreId.get(entry.store_id);
        if (!existing) {
          mergedByStoreId.set(entry.store_id, entry);
          continue;
        }

        const mergedSizes =
          Array.isArray(existing.sizes) && existing.sizes.length > 0
            ? existing.sizes
            : Array.isArray(entry.sizes)
              ? entry.sizes
              : [];

        const endpointPriceIsValid = Number.isFinite(entry.price) && entry.price > 0;

        mergedByStoreId.set(entry.store_id, {
          ...existing,
          ...entry,
          store_name: entry.store_name || existing.store_name,
          price: endpointPriceIsValid ? entry.price : existing.price,
          sizes: mergedSizes,
        });
      }

      productData.product_stores = Array.from(mergedByStoreId.values());

      editProduct(productData);
    } catch (error_) {
      console.error("Failed to load product for editing", error_);
      toast({
        title: 'Error',
        description: getErrorMessage(error_) || 'Failed to load product for editing',
        variant: 'destructive',
      });
    }
  }, [editProduct, toast]);

  // Auth / access guard
  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      router.push('/auth');
      return;
    }

    if (!isAdmin) {
      toast({
        title: "Access Denied",
        description: "Admin access required",
        variant: "destructive",
      });
      router.push('/');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, isAuthenticated, isAdmin, toast]);

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
      } catch (error_) {
        console.error("Failed to load saved contacts", error_);
      }
    }

    // Check if we should edit a product from URL
    const urlParams = new URLSearchParams(globalThis.location.search);
    const editProductId = urlParams.get('editProduct');
    if (editProductId) {
      loadProductForEdit(editProductId);
    }
  }, [isAdmin, loadProductForEdit]);

  // Keyboard shortcuts
  useEffect(() => {
    const submitActiveForm = () => {
      const form = document.querySelector<HTMLFormElement>("form");
      form?.requestSubmit();
    };

    const focusSearchInput = () => {
      const searchInput = document.querySelector<HTMLInputElement>(
        'input[placeholder*="Search"]'
      );
      searchInput?.focus();
    };

    const cancelProductEdit = () => {
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
      setCurrentStoreSizes([]);
      setCurrentSizeInput("");
      setEditingProductStore(null);
      router.replace("/admin");

      toast({
        title: "Cancelled",
        description: "Product editing cancelled",
      });
    };

    const handleSaveShortcut = (e: KeyboardEvent): boolean => {
      if (!(e.ctrlKey || e.metaKey) || e.key !== "s") return false;
      e.preventDefault();
      if (activeTab === "add-product") submitActiveForm();
      return true;
    };

    const handleEscapeKey = (e: KeyboardEvent): boolean => {
      if (e.key !== "Escape") return false;
      if (editingProductId) cancelProductEdit();
      if (isSelectMode) {
        setIsSelectMode(false);
        setSelectedProductIds(new Set());
      }
      return true;
    };

    const handleSearchShortcut = (e: KeyboardEvent): boolean => {
      if (!(e.ctrlKey || e.metaKey) || e.key !== "k") return false;
      e.preventDefault();
      focusSearchInput();
      return true;
    };

    const handleNewProductShortcut = (e: KeyboardEvent): boolean => {
      if (!(e.ctrlKey || e.metaKey) || e.key !== "n") return false;
      if (activeTab === "add-product") return true;

      e.preventDefault();
      setActiveTab("add-product");
      toast({
        title: "New Product",
        description: "Switched to Add Product tab",
      });
      return true;
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (handleSaveShortcut(e)) return;
      if (handleEscapeKey(e)) return;
      if (handleSearchShortcut(e)) return;
      handleNewProductShortcut(e);
    };

    globalThis.addEventListener("keydown", handleKeyDown);
    return () => globalThis.removeEventListener("keydown", handleKeyDown);
  }, [activeTab, editingProductId, isSelectMode, toast, router]);

  // Auto-save draft to localStorage
  useEffect(() => {
    // Don't save if editing existing product or if form is empty
    if (editingProductId || !productName) return;

    const draft = {
      productName,
      productCategory,
      productColor,
      productGender,
      productBrandId,
      productDescription,
      productImageUrl,
      selectedStores,
      timestamp: Date.now(),
    };

    const timeoutId = setTimeout(() => {
      localStorage.setItem('admin_product_draft', JSON.stringify(draft));
    }, 2000); // Auto-save after 2 seconds of inactivity

    return () => clearTimeout(timeoutId);
  }, [editingProductId, productName, productCategory, productColor, productGender, productBrandId, productDescription, productImageUrl, selectedStores]);

  // Load draft on mount
  useEffect(() => {
    const loadDraft = () => {
      const savedDraft = localStorage.getItem('admin_product_draft');
      if (!savedDraft) return;

      try {
        const draft = JSON.parse(savedDraft);
        const age = Date.now() - draft.timestamp;
        
        // Only load draft if less than 24 hours old
        if (age > 24 * 60 * 60 * 1000) {
          localStorage.removeItem('admin_product_draft');
          return;
        }

        // Ask user if they want to restore
        const restore = globalThis.confirm(
          `Found a saved draft from ${new Date(draft.timestamp).toLocaleString()}. Do you want to restore it?`
        );

        if (restore) {
          setProductName(draft.productName || "");
          setProductCategory(draft.productCategory || "");
          setProductColor(draft.productColor || "");
          setProductGender(draft.productGender || "");
          setProductBrandId(draft.productBrandId || "");
          setProductDescription(draft.productDescription || "");
          setProductImageUrl(draft.productImageUrl || "");
          setSelectedStores(
            (Array.isArray(draft.selectedStores) ? draft.selectedStores : []).map((store: any) => ({
              ...store,
              sizes: Array.isArray(store?.sizes) ? store.sizes : [],
            }))
          );
          
          toast({
            title: "Draft Restored",
            description: "Your previous work has been restored",
          });
        } else {
          localStorage.removeItem('admin_product_draft');
        }
      } catch (e) {
        console.error('Failed to load draft:', e);
        localStorage.removeItem('admin_product_draft');
      }
    };

    // Only load draft once on mount
    if (!didInitRef.current && isAdmin) {
      loadDraft();
    }
  }, [isAdmin, toast]);

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
        price: Number.parseFloat(currentStorePrice),
        sizes: [...currentStoreSizes]
      }
    ]);

    // Reset current selection
    setCurrentStore("");
    setCurrentStorePrice("");
    setCurrentStoreSizes([]);
    setCurrentSizeInput("");
  };

  const addSize = () => {
    const next = currentSizeInput.trim();
    if (!next) return;

    setCurrentStoreSizes((prev) => (prev.includes(next) ? prev : [...prev, next]));
    setCurrentSizeInput("");
  };

  const removeSize = (size: string) => {
    setCurrentStoreSizes((prev) => prev.filter((s) => s !== size));
  };

  const startEditingStore = (storeId: string) => {
    const store = selectedStores.find(s => s.store_id === storeId);
    if (store) {
      setEditingProductStore({ store_id: storeId, price: store.price, sizes: store.sizes || [] });
      setEditingProductStoreSizeInput("");
    }
  };

  const commitEditingProductStoreSizeInput = useCallback(() => {
    const next = editingProductStoreSizeInput.trim();
    if (!next) return;
    setEditingProductStore((current) => {
      if (!current) return current;
      if (current.sizes.includes(next)) return current;
      return { ...current, sizes: [...current.sizes, next] };
    });
    setEditingProductStoreSizeInput("");
  }, [editingProductStoreSizeInput]);

  const verifySizesPersisted = useCallback(
    async (productId: string, expected: Array<{ store_id: string; sizes: string[] }>) => {
      const expectedWithSizes = expected.filter((s) => Array.isArray(s.sizes) && s.sizes.length > 0);
      if (expectedWithSizes.length === 0) return;

      try {
        const productUnknown: unknown = await productService.getProductById(productId);
        if (!isRecord(productUnknown)) return;

        const productStoresRaw: unknown = productUnknown.product_stores;
        const normalized = Array.isArray(productStoresRaw)
          ? productStoresRaw
              .map(normalizeProductStoreEntry)
              .filter((store): store is NormalizedProductStore => store !== null)
          : [];

        const byId = new Map(normalized.map((s) => [s.store_id, s] as const));
        const missing = expectedWithSizes.filter((s) => {
          const got = byId.get(s.store_id);
          return !got || !Array.isArray(got.sizes) || got.sizes.length === 0;
        });

        if (missing.length > 0) {
          toast({
            variant: "destructive",
            title: "╨á╨╛╨╖╨╝╤û╤Ç╨╕ ╨╜╨╡ ╨╖╨▒╨╡╤Ç╨╡╨╢╨╡╨╜╤û",
            description:
              "╨í╤à╨╛╨╢╨╡, ╨▒╨╡╨║╨╡╨╜╨┤ ╨╜╨╡ ╨╖╨▒╨╡╤Ç╤û╨│╨░╤ö ╨░╨▒╨╛ ╨╜╨╡ ╨┐╨╛╨▓╨╡╤Ç╤é╨░╤ö ╨┐╨╛╨╗╨╡ sizes ╨┤╨╗╤Å ╨╖╨▓ΓÇÖ╤Å╨╖╨║╤â ╨┐╤Ç╨╛╨┤╤â╨║╤éΓåö╨╝╨░╨│╨░╨╖╨╕╨╜. ╨ª╨╡ ╨┐╨╛╤é╤Ç╤û╨▒╨╜╨╛ ╨┤╨╛╨┤╨░╤é╨╕ ╨╜╨░ ╨▒╨╡╨║╨╡╨╜╨┤╤û.",
          });
        }
      } catch (e) {
        if (process.env.NODE_ENV !== 'production') console.debug("verifySizesPersisted failed", e);
      }
    },
    [toast]
  );

  const saveStoreEdit = async () => {
    if (!editingProductStore) return;

    // If user typed a size but didn't press Enter, commit it before saving.
    commitEditingProductStoreSizeInput();

    const nextSelectedStores = selectedStores.map((store) =>
      store.store_id === editingProductStore.store_id
        ? { ...store, price: editingProductStore.price, sizes: editingProductStore.sizes }
        : store
    );

    setSelectedStores(nextSelectedStores);
    setEditingProductStore(null);

    // If editing an existing product, persist immediately.
    if (!editingProductId) {
      toast({
        title: "╨ù╨╝╤û╨╜╨╕ ╨╖╨░╤ü╤é╨╛╤ü╨╛╨▓╨░╨╜╨╛",
        description: "╨⌐╨╛╨▒ ╨╖╨▒╨╡╤Ç╨╡╨│╤é╨╕ ╨╜╨░ ╤ü╨╡╤Ç╨▓╨╡╤Ç╤û, ╨╜╨░╤é╨╕╤ü╨╜╤û╤é╤î ┬½╨í╤é╨▓╨╛╤Ç╨╕╤é╨╕ ╨┐╤Ç╨╛╨┤╤â╨║╤é┬╗ / ┬½╨₧╨╜╨╛╨▓╨╕╤é╨╕ ╨┐╤Ç╨╛╨┤╤â╨║╤é┬╗.",
      });
      return;
    }

    setSubmitting(true);
    try {
      const avgPrice = nextSelectedStores.reduce((sum, store) => sum + store.price, 0) / nextSelectedStores.length;
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
        stores: nextSelectedStores.map((store) => ({
          store_id: store.store_id,
          price: store.price,
          sizes: store.sizes || [],
        })),
      };

      if (process.env.NODE_ENV !== 'production') {
        console.debug("Auto-saving product stores (sizes)", { productId: editingProductId, updateData });
      }

      await productService.updateProduct(editingProductId, updateData);
      await verifySizesPersisted(
        editingProductId,
        nextSelectedStores.map((s) => ({ store_id: s.store_id, sizes: s.sizes || [] }))
      );

      toast({
        title: "╨ù╨▒╨╡╤Ç╨╡╨╢╨╡╨╜╨╛",
        description: "╨á╨╛╨╖╨╝╤û╤Ç╨╕/╤å╤û╨╜╨░ ╨┤╨╗╤Å ╤å╤î╨╛╨│╨╛ ╨╝╨░╨│╨░╨╖╨╕╨╜╤â ╨╖╨▒╨╡╤Ç╨╡╨╢╨╡╨╜╤û.",
      });
    } catch (e) {
      toast({
        variant: "destructive",
        title: "╨ƒ╨╛╨╝╨╕╨╗╨║╨░",
        description: getErrorMessage(e) || "╨¥╨╡ ╨▓╨┤╨░╨╗╨╛╤ü╤Å ╨╖╨▒╨╡╤Ç╨╡╨│╤é╨╕ ╨╖╨╝╤û╨╜╨╕",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const cancelStoreEdit = () => {
    setEditingProductStore(null);
    setEditingProductStoreSizeInput("");
  };

  const cancelStoreEntityEdit = () => {
    setEditingStore(null);
    setStoreName("");
    setStoreTelegram("");
    setStoreInstagram("");
    setStoreTiktok("");
    setStoreShipping("");
    setStoreLogoUrl("");
    setStoreRecommended(false);
  };

  // ===== TEMPLATES FUNCTIONS =====
  
  // Load templates from API on mount
  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const response = await advancedApi.getTemplates();
        if (response?.templates || Array.isArray(response)) {
          setSavedTemplates(response.templates || response);
        }
      } catch (error) {
        console.error("Failed to load templates from API, using localStorage fallback", error);
        // Fallback to localStorage
        const saved = localStorage.getItem('admin_product_templates');
        if (saved) {
          try {
            setSavedTemplates(JSON.parse(saved));
          } catch (e) {
            console.error("Failed to load templates", e);
          }
        }
      }
    };
    
    loadTemplates();
  }, []);

  // Save current product as template
  const saveAsTemplate = async () => {
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
      const response = await advancedApi.createTemplate(templateData);
      const template = response.template || response;
      setSavedTemplates([...savedTemplates, template]);
      
      toast({
        title: "Γ£à Template Saved",
        description: `Template "${templateName}" saved to database`,
      });
    } catch (error) {
      console.error("API save failed, using localStorage", error);
      // Fallback to localStorage
      const template = {
        id: Date.now().toString(),
        name: templateName,
        data: templateData.template_data
      };
      const updated = [...savedTemplates, template];
      setSavedTemplates(updated);
      localStorage.setItem('admin_product_templates', JSON.stringify(updated));
      
      toast({
        title: "Template Saved (Offline)",
        description: `Template "${templateName}" saved locally`,
      });
    }
  };

  // Load template into form
  const loadTemplate = (template: any) => {
    const data = template.template_data || template.data || template;
    setProductCategory(data.category || "");
    setProductColor(data.color || "");
    setProductGender(data.gender || "");
    setProductBrandId(data.brand_id || "");
    setProductDescription(data.description || "");

    toast({
      title: "Template Loaded",
      description: `Applied "${template.name}" template`,
    });
    
    setShowTemplates(false);
  };

  // Delete template
  const deleteTemplate = async (templateId: string) => {
    if (!confirm("Delete this template?")) return;
    
    try {
      await advancedApi.deleteTemplate(templateId);
      const updated = savedTemplates.filter(t => t.id !== templateId);
      setSavedTemplates(updated);
      
      toast({
        title: "Γ£à Template Deleted",
        description: "Template removed from database",
      });
    } catch (error) {
      console.error("API delete failed, using localStorage", error);
      // Fallback to localStorage
      const updated = savedTemplates.filter(t => t.id !== templateId);
      setSavedTemplates(updated);
      localStorage.setItem('admin_product_templates', JSON.stringify(updated));
      
      toast({
        title: "Template Deleted (Offline)",
        description: "Template removed locally",
      });
    }
  };

  // ===== STOCK MANAGEMENT FUNCTIONS =====

  // Load stock data from localStorage (mock until backend ready)
  useEffect(() => {
    const saved = localStorage.getItem('admin_stock_data');
    if (saved) {
      try {
        setStockData(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load stock data", e);
      }
    }
    
    // Load price history
    const savedHistory = localStorage.getItem('admin_price_history');
    if (savedHistory) {
      try {
        setPriceHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Failed to load price history", e);
      }
    }
    
    // Load activity log
    const savedLog = localStorage.getItem('admin_activity_log');
    if (savedLog) {
      try {
        setActivityLog(JSON.parse(savedLog));
      } catch (e) {
        console.error("Failed to load activity log", e);
      }
    }
    
    // Load product relations
    const savedRelations = localStorage.getItem('admin_product_relations');
    if (savedRelations) {
      try {
        setProductRelations(JSON.parse(savedRelations));
      } catch (e) {
        console.error("Failed to load product relations", e);
      }
    }
  }, []);

  // Update stock for product/store
  const updateStock = (productId: string, storeId: string, stock: number) => {
    const existing = stockData[productId];
    const updated = {
      ...stockData,
      [productId]: existing ? { ...existing, [storeId]: stock } : { [storeId]: stock },
    };
    setStockData(updated);
    localStorage.setItem('admin_stock_data', JSON.stringify(updated));

    toast({
      title: "Stock Updated",
      description: `Stock set to ${stock} units`,
    });
  };

  // Get stock for product/store
  const getStock = (productId: string, storeId: string): number => {
    return stockData[productId]?.[storeId] || 0;
  };

  // Check low stock (threshold: 10)
  const isLowStock = (productId: string, storeId: string): boolean => {
    const stock = getStock(productId, storeId);
    return stock > 0 && stock < 10;
  };

  // ===== PRICE HISTORY FUNCTIONS =====
  
  // Load price history from API for a specific product
  const loadPriceHistoryFromAPI = async (productId: string) => {
    setLoadingPriceHistory(true);
    try {
      const response = await advancedApi.getPriceHistory(productId);
      const history = response.history || [];
      setPriceHistory(prev => ({
        ...prev,
        [productId]: history.map((h: any) => ({
          id: h.id?.toString() || Date.now().toString(),
          store_id: h.store_id,
          store_name: h.store_name,
          price: Number.parseFloat(h.price),
          changed_at: h.changed_at,
        }))
      }));
    } catch (error) {
      console.error("Failed to load price history from API", error);
      // Keep localStorage data as fallback
    } finally {
      setLoadingPriceHistory(false);
    }
  };
  
  const getPriceHistory = (productId: string, storeId?: string) => {
    const history = priceHistory[productId] || [];
    if (storeId) {
      return history.filter(h => h.store_id === storeId);
    }
    return history;
  };

  // ===== ACTIVITY LOG FUNCTIONS =====
  
  // Load activity log from API
  const loadActivityLogFromAPI = async (limit: number = 50) => {
    setLoadingActivityLog(true);
    try {
      const response = await advancedApi.getActivityLog({ limit });
      const logs = response.logs || [];
      setActivityLog(logs.map((log: any) => ({
        id: log.id?.toString() || Date.now().toString(),
        entity_type: log.entity_type,
        entity_id: log.entity_id,
        action: log.action,
        changes: log.changes,
        user_name: log.user_email || log.user_name || "Admin",
        created_at: log.created_at,
      })));
    } catch (error) {
      console.error("Failed to load activity log from API", error);
      // Keep localStorage data as fallback
    } finally {
      setLoadingActivityLog(false);
    }
  };
  
  // ===== PRODUCT RELATIONS FUNCTIONS =====
  
  // Load relations from API for a specific product
  const loadRelationsFromAPI = async (productId: string) => {
    setLoadingRelations(true);
    try {
      const response = await advancedApi.getRelatedProducts(productId);
      const relations = response.relations || [];
      setProductRelations(prev => ({
        ...prev,
        [productId]: relations.map((r: any) => ({
          id: r.id?.toString(),
          type: r.relation_type,
          related_id: r.related_product?.id || r.related_id,
        }))
      }));
    } catch (error) {
      console.error("Failed to load relations from API", error);
    } finally {
      setLoadingRelations(false);
    }
  };
  
  const addRelatedProduct = async (productId: string, relatedId: string, type: 'similar' | 'bundle' | 'frequently_bought') => {
    if (productId === relatedId) {
      toast({ title: "Error", description: "Cannot relate product to itself", variant: "destructive" });
      return;
    }
    
    const existing = productRelations[productId] || [];
    const alreadyExists = existing.some(r => r.related_id === relatedId && r.type === type);
    
    if (alreadyExists) {
      toast({ title: "Already exists", description: "This relation already exists", variant: "destructive" });
      return;
    }
    
    setLoadingRelations(true);
    try {
      const response = await advancedApi.addProductRelation(productId, {
        related_id: relatedId,
        relation_type: type,
      });
      
      const relationId = response.id || Date.now().toString();
      const updated = {
        ...productRelations,
        [productId]: [...existing, { id: relationId, type, related_id: relatedId }]
      };
      
      setProductRelations(updated);
      
      toast({
        title: "Γ£à Related Product Added",
        description: `Added ${type} relation`,
      });
    } catch (error) {
      console.error("Failed to add relation", error);
      // Fallback to localStorage
      const updated = {
        ...productRelations,
        [productId]: [...existing, { type, related_id: relatedId }]
      };
      setProductRelations(updated);
      localStorage.setItem('admin_product_relations', JSON.stringify(updated));
      
      toast({
        title: "Related Product Added (Offline)",
        description: `Added ${type} relation locally`,
      });
    } finally {
      setLoadingRelations(false);
    }
  };
  
  const removeRelatedProduct = async (productId: string, relatedId: string, type: string) => {
    const existing = productRelations[productId] || [];
    const relation = existing.find(r => r.related_id === relatedId && r.type === type);
    
    setLoadingRelations(true);
    try {
      if (relation?.id) {
        await advancedApi.deleteProductRelation(productId, relation.id);
      }
      
      const updated = {
        ...productRelations,
        [productId]: existing.filter(r => !(r.related_id === relatedId && r.type === type))
      };
      
      setProductRelations(updated);
      
      toast({
        title: "Γ£à Relation Removed",
        description: "Related product removed",
      });
    } catch (error) {
      console.error("Failed to remove relation", error);
      // Fallback to localStorage
      const updated = {
        ...productRelations,
        [productId]: existing.filter(r => !(r.related_id === relatedId && r.type === type))
      };
      setProductRelations(updated);
      localStorage.setItem('admin_product_relations', JSON.stringify(updated));
      
      toast({
        title: "Relation Removed (Offline)",
        description: "Related product removed locally",
      });
    } finally {
      setLoadingRelations(false);
    }
  };
  
  const getRelatedProducts = (productId: string, type?: string) => {
    const relations = productRelations[productId] || [];
    if (type) {
      return relations.filter(r => r.type === type);
    }
    return relations;
  };

  const removeStoreFromProduct = (storeId: string) => {
    setSelectedStores(selectedStores.filter(s => s.store_id !== storeId));
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingProductId) return;

    const effectiveStores = editingProductStore
      ? selectedStores.map((store) =>
          store.store_id === editingProductStore.store_id
            ? { ...store, price: editingProductStore.price, sizes: editingProductStore.sizes }
            : store
        )
      : selectedStores;

    if (effectiveStores.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one store",
        variant: "destructive",
      });
      return;
    }

    // Keep UI state consistent in case user submits without pressing "Save" in the store row.
    if (editingProductStore) {
      setSelectedStores(effectiveStores);
      setEditingProductStore(null);
    }

    setSubmitting(true);

    try {
      const avgPrice = effectiveStores.reduce((sum, store) => sum + store.price, 0) / effectiveStores.length;

      const updateData = {
        name: productName,
        price: avgPrice,
        type: productCategory,
        color: productColor,
        gender: productGender || undefined,
        brand_id: productBrandId || undefined,
        description: productDescription || undefined,
        image_url: productImageUrl || undefined,
        stores: effectiveStores.map(store => ({
          store_id: store.store_id,
          price: store.price,
          sizes: store.sizes || []
        }))
      };

      const result = await adminApi.updateProduct(editingProductId, updateData);

      if (result.success) {
        toast({
          title: "Success",
          description: result.message || `Product and ${effectiveStores.length} store(s) updated successfully!`,
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
        setCurrentStoreSizes([]);
        setCurrentSizeInput("");
        setEditingProductStore(null);
        refetchDashboard();
        
        // Clear URL param
        router.replace("/admin");
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
    setCurrentStoreSizes([]);
    setCurrentSizeInput("");
    setEditingStore(null);
    router.replace("/admin");
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    const effectiveStores = editingProductStore
      ? selectedStores.map((store) =>
          store.store_id === editingProductStore.store_id
            ? { ...store, price: editingProductStore.price, sizes: editingProductStore.sizes }
            : store
        )
      : selectedStores;

    if (effectiveStores.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one store",
        variant: "destructive",
      });
      return;
    }

    if (editingProductStore) {
      setSelectedStores(effectiveStores);
      setEditingProductStore(null);
    }

    setSubmitting(true);

    try {
      // Calculate average price for the main product record
      const avgPrice = effectiveStores.reduce((sum, store) => sum + store.price, 0) / effectiveStores.length;

      const createData = {
        name: productName,
        price: avgPrice,
        type: productCategory,
        color: productColor,
        gender: productGender || undefined,
        brand_id: productBrandId || undefined,
        description: productDescription || undefined,
        image_url: productImageUrl || undefined,
        stores: effectiveStores.map(store => ({
          store_id: store.store_id,
          price: store.price,
          sizes: store.sizes || []
        }))
      };

      // Use new admin API
      const result = await adminApi.createProduct(createData);

      if (result.success) {
        triggerConfetti();
        toast({
          title: "Success",
          description: result.message || `Product created and added to ${effectiveStores.length} store(s)!`,
        });

        // Clear saved draft
        localStorage.removeItem('admin_product_draft');

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
        setCurrentStoreSizes([]);
        setCurrentSizeInput("");
        setEditingProductStore(null);
        refetchDashboard();

        // Clear URL param if editing
        router.replace("/admin");
      }
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
    globalThis.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Bulk operations functions
  const toggleSelectMode = () => {
    setIsSelectMode(!isSelectMode);
    setSelectedProductIds(new Set());
  };

  const toggleProductSelection = (productId: string) => {
    const newSelected = new Set(selectedProductIds);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
    } else {
      newSelected.add(productId);
    }
    setSelectedProductIds(newSelected);
  };

  const selectAllProducts = () => {
    setSelectedProductIds(new Set(products.map(p => p.id)));
  };

  const deselectAllProducts = () => {
    setSelectedProductIds(new Set());
  };

  const handleBulkDelete = async () => {
    if (selectedProductIds.size === 0) return;

    const confirmed = globalThis.confirm(
      `Are you sure you want to delete ${selectedProductIds.size} product(s)? This action cannot be undone.`
    );

    if (!confirmed) return;

    setSubmitting(true);
    let successCount = 0;
    let errorCount = 0;

    try {
      const deletePromises = Array.from(selectedProductIds).map(async (id) => {
        try {
          await adminApi.deleteProduct(id);
          successCount++;
        } catch (error) {
          console.error(`Failed to delete product ${id}:`, error);
          errorCount++;
        }
      });

      await Promise.all(deletePromises);

      const errorSuffix = errorCount > 0 ? ` ${errorCount} failed.` : "";

      toast({
        title: "Bulk Delete Complete",
        description: `Successfully deleted ${successCount} product(s).${errorSuffix}`,
      });

      setSelectedProductIds(new Set());
      setIsSelectMode(false);
      refetchDashboard();
    } catch (error) {
      console.error("Failed to complete bulk delete operation", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to complete bulk delete operation",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Filter and sort products
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = [...products];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(query) ||
        (p.description?.toLowerCase().includes(query) ?? false) ||
        (p.brand?.toLowerCase().includes(query) ?? false)
      );
    }

    // Multi-select Category filter
    if (filterCategories.size > 0) {
      filtered = filtered.filter(p => {
        const category = normalizeCategoryValue(p.type || p.category);
        return filterCategories.has(category.toLowerCase());
      });
    }

    // Multi-select Brand filter
    if (filterBrands.size > 0) {
      filtered = filtered.filter(p => filterBrands.has(p.brand_id));
    }

    // Price range filter
    if (priceRangeMin > 0 || priceRangeMax < 1000) {
      filtered = filtered.filter(p => p.price >= priceRangeMin && p.price <= priceRangeMax);
    }

    // Sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "price-asc":
          return a.price - b.price;
        case "price-desc":
          return b.price - a.price;
        case "newest":
        default:
          return 0;
      }
    });

    return filtered;
  }, [products, searchQuery, filterCategories, filterBrands, priceRangeMin, priceRangeMax, sortBy, normalizeCategoryValue]);

  const resetFilters = () => {
    setSearchQuery("");
    setFilterCategories(new Set());
    setFilterBrands(new Set());
    setPriceRangeMin(0);
    setPriceRangeMax(1000);
    setSortBy("newest");
  };

  // Save current filter preset
  const saveFilterPreset = () => {
    const presetName = prompt("Enter filter preset name:");
    if (!presetName) return;

    const preset = {
      name: presetName,
      filters: {
        searchQuery,
        filterCategories: Array.from(filterCategories),
        filterBrands: Array.from(filterBrands),
        priceRangeMin,
        priceRangeMax,
        sortBy
      }
    };

    const updated = [...savedFilters, preset];
    setSavedFilters(updated);
    localStorage.setItem('admin_filter_presets', JSON.stringify(updated));

    toast({
      title: "Filter Preset Saved",
      description: `Saved as "${presetName}"`,
    });
  };

  // Load filter preset
  const loadFilterPreset = (preset: any) => {
    setSearchQuery(preset.filters.searchQuery || "");
    setFilterCategories(new Set(preset.filters.filterCategories || []));
    setFilterBrands(new Set(preset.filters.filterBrands || []));
    setPriceRangeMin(preset.filters.priceRangeMin || 0);
    setPriceRangeMax(preset.filters.priceRangeMax || 1000);
    setSortBy(preset.filters.sortBy || "newest");

    toast({
      title: "Filter Preset Loaded",
      description: `Applied "${preset.name}"`,
    });
  };

  // Load saved presets on mount
  useEffect(() => {
    const saved = localStorage.getItem('admin_filter_presets');
    if (saved) {
      try {
        setSavedFilters(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load filter presets", e);
      }
    }
  }, []);

  // Toggle category selection
  const toggleCategory = (category: string) => {
    const newSet = new Set(filterCategories);
    if (newSet.has(category)) {
      newSet.delete(category);
    } else {
      newSet.add(category);
    }
    setFilterCategories(newSet);
  };

  // Toggle brand selection
  const toggleBrand = (brandId: string) => {
    const newSet = new Set(filterBrands);
    if (newSet.has(brandId)) {
      newSet.delete(brandId);
    } else {
      newSet.add(brandId);
    }
    setFilterBrands(newSet);
  };

  // Export to CSV - using backend API
  const exportToCSV = async () => {
    setLoadingExport(true);
    try {
      // Get selected IDs or all filtered products
      const ids = selectedProductIds.size > 0 
        ? Array.from(selectedProductIds) 
        : filteredAndSortedProducts.map(p => p.id);
      
      const blob = await advancedApi.exportProducts('csv', ids);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      
      link.setAttribute("href", url);
      link.setAttribute("download", `products_export_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);

      toast({
        title: "Γ£à Export Successful",
        description: `Exported ${ids.length} products to CSV from backend`,
      });
    } catch (error) {
      console.error("API export failed, using local fallback", error);
      // Fallback to local export
      try {
        const headers = ["ID", "Name", "Category", "Brand", "Price", "Color", "Gender", "Description", "Image URL", "Stores"];
        const csvData = filteredAndSortedProducts.map(product => {
          const brand = brands.find(b => b.id === product.brand_id);
          const storesData = product.stores?.map((s: any) => `${s.store_name}:${s.price}`).join("; ") || "";
          
          return [
            product.id,
            `"${product.name.replaceAll('"', '""')}"`,
            product.type || product.category || "",
            brand?.name || "",
            product.price,
            product.color || "",
            product.gender || "",
            `"${(product.description || "").replaceAll('"', '""')}"`,
            product.image_url || "",
            `"${storesData}"`
          ].join(",");
        });

        const csv = [headers.join(","), ...csvData].join("\n");
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        
        link.setAttribute("href", url);
        link.setAttribute("download", `products_export_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        link.remove();

        toast({
          title: "Export Successful (Offline)",
          description: `Exported ${filteredAndSortedProducts.length} products to CSV locally`,
        });
      } catch (fallbackError) {
        toast({
          variant: "destructive",
          title: "Export Failed",
          description: getErrorMessage(fallbackError),
        });
      }
    } finally {
      setLoadingExport(false);
    }
  };

  // Export to JSON - using backend API
  const exportToJSON = async () => {
    setLoadingExport(true);
    try {
      const ids = selectedProductIds.size > 0 
        ? Array.from(selectedProductIds) 
        : filteredAndSortedProducts.map(p => p.id);
      
      const blob = await advancedApi.exportProducts('json', ids);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      
      link.setAttribute("href", url);
      link.setAttribute("download", `products_export_${new Date().toISOString().split('T')[0]}.json`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);

      toast({
        title: "Γ£à Export Successful",
        description: `Exported ${ids.length} products to JSON from backend`,
      });
    } catch (error) {
      console.error("API export failed, using local fallback", error);
      // Fallback to local export
      try {
        const exportData = filteredAndSortedProducts.map(product => {
          const brand = brands.find(b => b.id === product.brand_id);
          return {
            id: product.id,
            name: product.name,
            category: product.type || product.category,
            brand: brand?.name || "",
            brand_id: product.brand_id,
            price: product.price,
            color: product.color,
            gender: product.gender,
            description: product.description,
            image_url: product.image_url,
            stores: product.stores || []
          };
        });

        const json = JSON.stringify(exportData, null, 2);
        const blob = new Blob([json], { type: "application/json" });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        
        link.setAttribute("href", url);
        link.setAttribute("download", `products_export_${new Date().toISOString().split('T')[0]}.json`);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        link.remove();

        toast({
          title: "Export Successful (Offline)",
          description: `Exported ${filteredAndSortedProducts.length} products to JSON locally`,
        });
      } catch (fallbackError) {
        toast({
          variant: "destructive",
          title: "Export Failed",
          description: getErrorMessage(fallbackError),
        });
      }
    } finally {
      setLoadingExport(false);
    }
  };

  // Download CSV Template
  const downloadTemplate = () => {
    const headers = ["Name", "Category", "Brand Name", "Price", "Color", "Gender", "Description", "Image URL", "Stores (StoreName:Price; ...)"];
    const exampleRow = [
      "Nike Air Max 90",
      "sneakers",
      "Nike",
      "150.00",
      "white",
      "unisex",
      "Classic sneakers with comfortable fit",
      "https://example.com/image.jpg",
      "Store1:150.00; Store2:145.00"
    ];

    const csv = [
      headers.join(","),
      exampleRow.map(cell => `"${cell}"`).join(",")
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    
    link.setAttribute("href", url);
    link.setAttribute("download", "product_import_template.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    link.remove();

    toast({
      title: "Template Downloaded",
      description: "Use this template to prepare your import file",
    });
  };

  const tryImportProductsViaApi = async (file: File) => {
    try {
      return await advancedApi.importProducts(file);
    } catch (error_) {
      console.error("API import failed, using local fallback", error_);
      return null;
    }
  };

  const parseCsvRow = (row: string): string[] => {
    return row
      .split(/,(?=(?:[^"]*["[^"]*["])*[^"]*$)/)
      .map((value) => {
        const trimmed = value.trim();
        if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
          return trimmed.slice(1, -1).replaceAll('""', '"').trim();
        }
        return trimmed;
      });
  };

  const findBrandId = (brandName: string | undefined): string => {
    if (!brandName) return "";
    const existingBrand = brands.find(
      (brand) => brand.name.toLowerCase() === brandName.toLowerCase()
    );
    return existingBrand?.id ?? "";
  };

  const parseStoresList = (storesData: string | undefined) => {
    const storesList: Array<{ store_id: string; store_name: string; price: number }> = [];
    if (!storesData) return storesList;

    const storeEntries = storesData
      .split(";")
      .map((s) => s.trim())
      .filter(Boolean);

    for (const entry of storeEntries) {
      const [storeName, storePrice] = entry.split(":").map((s) => s.trim());
      const store = stores.find((s) => s.name.toLowerCase() === storeName.toLowerCase());
      if (store && storePrice) {
        storesList.push({
          store_id: store.id,
          store_name: store.name,
          price: Number.parseFloat(storePrice),
        });
      }
    }

    return storesList;
  };

  const importSingleCsvRow = async (row: string) => {
    const [name, category, brandName, price, color, gender, description, imageUrl, storesData] =
      parseCsvRow(row);

    if (!name || !price) return "skipped" as const;

    await productService.createProduct({
      name,
      type: category || "other",
      category: category || "other",
      brand_id: findBrandId(brandName),
      price: Number.parseFloat(price),
      color: color || "",
      gender: gender || "unisex",
      description: description || "",
      image_url: imageUrl || "",
      stores: parseStoresList(storesData),
    });

    return "success" as const;
  };

  const importProductsViaCsvFallback = async (file: File) => {
    const text = await file.text();
    const lines = text.split("\n").filter((line) => line.trim());
    if (lines.length < 2) {
      throw new Error("File is empty or invalid");
    }

    const rows = lines.slice(1);
    let successCount = 0;
    let errorCount = 0;

    for (const row of rows) {
      try {
        const result = await importSingleCsvRow(row);
        if (result === "success") successCount++;
        else errorCount++;
      } catch (rowError) {
        console.error("Failed to import row:", rowError);
        errorCount++;
      }
    }

    return { successCount, errorCount };
  };

  // Import from CSV - using backend API
  const handleImportCSV = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoadingImport(true);
    try {
      const response = await tryImportProductsViaApi(file);
      if (response) {
        const failureSuffix = response.failed > 0 ? ` ${response.failed} failed.` : "";
        toast({
          title: "Γ£à Import Complete",
          description: `Successfully imported ${response.imported} product(s).${failureSuffix}`,
        });
        refetchDashboard();
        return;
      }

      const { successCount, errorCount } = await importProductsViaCsvFallback(file);
      const failureSuffix = errorCount > 0 ? ` ${errorCount} failed.` : "";
      toast({
        title: "Import Complete (Offline)",
        description: `Successfully imported ${successCount} product(s).${failureSuffix}`,
      });
      refetchDashboard();
    } catch (error_) {
      toast({
        variant: "destructive",
        title: "Import Failed",
        description: getErrorMessage(error_),
      });
    } finally {
      setLoadingImport(false);
      if (importFileRef.current) {
        importFileRef.current.value = "";
      }
    }
  };

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

    const prices = products.map(p => p.price);
    const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    // Count products by category
    const categoriesCount: Record<string, number> = {};
    products.forEach(p => {
      const cat = normalizeCategoryValue(p.type || p.category);
      categoriesCount[cat] = (categoriesCount[cat] || 0) + 1;
    });

    // Count products by brand
    const brandCount: Record<string, { name: string; count: number }> = {};
    products.forEach(p => {
      if (p.brand_id && p.brand) {
        if (!brandCount[p.brand_id]) {
          brandCount[p.brand_id] = { name: p.brand, count: 0 };
        }
        brandCount[p.brand_id].count++;
      }
    });

    const topBrands = Object.values(brandCount)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalProducts: products.length,
      totalStores: stores.length,
      totalBrands: brands.length,
      avgPrice: Math.round(avgPrice * 100) / 100,
      minPrice,
      maxPrice,
      categoriesCount,
      topBrands,
    };
  }, [products, stores.length, brands.length, normalizeCategoryValue]);

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

      const result = editingStoreId
        ? await adminApi.updateStore(editingStoreId, payload)
        : await adminApi.createStore(payload);

      if (result.success) {
        toast({
          title: "Success",
          description: result.message || (editingStore ? "Store updated successfully" : "Store created successfully"),
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

  const productVerb = editingProductId ? "Update" : "Create";
  const productVerbProgress = editingProductId ? "Updating" : "Creating";
  const productSubmitText = submitting
    ? `${productVerbProgress} Product...`
    : `${productVerb} Product`;

  const storeVerb = editingStore ? "Update" : "Create";
  const storeVerbProgress = editingStore ? "Updating" : "Creating";
  const storeSubmitText = submitting ? `${storeVerbProgress}...` : `${storeVerb} Store`;

  const removeManagedStoreSize = useCallback((sizeToRemove: string) => {
    setEditingProductStore((current) => {
      if (!current) return current;
      return { ...current, sizes: current.sizes.filter((s) => s !== sizeToRemove) };
    });
  }, []);

  const visibleStores = useMemo(() => {
    const query = storeSearchQuery.toLowerCase();
    return stores.filter((store) => store.name.toLowerCase().includes(query));
  }, [stores, storeSearchQuery]);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      
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
            <TabsList className="flex w-full overflow-x-auto md:grid md:grid-cols-6 bg-card/40 border border-border/50 backdrop-blur-sm mb-4 md:mb-8 p-1 rounded-xl gap-1">
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
              <TabsTrigger 
                value="analytics"
                className="flex-shrink-0 data-[state=active]:bg-foreground data-[state=active]:text-background rounded-lg transition-all text-xs md:text-sm px-3 py-2.5 min-h-[44px]"
              >
                <BarChart3 className="w-4 h-4 md:mr-2" />
                <span className="hidden md:inline ml-1">Analytics</span>
                <span className="md:hidden ml-1">Stats</span>
              </TabsTrigger>
            </TabsList>

            {/* ADD/EDIT PRODUCT TAB */}
            <TabsContent value="add-product" className="space-y-4 md:space-y-8 overflow-visible">
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

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 overflow-visible">
                      <div className="md:col-span-2 space-y-2 relative overflow-visible">
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
                        />
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

                    {/* Sizes Section */}
                    <div className="space-y-3 pt-3 border-t border-border/30">
                      <Label className="text-sm font-medium">Available Sizes (Optional)</Label>
                      <div className="flex gap-2">
                        <Input
                          value={currentSizeInput}
                          onChange={(e) => setCurrentSizeInput(e.target.value)}
                          placeholder="Enter size (e.g., S, M, L, XL, 42, 43)"
                          className="flex-1 bg-card/50 border-border/50 rounded-lg"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addSize();
                            }
                          }}
                        />
                        <Button
                          type="button"
                          onClick={addSize}
                          variant="outline"
                          size="sm"
                          disabled={!currentSizeInput.trim()}
                        >
                          Add
                        </Button>
                      </div>
                      
                      {currentStoreSizes.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {currentStoreSizes.map((size) => (
                            <span
                              key={size}
                              className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-xs rounded-full border border-primary/20"
                            >
                              {size}
                              <button
                                type="button"
                                onClick={() => removeSize(size)}
                                className="hover:text-destructive"
                              >
                                ├ù
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
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

                    {/* Batch Add All Stores */}
                    <div className="pt-3 border-t border-border/50">
                      <div className="flex gap-2 items-end">
                        <div className="flex-1 space-y-2">
                          <Label className="text-sm">Batch Add All Remaining Stores</Label>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="Same price for all..."
                            className="bg-card/50 border-border/50"
                            id="batch-price-input"
                          />
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            const batchPriceInput = document.getElementById('batch-price-input') as HTMLInputElement;
                            const batchPrice = Number.parseFloat(batchPriceInput?.value || '0');
                            
                            if (!batchPrice || batchPrice <= 0) {
                              toast({
                                variant: "destructive",
                                title: "Invalid Price",
                                description: "Please enter a valid price",
                              });
                              return;
                            }

                            const remainingStores = stores.filter(
                              store => !selectedStores.some(s => s.store_id === store.id)
                            );

                            if (remainingStores.length === 0) {
                              toast({
                                title: "No Stores",
                                description: "All stores already added",
                              });
                              return;
                            }

                            const newStores = remainingStores.map(store => ({
                              store_id: store.id,
                              store_name: store.name,
                              price: batchPrice,
                              sizes: []
                            }));

                            setSelectedStores([...selectedStores, ...newStores]);
                            
                            if (batchPriceInput) batchPriceInput.value = '';

                            toast({
                              title: "Stores Added",
                              description: `Added ${newStores.length} store(s) with $${batchPrice} price`,
                            });
                          }}
                          className="whitespace-nowrap"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add All ({stores.filter(s => !selectedStores.some(ss => ss.store_id === s.id)).length})
                        </Button>
                      </div>
                    </div>

                    {/* List of added stores */}
                    {selectedStores.length > 0 && (
                      <div className="space-y-2 mt-4">
                        <Label className="text-sm text-muted-foreground">Added Stores ({selectedStores.length})</Label>
                        <div className="space-y-2">
                          {selectedStores.map((store) => (
                            <div
                              key={store.store_id}
                              className="p-3 rounded-lg bg-card/40 border border-border/50"
                            >
                              {editingProductStore?.store_id === store.store_id ? (
                                // Edit mode
                                <div className="space-y-3">
                                  <div className="flex items-center gap-3">
                                    <Store className="w-4 h-4 text-primary flex-shrink-0" />
                                    <p className="font-medium">{store.store_name}</p>
                                  </div>
                                  
                                  <div className="grid grid-cols-1 gap-3">
                                    <div>
                                      <Label className="text-xs text-muted-foreground">Price ($)</Label>
                                      <Input
                                        type="number"
                                        step="0.01"
                                        value={editingProductStore.price}
                                        onChange={(e) => setEditingProductStore({
                                          ...editingProductStore,
                                          price: Number.parseFloat(e.target.value) || 0
                                        })}
                                        className="h-8 bg-card/50 border-border/50"
                                      />
                                    </div>
                                    
                                    <div>
                                      <Label className="text-xs text-muted-foreground">Sizes</Label>
                                      <div className="flex flex-wrap gap-1 mt-1">
                                        {editingProductStore.sizes.map((size) => (
                                          <span
                                            key={size}
                                            className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-primary/10 text-primary text-xs rounded border border-primary/20"
                                          >
                                            {size}
                                            <button
                                              type="button"
                                              onClick={() => removeManagedStoreSize(size)}
                                              className="hover:text-destructive"
                                            >
                                              ├ù
                                            </button>
                                          </span>
                                        ))}
                                        <Input
                                          size="sm"
                                          placeholder="Add size"
                                          className="w-20 h-6 text-xs"
                                          value={editingProductStoreSizeInput}
                                          onChange={(e) => setEditingProductStoreSizeInput(e.target.value)}
                                          onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                              e.preventDefault();
                                              commitEditingProductStoreSizeInput();
                                            }
                                          }}
                                          onBlur={() => commitEditingProductStoreSizeInput()}
                                        />
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div className="flex gap-2">
                                    <Button
                                      type="button"
                                      onClick={saveStoreEdit}
                                      size="sm"
                                      className="text-xs"
                                    >
                                      Save
                                    </Button>
                                    <Button
                                      type="button"
                                      onClick={cancelStoreEdit}
                                      variant="outline"
                                      size="sm"
                                      className="text-xs"
                                    >
                                      Cancel
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                // View mode
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <Store className="w-4 h-4 text-primary" />
                                    <div>
                                      <p className="font-medium">{store.store_name}</p>
                                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <span>${store.price}</span>
                                        {Array.isArray(store.sizes) && store.sizes.length > 0 && (
                                          <>
                                            <span>ΓÇó</span>
                                            <span>Sizes: {store.sizes.join(', ')}</span>
                                          </>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex gap-1">
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => startEditingStore(store.store_id)}
                                      className="text-primary hover:text-primary hover:bg-primary/10 h-8 w-8 p-0"
                                    >
                                      <Edit className="w-3 h-3" />
                                    </Button>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => removeStoreFromProduct(store.store_id)}
                                      className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8 p-0"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </Button>
                                  </div>
                                </div>
                              )}
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

                  {/* Multiple Images Section */}
                  {productImageUrl && productImages.length === 0 && (
                    <div className="p-4 rounded-xl border border-border/50 bg-card/20">
                      <div className="flex items-center justify-between mb-3">
                        <Label className="text-sm font-medium">≡ƒû╝∩╕Å Multiple Images</Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (productImageUrl) {
                              setProductImages([productImageUrl]);
                              toast({
                                title: "Γ£à Multi-Image Enabled",
                                description: "Now you can add more images, reorder them, and set primary.",
                              });
                            }
                          }}
                        >
                          <Images className="w-4 h-4 mr-2" />
                          Enable Multi-Image
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        ≡ƒô╕ Add multiple product images, set primary image, and drag to reorder. First image is primary by default.
                      </p>
                    </div>
                  )}

                  {productImages.length > 0 && (
                    <div className="space-y-3 p-4 rounded-xl border border-border/50 bg-card/20">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium">≡ƒû╝∩╕Å Product Images ({productImages.length})</Label>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setProductImages([]);
                            setPrimaryImageIndex(0);
                            toast({ title: "Multi-Image disabled", description: "Switched back to single image mode." });
                          }}
                          className="h-7 text-xs"
                        >
                          Disable Multi-Image
                        </Button>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        {productImages.map((img, index) => (
                          <div 
                            key={img} 
                            className="relative group cursor-move"
                            draggable
                            onDragStart={(e) => {
                              e.dataTransfer.effectAllowed = 'move';
                              e.dataTransfer.setData('text/plain', index.toString());
                            }}
                            onDragOver={(e) => {
                              e.preventDefault();
                              e.dataTransfer.dropEffect = 'move';
                            }}
                            onDrop={(e) => {
                              e.preventDefault();
                              const fromIndex = Number.parseInt(e.dataTransfer.getData('text/plain'));
                              const toIndex = index;
                              if (fromIndex !== toIndex) {
                                const newImages = [...productImages];
                                const [movedImage] = newImages.splice(fromIndex, 1);
                                newImages.splice(toIndex, 0, movedImage);
                                setProductImages(newImages);
                                // Adjust primary index
                                if (primaryImageIndex === fromIndex) {
                                  setPrimaryImageIndex(toIndex);
                                } else if (fromIndex < primaryImageIndex && toIndex >= primaryImageIndex) {
                                  setPrimaryImageIndex(primaryImageIndex - 1);
                                } else if (fromIndex > primaryImageIndex && toIndex <= primaryImageIndex) {
                                  setPrimaryImageIndex(primaryImageIndex + 1);
                                }
                                toast({ title: "Reordered", description: `Moved image ${fromIndex + 1} to position ${toIndex + 1}` });
                              }
                            }}
                          >
                            <img 
                              src={img} 
                              alt={`Product ${index + 1}`}
                              className={`w-full h-24 object-cover rounded-lg border-2 transition-all ${
                                index === primaryImageIndex ? 'border-primary shadow-lg' : 'border-border/50 hover:border-foreground/30'
                              }`}
                            />
                            {/* Index Badge */}
                            <span className="absolute bottom-1 left-1 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
                              #{index + 1}
                            </span>
                            {/* Primary Badge */}
                            {index === primaryImageIndex && (
                              <span className="absolute top-1 left-1 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded flex items-center gap-1">
                                <Star className="w-3 h-3 fill-current" /> Primary
                              </span>
                            )}
                            {/* Action Buttons */}
                            <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                              {index !== primaryImageIndex && (
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="secondary"
                                  className="h-6 w-6 p-0"
                                  onClick={() => {
                                    setPrimaryImageIndex(index);
                                    toast({ title: "Primary set", description: `Image ${index + 1} is now primary` });
                                  }}
                                  title="Set as Primary"
                                >
                                  <Star className="w-3 h-3" />
                                </Button>
                              )}
                              <Button
                                type="button"
                                size="sm"
                                variant="destructive"
                                className="h-6 w-6 p-0"
                                onClick={() => {
                                  const updated = productImages.filter((_, i) => i !== index);
                                  setProductImages(updated);
                                  if (primaryImageIndex === index) {
                                    setPrimaryImageIndex(0);
                                  } else if (primaryImageIndex > index) {
                                    setPrimaryImageIndex(primaryImageIndex - 1);
                                  }
                                  toast({ title: "Deleted", description: `Image ${index + 1} removed` });
                                }}
                                title="Delete Image"
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                            {/* Move Buttons */}
                            <div className="absolute bottom-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                              {index > 0 && (
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="secondary"
                                  className="h-5 w-5 p-0"
                                  onClick={() => {
                                    const newImages = [...productImages];
                                    [newImages[index - 1], newImages[index]] = [newImages[index], newImages[index - 1]];
                                    setProductImages(newImages);
                                    if (primaryImageIndex === index) setPrimaryImageIndex(index - 1);
                                    else if (primaryImageIndex === index - 1) setPrimaryImageIndex(index);
                                  }}
                                  title="Move Left"
                                >
                                  ΓåÉ
                                </Button>
                              )}
                              {index < productImages.length - 1 && (
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="secondary"
                                  className="h-5 w-5 p-0"
                                  onClick={() => {
                                    const newImages = [...productImages];
                                    [newImages[index], newImages[index + 1]] = [newImages[index + 1], newImages[index]];
                                    setProductImages(newImages);
                                    if (primaryImageIndex === index) setPrimaryImageIndex(index + 1);
                                    else if (primaryImageIndex === index + 1) setPrimaryImageIndex(index);
                                  }}
                                  title="Move Right"
                                >
                                  ΓåÆ
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Paste image URL and press Enter"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              const input = e.currentTarget;
                              if (input.value.trim()) {
                                setProductImages([...productImages, input.value.trim()]);
                                input.value = '';
                                toast({ title: "Image added", description: `Total images: ${productImages.length + 1}` });
                              }
                            }
                          }}
                          className="bg-card/50 border-border/50"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const input = document.querySelector<HTMLInputElement>('input[placeholder="Paste image URL and press Enter"]');
                            if (input?.value.trim()) {
                              setProductImages([...productImages, input.value.trim()]);
                              input.value = '';
                              toast({ title: "Image added", description: `Total images: ${productImages.length + 1}` });
                            }
                          }}
                        >
                          <Plus className="w-4 h-4 mr-1" /> Add
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        ≡ƒÆí <strong>Tip:</strong> Drag images to reorder, or use arrow buttons. Click star to set primary image.
                      </p>
                    </div>
                  )}

                  {/* Scheduled Publishing */}
                  <div className="space-y-4 p-4 rounded-xl border border-border/50 bg-card/20">
                    <Label className="text-sm font-medium">≡ƒôà Scheduled Publishing (Optional)</Label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label className="text-xs">Status</Label>
                        <Combobox
                          value={productStatus}
                          onValueChange={(value) => setProductStatus(value as typeof productStatus)}
                          placeholder="Status"
                          items={[
                            { value: 'draft', label: '≡ƒô¥ Draft' },
                            { value: 'published', label: 'Γ£à Published' },
                          ]}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">Publish At (optional)</Label>
                        <Input
                          type="datetime-local"
                          value={publishAt}
                          onChange={(e) => setPublishAt(e.target.value)}
                          className="bg-card/50 border-border/50"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">Auto Unpublish (optional)</Label>
                        <Input
                          type="datetime-local"
                          value={unpublishAt}
                          onChange={(e) => setUnpublishAt(e.target.value)}
                          className="bg-card/50 border-border/50"
                        />
                      </div>
                    </div>
                    {publishAt && (
                      <p className="text-xs text-muted-foreground">
                        ≡ƒôà Will publish on {new Date(publishAt).toLocaleString()}
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
                    
                    {!editingProductId && (
                      <Button
                        type="button"
                        onClick={saveAsTemplate}
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
                        onClick={() => setShowTemplates(!showTemplates)}
                        variant="ghost"
                        size="sm"
                        className="w-full"
                      >
                        <BookTemplate className="w-4 h-4 mr-2" />
                        {showTemplates ? 'Hide' : 'Show'} Templates ({savedTemplates.length})
                      </Button>
                      
                      {showTemplates && (
                        <div className="mt-3 space-y-2">
                          {savedTemplates.map(template => (
                            <div key={template.id} className="flex items-center gap-2 p-3 rounded-lg bg-card/50 border border-border/50">
                              <button
                                type="button"
                                onClick={() => loadTemplate(template)}
                                className="flex-1 text-left hover:text-primary transition-colors"
                              >
                                <span className="font-medium">{template.name}</span>
                                <p className="text-xs text-muted-foreground">
                                  {template.data.category && getCategoryTranslation(template.data.category)}
                                  {template.data.brand_id && brands.find(b => b.id === template.data.brand_id)?.name && 
                                    ` ΓÇó ${brands.find(b => b.id === template.data.brand_id)?.name}`}
                                </p>
                              </button>
                              <Button
                                type="button"
                                onClick={() => deleteTemplate(template.id)}
                                variant="ghost"
                                size="sm"
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </form>
              </div>

            </TabsContent>

            {/* MANAGE PRODUCTS TAB - List with search and multi-select delete */}
            <TabsContent value="manage-products" className="space-y-6 overflow-visible">
              <div className="p-8 rounded-2xl border border-border/50 bg-card/40 backdrop-blur-sm overflow-visible">
                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-6">
                  <div>
                    <h3 className="font-display text-2xl font-bold mb-2">All Products</h3>
                    <p className="text-muted-foreground">
                      {filteredAndSortedProducts.length} of {products.length} products
                      {isSelectMode && selectedProductIds.size > 0 && (
                        <span className="ml-2 text-primary">ΓÇó {selectedProductIds.size} selected</span>
                      )}
                    </p>
                  </div>
                  <div className="flex gap-3 w-full md:w-auto flex-wrap">
                    {isSelectMode ? (
                      <>
                        <Button
                          onClick={selectAllProducts}
                          variant="outline"
                          size="sm"
                          className="border-border/50"
                        >
                          Select All
                        </Button>
                        <Button
                          onClick={deselectAllProducts}
                          variant="outline"
                          size="sm"
                          className="border-border/50"
                        >
                          Deselect All
                        </Button>
                        <Button
                          onClick={handleBulkDelete}
                          variant="destructive"
                          size="sm"
                          disabled={selectedProductIds.size === 0 || submitting}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete ({selectedProductIds.size})
                        </Button>
                        <Button
                          onClick={toggleSelectMode}
                          variant="ghost"
                          size="sm"
                        >
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <>
                        <div className="flex gap-1 p-1 rounded-lg bg-card/50 border border-border/50">
                          <Button
                            onClick={() => setViewMode("card")}
                            variant={viewMode === "card" ? "default" : "ghost"}
                            size="sm"
                            className="h-8 w-8 p-0"
                          >
                            <LayoutGrid className="h-4 w-4" />
                          </Button>
                          <Button
                            onClick={() => setViewMode("table")}
                            variant={viewMode === "table" ? "default" : "ghost"}
                            size="sm"
                            className="h-8 w-8 p-0"
                          >
                            <TableIcon className="h-4 w-4" />
                          </Button>
                        </div>
                        <button
                          onClick={toggleSelectMode}
                          className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-border/50 bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3"
                        >
                          <Checkbox className="w-4 h-4 mr-2" checked={isSelectMode} />
                          Select
                        </button>
                        <div className="relative flex-1 md:w-64">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Search products..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 bg-card/50 border-border/50"
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Export/Import Row */}
                {!isSelectMode && (
                  <div className="flex flex-wrap gap-3 mb-4 items-center justify-between p-4 rounded-xl border border-border/50 bg-card/20">
                    <div className="flex gap-2">
                      <Button
                        onClick={downloadTemplate}
                        variant="outline"
                        size="sm"
                        className="border-border/50"
                        title="Download CSV Template"
                      >
                        <FileSpreadsheet className="w-4 h-4 mr-2" />
                        Download Template
                      </Button>
                    </div>
                    
                    <div className="flex gap-2">
                      <div className="flex gap-1">
                        <Button
                          onClick={exportToCSV}
                          variant="outline"
                          size="sm"
                          className="border-border/50"
                          title="Export filtered products to CSV"
                          disabled={loadingExport}
                        >
                          {loadingExport ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Download className="w-4 h-4 mr-2" />
                          )}
                          Export CSV ({filteredAndSortedProducts.length})
                        </Button>
                        <Button
                          onClick={exportToJSON}
                          variant="outline"
                          size="sm"
                          className="border-border/50"
                          title="Export filtered products to JSON"
                          disabled={loadingExport}
                        >
                          {loadingExport ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <FileJson className="w-4 h-4 mr-2" />
                          )}
                          Export JSON
                        </Button>
                      </div>
                      
                      <Button
                        onClick={() => importFileRef.current?.click()}
                        variant="default"
                        size="sm"
                        className="bg-primary hover:bg-primary/90"
                        title="Import products from CSV"
                        disabled={loadingImport}
                      >
                        {loadingImport ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Upload className="w-4 h-4 mr-2" />
                        )}
                        {loadingImport ? "Importing..." : "Import CSV"}
                      </Button>
                      <input
                        ref={importFileRef}
                        type="file"
                        accept=".csv"
                        onChange={handleImportCSV}
                        className="hidden"
                      />
                    </div>
                  </div>
                )}

                {/* Filters Row */}
                {!isSelectMode && (
                  <div className="space-y-4 mb-6">
                    {/* Quick Filters */}
                    <div className="flex flex-wrap gap-3 p-4 rounded-xl border border-border/50 bg-card/20">
                      <Combobox
                        value={sortBy}
                        onValueChange={(value) => setSortBy(value as typeof sortBy)}
                        placeholder="Sort by"
                        items={[
                          { value: 'newest', label: 'Γåô Newest' },
                          { value: 'name', label: 'A-Z Name' },
                          { value: 'price-asc', label: 'Γåæ Price Low' },
                          { value: 'price-desc', label: 'Γåô Price High' },
                        ]}
                        className="w-40"
                      />
                      
                      <Button
                        onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                        variant="outline"
                        size="sm"
                        className="border-border/50"
                      >
                        {showAdvancedFilters ? "Hide" : "Show"} Advanced Filters
                      </Button>
                      
                      {(filterCategories.size > 0 || filterBrands.size > 0 || priceRangeMin > 0 || priceRangeMax < 1000 || searchQuery) && (
                        <Button
                          onClick={resetFilters}
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Clear All Filters
                        </Button>
                      )}
                      
                      {savedFilters.length > 0 && (
                        <Combobox
                          value=""
                          onValueChange={(value) => {
                            const preset = savedFilters.find(p => p.name === value);
                            if (preset) loadFilterPreset(preset);
                          }}
                          placeholder="Load Preset"
                          items={savedFilters.map(p => ({ value: p.name, label: p.name }))}
                          className="w-40"
                        />
                      )}
                      
                      {(filterCategories.size > 0 || filterBrands.size > 0 || priceRangeMin > 0 || priceRangeMax < 1000) && (
                        <Button
                          onClick={saveFilterPreset}
                          variant="outline"
                          size="sm"
                          className="border-border/50"
                        >
                          Save Preset
                        </Button>
                      )}
                    </div>

                    {/* Advanced Filters */}
                    {showAdvancedFilters && (
                      <div className="space-y-4 p-4 rounded-xl border border-border/50 bg-card/20">
                        {/* Multi-select Categories */}
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Categories (multi-select)</Label>
                          <div className="flex flex-wrap gap-2">
                            {['jackets', 'hoodies', 'T-shirts', 'pants', 'jeans', 'shorts', 'shoes', 'accessories'].map(cat => (
                              <Button
                                key={cat}
                                type="button"
                                onClick={() => toggleCategory(cat.toLowerCase())}
                                variant={filterCategories.has(cat.toLowerCase()) ? "default" : "outline"}
                                size="sm"
                                className="h-8"
                              >
                                {filterCategories.has(cat.toLowerCase()) && <X className="w-3 h-3 mr-1" />}
                                {getCategoryTranslation(cat)}
                              </Button>
                            ))}
                          </div>
                        </div>

                        {/* Multi-select Brands */}
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Brands (multi-select)</Label>
                          <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                            {brands.map(brand => (
                              <Button
                                key={brand.id}
                                type="button"
                                onClick={() => toggleBrand(brand.id)}
                                variant={filterBrands.has(brand.id) ? "default" : "outline"}
                                size="sm"
                                className="h-8"
                              >
                                {filterBrands.has(brand.id) && <X className="w-3 h-3 mr-1" />}
                                {brand.name}
                              </Button>
                            ))}
                          </div>
                        </div>

                        {/* Price Range Slider */}
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <Label className="text-sm font-medium">Price Range</Label>
                            <span className="text-sm text-muted-foreground">
                              ${priceRangeMin} - ${priceRangeMax}
                            </span>
                          </div>
                          <div className="space-y-2">
                            <div className="flex gap-4 items-center">
                              <Input
                                type="range"
                                min="0"
                                max="1000"
                                step="10"
                                value={priceRangeMin}
                                onChange={(e) => setPriceRangeMin(Math.min(Number(e.target.value), priceRangeMax - 10))}
                                className="flex-1"
                              />
                              <Input
                                type="range"
                                min="0"
                                max="1000"
                                step="10"
                                value={priceRangeMax}
                                onChange={(e) => setPriceRangeMax(Math.max(Number(e.target.value), priceRangeMin + 10))}
                                className="flex-1"
                              />
                            </div>
                            <div className="flex gap-2">
                              <Input
                                type="number"
                                placeholder="Min"
                                value={priceRangeMin}
                                onChange={(e) => setPriceRangeMin(Math.min(Number(e.target.value), priceRangeMax - 10))}
                                className="w-24 bg-card/50 border-border/50"
                              />
                              <span className="self-center text-muted-foreground">to</span>
                              <Input
                                type="number"
                                placeholder="Max"
                                value={priceRangeMax}
                                onChange={(e) => setPriceRangeMax(Math.max(Number(e.target.value), priceRangeMin + 10))}
                                className="w-24 bg-card/50 border-border/50"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Active Filters Summary */}
                        {(filterCategories.size > 0 || filterBrands.size > 0) && (
                          <div className="pt-3 border-t border-border/50">
                            <div className="flex flex-wrap gap-2 items-center">
                              <span className="text-sm text-muted-foreground">Active filters:</span>
                              {Array.from(filterCategories).map(cat => (
                                <span key={cat} className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-primary/20 text-primary text-xs">
                                  {getCategoryTranslation(cat)}
                                  <X className="w-3 h-3 cursor-pointer hover:text-primary/70" onClick={() => toggleCategory(cat)} />
                                </span>
                              ))}
                              {Array.from(filterBrands).map(brandId => {
                                const brand = brands.find(b => b.id === brandId);
                                return brand ? (
                                  <span key={brandId} className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-primary/20 text-primary text-xs">
                                    {brand.name}
                                    <X className="w-3 h-3 cursor-pointer hover:text-primary/70" onClick={() => toggleBrand(brandId)} />
                                  </span>
                                ) : null;
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
                
                {filteredAndSortedProducts.length > 0 ? (
                  viewMode === "card" ? (
                    <div className="space-y-3">
                      {filteredAndSortedProducts.map((product) => (
                        <div
                        key={product.id}
                        className={`group flex items-center gap-4 p-4 rounded-xl border transition-all ${
                          isSelectMode && selectedProductIds.has(product.id)
                            ? 'border-primary bg-primary/10'
                            : 'border-border/50 bg-card/20 hover:bg-card/40 hover:border-foreground/30'
                        }`}
                      >
                        {isSelectMode && (
                          <Checkbox
                            checked={selectedProductIds.has(product.id)}
                            onCheckedChange={() => toggleProductSelection(product.id)}
                            className="flex-shrink-0"
                          />
                        )}
                        {product.image_url && (
                          <div 
                            className="w-20 h-24 rounded-lg overflow-hidden bg-muted/30 flex-shrink-0 border border-border/50 cursor-pointer hover:border-primary transition-colors"
                            onClick={() => setPreviewProduct(product)}
                          >
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
                        {!isSelectMode && (
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
                              className="hover:bg-blue-500/20 hover:text-blue-400 border-border/50"
                              onClick={async () => {
                                try {
                                  // Fetch product data
                                  const productData = await productService.getProductById(product.id);
                                  const prod = (productData as any)?.item || productData;
                                  
                                  // Populate form with duplicated data
                                  setProductName(`${prod.name} (Copy)`);
                                  setProductCategory(normalizeCategoryValue(prod.type || prod.category));
                                  setProductColor(prod.color || "");
                                  setProductGender(prod.gender || "");
                                  setProductBrandId(prod.brand_id || "");
                                  setProductDescription(prod.description || "");
                                  setProductImageUrl(prod.image_url || "");
                                  
                                  // Load stores if available
                                  try {
                                    const storesData = await productService.getProductStores(product.id);
                                    const stores = (storesData as any)?.items || [];
                                    if (stores.length > 0) {
                                      setSelectedStores(stores.map((s: any) => ({
                                        store_id: s.store_id || s.id,
                                        store_name: s.store_name || s.name || 'Unknown',
                                        price: s.price || 0
                                      })));
                                    }
                                  } catch (error_) {
                                    console.warn('Could not load stores for duplicate', error_);
                                  }
                                  
                                  // Clear editing ID (this is a new product)
                                  setEditingProductId(null);
                                  
                                  // Switch to add-product tab
                                  setActiveTab("add-product");
                                  
                                  toast({
                                    title: "Product Duplicated",
                                    description: "Edit the details and save as a new product",
                                  });
                                } catch (error) {
                                  console.error("Failed to duplicate product", error);
                                  toast({
                                    variant: "destructive",
                                    title: "Error",
                                    description: "Failed to duplicate product",
                                  });
                                }
                              }}
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              Duplicate
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="hover:bg-red-500/20 hover:text-red-400 border-border/50"
                              onClick={async () => {
                                if (globalThis.confirm(`Delete "${product.name}"?`)) {
                                  try {
                                    await adminApi.deleteProduct(product.id);
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
                          
                          {/* Stock Management Button */}
                          <Button
                            variant="outline"
                            size="sm"
                            className="hover:bg-green-500/20 hover:text-green-400 border-border/50"
                            onClick={() => {
                              setShowStockManagement(product.id);
                            }}
                          >
                            <Package className="w-4 h-4" />
                          </Button>
                        </div>
                        )}
                        
                        {/* Stock Management Panel */}
                        {showStockManagement === product.id && product.stores && (
                          <div className="mt-4 p-4 rounded-lg bg-card/50 border border-border/50 space-y-3">
                            <div className="flex justify-between items-center mb-2">
                              <h5 className="font-semibold">≡ƒôª Stock Management</h5>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowStockManagement(false)}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                            {product.stores.map((store: any) => {
                              const currentStock = getStock(product.id, store.store_id);
                              const lowStock = isLowStock(product.id, store.store_id);
                              
                              return (
                                <div key={store.store_id} className="flex items-center gap-3 p-2 rounded bg-card/30">
                                  <div className="flex-1">
                                    <p className="font-medium text-sm">{store.store_name}</p>
                                    <p className="text-xs text-muted-foreground">${store.price}</p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Input
                                      type="number"
                                      min="0"
                                      value={currentStock}
                                      onChange={(e) => updateStock(product.id, store.store_id, Number.parseInt(e.target.value) || 0)}
                                      className="w-20 h-8 text-center"
                                      placeholder="Stock"
                                    />
                                    <span className="text-xs">units</span>
                                    {lowStock && (
                                      <span className="text-xs text-orange-500 font-medium">ΓÜá∩╕Å Low</span>
                                    )}
                                    {currentStock === 0 && (
                                      <span className="text-xs text-red-500 font-medium">Γ¥î Out</span>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  ) : (
                    /* Table View */
                    <div className="rounded-xl border border-border/50 overflow-hidden">
                      <table className="w-full">
                        <thead className="bg-card/60 border-b border-border/50">
                          <tr>
                            {isSelectMode && <th className="p-3 text-left w-12"></th>}
                            <th className="p-3 text-left w-20">Image</th>
                            <th className="p-3 text-left">Name</th>
                            <th className="p-3 text-left">Category</th>
                            <th className="p-3 text-left">Price</th>
                            <th className="p-3 text-left">Color</th>
                            <th className="p-3 text-left">Brand</th>
                            {!isSelectMode && <th className="p-3 text-right w-32">Actions</th>}
                          </tr>
                        </thead>
                        <tbody>
                          {filteredAndSortedProducts.map((product) => (
                            <tr 
                              key={product.id}
                              className={`border-b border-border/30 hover:bg-card/20 transition-colors ${
                                isSelectMode && selectedProductIds.has(product.id) ? 'bg-primary/10' : ''
                              }`}
                            >
                              {isSelectMode && (
                                <td className="p-3">
                                  <Checkbox
                                    checked={selectedProductIds.has(product.id)}
                                    onCheckedChange={() => toggleProductSelection(product.id)}
                                  />
                                </td>
                              )}
                              <td className="p-3">
                                {product.image_url && (
                                  <div 
                                    className="w-12 h-12 rounded-lg overflow-hidden bg-muted/30 border border-border/50 cursor-pointer hover:border-primary transition-colors"
                                    onClick={() => setPreviewProduct(product)}
                                  >
                                    <img
                                      src={product.image_url}
                                      alt={product.name}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                )}
                              </td>
                              <td className="p-3">
                                <span className="font-semibold">{product.name}</span>
                              </td>
                              <td className="p-3">
                                <span className="px-2 py-1 rounded bg-foreground/10 text-xs">
                                  {getCategoryTranslation(product.type || product.category)}
                                </span>
                              </td>
                              <td className="p-3">
                                <span className="font-semibold">${product.price}</span>
                              </td>
                              <td className="p-3">
                                <span className="text-sm">{getColorTranslation(product.color)}</span>
                              </td>
                              <td className="p-3">
                                <span className="text-sm">{product.brand || '-'}</span>
                              </td>
                              {!isSelectMode && (
                                <td className="p-3">
                                  <div className="flex gap-1 justify-end">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 w-8 p-0"
                                      onClick={() => {
                                        loadProductForEdit(product.id);
                                        setActiveTab("add-product");
                                      }}
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 w-8 p-0 hover:text-red-400"
                                      onClick={async () => {
                                        if (globalThis.confirm(`Delete "${product.name}"?`)) {
                                          try {
                                            await adminApi.deleteProduct(product.id);
                                            toast({ title: "Success", description: "Product deleted" });
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
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </td>
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )
                ) : (
                  <div className="text-center py-20 border border-dashed border-border/50 rounded-xl">
                    <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground text-lg mb-2">
                      {products.length === 0 ? 'No products yet' : 'No products match your filters'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {products.length === 0 
                        ? 'Create your first product in the Add Product tab'
                        : 'Try adjusting your search or filters'
                      }
                    </p>
                    {products.length > 0 && (
                      <Button onClick={resetFilters} variant="outline" className="mt-4">
                        Clear Filters
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Stores Tab */}
            <TabsContent value="stores" className="space-y-8 overflow-visible">
              {/* Create/Edit Store Form */}
              <div className="p-8 rounded-2xl border border-border/50 bg-card/40 backdrop-blur-sm overflow-visible">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-display text-2xl font-bold flex items-center gap-2">
                    {editingStore ? <Edit className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
                    {editingStore ? 'Edit Store' : 'Add New Store'}
                </h2>
                  {editingStore && (
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={cancelStoreEntityEdit}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      Cancel Edit
                    </Button>
                  )}
                </div>

                <p className="text-sm text-muted-foreground mb-4">
                  ╨Æ╨░╨╢╨╗╨╕╨▓╨╛: ┬½╨á╨╛╨╖╨╝╤û╤Ç╨╕┬╗ ╨╖╨▒╨╡╤Ç╤û╨│╨░╤Ä╤é╤î╤ü╤Å ╨┤╨╗╤Å ╨╖╨▓ΓÇÖ╤Å╨╖╨║╤â ╨┐╤Ç╨╛╨┤╤â╨║╤éΓåö╨╝╨░╨│╨░╨╖╨╕╨╜ (╤â ╨┐╤Ç╨╛╨┤╤â╨║╤é╤û), ╨░ ╨╜╨╡ ╨▓ ╨║╨░╤Ç╤é╤å╤û ╨╝╨░╨│╨░╨╖╨╕╨╜╤â.
                </p>

                <form onSubmit={handleCreateStore} className="space-y-6 overflow-visible">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 overflow-visible">
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
                          Γ¡É Recommended Store (Featured)
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
                    {storeSubmitText}
                  </Button>
                </form>
              </div>

              {/* Stores List */}
              <div className="p-8 rounded-2xl border border-border/50 bg-card/40 backdrop-blur-sm overflow-visible">
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
                
                {visibleStores.length > 0 ? (
                  <div className="space-y-4">
                    {visibleStores.map((store) => (
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
                              if (globalThis.confirm(`Delete "${store.name}"?`)) {
                                try {
                                  await adminApi.deleteStore(store.id);
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
            <TabsContent value="brands" className="space-y-8 overflow-visible">
              {/* Create Brand Form */}
              <div className="p-8 rounded-2xl border border-border/50 bg-card/40 backdrop-blur-sm overflow-visible">
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
                    await adminApi.createBrand({ name: brandName });

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
              <div className="p-8 rounded-2xl border border-border/50 bg-card/40 backdrop-blur-sm overflow-visible">
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
                            if (globalThis.confirm(`Delete brand "${brand.name}"?`)) {
                              try {
                                await adminApi.deleteBrand(brand.id);

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
                    ≡ƒÆí <strong>Note:</strong> These contact details will be displayed in the Contacts dialog 
                    accessible from the main navigation menu.
                  </p>
                </div>
              </div>
            </TabsContent>

            {/* ANALYTICS TAB */}
            <TabsContent value="analytics" className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-6 rounded-xl border border-border/50 bg-card/40 backdrop-blur-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Total Products</span>
                    <Package className="w-5 h-5 text-primary" />
                  </div>
                  <p className="text-3xl font-bold">{analytics.totalProducts}</p>
                  <p className="text-xs text-muted-foreground mt-2">In marketplace</p>
                </div>

                <div className="p-6 rounded-xl border border-border/50 bg-card/40 backdrop-blur-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Total Stores</span>
                    <Store className="w-5 h-5 text-primary" />
                  </div>
                  <p className="text-3xl font-bold">{analytics.totalStores}</p>
                  <p className="text-xs text-muted-foreground mt-2">Active sellers</p>
                </div>

                <div className="p-6 rounded-xl border border-border/50 bg-card/40 backdrop-blur-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Total Brands</span>
                    <Package className="w-5 h-5 text-primary" />
                  </div>
                  <p className="text-3xl font-bold">{analytics.totalBrands}</p>
                  <p className="text-xs text-muted-foreground mt-2">Registered brands</p>
                </div>

                <div className="p-6 rounded-xl border border-border/50 bg-card/40 backdrop-blur-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Avg Price</span>
                    <Package className="w-5 h-5 text-primary" />
                  </div>
                  <p className="text-3xl font-bold">${analytics.avgPrice}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    ${analytics.minPrice} - ${analytics.maxPrice}
                  </p>
                </div>
              </div>

              {/* Categories Distribution */}
              <div className="p-8 rounded-2xl border border-border/50 bg-card/40 backdrop-blur-sm">
                <h3 className="font-display text-xl font-bold mb-6">Products by Category</h3>
                <div className="space-y-4">
                  {Object.entries(analytics.categoriesCount)
                    .sort(([, a], [, b]) => b - a)
                    .map(([category, count]) => {
                      const percentage = (count / analytics.totalProducts * 100).toFixed(1);
                      return (
                        <div key={category} className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-medium">{getCategoryTranslation(category)}</span>
                            <span className="text-muted-foreground">{count} ({percentage}%)</span>
                          </div>
                          <div className="h-2 bg-foreground/5 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary rounded-full transition-all"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Top Brands */}
              {analytics.topBrands.length > 0 && (
                <div className="p-8 rounded-2xl border border-border/50 bg-card/40 backdrop-blur-sm">
                  <h3 className="font-display text-xl font-bold mb-6">Top Brands</h3>
                  <div className="space-y-3">
                    {analytics.topBrands.map((brand, index) => (
                      <div 
                        key={brand.name}
                        className="flex items-center gap-4 p-4 rounded-lg border border-border/50 bg-card/20"
                      >
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                          #{index + 1}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold">{brand.name}</p>
                          <p className="text-sm text-muted-foreground">{brand.count} products</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            {/* ANALYTICS TAB - New Features */}
            <TabsContent value="analytics" className="space-y-6">
              <div className="p-8 rounded-2xl border border-border/50 bg-card/40 backdrop-blur-sm">
                <h2 className="font-display text-2xl font-bold mb-6 flex items-center gap-3">
                  <BarChart3 className="w-6 h-6" />
                  Analytics & Insights
                </h2>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Price History Card */}
                  <div className="p-6 rounded-xl border border-border/50 bg-card/20 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-primary" />
                        Price History
                        {loadingPriceHistory && <Loader2 className="w-4 h-4 animate-spin" />}
                      </h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setShowPriceHistory(!showPriceHistory);
                          if (!showPriceHistory && !selectedProductForHistory && products.length > 0) {
                            const productId = products[0].id;
                            setSelectedProductForHistory(productId);
                            loadPriceHistoryFromAPI(productId);
                          }
                        }}
                      >
                        {showPriceHistory ? "Hide" : "Show"}
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Track price changes over time for all products and stores
                    </p>
                    {showPriceHistory && (
                      <div className="space-y-3 mt-4">
                        <Combobox
                          value={selectedProductForHistory || ""}
                          onValueChange={(value) => {
                            setSelectedProductForHistory(value);
                            if (value) loadPriceHistoryFromAPI(value);
                          }}
                          placeholder="Select product..."
                          items={products.map(p => ({ value: p.id, label: p.name }))}
                        />
                        {selectedProductForHistory && (
                          <div className="space-y-2 max-h-64 overflow-y-auto">
                            {loadingPriceHistory ? (
                              <div className="flex items-center justify-center py-4">
                                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                              </div>
                            ) : getPriceHistory(selectedProductForHistory).length === 0 ? (
                              <p className="text-xs text-muted-foreground text-center py-4">
                                No price history yet. Update product prices to see history.
                              </p>
                            ) : (
                              getPriceHistory(selectedProductForHistory).map((entry) => (
                                <div key={entry.id} className="flex items-center justify-between p-3 rounded-lg bg-card/30 border border-border/30">
                                  <div>
                                    <p className="text-sm font-medium">{entry.store_name}</p>
                                    <p className="text-xs text-muted-foreground">
                                      {new Date(entry.changed_at).toLocaleString()}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-lg font-bold">${entry.price}</p>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Activity Log Card */}
                  <div className="p-6 rounded-xl border border-border/50 bg-card/20 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Activity className="w-5 h-5 text-primary" />
                        Activity Log
                        {loadingActivityLog && <Loader2 className="w-4 h-4 animate-spin" />}
                      </h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setShowActivityLog(!showActivityLog);
                          if (!showActivityLog) {
                            loadActivityLogFromAPI(50);
                          }
                        }}
                      >
                        {showActivityLog ? "Hide" : "Show"}
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      View all changes made to products, stores, and settings
                    </p>
                    {showActivityLog && (
                      <div className="space-y-2 max-h-64 overflow-y-auto mt-4">
                        {loadingActivityLog ? (
                          <div className="flex items-center justify-center py-4">
                            <Loader2 className="w-6 h-6 animate-spin text-primary" />
                          </div>
                        ) : activityLog.length === 0 ? (
                          <p className="text-xs text-muted-foreground text-center py-4">
                            No activity logged yet. Create, update, or delete items to see logs.
                          </p>
                        ) : (
                          activityLog.slice(0, 20).map((log) => (
                            <div key={log.id} className="p-3 rounded-lg bg-card/30 border border-border/30 space-y-1">
                              <div className="flex items-center justify-between">
                                <span className={`text-xs px-2 py-0.5 rounded ${
                                  log.action === 'create' ? 'bg-green-500/20 text-green-600' :
                                  log.action === 'update' ? 'bg-blue-500/20 text-blue-600' :
                                  'bg-red-500/20 text-red-600'
                                }`}>
                                  {log.action.toUpperCase()}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(log.created_at).toLocaleTimeString()}
                                </span>
                              </div>
                              <p className="text-sm font-medium">{log.entity_type} #{log.entity_id}</p>
                              <p className="text-xs text-muted-foreground">by {log.user_name}</p>
                              {log.changes && typeof log.changes === 'object' && (
                                <details className="text-xs text-muted-foreground">
                                  <summary className="cursor-pointer hover:text-foreground">Changes</summary>
                                  <pre className="mt-1 p-2 bg-black/20 rounded overflow-x-auto">
                                    {JSON.stringify(log.changes, null, 2)}
                                  </pre>
                                </details>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>

                  {/* Product Relations Card */}
                  <div className="p-6 rounded-xl border border-border/50 bg-card/20 space-y-4 lg:col-span-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Link className="w-5 h-5 text-primary" />
                        Product Relations
                        {loadingRelations && <Loader2 className="w-4 h-4 animate-spin" />}
                      </h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setShowRelations(!showRelations);
                          if (!showRelations && !selectedProductForRelations && products.length > 0) {
                            const productId = products[0].id;
                            setSelectedProductForRelations(productId);
                            loadRelationsFromAPI(productId);
                          }
                        }}
                      >
                        {showRelations ? "Hide" : "Show"}
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Manage related products: similar items, bundles, and frequently bought together
                    </p>
                    {showRelations && (
                      <div className="space-y-4 mt-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Combobox
                            value={selectedProductForRelations || ""}
                            onValueChange={(value) => {
                              setSelectedProductForRelations(value);
                              if (value) loadRelationsFromAPI(value);
                            }}
                            placeholder="Select main product..."
                            items={products.map(p => ({ value: p.id, label: p.name }))}
                          />
                          {selectedProductForRelations && (
                            <div className="flex gap-2">
                              <Combobox
                                value=""
                                onValueChange={(relatedId) => {
                                  if (relatedId && selectedProductForRelations) {
                                    addRelatedProduct(selectedProductForRelations, relatedId, 'similar');
                                  }
                                }}
                                placeholder="Add similar product..."
                                items={products
                                  .filter(p => p.id !== selectedProductForRelations)
                                  .map(p => ({ value: p.id, label: p.name }))}
                              />
                            </div>
                          )}
                        </div>

                        {selectedProductForRelations && (
                          <div className="space-y-3">
                            <h4 className="text-sm font-semibold">Related Products:</h4>
                            {getRelatedProducts(selectedProductForRelations).length === 0 ? (
                              <p className="text-xs text-muted-foreground text-center py-4">
                                No relations added yet. Select a related product above to add.
                              </p>
                            ) : (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {getRelatedProducts(selectedProductForRelations).map((relation) => {
                                  const relatedProduct = products.find(p => p.id === relation.related_id);
                                  if (!relatedProduct) return null;
                                  return (
                                    <div key={`${relation.related_id}-${relation.type}`} className="flex items-center justify-between p-3 rounded-lg bg-card/30 border border-border/30">
                                      <div className="flex-1">
                                        <p className="text-sm font-medium">{relatedProduct.name}</p>
                                        <span className="text-xs px-2 py-0.5 rounded bg-primary/20 text-primary">
                                          {relation.type}
                                        </span>
                                      </div>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeRelatedProduct(selectedProductForRelations, relation.related_id, relation.type)}
                                        className="h-8 w-8 p-0"
                                      >
                                        <X className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>

          </Tabs>
        </div>
      </section>

      {/* Sticky Action Bar */}
      <StickyActionBar
        show={activeTab === 'add-product'}
        onSave={() => {
          const form = document.querySelector<HTMLFormElement>('form');
          if (form) form.requestSubmit();
        }}
        onCancel={editingProductId ? cancelEdit : undefined}
        saveLabel={editingProductId ? 'Update Product' : 'Create Product'}
        isSaving={submitting}
      />

      {/* Product Preview Modal */}
      {previewProduct && (
        <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Close product preview"
            className="absolute inset-0 bg-transparent border-0 p-0 cursor-default"
            onClick={() => setPreviewProduct(null)}
          />
          <div 
            className="relative max-w-4xl w-full bg-card/95 backdrop-blur-xl rounded-2xl border border-border/50 overflow-hidden"
          >
            <div className="absolute top-4 right-4 z-10">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setPreviewProduct(null)}
                className="rounded-full bg-background/80 backdrop-blur-sm hover:bg-background"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6 p-6">
              {/* Image */}
              <div className="rounded-xl overflow-hidden bg-muted/30 border border-border/50">
                <img
                  src={previewProduct.image_url}
                  alt={previewProduct.name}
                  className="w-full h-auto object-contain max-h-[500px]"
                />
              </div>
              
              {/* Details */}
              <div className="space-y-4">
                <div>
                  <h2 className="text-3xl font-bold mb-2">{previewProduct.name}</h2>
                  <p className="text-4xl font-bold text-primary">${previewProduct.price}</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Category:</span>
                    <span className="px-3 py-1 rounded-lg bg-foreground/10 text-sm font-medium">
                      {getCategoryTranslation(previewProduct.type || previewProduct.category)}
                    </span>
                  </div>
                  
                  {previewProduct.color && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Color:</span>
                      <span className="px-3 py-1 rounded-lg bg-foreground/10 text-sm font-medium">
                        {getColorTranslation(previewProduct.color)}
                      </span>
                    </div>
                  )}
                  
                  {previewProduct.gender && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Gender:</span>
                      <span className="px-3 py-1 rounded-lg bg-foreground/10 text-sm font-medium">
                        {previewProduct.gender}
                      </span>
                    </div>
                  )}
                  
                  {previewProduct.brand && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Brand:</span>
                      <span className="px-3 py-1 rounded-lg bg-foreground/10 text-sm font-medium">
                        {previewProduct.brand}
                      </span>
                    </div>
                  )}
                </div>
                
                {previewProduct.description && (
                  <div className="pt-4 border-t border-border/50">
                    <h3 className="text-sm font-semibold mb-2 text-muted-foreground">Description</h3>
                    <p className="text-sm">{previewProduct.description}</p>
                  </div>
                )}
                
                <div className="pt-4 flex gap-2">
                  <Button
                    onClick={() => {
                      loadProductForEdit(previewProduct.id);
                      setActiveTab("add-product");
                      setPreviewProduct(null);
                    }}
                    className="flex-1"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Product
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;

