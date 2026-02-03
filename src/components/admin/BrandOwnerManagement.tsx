'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { apiLegacy } from '@/services/api';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type BrandPermission = {
  store_id: string;
  status?: string;
  brand_id?: string;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const getArray = (value: unknown, key: string): unknown[] | undefined => {
  if (!isRecord(value)) return undefined;
  const nested = value[key];
  return Array.isArray(nested) ? nested : undefined;
};

const normalizePermissions = (payload: unknown, brandId: string): BrandPermission[] => {
  const items = getArray(payload, 'items') ?? (Array.isArray(payload) ? payload : []);

  const normalized: BrandPermission[] = [];

  items.forEach(item => {
    if (!isRecord(item)) return;
    const storeId = String(item.store_id ?? item.storeId ?? item.id ?? '');
    if (!storeId) return;
    normalized.push({
      store_id: storeId,
      status: item.status ? String(item.status) : undefined,
      brand_id: String(item.brand_id ?? item.brandId ?? brandId),
    });
  });

  return normalized;
};

export const BrandOwnerManagement = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [brandId, setBrandId] = useState('');
  const [storeId, setStoreId] = useState('');
  const [officialStoreId, setOfficialStoreId] = useState('');
  const [permissions, setPermissions] = useState<BrandPermission[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const resolvedBrandId = useMemo(() => {
    const userBrandId = isRecord(user) ? user.brand_id : undefined;
    return brandId.trim() || String(userBrandId ?? '').trim();
  }, [brandId, user]);

  useEffect(() => {
    if (!brandId && isRecord(user) && user.brand_id) {
      setBrandId(String(user.brand_id));
    }
  }, [user, brandId]);

  const loadPermissions = useCallback(async () => {
    if (!resolvedBrandId) return;
    setLoading(true);
    setError(null);
    try {
      const response = await apiLegacy.get(`/brands/${resolvedBrandId}/permissions`);
      const payload = response.data?.data ?? response.data?.items ?? response.data;
      setPermissions(normalizePermissions(payload, resolvedBrandId));
    } catch {
      setError(t('brand.permissionsLoadError', 'Failed to load permissions'));
      setPermissions([]);
    } finally {
      setLoading(false);
    }
  }, [resolvedBrandId, t]);

  useEffect(() => {
    if (!resolvedBrandId) {
      setPermissions([]);
      return;
    }
    loadPermissions();
  }, [resolvedBrandId, loadPermissions]);

  const handleAddPermission = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage(null);
    setError(null);
    if (!resolvedBrandId || !storeId.trim()) {
      setError(t('brand.permissionStoreRequired', 'Brand and store are required'));
      return;
    }
    setLoading(true);
    try {
      await apiLegacy.post(`/brands/${resolvedBrandId}/permissions`, {
        store_id: storeId.trim(),
      });
      setMessage(t('brand.permissionAdded', 'Store access granted'));
      setStoreId('');
      await loadPermissions();
    } catch {
      setError(t('brand.permissionAddError', 'Failed to grant access'));
    } finally {
      setLoading(false);
    }
  };

  const handleRemovePermission = async (storeIdToRemove: string) => {
    if (!resolvedBrandId || !storeIdToRemove) return;
    setMessage(null);
    setError(null);
    setLoading(true);
    try {
      await apiLegacy.delete(`/brands/${resolvedBrandId}/permissions/${storeIdToRemove}`);
      setMessage(t('brand.permissionRemoved', 'Store access removed'));
      await loadPermissions();
    } catch {
      setError(t('brand.permissionRemoveError', 'Failed to remove access'));
    } finally {
      setLoading(false);
    }
  };

  const handleLinkOfficialStore = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage(null);
    setError(null);
    if (!resolvedBrandId || !officialStoreId.trim()) {
      setError(t('brand.officialStoreRequired', 'Brand and store are required'));
      return;
    }
    setLoading(true);
    try {
      await apiLegacy.post(`/brands/${resolvedBrandId}/stores/${officialStoreId.trim()}/link`);
      setMessage(t('brand.officialStoreLinked', 'Official store linked'));
      setOfficialStoreId('');
    } catch {
      setError(t('brand.officialStoreLinkError', 'Failed to link official store'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-6">
      <Card className="border border-border/50 bg-card/40 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">
            {t('brand.permissionsTitle', 'Allowed stores')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="brand-id">{t('brand.brandId', 'Brand ID')}</Label>
            <Input
              id="brand-id"
              value={brandId}
              onChange={event => setBrandId(event.target.value)}
              placeholder="brand_id"
            />
          </div>

          <form onSubmit={handleAddPermission} className="grid gap-3 md:grid-cols-[1fr_auto]">
            <div className="grid gap-2">
              <Label htmlFor="store-id">{t('brand.storeId', 'Store ID')}</Label>
              <Input
                id="store-id"
                value={storeId}
                onChange={event => setStoreId(event.target.value)}
                placeholder="store_id"
              />
            </div>
            <div className="flex items-end">
              <Button type="submit" disabled={loading} variant="pill" size="pill">
                {t('brand.addStorePermission', 'Grant access')}
              </Button>
            </div>
          </form>

          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {t('brand.permissionsList', 'Stores with access to this closed brand')}
            </p>
            <Button variant="outline" size="sm" onClick={loadPermissions} disabled={loading}>
              {t('common.refresh', 'Refresh')}
            </Button>
          </div>

          <div className="space-y-2">
            {permissions.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {t('brand.permissionsEmpty', 'No stores approved yet')}
              </p>
            ) : (
              permissions.map(item => (
                <div
                  key={`${item.store_id}-${item.brand_id}`}
                  className="flex items-center justify-between rounded-lg border border-border/50 px-3 py-2"
                >
                  <div>
                    <p className="text-sm font-medium">{item.store_id}</p>
                    {item.status && <p className="text-xs text-muted-foreground">{item.status}</p>}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemovePermission(item.store_id)}
                    disabled={loading}
                  >
                    {t('common.remove', 'Remove')}
                  </Button>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="border border-border/50 bg-card/40 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">
            {t('brand.officialStoreTitle', 'Official brand store')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLinkOfficialStore} className="grid gap-3 md:grid-cols-[1fr_auto]">
            <div className="grid gap-2">
              <Label htmlFor="official-store">{t('brand.officialStoreId', 'Store ID')}</Label>
              <Input
                id="official-store"
                value={officialStoreId}
                onChange={event => setOfficialStoreId(event.target.value)}
                placeholder="store_id"
              />
            </div>
            <div className="flex items-end">
              <Button type="submit" disabled={loading} variant="pill" size="pill">
                {t('brand.linkOfficialStore', 'Link store')}
              </Button>
            </div>
          </form>
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

export default BrandOwnerManagement;
