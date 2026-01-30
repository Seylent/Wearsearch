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

type UserRole = 'user' | 'admin' | 'moderator' | 'store_owner';
type StoreOption = { id: string; name: string };

const roles: UserRole[] = ['user', 'admin', 'moderator', 'store_owner'];

export const UserRoleManagement = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('user');
  const [storeId, setStoreId] = useState('');
  const [stores, setStores] = useState<StoreOption[]>([]);
  const [storesLoading, setStoresLoading] = useState(false);
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
    if (role !== 'store_owner') return;
    let isMounted = true;

    const fetchStores = async () => {
      setStoresLoading(true);
      try {
        const response = await api.get('/admin/stores');
        const payload = response.data?.data ?? response.data?.items ?? response.data;
        const items = Array.isArray(payload?.items) ? payload.items : payload;
        if (Array.isArray(items)) {
          const normalized = items
            .map((item: any) => ({
              id: String(item?.id ?? ''),
              name: String(item?.name ?? ''),
            }))
            .filter(item => item.id && item.name);
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

    if (role === 'store_owner' && !storeId) {
      setError(t('admin.rolesStoreRequired', 'Store is required for store_owner'));
      return;
    }

    setLoading(true);
    try {
      const payload: Record<string, unknown> = {
        email: email.trim(),
        role,
      };
      if (role === 'store_owner') {
        payload.store_id = storeId;
      }

      const response = await api.post('/admin/users/role', payload);

      const responseBody = response.data ?? {};
      setMessage(responseBody.message || t('admin.rolesSaved', 'Role updated'));
    } catch (err: any) {
      const status = err?.response?.status;
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
                if (value !== 'store_owner') setStoreId('');
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
              {t('admin.rolesStoreOwnerHint', 'store_owner — can manage store products')}
            </p>
          </div>

          {role === 'store_owner' && (
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
