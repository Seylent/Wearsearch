/**
 * Store Management Component
 * Handles CRUD operations for stores in the admin panel
 */

import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  Shield,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';

type VerificationStatus = 'pending' | 'verified' | 'rejected';

interface Store {
  id: number;
  name: string;
  domain?: string;
  logo_url?: string;
  description?: string;
  country?: string;
  website_url?: string;
  contact_email?: string;
  contact_phone?: string;
  telegram_url?: string;
  instagram_url?: string;
  tiktok_url?: string;
  shipping_info?: string;
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
  loading: _loading = false,
}: StoreManagementProps) => {
  const { t } = useTranslation();

  // Local state
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingStore, setEditingStore] = useState<Store | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState<{
    name: string;
    website_url: string;
    telegram_url: string;
    instagram_url: string;
    tiktok_url: string;
    shipping_info: string;
    is_active: boolean;
    verification_status: VerificationStatus;
  }>({
    name: '',
    website_url: '',
    telegram_url: '',
    instagram_url: '',
    tiktok_url: '',
    shipping_info: '',
    is_active: true,
    verification_status: 'pending' as const,
  });

  // Filtered stores
  const filteredStores = useMemo(() => {
    if (!searchTerm) return stores;
    const query = searchTerm.toLowerCase();
    return stores.filter(
      store =>
        store.name.toLowerCase().includes(query) ||
        store.website_url?.toLowerCase().includes(query) ||
        store.telegram_url?.toLowerCase().includes(query) ||
        store.instagram_url?.toLowerCase().includes(query)
    );
  }, [stores, searchTerm]);

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      website_url: '',
      telegram_url: '',
      instagram_url: '',
      tiktok_url: '',
      shipping_info: '',
      is_active: true,
      verification_status: 'pending',
    });
    setEditingStore(null);
  };

  // Load store for editing
  const handleEdit = (store: Store) => {
    setEditingStore(store);
    setFormData({
      name: store.name || '',
      website_url: store.website_url || '',
      telegram_url: store.telegram_url || '',
      instagram_url: store.instagram_url || '',
      tiktok_url: store.tiktok_url || '',
      shipping_info: store.shipping_info || '',
      is_active: store.is_active ?? true,
      verification_status: store.verification_status || 'pending',
    });
    setIsAddDialogOpen(true);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
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

        <Dialog
          open={isAddDialogOpen}
          onOpenChange={open => {
            setIsAddDialogOpen(open);
            if (!open) resetForm();
          }}
          modal={false}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              {t('admin.addStore')}
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingStore ? t('admin.editStore') : t('admin.addStore')}</DialogTitle>
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
                    onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g. Nike Official Store"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website_url">{t('admin.websiteUrl')}</Label>
                  <Input
                    id="website_url"
                    type="url"
                    value={formData.website_url}
                    onChange={e => setFormData(prev => ({ ...prev, website_url: e.target.value }))}
                    placeholder="https://nike.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="telegram_url">{t('admin.telegram')}</Label>
                  <Input
                    id="telegram_url"
                    value={formData.telegram_url}
                    onChange={e => setFormData(prev => ({ ...prev, telegram_url: e.target.value }))}
                    placeholder="https://t.me/your_store"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="instagram_url">{t('admin.instagram')}</Label>
                  <Input
                    id="instagram_url"
                    value={formData.instagram_url}
                    onChange={e =>
                      setFormData(prev => ({ ...prev, instagram_url: e.target.value }))
                    }
                    placeholder="https://instagram.com/your_store"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tiktok_url">{t('admin.tiktok')}</Label>
                  <Input
                    id="tiktok_url"
                    value={formData.tiktok_url}
                    onChange={e => setFormData(prev => ({ ...prev, tiktok_url: e.target.value }))}
                    placeholder="https://tiktok.com/@your_store"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="shipping_info">{t('admin.shippingInfo')}</Label>
                <Textarea
                  id="shipping_info"
                  value={formData.shipping_info}
                  onChange={e => setFormData(prev => ({ ...prev, shipping_info: e.target.value }))}
                  placeholder={t('admin.shippingInfoPlaceholder')}
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={checked =>
                    setFormData(prev => ({ ...prev, is_active: checked }))
                  }
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
          onChange={e => setSearchTerm(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Store List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStores.map(store => {
          const storeKey = `${store.id}-${store.domain ?? store.website_url ?? store.name}`;

          return (
            <Card key={storeKey} className="relative group">
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
                  <Badge variant={store.is_active ? 'default' : 'secondary'}>
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
                    {t(`admin.${store.verification_status ?? 'undefined'}`)}
                  </Badge>
                </div>

                {/* Store Info */}
                {store.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">{store.description}</p>
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
                      <span>
                        {store.products_count} {t('common.products')}
                      </span>
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
          );
        })}
      </div>

      {filteredStores.length === 0 && (
        <div className="text-center py-12">
          <Store className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">
            {searchTerm ? t('admin.noStoresFound') : t('admin.noStores')}
          </h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm ? t('admin.tryDifferentSearch') : t('admin.addFirstStore')}
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
