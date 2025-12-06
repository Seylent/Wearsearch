import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { Package, Store, Plus, Edit, Trash2, Search, ShieldCheck } from "lucide-react";
import { ImageUploader } from "@/components/ImageUploader";
import { productService } from "@/services/productService";
import { storeService } from "@/services/storeService";

const Admin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<any[]>([]);
  const [stores, setStores] = useState<any[]>([]);
  
  // Product form state
  const [productName, setProductName] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productType, setProductType] = useState("");
  const [productColor, setProductColor] = useState("");
  const [productGender, setProductGender] = useState("");
  const [productBrand, setProductBrand] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [productImageUrl, setProductImageUrl] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  
  // Multi-store selection state
  const [selectedStores, setSelectedStores] = useState<Array<{ store_id: string; store_name: string; price: number }>>([]);
  const [currentStore, setCurrentStore] = useState("");
  const [currentStorePrice, setCurrentStorePrice] = useState("");
  
  // Edit mode state
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [editingStore, setEditingStore] = useState<any>(null);
  
  // Store form state
  const [storeName, setStoreName] = useState("");
  const [storeTelegram, setStoreTelegram] = useState("");
  const [storeInstagram, setStoreInstagram] = useState("");
  const [storeShipping, setStoreShipping] = useState("");
  
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    checkAdmin();
    fetchData();
  }, []);

  const checkAdmin = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      navigate('/auth');
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      const userData = data.data || data.user || data;
      
      if (userData.role !== 'admin') {
        toast({
          title: "Access Denied",
          description: "Admin access required",
          variant: "destructive",
        });
        navigate('/');
      }
    } catch (error) {
      navigate('/auth');
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [productsRes, storesRes] = await Promise.all([
        fetch('http://localhost:3000/api/admin/products', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` }
        }),
        fetch('http://localhost:3000/api/stores')
      ]);

      const productsData = await productsRes.json();
      const storesData = await storesRes.json();

      if (productsData.success) setProducts(productsData.data || []);
      if (storesData.success || Array.isArray(storesData)) {
        setStores(Array.isArray(storesData) ? storesData : storesData.data || []);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
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
      // Create product for each store
      const results = await Promise.all(
        selectedStores.map(async (store) => {
          const response = await fetch('http://localhost:3000/api/admin/products', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('access_token')}`
            },
            body: JSON.stringify({
              name: productName,
              price: parseFloat(productPrice),
              store_price: store.price, // Use store-specific price
              type: productType,
              color: productColor,
              gender: productGender || null,
              brand: productBrand || null,
              description: productDescription || null,
              image_url: productImageUrl,
              is_featured: isFeatured,
              store_id: store.store_id, // Use store_id instead of store_name
            }),
          });
          
          return await response.json();
        })
      );

      // Check if all succeeded
      const allSucceeded = results.every(r => r.success);
      const successCount = results.filter(r => r.success).length;

      if (allSucceeded) {
        toast({
          title: "Success",
          description: `Product added to ${successCount} store(s)`,
        });
      } else {
        toast({
          title: "Partial Success",
          description: `Product added to ${successCount} out of ${selectedStores.length} store(s)`,
          variant: "destructive",
        });
      }

      // Reset form
      setProductName("");
      setProductPrice("");
      setProductType("");
      setProductColor("");
      setProductGender("");
      setProductBrand("");
      setProductDescription("");
      setProductImageUrl("");
      setIsFeatured(false);
      setSelectedStores([]);
      setCurrentStore("");
      setCurrentStorePrice("");
      fetchData();
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

  const handleCreateStore = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch('http://localhost:3000/api/admin/stores', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({
          name: storeName,
          telegram_url: storeTelegram || null,
          instagram_url: storeInstagram || null,
          shipping_info: storeShipping || null,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Success",
          description: "Store created successfully",
        });
        // Reset form
        setStoreName("");
        setStoreTelegram("");
        setStoreInstagram("");
        setStoreShipping("");
        fetchData();
      } else {
        throw new Error(result.error || 'Failed to create store');
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to create store",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <Navigation />
      
      {/* Header */}
      <section className="relative py-20 border-b border-border/50 overflow-hidden">
        <div className="absolute inset-0 opacity-30 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-foreground/5 rounded-full blur-[120px]" />
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <ShieldCheck className="w-8 h-8" />
            <span className="text-sm text-muted-foreground uppercase tracking-[0.2em]">Admin Panel</span>
          </div>
          <h1 className="font-display text-5xl md:text-6xl font-bold mb-3">
            <span className="text-gradient">Dashboard</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            Manage products, stores, and marketplace content
          </p>
        </div>
      </section>

      {/* Admin Tabs */}
      <section className="py-12">
        <div className="container mx-auto px-6">
          <Tabs defaultValue="products" className="max-w-6xl mx-auto">
            <TabsList className="grid w-full grid-cols-2 bg-card/40 border border-border/50 backdrop-blur-sm mb-8 p-1 rounded-xl">
              <TabsTrigger 
                value="products"
                className="data-[state=active]:bg-foreground data-[state=active]:text-background rounded-lg transition-all"
              >
                <Package className="w-4 h-4 mr-2" />
                Products ({products.length})
              </TabsTrigger>
              <TabsTrigger 
                value="stores"
                className="data-[state=active]:bg-foreground data-[state=active]:text-background rounded-lg transition-all"
              >
                <Store className="w-4 h-4 mr-2" />
                Stores ({stores.length})
              </TabsTrigger>
            </TabsList>

            {/* Products Tab */}
            <TabsContent value="products" className="space-y-8">
              {/* Create Product Form */}
              <div className="p-8 rounded-2xl border border-border/50 bg-card/40 backdrop-blur-sm">
                <h2 className="font-display text-2xl font-bold mb-6 flex items-center gap-2">
                  <Plus className="w-6 h-6" />
                  Add New Product
                </h2>

                <form onSubmit={handleCreateProduct} className="space-y-6">
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
                      <Label>Price ($)</Label>
                      <Input
                        type="number"
                        value={productPrice}
                        onChange={(e) => setProductPrice(e.target.value)}
                        placeholder="420"
                        required
                        className="h-12 bg-card/50 border-border/50 rounded-lg"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Type</Label>
                      <Select value={productType} onValueChange={setProductType} required>
                        <SelectTrigger className="h-12 bg-card/50 border-border/50 rounded-lg">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent className="bg-card border-border/50">
                          <SelectItem value="Outerwear">Outerwear</SelectItem>
                          <SelectItem value="Tops">Tops</SelectItem>
                          <SelectItem value="Bottoms">Bottoms</SelectItem>
                          <SelectItem value="Dresses">Dresses</SelectItem>
                          <SelectItem value="Shoes">Shoes</SelectItem>
                          <SelectItem value="Accessories">Accessories</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Color</Label>
                      <Input
                        value={productColor}
                        onChange={(e) => setProductColor(e.target.value)}
                        placeholder="Black"
                        required
                        className="h-12 bg-card/50 border-border/50 rounded-lg"
                      />
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
                      <Label>Brand</Label>
                      <Input
                        value={productBrand}
                        onChange={(e) => setProductBrand(e.target.value)}
                        placeholder="Maison Noir"
                        className="h-12 bg-card/50 border-border/50 rounded-lg"
                      />
                    </div>

                    <div className="space-y-2 flex items-center gap-3 pt-8">
                      <input
                        type="checkbox"
                        id="featured"
                        checked={isFeatured}
                        onChange={(e) => setIsFeatured(e.target.checked)}
                        className="w-5 h-5 rounded border-border/50"
                      />
                      <Label htmlFor="featured" className="cursor-pointer">
                        Featured Product (Show in Hero)
                      </Label>
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
                        <Select value={currentStore} onValueChange={setCurrentStore}>
                          <SelectTrigger className="h-12 bg-card/50 border-border/50 rounded-lg">
                            <SelectValue placeholder="Choose a store" />
                          </SelectTrigger>
                          <SelectContent className="bg-card border-border/50">
                            {stores
                              .filter(store => !selectedStores.some(s => s.store_id === store.id))
                              .map((store) => (
                                <SelectItem key={store.id} value={store.name}>
                                  {store.name}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
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
                    {submitting ? 'Creating...' : 'Create Product'}
                  </Button>
                </form>
              </div>

              {/* Products List */}
              <div className="p-8 rounded-2xl border border-border/50 bg-card/40 backdrop-blur-sm">
                <h3 className="font-display text-xl font-bold mb-6">
                  All Products ({products.length})
                </h3>
                
                {products.length > 0 ? (
                  <div className="space-y-4">
                    {products.map((product) => (
                      <div
                        key={product.id}
                        className="flex items-center gap-4 p-4 rounded-lg border border-border/50 bg-card/20 hover:bg-card/40 transition-colors"
                      >
                        <div className="w-16 h-20 rounded-lg overflow-hidden bg-muted/30 flex-shrink-0">
                          {product.image_url && (
                            <img
                              src={product.image_url}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold truncate">{product.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            ${product.price} • {product.type} • {product.color}
                          </p>
                          {product.brand && (
                            <p className="text-xs text-muted-foreground">{product.brand}</p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="hover:bg-white/10 hover:text-white border border-white/20"
                            onClick={() => setEditingProduct(product)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="hover:bg-red-500/20 hover:text-red-400 border border-white/20"
                            onClick={async () => {
                              if (window.confirm(`Delete "${product.name}"?`)) {
                                try {
                                  await productService.deleteProduct(product.id);
                                  toast({
                                    title: "Success",
                                    description: "Product deleted successfully",
                                  });
                                  fetchData();
                                } catch (error: any) {
                                  toast({
                                    variant: "destructive",
                                    title: "Error",
                                    description: error.message || "Failed to delete product",
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
                    No products yet
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Stores Tab */}
            <TabsContent value="stores" className="space-y-8">
              {/* Create Store Form */}
              <div className="p-8 rounded-2xl border border-border/50 bg-card/40 backdrop-blur-sm">
                <h2 className="font-display text-2xl font-bold mb-6 flex items-center gap-2">
                  <Plus className="w-6 h-6" />
                  Add New Store
                </h2>

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
                      <Label>Shipping Info</Label>
                      <Input
                        value={storeShipping}
                        onChange={(e) => setStoreShipping(e.target.value)}
                        placeholder="Worldwide shipping"
                        className="h-12 bg-card/50 border-border/50 rounded-lg"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={submitting}
                    className="w-full h-12 bg-foreground text-background hover:bg-foreground/90 hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] rounded-lg font-medium transition-all"
                  >
                    {submitting ? 'Creating...' : 'Create Store'}
                  </Button>
                </form>
              </div>

              {/* Stores List */}
              <div className="p-8 rounded-2xl border border-border/50 bg-card/40 backdrop-blur-sm">
                <h3 className="font-display text-xl font-bold mb-6">
                  All Stores ({stores.length})
                </h3>
                
                {stores.length > 0 ? (
                  <div className="space-y-4">
                    {stores.map((store) => (
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
                            onClick={() => setEditingStore(store)}
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
                                  fetchData();
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
          </Tabs>
        </div>
      </section>

      <Footer />

      {/* Edit Product Dialog */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-black/95 border border-white/20 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6 text-white">Edit Product</h2>
            
            <form onSubmit={async (e) => {
              e.preventDefault();
              try {
                await productService.updateProduct(editingProduct.id, {
                  name: editingProduct.name,
                  price: parseFloat(editingProduct.price),
                  type: editingProduct.type,
                  color: editingProduct.color,
                  gender: editingProduct.gender || null,
                  brand: editingProduct.brand || null,
                  description: editingProduct.description || null,
                  image_url: editingProduct.image_url || null,
                  is_featured: editingProduct.is_featured || false,
                });
                toast({
                  title: "Success",
                  description: "Product updated successfully",
                });
                setEditingProduct(null);
                fetchData();
              } catch (error: any) {
                toast({
                  variant: "destructive",
                  title: "Error",
                  description: error.message || "Failed to update product",
                });
              }
            }} className="space-y-4">
              <div>
                <Label className="text-white">Name</Label>
                <Input
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})}
                  className="bg-white/5 border-white/20 text-white"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-white">Price</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={editingProduct.price}
                    onChange={(e) => setEditingProduct({...editingProduct, price: e.target.value})}
                    className="bg-white/5 border-white/20 text-white"
                    required
                  />
                </div>
                
                <div>
                  <Label className="text-white">Color</Label>
                  <Input
                    value={editingProduct.color}
                    onChange={(e) => setEditingProduct({...editingProduct, color: e.target.value})}
                    className="bg-white/5 border-white/20 text-white"
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-white">Type</Label>
                  <Input
                    value={editingProduct.type}
                    onChange={(e) => setEditingProduct({...editingProduct, type: e.target.value})}
                    className="bg-white/5 border-white/20 text-white"
                    required
                  />
                </div>
                
                <div>
                  <Label className="text-white">Gender</Label>
                  <Select value={editingProduct.gender || ""} onValueChange={(val) => setEditingProduct({...editingProduct, gender: val})}>
                    <SelectTrigger className="bg-white/5 border-white/20 text-white">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent className="bg-black border-white/20">
                      <SelectItem value="men">Men</SelectItem>
                      <SelectItem value="women">Women</SelectItem>
                      <SelectItem value="unisex">Unisex</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label className="text-white">Brand</Label>
                <Input
                  value={editingProduct.brand || ""}
                  onChange={(e) => setEditingProduct({...editingProduct, brand: e.target.value})}
                  className="bg-white/5 border-white/20 text-white"
                />
              </div>
              
              <div>
                <Label className="text-white">Image URL</Label>
                <Input
                  value={editingProduct.image_url || ""}
                  onChange={(e) => setEditingProduct({...editingProduct, image_url: e.target.value})}
                  className="bg-white/5 border-white/20 text-white"
                />
              </div>
              
              <div>
                <Label className="text-white">Description</Label>
                <Textarea
                  value={editingProduct.description || ""}
                  onChange={(e) => setEditingProduct({...editingProduct, description: e.target.value})}
                  className="bg-white/5 border-white/20 text-white"
                  rows={3}
                />
              </div>
              
              <div className="flex gap-4">
                <Button type="submit" className="flex-1 bg-white text-black hover:bg-white/90">
                  Save Changes
                </Button>
                <Button type="button" variant="outline" onClick={() => setEditingProduct(null)} className="flex-1 border-white/20 text-white hover:bg-white/10">
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Store Dialog */}
      {editingStore && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-black/95 border border-white/20 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6 text-white">Edit Store</h2>
            
            <form onSubmit={async (e) => {
              e.preventDefault();
              try {
                await storeService.updateStore(editingStore.id, {
                  name: editingStore.name,
                  telegram_url: editingStore.telegram_url || null,
                  instagram_url: editingStore.instagram_url || null,
                  shipping_info: editingStore.shipping_info || null,
                });
                toast({
                  title: "Success",
                  description: "Store updated successfully",
                });
                setEditingStore(null);
                fetchData();
              } catch (error: any) {
                toast({
                  variant: "destructive",
                  title: "Error",
                  description: error.message || "Failed to update store",
                });
              }
            }} className="space-y-4">
              <div>
                <Label className="text-white">Store Name</Label>
                <Input
                  value={editingStore.name}
                  onChange={(e) => setEditingStore({...editingStore, name: e.target.value})}
                  className="bg-white/5 border-white/20 text-white"
                  required
                />
              </div>
              
              <div>
                <Label className="text-white">Telegram URL</Label>
                <Input
                  value={editingStore.telegram_url || ""}
                  onChange={(e) => setEditingStore({...editingStore, telegram_url: e.target.value})}
                  className="bg-white/5 border-white/20 text-white"
                  placeholder="https://t.me/..."
                />
              </div>
              
              <div>
                <Label className="text-white">Instagram URL</Label>
                <Input
                  value={editingStore.instagram_url || ""}
                  onChange={(e) => setEditingStore({...editingStore, instagram_url: e.target.value})}
                  className="bg-white/5 border-white/20 text-white"
                  placeholder="https://instagram.com/..."
                />
              </div>
              
              <div>
                <Label className="text-white">Shipping Info</Label>
                <Textarea
                  value={editingStore.shipping_info || ""}
                  onChange={(e) => setEditingStore({...editingStore, shipping_info: e.target.value})}
                  className="bg-white/5 border-white/20 text-white"
                  rows={3}
                  placeholder="Delivery details..."
                />
              </div>
              
              <div className="flex gap-4">
                <Button type="submit" className="flex-1 bg-white text-black hover:bg-white/90">
                  Save Changes
                </Button>
                <Button type="button" variant="outline" onClick={() => setEditingStore(null)} className="flex-1 border-white/20 text-white hover:bg-white/10">
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
