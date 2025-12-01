import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Pencil, Trash2, Plus, X, Save } from "lucide-react";

interface Store {
  id: string;
  name: string;
  telegram_url: string | null;
  instagram_url: string | null;
  shipping_info: string | null;
  created_at: string;
}

export const StoreManagement = () => {
  const { toast } = useToast();
  const [stores, setStores] = useState<Store[]>([]);
  const [editingStore, setEditingStore] = useState<Store | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  
  // Form state
  const [storeName, setStoreName] = useState("");
  const [telegramUrl, setTelegramUrl] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");
  const [shippingInfo, setShippingInfo] = useState("");

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    const { data, error } = await supabase
      .from("stores")
      .select("*")
      .order("name");

    if (!error && data) {
      setStores(data);
    }
  };

  const resetForm = () => {
    setStoreName("");
    setTelegramUrl("");
    setInstagramUrl("");
    setShippingInfo("");
    setEditingStore(null);
    setIsAdding(false);
  };

  const startEdit = (store: Store) => {
    setEditingStore(store);
    setStoreName(store.name);
    setTelegramUrl(store.telegram_url || "");
    setInstagramUrl(store.instagram_url || "");
    setShippingInfo(store.shipping_info || "");
    setIsAdding(false);
  };

  const startAdd = () => {
    resetForm();
    setIsAdding(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!storeName.trim()) {
      toast({
        title: "Error",
        description: "Store name is required",
        variant: "destructive",
      });
      return;
    }

    const storeData = {
      name: storeName.trim(),
      telegram_url: telegramUrl.trim() || null,
      instagram_url: instagramUrl.trim() || null,
      shipping_info: shippingInfo.trim() || null,
    };

    if (editingStore) {
      // Update existing store
      const { error } = await supabase
        .from("stores")
        .update(storeData)
        .eq("id", editingStore.id);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to update store",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Store updated successfully",
        });
        resetForm();
        fetchStores();
      }
    } else {
      // Create new store
      const { error } = await supabase
        .from("stores")
        .insert([storeData]);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to create store",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Store created successfully",
        });
        resetForm();
        fetchStores();
      }
    }
  };

  const handleDelete = async (storeId: string, storeName: string) => {
    if (!confirm(`Are you sure you want to delete "${storeName}"? This will remove all product associations with this store.`)) {
      return;
    }

    const { error } = await supabase
      .from("stores")
      .delete()
      .eq("id", storeId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete store",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Store deleted successfully",
      });
      fetchStores();
    }
  };

  return (
    <div className="space-y-6">
      {/* Add Store Button */}
      {!isAdding && !editingStore && (
        <Button onClick={startAdd} className="w-full">
          <Plus className="w-4 h-4 mr-2" />
          Add New Store
        </Button>
      )}

      {/* Add/Edit Form */}
      {(isAdding || editingStore) && (
        <Card className="p-6 border-2 border-primary">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold select-none">
                {editingStore ? "Edit Store" : "Add New Store"}
              </h3>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={resetForm}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="store-name">Store Name *</Label>
                <Input
                  id="store-name"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  placeholder="e.g., Fashion Store"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="shipping-info">Shipping Region</Label>
                <Input
                  id="shipping-info"
                  value={shippingInfo}
                  onChange={(e) => setShippingInfo(e.target.value)}
                  placeholder="e.g., Worldwide, Europe"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="telegram-url">Telegram URL</Label>
                <Input
                  id="telegram-url"
                  type="url"
                  value={telegramUrl}
                  onChange={(e) => setTelegramUrl(e.target.value)}
                  placeholder="https://t.me/..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="instagram-url">Instagram URL</Label>
                <Input
                  id="instagram-url"
                  type="url"
                  value={instagramUrl}
                  onChange={(e) => setInstagramUrl(e.target.value)}
                  placeholder="https://instagram.com/..."
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button type="submit" className="flex-1">
                <Save className="w-4 h-4 mr-2" />
                {editingStore ? "Update Store" : "Create Store"}
              </Button>
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Stores List */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold select-none">
          All Stores ({stores.length})
        </h3>
        
        {stores.length === 0 ? (
          <p className="text-center text-muted-foreground py-8 select-none">
            No stores yet. Add your first store above.
          </p>
        ) : (
          <div className="space-y-3">
            {stores.map((store) => (
              <Card
                key={store.id}
                className={`p-4 transition-all ${
                  editingStore?.id === store.id ? "border-2 border-primary" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <h4 className="font-semibold text-lg select-none">{store.name}</h4>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                      {store.shipping_info && (
                        <div>
                          <span className="text-muted-foreground select-none">Shipping: </span>
                          <span className="select-none">{store.shipping_info}</span>
                        </div>
                      )}
                      {store.telegram_url && (
                        <div>
                          <span className="text-muted-foreground select-none">Telegram: </span>
                          <a
                            href={store.telegram_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:underline"
                          >
                            Link
                          </a>
                        </div>
                      )}
                      {store.instagram_url && (
                        <div>
                          <span className="text-muted-foreground select-none">Instagram: </span>
                          <a
                            href={store.instagram_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:underline"
                          >
                            Link
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => startEdit(store)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(store.id, store.name)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
