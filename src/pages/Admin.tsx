  import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useNavigate, useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import { StoreManagement } from "@/components/StoreManagement";
import { ImageUploader } from "@/components/ImageUploader";
import { z } from "zod";

const productSchema = z.object({
  name: z.string().trim().min(1, "Product name is required").max(200),
  color: z.string().trim().min(1, "Color is required").max(100),
  type: z.string().min(1, "Type is required"),
  price: z.number().positive("Price must be positive"),
  description: z.string().max(1000).optional(),
  image_url: z.string().trim().refine((val) => val === "" || z.string().url().safeParse(val).success, {
    message: "Must be a valid URL or empty"
  }).optional(),
});

const storeSchema = z.object({
  name: z.string().trim().min(1, "Store name is required").max(200),
  telegram_url: z.string().trim().refine((val) => val === "" || z.string().url().safeParse(val).success, {
    message: "Must be a valid URL or empty"
  }).optional(),
  instagram_url: z.string().trim().refine((val) => val === "" || z.string().url().safeParse(val).success, {
    message: "Must be a valid URL or empty"
  }).optional(),
  shipping_info: z.string().optional(),
});

const Admin = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("add-product");

  // Product form state
  const [productName, setProductName] = useState("");
  const [productColor, setProductColor] = useState("");
  const [productType, setProductType] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [productImageUrl, setProductImageUrl] = useState("");

  // Store info for each product - supports multiple stores
  const [productStores, setProductStores] = useState<Array<{
    name: string;
    telegram: string;
    instagram: string;
    shipping: string;
  }>>([{ name: "", telegram: "", instagram: "", shipping: "" }]);
  
  // Products list
  const [products, setProducts] = useState<any[]>([]);
  
  // Edit mode states
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
    
    // Check if we should edit a product from URL
    const editProductId = searchParams.get('editProduct');
    if (editProductId) {
      loadProductForEdit(editProductId);
    }
  }, [searchParams]);

  const fetchProducts = async () => {
    const { data } = await supabase
      .from("products")
      .select(`
        *,
        product_stores(
          stores(*)
        )
      `)
      .order("created_at", { ascending: false });
    if (data) setProducts(data);
  };

  const loadProductForEdit = async (productId: string) => {
    const { data: product } = await supabase
      .from("products")
      .select(`
        *,
        product_stores(
          stores(*)
        )
      `)
      .eq("id", productId)
      .single();
    
    if (product) {
      handleEditProduct(product);
      setActiveTab("add-product");
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Use the image URL directly from the input
      const imageUrl = productImageUrl;

      // Validate product data
      const validatedProduct = productSchema.parse({
        name: productName,
        color: productColor,
        type: productType,
        price: parseFloat(productPrice),
        description: productDescription.trim() || undefined,
        image_url: imageUrl.trim() || undefined,
      });

      // Validate and create stores
      const storeIds: string[] = [];
      
      for (const store of productStores) {
        // Skip empty stores
        if (!store.name.trim()) continue;
        
        const validatedStore = storeSchema.parse({
          name: store.name,
          telegram_url: store.telegram.trim() || undefined,
          instagram_url: store.instagram.trim() || undefined,
          shipping_info: store.shipping || undefined,
        });

        // Find or create the store
        const { data: existingStore } = await supabase
          .from("stores")
          .select("id")
          .eq("name", validatedStore.name)
          .maybeSingle();

        if (existingStore) {
          // Update existing store with new information
          const { error: updateError } = await supabase
            .from("stores")
            .update({
              telegram_url: validatedStore.telegram_url,
              instagram_url: validatedStore.instagram_url,
              shipping_info: validatedStore.shipping_info,
            })
            .eq("id", existingStore.id);
          
          if (updateError) throw updateError;
          storeIds.push(existingStore.id);
        } else {
          const { data: newStore, error: storeError } = await supabase
            .from("stores")
            .insert([{
              name: validatedStore.name,
              telegram_url: validatedStore.telegram_url,
              instagram_url: validatedStore.instagram_url,
              shipping_info: validatedStore.shipping_info,
            }])
            .select("id")
            .single();

          if (storeError) throw storeError;
          storeIds.push(newStore.id);
        }
      }

      if (storeIds.length === 0) {
        throw new Error("At least one store is required");
      }

      // Create the product
      const { data: newProduct, error: productError } = await supabase
        .from("products")
        .insert([{
          name: validatedProduct.name,
          color: validatedProduct.color,
          type: validatedProduct.type,
          price: validatedProduct.price,
          description: validatedProduct.description,
          image_url: validatedProduct.image_url,
        }])
        .select("id")
        .single();

      if (productError) throw productError;

      // Link product to all stores
      const productStoreLinks = storeIds.map(storeId => ({
        product_id: newProduct.id,
        store_id: storeId,
      }));

      const { error: linkError } = await supabase
        .from("product_stores")
        .insert(productStoreLinks);

      if (linkError) throw linkError;

      toast({
        title: "Success",
        description: "Product added successfully!",
      });

      // Reset form
      setProductName("");
      setProductColor("");
      setProductType("");
      setProductPrice("");
      setProductDescription("");
      setProductImageUrl("");
      setProductStores([{ name: "", telegram: "", instagram: "", shipping: "" }]);
      fetchProducts();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add product",
        variant: "destructive",
      });
    }
  };

  const handleEditProduct = (product: any) => {
    setEditingProductId(product.id);
    setProductName(product.name);
    setProductColor(product.color);
    setProductType(product.type);
    setProductPrice(product.price.toString());
    setProductDescription(product.description || "");
    setProductImageUrl(product.image_url || "");
    
    // Load all stores
    if (product.product_stores && product.product_stores.length > 0) {
      const stores = product.product_stores.map((ps: any) => ({
        name: ps.stores.name,
        telegram: ps.stores.telegram_url || "",
        instagram: ps.stores.instagram_url || "",
        shipping: ps.stores.shipping_info || "",
      }));
      setProductStores(stores);
    } else {
      setProductStores([{ name: "", telegram: "", instagram: "", shipping: "" }]);
    }
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProductId) return;

    try {
      // Use the image URL directly from the input
      const imageUrl = productImageUrl;

      const validatedProduct = productSchema.parse({
        name: productName,
        color: productColor,
        type: productType,
        price: parseFloat(productPrice),
        description: productDescription.trim() || undefined,
        image_url: imageUrl.trim() || undefined,
      });

      // Validate and update/create stores
      const storeIds: string[] = [];
      
      for (const store of productStores) {
        // Skip empty stores
        if (!store.name.trim()) continue;
        
        const validatedStore = storeSchema.parse({
          name: store.name,
          telegram_url: store.telegram.trim() || undefined,
          instagram_url: store.instagram.trim() || undefined,
          shipping_info: store.shipping || undefined,
        });

        // Find or create the store
        const { data: existingStore } = await supabase
          .from("stores")
          .select("id")
          .eq("name", validatedStore.name)
          .maybeSingle();

        if (existingStore) {
          // Update existing store
          const { error: updateError } = await supabase
            .from("stores")
            .update({
              telegram_url: validatedStore.telegram_url,
              instagram_url: validatedStore.instagram_url,
              shipping_info: validatedStore.shipping_info,
            })
            .eq("id", existingStore.id);
          
          if (updateError) throw updateError;
          storeIds.push(existingStore.id);
        } else {
          const { data: newStore, error: storeError } = await supabase
            .from("stores")
            .insert([{
              name: validatedStore.name,
              telegram_url: validatedStore.telegram_url,
              instagram_url: validatedStore.instagram_url,
              shipping_info: validatedStore.shipping_info,
            }])
            .select("id")
            .single();

          if (storeError) throw storeError;
          storeIds.push(newStore.id);
        }
      }

      if (storeIds.length === 0) {
        throw new Error("At least one store is required");
      }

      // Update product
      const { error: productError } = await supabase
        .from("products")
        .update({
          name: validatedProduct.name,
          color: validatedProduct.color,
          type: validatedProduct.type,
          price: validatedProduct.price,
          description: validatedProduct.description,
          image_url: validatedProduct.image_url,
        })
        .eq("id", editingProductId);

      if (productError) throw productError;

      // Delete old product_stores links
      const { error: deleteError } = await supabase
        .from("product_stores")
        .delete()
        .eq("product_id", editingProductId);

      if (deleteError) throw deleteError;

      // Create new product_stores links
      const productStoreLinks = storeIds.map(storeId => ({
        product_id: editingProductId,
        store_id: storeId,
      }));

      const { error: linkError } = await supabase
        .from("product_stores")
        .insert(productStoreLinks);

      if (linkError) throw linkError;

      toast({
        title: "Success",
        description: "Product updated successfully!",
      });

      // Reset form
      setEditingProductId(null);
      setProductName("");
      setProductColor("");
      setProductType("");
      setProductPrice("");
      setProductDescription("");
      setProductImageUrl("");
      setProductStores([{ name: "", telegram: "", instagram: "", shipping: "" }]);
      fetchProducts();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update product",
        variant: "destructive",
      });
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const { error } = await supabase.from("products").delete().eq("id", productId);
      if (error) throw error;

      toast({
        title: "Success",
        description: "Product deleted successfully!",
      });
      fetchProducts();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete product",
        variant: "destructive",
      });
    }
  };

  const cancelEdit = () => {
    setEditingProductId(null);
    setProductName("");
    setProductColor("");
    setProductType("");
    setProductPrice("");
    setProductDescription("");
    setProductImageUrl("");
    setProductStores([{ name: "", telegram: "", instagram: "", shipping: "" }]);
  };


  return (
    <div className="min-h-screen bg-background">
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-serif font-bold">Admin Panel</h1>
          <Button onClick={() => navigate("/")} variant="outline">
            Back to Main Menu
          </Button>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="add-product">Add Product</TabsTrigger>
            <TabsTrigger value="manage-products">Manage Products</TabsTrigger>
            <TabsTrigger value="manage-stores">Manage Stores</TabsTrigger>
          </TabsList>

          <TabsContent value="add-product">
            <Card>
              <CardHeader>
                <CardTitle>{editingProductId ? "Edit Product" : "Add New Product"}</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={editingProductId ? handleUpdateProduct : handleAddProduct} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="product-name">Product Name</Label>
                      <Input
                        id="product-name"
                        value={productName}
                        onChange={(e) => setProductName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="product-color">Color</Label>
                      <Input
                        id="product-color"
                        value={productColor}
                        onChange={(e) => setProductColor(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="product-type">Type</Label>
                      <Select value={productType} onValueChange={setProductType} required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Outerwear">Outerwear</SelectItem>
                          <SelectItem value="Bottoms">Bottoms</SelectItem>
                          <SelectItem value="Hats">Hats</SelectItem>
                          <SelectItem value="Shoes">Shoes</SelectItem>
                          <SelectItem value="Tops">Tops</SelectItem>
                          <SelectItem value="Accessories">Accessories</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="product-price">Price</Label>
                      <Input
                        id="product-price"
                        type="number"
                        step="0.01"
                        value={productPrice}
                        onChange={(e) => setProductPrice(e.target.value)}
                        required
                      />
                    </div>
                    
                    {/* Image Upload Section */}
                    <div className="space-y-2 md:col-span-2">
                      <ImageUploader
                        onImageUpload={(url) => setProductImageUrl(url)}
                        currentImage={productImageUrl}
                        label="Product Image"
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="product-image">Or paste Image URL directly</Label>
                      <Input
                        id="product-image"
                        value={productImageUrl}
                        onChange={(e) => setProductImageUrl(e.target.value)}
                        placeholder="https://... or s3://..."
                      />
                      <p className="text-xs text-muted-foreground select-none">
                        Alternative: Paste direct URL if you have image hosted elsewhere
                      </p>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="product-description">Description</Label>
                      <Textarea
                        id="product-description"
                        value={productDescription}
                        onChange={(e) => setProductDescription(e.target.value)}
                        rows={4}
                      />
                    </div>
                    
                    {/* Stores Section */}
                    <div className="space-y-4 md:col-span-2">
                      <div className="flex justify-between items-center">
                        <Label className="text-lg font-semibold">Stores</Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setProductStores([...productStores, { name: "", telegram: "", instagram: "", shipping: "" }])}
                        >
                          + Add Store
                        </Button>
                      </div>
                      
                      {productStores.map((store, index) => (
                        <Card key={index} className="p-4">
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <h4 className="font-medium">Store {index + 1}</h4>
                              {productStores.length > 1 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setProductStores(productStores.filter((_, i) => i !== index))}
                                >
                                  Remove
                                </Button>
                              )}
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor={`store-name-${index}`}>Store Name *</Label>
                              <Input
                                id={`store-name-${index}`}
                                value={store.name}
                                onChange={(e) => {
                                  const newStores = [...productStores];
                                  newStores[index].name = e.target.value;
                                  setProductStores(newStores);
                                }}
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor={`store-telegram-${index}`}>Telegram URL</Label>
                              <Input
                                id={`store-telegram-${index}`}
                                value={store.telegram}
                                onChange={(e) => {
                                  const newStores = [...productStores];
                                  newStores[index].telegram = e.target.value;
                                  setProductStores(newStores);
                                }}
                                placeholder="https://t.me/..."
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor={`store-instagram-${index}`}>Instagram URL</Label>
                              <Input
                                id={`store-instagram-${index}`}
                                value={store.instagram}
                                onChange={(e) => {
                                  const newStores = [...productStores];
                                  newStores[index].instagram = e.target.value;
                                  setProductStores(newStores);
                                }}
                                placeholder="https://instagram.com/..."
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor={`store-shipping-${index}`}>Shipping Region</Label>
                              <Select
                                key={`shipping-select-${index}`}
                                value={store.shipping || ""}
                                onValueChange={(value) => {
                                  const newStores = [...productStores];
                                  newStores[index].shipping = value;
                                  setProductStores(newStores);
                                }}
                              >
                                <SelectTrigger id={`store-shipping-${index}`}>
                                  <SelectValue placeholder="Select shipping region" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Worldwide">Worldwide</SelectItem>
                                  <SelectItem value="Europe">Europe</SelectItem>
                                  <SelectItem value="Ukraine">Ukraine Only</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" className="flex-1">
                      {editingProductId ? "Update Product" : "Add Product"}
                    </Button>
                    {editingProductId && (
                      <>
                        <Button type="button" variant="outline" onClick={cancelEdit}>
                          Cancel
                        </Button>
                        <Button 
                          type="button" 
                          variant="destructive" 
                          onClick={() => {
                            if (window.confirm('Are you sure you want to delete this product?')) {
                              handleDeleteProduct(editingProductId);
                            }
                          }}
                        >
                          Delete
                        </Button>
                      </>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="manage-products">
            <Card>
              <CardHeader>
                <CardTitle>Manage Products</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {products.map((product) => (
                    <div key={product.id} className="border rounded-lg p-4 space-y-2">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{product.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {product.color} • {product.type} • ${product.price}
                          </p>
                          {product.description && (
                            <p className="text-sm mt-2">{product.description}</p>
                          )}
                          {product.image_url && (
                            <img src={product.image_url} alt={product.name} className="mt-2 h-20 object-cover rounded" />
                          )}
                          {product.product_stores && product.product_stores.length > 0 && (
                            <div className="mt-2">
                              <p className="text-sm font-medium">Stores:</p>
                              {product.product_stores.map((ps: any) => (
                                <p key={ps.stores.id} className="text-sm text-muted-foreground">
                                  • {ps.stores.name}
                                </p>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleEditProduct(product)}>
                            Edit
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDeleteProduct(product.id)}>
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {products.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">No products yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="manage-stores">
            <Card>
              <CardHeader>
                <CardTitle>Manage Stores</CardTitle>
              </CardHeader>
              <CardContent>
                <StoreManagement />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
