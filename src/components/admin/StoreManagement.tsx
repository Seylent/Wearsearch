/**
 * Store Management Component
 * Handles CRUD operations for stores in the admin panel
 */

import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  ExternalLink,
  Store,
  Globe,
  MapPin,
  Package,
  Shield
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type VerificationStatus = 'pending' | 'verified' | 'rejected';

interface Store {
  id: number;
  name: string;
  domain: string;
  logo_url?: string;
  description?: string;
  country?: string;
  website_url?: string;
  contact_email?: string;
  contact_phone?: string;
  is_active?: boolean;
  verification_status?: VerificationStatus;
  created_at?: string;
  updated_at?: string;
  products_count?: number;
  shipping_regions?: string[];
  supported_currencies?: string[];
}

interface StoreManagementProps {
  stores: Store[];
  onStoreCreate: (store: Omit<Store, 'id'>) => Promise<void>;
  onStoreUpdate: (id: number, store: Partial<Store>) => Promise<void>;
  onStoreDelete: (id: number) => Promise<void>;
  loading?: boolean;
}

export const StoreManagement = ({ 
  stores, 
  onStoreCreate, 
  onStoreUpdate, 
  onStoreDelete,
  loading = false 
}: StoreManagementProps) => {
  const { t } = useTranslation();
  
  // Local state
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingStore, setEditingStore] = useState<Store | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState<{
    name: string;
    domain: string;
    description: string;
    country: string;
    website_url: string;
    contact_email: string;
    contact_phone: string;
    logo_url: string;
    is_active: boolean;
    verification_status: VerificationStatus;
    shipping_regions: string[];
    supported_currencies: string[];
  }>({
    name: "",
    domain: "",
    description: "",
    country: "",
    website_url: "",
    contact_email: "",
    contact_phone: "",
    logo_url: "",
    is_active: true,
    verification_status: 'pending' as const,
    shipping_regions: [] as string[],
    supported_currencies: ['USD', 'EUR'] as string[]
  });

  // Filtered stores
  const filteredStores = useMemo(() => {
    if (!searchTerm) return stores;
    return stores.filter(store => 
      store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      store.domain.toLowerCase().includes(searchTerm.toLowerCase()) ||
      store.country?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [stores, searchTerm]);

  // Reset form
  const resetForm = () => {
    setFormData({
      name: "",
      domain: "",
      description: "",
      country: "",
      website_url: "",
      contact_email: "",
      contact_phone: "",
      logo_url: "",
      is_active: true,
      verification_status: 'pending',
      shipping_regions: [],
      supported_currencies: ['USD', 'EUR']
    });
    setEditingStore(null);
  };

  // Load store for editing
  const handleEdit = (store: Store) => {
    setEditingStore(store);
    setFormData({
      name: store.name || "",
      domain: store.domain || "",
      description: store.description || "",
      country: store.country || "",
      website_url: store.website_url || "",
      contact_email: store.contact_email || "",
      contact_phone: store.contact_phone || "",
      logo_url: store.logo_url || "",
      is_active: store.is_active ?? true,
      verification_status: store.verification_status || 'pending',
      shipping_regions: store.shipping_regions || [],
      supported_currencies: store.supported_currencies || ['USD', 'EUR']
    });
    setIsAddDialogOpen(true);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.domain.trim()) {
      return;
    }

    setSubmitting(true);
    try {
      if (editingStore) {
        await onStoreUpdate(editingStore.id, formData);
      } else {
        await onStoreCreate(formData);
      }
      
      setIsAddDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error saving store:', error);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle delete
  const handleDelete = async (id: number) => {
    setSubmitting(true);
    try {
      await onStoreDelete(id);
    } catch (error) {
      console.error('Error deleting store:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold mb-2">{t('admin.storeManagement')}</h2>
          <p className="text-muted-foreground">{t('admin.manageStoresDescription')}</p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
          setIsAddDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              {t('admin.addStore')}
            </Button>
          </DialogTrigger>
          
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingStore ? t('admin.editStore') : t('admin.addStore')}
              </DialogTitle>
              <DialogDescription>
                {editingStore ? t('admin.editStoreDescription') : t('admin.addStoreDescription')}
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">{t('common.name')} *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g. Nike Official Store"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="domain">{t('admin.domain')} *</Label>
                  <Input
                    id="domain"
                    value={formData.domain}
                    onChange={(e) => setFormData(prev => ({ ...prev, domain: e.target.value }))}
                    placeholder="e.g. nike.com"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="country">{t('common.country')}</Label>
                  <Input
                    id="country"
                    value={formData.country}
                    onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                    placeholder="e.g. United States"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="verification_status">{t('admin.verificationStatus')}</Label>
                  <Select 
                    value={formData.verification_status} 
                    onValueChange={(value: VerificationStatus) => 
                      setFormData(prev => ({ ...prev, verification_status: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">{t('admin.pending')}</SelectItem>
                      <SelectItem value="verified">{t('admin.verified')}</SelectItem>
                      <SelectItem value="rejected">{t('admin.rejected')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">{t('common.description')}</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder={t('admin.storeDescriptionPlaceholder')}
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="website_url">{t('admin.websiteUrl')}</Label>
                  <Input
                    id="website_url"
                    type="url"
                    value={formData.website_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, website_url: e.target.value }))}
                    placeholder="https://nike.com"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="logo_url">{t('admin.logoUrl')}</Label>
                  <Input
                    id="logo_url"
                    type="url"
                    value={formData.logo_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, logo_url: e.target.value }))}
                    placeholder="https://example.com/logo.png"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="contact_email">{t('admin.contactEmail')}</Label>
                  <Input
                    id="contact_email"
                    type="email"
                    value={formData.contact_email}
                    onChange={(e) => setFormData(prev => ({ ...prev, contact_email: e.target.value }))}
                    placeholder="contact@nike.com"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="contact_phone">{t('admin.contactPhone')}</Label>
                  <Input
                    id="contact_phone"
                    value={formData.contact_phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, contact_phone: e.target.value }))}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                />
                <Label htmlFor="is_active">{t('admin.activeStore')}</Label>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => {
                    setIsAddDialogOpen(false);
                    resetForm();
                  }}
                >
                  {t('common.cancel')}
                </Button>
                <Button type="submit" disabled={submitting}>
                  {(() => {
                    if (submitting) return t('common.saving');
                    return editingStore ? t('common.save') : t('common.create');
                  })()}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder={t('admin.searchStores')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Store List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStores.map((store) => (
          <Card key={store.id} className="relative group">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {store.logo_url ? (
                    <img 
                      src={store.logo_url} 
                      alt={store.name}
                      className="w-10 h-10 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                      <Store className="w-5 h-5" />
                    </div>
                  )}
                  <div>
                    <CardTitle className="text-lg">{store.name}</CardTitle>
                    <CardDescription>{store.domain}</CardDescription>
                  </div>
                </div>
                
                <div className="flex gap-1">
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => handleEdit(store)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Edit3 className="w-4 h-4" />
                  </Button>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>{t('admin.deleteStore')}</AlertDialogTitle>
                        <AlertDialogDescription>
                          {t('admin.deleteStoreConfirm', { name: store.name })}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(store.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          {t('common.delete')}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-3">
              {/* Status Badges */}
              <div className="flex gap-2">
                <Badge 
                  variant={store.is_active ? "default" : "secondary"}
                >
                  {store.is_active ? t('admin.active') : t('admin.inactive')}
                </Badge>
                
                <Badge 
                  variant={(() => {
                    if (store.verification_status === 'verified') return 'default';
                    if (store.verification_status === 'rejected') return 'destructive';
                    return 'secondary';
                  })()}
                >
                  <Shield className="w-3 h-3 mr-1" />
                  {t(`admin.${store.verification_status}`)}
                </Badge>
              </div>
              
              {/* Store Info */}
              {store.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {store.description}
                </p>
              )}
              
              <div className="space-y-1 text-xs text-muted-foreground">
                {store.country && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3 h-3" />
                    <span>{store.country}</span>
                  </div>
                )}
                
                {store.products_count !== undefined && (
                  <div className="flex items-center gap-2">
                    <Package className="w-3 h-3" />
                    <span>{store.products_count} {t('common.products')}</span>
                  </div>
                )}
                
                {store.website_url && (
                  <div className="flex items-center gap-2">
                    <Globe className="w-3 h-3" />
                    <a 
                      href={store.website_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="hover:text-foreground transition-colors"
                    >
                      {t('admin.visitWebsite')}
                      <ExternalLink className="w-3 h-3 inline ml-1" />
                    </a>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {filteredStores.length === 0 && (
        <div className="text-center py-12">
          <Store className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">
            {searchTerm ? t('admin.noStoresFound') : t('admin.noStores')}
          </h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm 
              ? t('admin.tryDifferentSearch')
              : t('admin.addFirstStore')
            }
          </p>
          {searchTerm && (
            <Button variant="outline" onClick={() => setSearchTerm('')}>
              {t('admin.clearSearch')}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default StoreManagement;