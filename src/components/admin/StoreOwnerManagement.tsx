'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '@/services/api';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const parseSizes = (value: string) =>
  value
    .split(',')
    .map(size => size.trim())
    .filter(Boolean);

const parseIds = (value: string) =>
  value
    .split(',')
    .map(id => id.trim())
    .filter(Boolean);

export const StoreOwnerManagement = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [storeId, setStoreId] = useState('');
  const [managerEmail, setManagerEmail] = useState('');
  const [managerUserId, setManagerUserId] = useState('');
  const [existingProductId, setExistingProductId] = useState('');
  const [existingPrice, setExistingPrice] = useState('');
  const [existingSizes, setExistingSizes] = useState('');
  const [existingSizeIds, setExistingSizeIds] = useState('');
  const [newProduct, setNewProduct] = useState({
    name: '',
    type: '',
    price: '',
    brand_id: '',
    color: '',
    gender: '',
    category: '',
    image_url: '',
    description: '',
    sizes: '',
    material_ids: '',
    technology_ids: '',
    size_ids: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const resolvedStoreId = useMemo(() => {
    const userStoreId = isRecord(user) ? user.store_id : undefined;
    return storeId.trim() || String(userStoreId ?? '').trim();
  }, [storeId, user]);

  useEffect(() => {
    if (!storeId && isRecord(user) && user.store_id) {
      setStoreId(String(user.store_id));
    }
  }, [user, storeId]);

  const handleAddManager = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage(null);
    setError(null);
    if (!resolvedStoreId || !managerEmail.trim()) {
      setError(t('store.managersRequired', 'Store and email are required'));
      return;
    }
    setLoading(true);
    try {
      await api.post(`/stores/${resolvedStoreId}/managers`, {
        email: managerEmail.trim(),
      });
      setMessage(t('store.managerAdded', 'Manager added'));
      setManagerEmail('');
    } catch {
      setError(t('store.managerAddError', 'Failed to add manager'));
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveManager = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage(null);
    setError(null);
    if (!resolvedStoreId || !managerUserId.trim()) {
      setError(t('store.managerRemoveRequired', 'Store and user ID are required'));
      return;
    }
    setLoading(true);
    try {
      await api.delete(`/stores/${resolvedStoreId}/managers/${managerUserId.trim()}`);
      setMessage(t('store.managerRemoved', 'Manager removed'));
      setManagerUserId('');
    } catch {
      setError(t('store.managerRemoveError', 'Failed to remove manager'));
    } finally {
      setLoading(false);
    }
  };

  const handleAttachExistingProduct = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage(null);
    setError(null);
    if (!resolvedStoreId || !existingProductId.trim()) {
      setError(t('store.productRequired', 'Store and product ID are required'));
      return;
    }
    setLoading(true);
    try {
      await api.post(`/stores/${resolvedStoreId}/products`, {
        product_id: existingProductId.trim(),
        price: Number(existingPrice) || 0,
        sizes: parseSizes(existingSizes),
        size_ids: parseIds(existingSizeIds),
      });
      setMessage(t('store.productLinked', 'Product added to store'));
      setExistingProductId('');
      setExistingPrice('');
      setExistingSizes('');
      setExistingSizeIds('');
    } catch {
      setError(t('store.productLinkError', 'Failed to add product'));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStoreProduct = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage(null);
    setError(null);
    if (!resolvedStoreId || !newProduct.name.trim()) {
      setError(t('store.productCreateRequired', 'Store and product name are required'));
      return;
    }
    setLoading(true);
    try {
      await api.post(`/stores/${resolvedStoreId}/products`, {
        name: newProduct.name.trim(),
        type: newProduct.type.trim() || undefined,
        price: Number(newProduct.price) || 0,
        brand_id: newProduct.brand_id.trim() || undefined,
        color: newProduct.color.trim() || undefined,
        gender: newProduct.gender.trim() || undefined,
        category: newProduct.category.trim() || undefined,
        category_slug: newProduct.category.trim() || undefined,
        image_url: newProduct.image_url.trim() || undefined,
        description: newProduct.description.trim() || undefined,
        sizes: parseSizes(newProduct.sizes),
        material_ids: parseIds(newProduct.material_ids),
        technology_ids: parseIds(newProduct.technology_ids),
        size_ids: parseIds(newProduct.size_ids),
      });
      setMessage(t('store.productCreated', 'Reseller product created'));
      setNewProduct({
        name: '',
        type: '',
        price: '',
        brand_id: '',
        color: '',
        gender: '',
        category: '',
        image_url: '',
        description: '',
        sizes: '',
        material_ids: '',
        technology_ids: '',
        size_ids: '',
      });
    } catch {
      setError(t('store.productCreateError', 'Failed to create product'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-6">
      <Card className="border border-border/50 bg-card/40 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">
            {t('store.managersTitle', 'Store managers')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="store-id">{t('store.storeId', 'Store ID')}</Label>
            <Input
              id="store-id"
              value={storeId}
              onChange={event => setStoreId(event.target.value)}
              placeholder="store_id"
            />
          </div>

          <form onSubmit={handleAddManager} className="grid gap-3 md:grid-cols-[1fr_auto]">
            <div className="grid gap-2">
              <Label htmlFor="manager-email">{t('store.managerEmail', 'Manager email')}</Label>
              <Input
                id="manager-email"
                type="email"
                value={managerEmail}
                onChange={event => setManagerEmail(event.target.value)}
                placeholder="manager@email.com"
              />
            </div>
            <div className="flex items-end">
              <Button type="submit" disabled={loading} variant="pill" size="pill">
                {t('store.addManager', 'Add manager')}
              </Button>
            </div>
          </form>

          <form onSubmit={handleRemoveManager} className="grid gap-3 md:grid-cols-[1fr_auto]">
            <div className="grid gap-2">
              <Label htmlFor="manager-user-id">{t('store.managerUserId', 'Manager user ID')}</Label>
              <Input
                id="manager-user-id"
                value={managerUserId}
                onChange={event => setManagerUserId(event.target.value)}
                placeholder="user_id"
              />
            </div>
            <div className="flex items-end">
              <Button type="submit" variant="pillOutline" size="pill" disabled={loading}>
                {t('store.removeManager', 'Remove manager')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="border border-border/50 bg-card/40 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">
            {t('store.productsTitle', 'Add product to store')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="existing" className="space-y-4">
            <TabsList className="grid grid-cols-2">
              <TabsTrigger value="existing">
                {t('store.existingProduct', 'Existing product')}
              </TabsTrigger>
              <TabsTrigger value="new">{t('store.newProduct', 'New reseller product')}</TabsTrigger>
            </TabsList>

            <TabsContent value="existing">
              <form onSubmit={handleAttachExistingProduct} className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="existing-product-id">{t('store.productId', 'Product ID')}</Label>
                  <Input
                    id="existing-product-id"
                    value={existingProductId}
                    onChange={event => setExistingProductId(event.target.value)}
                    placeholder="product_id"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="existing-price">{t('store.price', 'Price')}</Label>
                  <Input
                    id="existing-price"
                    type="number"
                    value={existingPrice}
                    onChange={event => setExistingPrice(event.target.value)}
                    placeholder="1000"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="existing-sizes">
                    {t('store.sizes', 'Sizes (comma separated)')}
                  </Label>
                  <Input
                    id="existing-sizes"
                    value={existingSizes}
                    onChange={event => setExistingSizes(event.target.value)}
                    placeholder="S, M, L"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="existing-size-ids">
                    {t('store.sizeIds', 'Size IDs (comma separated)')}
                  </Label>
                  <Input
                    id="existing-size-ids"
                    value={existingSizeIds}
                    onChange={event => setExistingSizeIds(event.target.value)}
                    placeholder="uuid, uuid"
                  />
                </div>
                <Button type="submit" disabled={loading} variant="pill" size="pill">
                  {t('store.addExistingProduct', 'Add product')}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="new">
              <form onSubmit={handleCreateStoreProduct} className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="new-name">{t('store.productName', 'Name')}</Label>
                  <Input
                    id="new-name"
                    value={newProduct.name}
                    onChange={event =>
                      setNewProduct(prev => ({ ...prev, name: event.target.value }))
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="new-type">{t('store.productType', 'Type')}</Label>
                  <Input
                    id="new-type"
                    value={newProduct.type}
                    onChange={event =>
                      setNewProduct(prev => ({ ...prev, type: event.target.value }))
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="new-price">{t('store.price', 'Price')}</Label>
                  <Input
                    id="new-price"
                    type="number"
                    value={newProduct.price}
                    onChange={event =>
                      setNewProduct(prev => ({ ...prev, price: event.target.value }))
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="new-brand">{t('store.brandId', 'Brand ID (optional)')}</Label>
                  <Input
                    id="new-brand"
                    value={newProduct.brand_id}
                    onChange={event =>
                      setNewProduct(prev => ({ ...prev, brand_id: event.target.value }))
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="new-color">{t('store.color', 'Color')}</Label>
                  <Input
                    id="new-color"
                    value={newProduct.color}
                    onChange={event =>
                      setNewProduct(prev => ({ ...prev, color: event.target.value }))
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="new-gender">{t('store.gender', 'Gender')}</Label>
                  <Input
                    id="new-gender"
                    value={newProduct.gender}
                    onChange={event =>
                      setNewProduct(prev => ({ ...prev, gender: event.target.value }))
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="new-category">{t('store.category', 'Category')}</Label>
                  <Input
                    id="new-category"
                    value={newProduct.category}
                    onChange={event =>
                      setNewProduct(prev => ({ ...prev, category: event.target.value }))
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="new-image">{t('store.imageUrl', 'Image URL')}</Label>
                  <Input
                    id="new-image"
                    value={newProduct.image_url}
                    onChange={event =>
                      setNewProduct(prev => ({ ...prev, image_url: event.target.value }))
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="new-description">{t('store.description', 'Description')}</Label>
                  <Textarea
                    id="new-description"
                    value={newProduct.description}
                    onChange={event =>
                      setNewProduct(prev => ({ ...prev, description: event.target.value }))
                    }
                    rows={4}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="new-sizes">{t('store.sizes', 'Sizes (comma separated)')}</Label>
                  <Input
                    id="new-sizes"
                    value={newProduct.sizes}
                    onChange={event =>
                      setNewProduct(prev => ({ ...prev, sizes: event.target.value }))
                    }
                    placeholder="S, M, L"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="new-material-ids">
                    {t('store.materialIds', 'Material IDs (comma separated)')}
                  </Label>
                  <Input
                    id="new-material-ids"
                    value={newProduct.material_ids}
                    onChange={event =>
                      setNewProduct(prev => ({ ...prev, material_ids: event.target.value }))
                    }
                    placeholder="uuid, uuid"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="new-technology-ids">
                    {t('store.technologyIds', 'Technology IDs (comma separated)')}
                  </Label>
                  <Input
                    id="new-technology-ids"
                    value={newProduct.technology_ids}
                    onChange={event =>
                      setNewProduct(prev => ({ ...prev, technology_ids: event.target.value }))
                    }
                    placeholder="uuid, uuid"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="new-size-ids">
                    {t('store.sizeIds', 'Size IDs (comma separated)')}
                  </Label>
                  <Input
                    id="new-size-ids"
                    value={newProduct.size_ids}
                    onChange={event =>
                      setNewProduct(prev => ({ ...prev, size_ids: event.target.value }))
                    }
                    placeholder="uuid, uuid"
                  />
                </div>
                <Button type="submit" disabled={loading} variant="pill" size="pill">
                  {t('store.createStoreProduct', 'Create product')}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {(message || error) && (
        <div
          className={`rounded-lg px-4 py-3 text-sm border ${
            error
              ? 'border-destructive/40 text-destructive'
              : 'border-foreground/10 text-foreground'
          }`}
        >
          {error || message}
        </div>
      )}
    </div>
  );
};

export default StoreOwnerManagement;
