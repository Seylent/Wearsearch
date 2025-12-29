import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { Package, Store, Plus, Edit, Trash2, Search, ShieldCheck } from "lucide-react";
import { ImageUploader } from "@/components/ImageUploader";
import { productService } from "@/services/productService";
import { storeService } from "@/services/storeService";
import { api } from "@/services/api";
import { useAdminDashboardData } from "@/hooks/useAggregatedData";
import { getCategoryTranslation, getColorTranslation } from "@/utils/translations";
import { useProducts, useStores, useBrands } from "@/hooks/useApi";

// Use relative API URL (works with Vite proxy)
const API_BASE_URL = '';

const Admin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Use React Query hooks - single source of truth for server data
  const { data: productsData = [], isLoading: productsLoading, refetch: refetchProducts } = useProducts();
  const { data: storesData = [], isLoading: storesLoading, refetch: refetchStores } = useStores();
  const { data: brandsData = [], isLoading: brandsLoading, refetch: refetchBrands } = useBrands();
  
  // Normalize data (handle different API response formats)
  const products = useMemo(() => {
    if (Array.isArray(productsData)) return productsData;
    if (productsData?.success) return productsData.data || [];
    if (productsData?.products) return productsData.products;
    return [];
  }, [productsData]);
  
  const stores = useMemo(() => {
    if (Array.isArray(storesData)) return storesData;
    if (storesData?.success) return storesData.data || [];
    return [];
  }, [storesData]);
  
  const brands = useMemo(() => {
    if (Array.isArray(brandsData)) return brandsData;
    if (brandsData?.data?.brands) return brandsData.data.brands;
    if (brandsData?.brands) return brandsData.brands;
    if (brandsData?.data) return brandsData.data;
    if (brandsData?.success && brandsData?.data) return Array.isArray(brandsData.data) ? brandsData.data : [];
    return [];
  }, [brandsData]);
  
  const loading = productsLoading || storesLoading || brandsLoading;
  
  // Product form state - always initialize with empty string to avoid controlled/uncontrolled issues
  const [productName, setProductName] = useState<string>("");
  const [productCategory, setProductCategory] = useState<string>("");
  const [productColor, setProductColor] = useState<string>("");
  const [productGender, setProductGender] = useState<string>("");
  const [productBrandId, setProductBrandId] = useState<string>("");
  const [productDescription, setProductDescription] = useState<string>("");
  const [productImageUrl, setProductImageUrl] = useState<string>("");
  
  // Multi-store selection state
  const [selectedStores, setSelectedStores] = useState<Array<{ store_id: string; store_name: string; price: number }>>([]);
  const [currentStore, setCurrentStore] = useState<string>("");
  const [currentStorePrice, setCurrentStorePrice] = useState<string>("");
  const [storeSearchQuery, setStoreSearchQuery] = useState<string>("");
  
  // Editing state (for tracking which product is being edited)
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  
  // Tab state
  const [activeTab, setActiveTab] = useState("add-product");
  
  // Contacts state
  const [contactTelegram, setContactTelegram] = useState<string>("@wearsearch");
  const [contactInstagram, setContactInstagram] = useState<string>("@wearsearch");
  const [contactTiktok, setContactTiktok] = useState<string>("@wearsearch");
  const [contactEmail, setContactEmail] = useState<string>("support@wearsearch.com");
  const [savingContacts, setSavingContacts] = useState(false);
  
  // Store form state
  const [storeName, setStoreName] = useState<string>("");
  const [storeTelegram, setStoreTelegram] = useState<string>("");
  const [storeInstagram, setStoreInstagram] = useState<string>("");
  const [storeTiktok, setStoreTiktok] = useState<string>("");
  const [storeShipping, setStoreShipping] = useState<string>("");
  const [storeLogoUrl, setStoreLogoUrl] = useState<string>("");
  const [storeRecommended, setStoreRecommended] = useState<boolean>(false);
  const [editingStore, setEditingStore] = useState<any | null>(null);
  
  const [submitting, setSubmitting] = useState(false);
  
  // Predefined colors
  const COLORS = [
    "Black", "White", "Gray", "Beige", "Brown",
    "Red", "Blue", "Navy", "Green", "Olive",
    "Yellow", "Orange", "Pink", "Purple", "Cream"
  ];

  useEffect(() => {
    checkAdmin();
    
    // Load saved contacts from localStorage
    const savedContacts = localStorage.getItem('site_contacts');
    if (savedContacts) {
      try {
        const contacts = JSON.parse(savedContacts);
        if (contacts.telegram) setContactTelegram(contacts.telegram);
        if (contacts.instagram) setContactInstagram(contacts.instagram);
        if (contacts.tiktok) setContactTiktok(contacts.tiktok);
        if (contacts.email) setContactEmail(contacts.email);
      } catch (e) {
        console.error('Failed to load saved contacts');
      }
    }
    
    // Check if we should edit a product from URL
    const urlParams = new URLSearchParams(window.location.search);
    const editProductId = urlParams.get('editProduct');
    if (editProductId) {
      loadProductForEdit(editProductId);
    }
  }, []);

  const checkAdmin = useCallback(async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      console.log('🔒 No token, redirecting to auth');
      navigate('/auth');
      return;
    }

    // Try to use cached user data first - AVOID unnecessary /me requests
    const cachedUser = localStorage.getItem('user');
    if (cachedUser) {
      try {
        const userData = JSON.parse(cachedUser);
        console.log('✅ [checkAdmin] Using cached user data - NO /me REQUEST');
        if (userData.role === 'admin') {
          return; // Already admin, no need to fetch
        } else {
          toast({
            title: "Access Denied",
            description: "Admin access required",
            variant: "destructive",
          });
          navigate('/');
          return;
        }
      } catch (e) {
        console.warn('⚠️ Cache invalid, will fetch from API');
        // Cache invalid, continue to API call
      }
    }

    // Only fetch from API if no valid cache
    console.log('🔍 [checkAdmin] No cache, fetching /me from API (should happen only ONCE)');
    try {
      const response = await api.get('/auth/me');
      const data = response.data;
      const userData = data.data || data.user || data;
      
      console.log('💾 [checkAdmin] Caching user data:', userData);
      // Cache user data
      localStorage.setItem('user', JSON.stringify(userData));
      
      if (userData.role !== 'admin') {
        toast({
          title: "Access Denied",
          description: "Admin access required",
          variant: "destructive",
        });
        navigate('/');
      }
    } catch (error) {
      console.error('❌ Failed to check admin:', error);
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      navigate('/auth');
    }
  }, [navigate, toast]);

  const loadProductForEdit = async (productId: string) => {
    try {
      console.log('🔄 Loading product for edit:', productId);
      // Always fetch from API to get fresh data including stores
      const [productRes, storesRes] = await Promise.all([
        fetch(`/api/items/${productId}`),
        fetch(`/api/items/${productId}/stores`)
      ]);
      
      const productResult = await productRes.json();
      const storesResult = await storesRes.json();
      
      console.log('📦 Product data:', productResult);
      console.log('🏪 Stores data from API:', storesResult);
      console.log('🏪 Stores array:', storesResult.stores);
      console.log('🏪 Stores count:', storesResult.stores?.length || 0);
      
      if (productResult.success || productResult.id) {
        const productData = productResult.data || productResult;
        
        // Attach stores to product
        if (storesResult.success && storesResult.stores && storesResult.stores.length > 0) {
          console.log('✅ Found stores:', storesResult.stores.length);
          console.log('✅ Stores details:', storesResult.stores);
          productData.product_stores = storesResult.stores.map((store: any) => ({
            store_id: store.id,
            store_name: store.name,
            price: store.price,
            stores: store
          }));
        } else {
          console.error('❌ NO STORES FOUND! Backend did not save stores to database!');
          console.error('This means the PUT /api/admin/products/:id endpoint is NOT saving the stores array');
          productData.product_stores = [];
        }
        
        console.log('📝 Product with stores to edit:', productData);
        console.log('📝 product_stores array:', productData.product_stores);
        editProduct(productData);
      }
    } catch (error) {
      console.error('Failed to load product:', error);
      toast({
        title: 'Error',
        description: 'Failed to load product for editing',
        variant: 'destructive',
      });
    }
  };

  const editProduct = (product: any) => {
    console.log('✏️ Editing product:', product);
    console.log('🏷️ Brand ID:', product.brand_id);
    console.log('🏪 Stores:', product.product_stores);
    
    // Load product data into form
    setProductName(product.name);
    const categoryValue = product.type || product.category || "";
    console.log('📂 Category value:', categoryValue);
    setProductCategory(categoryValue);
    setProductColor(product.color);
    setProductGender(product.gender || "");
    setProductBrandId(product.brand_id || "");
    setProductDescription(product.description || "");
    setProductImageUrl(product.image_url || "");
    
    // Load stores from product_stores
    if (product.product_stores && product.product_stores.length > 0) {
      const productStores = product.product_stores.map((ps: any) => ({
        store_id: ps.store_id,
        store_name: ps.stores?.name || ps.store_name || 'Unknown Store',
        price: ps.price || ps.stores?.price || 0
      }));
      setSelectedStores(productStores);
    } else {
      setSelectedStores([]);
    }
    
    // Store product ID for update
    setEditingProductId(product.id);
    
    // Switch to "Add Product" tab (which is now dual-purpose)
    setActiveTab("add-product");
    
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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

      console.log('📤 Updating product with data:', {
        productId: editingProductId,
        storesCount: selectedStores.length,
        stores: updateData.stores,
        fullData: updateData
      });

      const response = await fetch(`/api/admin/products/${editingProductId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify(updateData),
      });

      const result = await response.json();
      console.log('📥 Update response:', result);

      if (result.success) {
        // Backend не повертає stores в response, використовуємо selectedStores
        const storesCount = result.data?.stores?.length || result.stores?.length || selectedStores.length;
        console.log('✅ Product updated with', storesCount, 'stores');
        
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
        refetchProducts();
        
        // Clear URL param
        window.history.replaceState({}, '', '/admin');
      } else {
        throw new Error(result.error || 'Failed to update product');
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update product",
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

    console.log('🚀 Creating product with stores:', selectedStores);
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

      console.log('📤 Sending request to backend with data:', createData);
      // Try NEW format first: Create ONE product with multiple stores
      const response = await fetch('/api/admin/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify(createData),
      });

      const result = await response.json();
      console.log('📥 Create product response:', result);

      // Check if successful
      if (result.success) {
        console.log('✅ Product created successfully with backend!');
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
        refetchProducts();
        
        // Clear URL param if editing
        window.history.replaceState({}, '', '/admin');
        return;
      }

      // If backend doesn't support new format, use OLD format (separate products per store)
      if (!result.success && (result.error?.includes('stores') || result.error?.includes('store_id'))) {
        console.warn('⚠️ Backend doesn\'t support multi-store format, using fallback...');
        
        // OLD FORMAT: Create separate product for each store
        const results = await Promise.all(
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
            console.log('📤 Fallback request for store:', store.store_name, fallbackData);
            const storeResponse = await fetch('/api/admin/products', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('access_token')}`
              },
              body: JSON.stringify(fallbackData),
            });
            return await storeResponse.json();
          })
        );

        const successCount = results.filter(r => r.success).length;
        console.log(`📊 Fallback results: ${successCount}/${results.length} successful`);
        
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
          refetchProducts();
          
          // Clear URL param if editing
          window.history.replaceState({}, '', '/admin');
        } else {
          console.error('❌ All fallback attempts failed');
          throw new Error('Failed to create products in any store');
        }
      } else {
        console.error('❌ Unexpected error from backend:', result);
        throw new Error(result.error || result.message || 'Failed to create product');
      }
      
      // Clear URL param if editing
      window.history.replaceState({}, '', '/admin');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to create product",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const loadStoreForEdit = (store: any) => {
    setEditingStore(store);
    setStoreName(store.name);
    setStoreTelegram(store.telegram_url || "");
    setStoreInstagram(store.instagram_url || "");
    setStoreTiktok(store.tiktok_url || "");
    setStoreShipping(store.shipping_info || "");
    setStoreLogoUrl(store.logo_url || "");
    setStoreRecommended(store.is_recommended || false);
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
      const url = editingStore 
        ? `${API_BASE_URL}/api/admin/stores/${editingStore.id}`
        : `${API_BASE_URL}/api/admin/stores`;
      
      const method = editingStore ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({
          name: storeName,
          telegram_url: storeTelegram || null,
          instagram_url: storeInstagram || null,
          tiktok_url: storeTiktok || null,
          shipping_info: storeShipping || null,
          logo_url: storeLogoUrl || null,
          is_recommended: storeRecommended,
        }),
      });

      const result = await response.json();

      if (result.success) {
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
      refetchStores();
      } else {
        throw new Error(result.error || `Failed to ${editingStore ? 'update' : 'create'} store`);
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || `Failed to ${editingStore ? 'update' : 'create'} store`,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <Navigation />
      
      {/* Header */}
      <section className="relative pt-28 pb-12 border-b border-border/30 overflow-hidden">
        <div className="absolute inset-0 opacity-30 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-foreground/5 rounded-full blur-[120px]" />
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border/50 bg-card/30 backdrop-blur-sm mb-6">
            <ShieldCheck className="w-4 h-4" />
            <span className="text-xs text-foreground tracking-wider uppercase font-medium">Admin Panel</span>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-bold mb-3">
            Dashboard
          </h1>
          <p className="text-lg text-muted-foreground">
            Manage products, stores, and marketplace content
          </p>
        </div>
      </section>

      {/* Admin Tabs */}
      <section className="py-6 md:py-12">
        <div className="container mx-auto px-4 md:px-6">
          <Tabs defaultValue="add-product" className="max-w-6xl mx-auto" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3 md:grid-cols-3 lg:grid-cols-6 bg-card/40 border border-border/50 backdrop-blur-sm mb-4 md:mb-8 p-1 rounded-xl">
              <TabsTrigger 
                value="add-product"
                className="data-[state=active]:bg-foreground data-[state=active]:text-background rounded-lg transition-all text-xs md:text-sm px-2 py-2"
              >
                <Plus className="w-3 h-3 md:w-4 md:h-4 md:mr-2" />
                <span className="hidden md:inline ml-1">Add Product</span>
                <span className="md:hidden ml-1">Add</span>
              </TabsTrigger>
              <TabsTrigger 
                value="manage-products"
                className="data-[state=active]:bg-foreground data-[state=active]:text-background rounded-lg transition-all text-xs md:text-sm px-2 py-2"
              >
                <Package className="w-3 h-3 md:w-4 md:h-4 md:mr-2" />
                <span className="hidden md:inline ml-1">Products ({products.length})</span>
                <span className="md:hidden ml-1">List</span>
              </TabsTrigger>
              <TabsTrigger 
                value="stores"
                className="data-[state=active]:bg-foreground data-[state=active]:text-background rounded-lg transition-all text-xs md:text-sm px-2 py-2"
              >
                <Store className="w-3 h-3 md:w-4 md:h-4 md:mr-2" />
                <span className="hidden md:inline ml-1">Stores</span>
                <span className="md:hidden ml-1">Store</span>
              </TabsTrigger>
              <TabsTrigger 
                value="brands"
                className="data-[state=active]:bg-foreground data-[state=active]:text-background rounded-lg transition-all text-xs md:text-sm px-2 py-2"
              >
                <Package className="w-3 h-3 md:w-4 md:h-4 md:mr-2" />
                <span className="hidden md:inline ml-1">Brands</span>
                <span className="md:hidden ml-1">Brand</span>
              </TabsTrigger>
              <TabsTrigger 
                value="contacts"
                className="data-[state=active]:bg-foreground data-[state=active]:text-background rounded-lg transition-all text-xs md:text-sm px-2 py-2"
              >
                <Package className="w-3 h-3 md:w-4 md:h-4 md:mr-2" />
                <span className="hidden md:inline ml-1">Contacts</span>
                <span className="sm:hidden">Contact</span>
              </TabsTrigger>
            </TabsList>

            {/* ADD/EDIT PRODUCT TAB */}
            <TabsContent value="add-product" className="space-y-4 md:space-y-8">
              {/* Add/Edit Product Form */}
              <div className="p-4 md:p-8 rounded-xl md:rounded-2xl border border-border/50 bg-card/40 backdrop-blur-sm">
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

                <form onSubmit={editingProductId ? handleUpdateProduct : handleCreateProduct} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Product Name</Label>
                      <Input
                        value={productName}
                        onChange={(e) => setProductName(e.target.value)}
                        placeholder="Oversized Cotton Blazer"
                        required
                        className="h-12 bg-card/50 border-border/50 rounded-lg"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Category *</Label>
                      <Select value={productCategory} onValueChange={setProductCategory} required>
                        <SelectTrigger className="h-12 bg-card/50 border-border/50 rounded-lg">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent className="bg-card border-border/50">
                          <SelectItem value="jackets">Куртки</SelectItem>
                          <SelectItem value="hoodies">Худі</SelectItem>
                          <SelectItem value="T-shirts">Футболки</SelectItem>
                          <SelectItem value="pants">Штани</SelectItem>
                          <SelectItem value="jeans">Джинси</SelectItem>
                          <SelectItem value="shorts">Шорти</SelectItem>
                          <SelectItem value="shoes">Взуття</SelectItem>
                          <SelectItem value="accessories">Аксесуари</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Color</Label>
                      <Select value={productColor} onValueChange={setProductColor} required>
                        <SelectTrigger className="h-12 bg-card/50 border-border/50 rounded-lg">
                          <SelectValue placeholder="Select color" />
                        </SelectTrigger>
                        <SelectContent className="bg-card border-border/50">
                          {COLORS.map((color) => (
                            <SelectItem key={color} value={color}>
                              {color}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Gender</Label>
                      <Select value={productGender} onValueChange={setProductGender}>
                        <SelectTrigger className="h-12 bg-card/50 border-border/50 rounded-lg">
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent className="bg-card border-border/50">
                          <SelectItem value="men">Men</SelectItem>
                          <SelectItem value="women">Women</SelectItem>
                          <SelectItem value="unisex">Unisex</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Brand (Optional)</Label>
                      <Select value={productBrandId || undefined} onValueChange={(value) => setProductBrandId(value === "none" ? "" : value)}>
                        <SelectTrigger className="h-12 bg-card/50 border-border/50 rounded-lg">
                          <SelectValue placeholder="Select brand (optional)" />
                        </SelectTrigger>
                        <SelectContent className="bg-card border-border/50">
                          <SelectItem value="none">No Brand</SelectItem>
                          {brands.map((brand) => (
                            <SelectItem key={brand.id} value={brand.id}>
                              {brand.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                  </div>

                  {/* Store Selection Section */}
                  <div className="space-y-4 p-6 rounded-xl border border-border/50 bg-card/20">
                    <Label className="text-lg font-semibold">Add Stores & Prices</Label>
                    <p className="text-sm text-muted-foreground">
                      Select stores where this product will be available and set the price for each store
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-2 space-y-2">
                        <Label>Select Store</Label>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                          <Select 
                            value={currentStore} 
                            onValueChange={(value) => {
                              setCurrentStore(value);
                              setStoreSearchQuery("");
                            }}
                            onOpenChange={(open) => {
                              if (!open) setStoreSearchQuery("");
                            }}
                          >
                            <SelectTrigger className="h-12 bg-card/50 border-border/50 rounded-lg pl-10">
                              <SelectValue placeholder="Type to search stores" />
                            </SelectTrigger>
                            <SelectContent className="bg-card border-border/50">
                              <div className="px-2 pb-2 sticky top-0 bg-card z-10">
                                <Input
                                  type="text"
                                  placeholder="Search stores..."
                                  value={storeSearchQuery}
                                  onChange={(e) => setStoreSearchQuery(e.target.value)}
                                  className="h-9"
                                  onClick={(e) => e.stopPropagation()}
                                  onKeyDown={(e) => e.stopPropagation()}
                                />
                              </div>
                              {stores
                                .filter(store => 
                                  !selectedStores.some(s => s.store_id === store.id) &&
                                  store.name.toLowerCase().includes(storeSearchQuery.toLowerCase())
                                )
                                .map((store) => (
                                  <SelectItem key={store.id} value={store.name}>
                                    {store.name}
                                  </SelectItem>
                                ))}
                              {stores.filter(store => 
                                !selectedStores.some(s => s.store_id === store.id) &&
                                store.name.toLowerCase().includes(storeSearchQuery.toLowerCase())
                              ).length === 0 && (
                                <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                                  No stores found
                                </div>
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Store Price ($)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={currentStorePrice}
                          onChange={(e) => setCurrentStorePrice(e.target.value)}
                          placeholder="e.g. 420"
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
                      Add Store
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
                                  refetchProducts();
                                } catch (error: any) {
                                  toast({
                                    variant: "destructive",
                                    title: "Error",
                                    description: error.message || "Failed to delete",
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
                                  refetchStores();
                                } catch (error: any) {
                                  toast({
                                    variant: "destructive",
                                    title: "Error",
                                    description: error.message || "Failed to delete store",
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
                    const response = await fetch('/api/brands', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                      },
                      body: JSON.stringify({ name: brandName })
                    });

                    if (response.ok) {
                      toast({
                        title: "Success",
                        description: "Brand created successfully",
                      });
                      refetchBrands();
                      (form.elements.namedItem('brandName') as HTMLInputElement).value = '';
                    } else {
                      throw new Error('Failed to create brand');
                    }
                  } catch (error: any) {
                    toast({
                      variant: "destructive",
                      title: "Error",
                      description: error.message || "Failed to create brand",
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
                                const response = await fetch(`${API_BASE_URL}/api/brands/${brand.id}`, {
                                  method: 'DELETE',
                                  headers: {
                                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                                  }
                                });

                                if (response.ok) {
                                  toast({
                                    title: "Success",
                                    description: "Brand deleted successfully",
                                  });
                                  refetchBrands();
                                } else {
                                  throw new Error('Failed to delete brand');
                                }
                              } catch (error: any) {
                                toast({
                                  variant: "destructive",
                                  title: "Error",
                                  description: error.message || "Failed to delete brand",
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

