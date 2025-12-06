import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Pencil, Trash2, Plus, X, Save, CheckCircle2 } from "lucide-react";

interface Store {
  id: string;
  name: string;
  telegram_url: string | null;
  instagram_url: string | null;
  shipping_info: string | null;
  is_verified: boolean;
  average_rating: number;
  total_ratings: number;
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
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/stores');
      
      if (response.ok) {
        const result = await response.json();
        const storesData = result.data || result;
        if (storesData) {
          // Sort by name
          const sortedStores = storesData.sort((a: Store, b: Store) => a.name.localeCompare(b.name));
          setStores(sortedStores);
        }
      }
    } catch (error) {
      console.error('Failed to fetch stores:', error);
    }
  };

  const resetForm = () => {
    setStoreName("");
    setTelegramUrl("");
    setInstagramUrl("");
    setShippingInfo("");
    setIsVerified(false);
    setEditingStore(null);
    setIsAdding(false);
  };

  const startEdit = (store: Store) => {
    setEditingStore(store);
    setStoreName(store.name);
    setTelegramUrl(store.telegram_url || "");
    setInstagramUrl(store.instagram_url || "");
    setShippingInfo(store.shipping_info || "");
    setIsVerified(store.is_verified || false);
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

    const token = localStorage.getItem('access_token');
    if (!token) {
      toast({
        title: "Error",
        description: "Please login first",
        variant: "destructive",
      });
      return;
    }

    const storeData = {
      name: storeName.trim(),
      telegram_url: telegramUrl.trim() || null,
      instagram_url: instagramUrl.trim() || null,
      shipping_info: shippingInfo.trim() || null,
      is_verified: isVerified,
    };

    try {
      if (editingStore) {
        // Update existing store
        const response = await fetch(`http://localhost:3000/api/admin/stores/${editingStore.id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(storeData),
        });

        if (!response.ok) {
          throw new Error('Failed to update store');
        }

        toast({
          title: "Success",
          description: "Store updated successfully",
        });
        resetForm();
        fetchStores();
      } else {
        // Create new store
        const response = await fetch('http://localhost:3000/api/admin/stores', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(storeData),
        });

        if (!response.ok) {
          throw new Error('Failed to create store');
        }

        toast({
          title: "Success",
          description: "Store created successfully",
        });
        resetForm();
        fetchStores();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || (editingStore ? "Failed to update store" : "Failed to create store"),
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (storeId: string, storeName: string) => {
    if (!confirm(`Are you sure you want to delete "${storeName}"? This will remove all product associations with this store.`)) {
      return;
    }

    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        toast({
          title: "Error",
          description: "Please login first",
          variant: "destructive",
        });
        return;
      }

      const response = await fetch(`http://localhost:3000/api/admin/stores/${storeId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete store');
      }

      toast({
        title: "Success",
        description: "Store deleted successfully",
      });
      fetchStores();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete store",
        variant: "destructive",
      });
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
                <Label htmlFor="shipping-info">Shipping Region *</Label>
                <Select value={shippingInfo} onValueChange={setShippingInfo} required>
                  <SelectTrigger id="shipping-info">
                    <SelectValue placeholder="Select shipping region" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Worldwide">Worldwide</SelectItem>
                    <SelectItem value="Europe">Europe</SelectItem>
                    <SelectItem value="USA">USA</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2 pt-6">
                  <Checkbox 
                    id="is-verified" 
                    checked={isVerified}
                    onCheckedChange={(checked) => setIsVerified(checked as boolean)}
                  />
                  <Label htmlFor="is-verified" className="cursor-pointer">
                    Verified Store
                  </Label>
                </div>
                <p className="text-xs text-muted-foreground select-none">
                  Mark as verified to show trust badge
                </p>
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
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-lg select-none">{store.name}</h4>
                      {store.is_verified && (
                        <div className="flex items-center gap-1 bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-xs font-medium">
                          <CheckCircle2 className="w-3 h-3" />
                          Verified
                        </div>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                      {store.shipping_info && (
                        <div>
                          <span className="text-muted-foreground select-none">Shipping: </span>
                          <span className="select-none">{store.shipping_info}</span>
                        </div>
                      )}
                      {store.total_ratings > 0 && (
                        <div>
                          <span className="text-muted-foreground select-none">Rating: </span>
                          <span className="select-none font-medium">
                            ⭐ {store.average_rating.toFixed(1)} ({store.total_ratings} reviews)
                          </span>
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
