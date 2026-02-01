'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import api from '@/services/api';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const getArray = (value: unknown, key: string): unknown[] | undefined => {
  if (!isRecord(value)) return undefined;
  const nested = value[key];
  return Array.isArray(nested) ? nested : undefined;
};

const normalizeOptions = (items: unknown[]): Array<{ id: string; name: string }> =>
  items
    .map(item => {
      if (!isRecord(item)) return null;
      const id = String(item.id ?? '');
      const name = String(item.name ?? '');
      if (!id || !name) return null;
      return { id, name };
    })
    .filter((item): item is { id: string; name: string } => !!item);
type UserRole = 'user' | 'admin' | 'moderator' | 'store_owner' | 'store_manager' | 'brand_owner';
type StoreOption = { id: string; name: string };
type BrandOption = { id: string; name: string };

const roles: UserRole[] = [
  'user',
  'admin',
  'moderator',
  'store_owner',
  'store_manager',
  'brand_owner',
];

export const UserRoleManagement = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('user');
  const [storeId, setStoreId] = useState('');
  const [brandId, setBrandId] = useState('');
  const [stores, setStores] = useState<StoreOption[]>([]);
  const [brands, setBrands] = useState<BrandOption[]>([]);
  const [storesLoading, setStoresLoading] = useState(false);
  const [brandsLoading, setBrandsLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const roleOptions = useMemo(
    () =>
      roles.map(value => ({
        value,
        label: t(`admin.roles.${value}`, value),
      })),
    [t]
  );

  useEffect(() => {
    if (role !== 'store_owner' && role !== 'store_manager') return;
    let isMounted = true;

    const fetchStores = async () => {
      setStoresLoading(true);
      try {
        const response = await api.get('/admin/stores');
        const payload = response.data?.data ?? response.data?.items ?? response.data;
        const items = getArray(payload, 'items') ?? (Array.isArray(payload) ? payload : []);
        if (items.length > 0) {
          const normalized = normalizeOptions(items);
          if (isMounted) setStores(normalized);
        }
      } catch {
        if (isMounted) setStores([]);
      } finally {
        if (isMounted) setStoresLoading(false);
      }
    };

    fetchStores();
    return () => {
      isMounted = false;
    };
  }, [role]);

  useEffect(() => {
    if (role !== 'brand_owner') return;
    let isMounted = true;

    const fetchBrands = async () => {
      setBrandsLoading(true);
      try {
        const response = await api.get('/brands');
        const payload = response.data?.data ?? response.data?.items ?? response.data;
        const items = getArray(payload, 'items') ?? (Array.isArray(payload) ? payload : []);
        if (items.length > 0) {
          const normalized = normalizeOptions(items);
          if (isMounted) setBrands(normalized);
        }
      } catch {
        if (isMounted) setBrands([]);
      } finally {
        if (isMounted) setBrandsLoading(false);
      }
    };

    fetchBrands();
    return () => {
      isMounted = false;
    };
  }, [role]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage(null);
    setError(null);

    if (!email.trim()) {
      setError(t('admin.rolesEmailRequired', 'Email is required'));
      return;
    }

    if (!roles.includes(role)) {
      setError(t('admin.rolesInvalid', 'Invalid role'));
      return;
    }

    if ((role === 'store_owner' || role === 'store_manager') && !storeId) {
      setError(t('admin.rolesStoreRequired', 'Store is required for store roles'));
      return;
    }

    if (role === 'brand_owner' && !brandId) {
      setError(t('admin.rolesBrandRequired', 'Brand is required for brand_owner'));
      return;
    }

    setLoading(true);
    try {
      const payload: Record<string, unknown> = {
        email: email.trim(),
        role,
      };
      if (role === 'store_owner' || role === 'store_manager') {
        payload.store_id = storeId;
      }
      if (role === 'brand_owner') {
        payload.brand_id = brandId;
      }

      const response = await api.post('/admin/users/role', payload);

      const responseBody = response.data ?? {};
      setMessage(responseBody.message || t('admin.rolesSaved', 'Role updated'));
    } catch (err: unknown) {
      const status = isRecord(err) && isRecord(err.response) ? err.response.status : undefined;
      if (status === 400) {
        setError(t('admin.rolesError400', 'Email or role is missing or invalid'));
      } else if (status === 404) {
        setError(t('admin.rolesError404', 'User not found'));
      } else {
        setError(t('admin.rolesError500', 'Server error'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border border-border/50 bg-card/40 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">
          {t('admin.rolesTitle', 'User Role Management')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="role-email">{t('admin.rolesEmail', 'Email')}</Label>
            <Input
              id="role-email"
              type="email"
              value={email}
              onChange={event => setEmail(event.target.value)}
              placeholder="owner@example.com"
            />
          </div>

          <div className="space-y-2">
            <Label>{t('admin.rolesRole', 'Role')}</Label>
            <Select
              value={role}
              onValueChange={value => {
                setRole(value as UserRole);
                if (value !== 'store_owner' && value !== 'store_manager') setStoreId('');
                if (value !== 'brand_owner') setBrandId('');
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('admin.rolesRole', 'Role')} />
              </SelectTrigger>
              <SelectContent>
                {roleOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {t(
                'admin.rolesStoreOwnerHint',
                'store_owner/store_manager — can manage store products'
              )}
            </p>
          </div>

          {(role === 'store_owner' || role === 'store_manager') && (
            <div className="space-y-2">
              <Label>{t('admin.rolesStoreLabel', 'Store')}</Label>
              <Select value={storeId} onValueChange={value => setStoreId(String(value))}>
                <SelectTrigger>
                  <SelectValue placeholder={t('admin.rolesStorePlaceholder', 'Select store')} />
                </SelectTrigger>
                <SelectContent>
                  {storesLoading ? (
                    <SelectItem value="loading" disabled>
                      {t('common.loading', 'Loading...')}
                    </SelectItem>
                  ) : stores.length === 0 ? (
                    <SelectItem value="empty" disabled>
                      {t('admin.rolesStoreEmpty', 'No stores available')}
                    </SelectItem>
                  ) : (
                    stores.map(store => (
                      <SelectItem key={store.id} value={store.id}>
                        {store.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          )}

          {role === 'brand_owner' && (
            <div className="space-y-2">
              <Label>{t('admin.rolesBrandLabel', 'Brand')}</Label>
              <Select value={brandId} onValueChange={value => setBrandId(String(value))}>
                <SelectTrigger>
                  <SelectValue placeholder={t('admin.rolesBrandPlaceholder', 'Select brand')} />
                </SelectTrigger>
                <SelectContent>
                  {brandsLoading ? (
                    <SelectItem value="loading" disabled>
                      {t('common.loading', 'Loading...')}
                    </SelectItem>
                  ) : brands.length === 0 ? (
                    <SelectItem value="empty" disabled>
                      {t('admin.rolesBrandEmpty', 'No brands available')}
                    </SelectItem>
                  ) : (
                    brands.map(brand => (
                      <SelectItem key={brand.id} value={brand.id}>
                        {brand.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          )}

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

          <Button type="submit" disabled={loading}>
            {loading ? t('common.saving', 'Saving...') : t('admin.rolesSave', 'Save')}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default UserRoleManagement;
