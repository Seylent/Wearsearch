/**
 * Store Settings Page
 * Store configuration and profile settings
 */

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useStoreContext } from '@/features/store-menu/context/StoreContext';
import { Store, Upload, ArrowLeft, Eye } from 'lucide-react';
import { StoreMenuLayout } from '@/features/store-menu/components/StoreMenuLayout';
import {
  useStoreSettings,
  useUpdateStoreSettings,
  useStoreDashboard,
} from '@/features/store-menu/hooks/useStoreMenu';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { OptimizedImage } from '@/components/OptimizedImage';
import { toast } from 'sonner';

function isValidUrl(url: string): boolean {
  if (!url) return true;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

function SettingsContent({ storeId, isOwner }: { storeId: string; isOwner: boolean }) {
  const { data: settings, isLoading } = useStoreSettings(storeId);
  const { data: dashboardData } = useStoreDashboard(storeId);
  const updateMutation = useUpdateStoreSettings();

  const [formData, setFormData] = useState({
    name: '',
    logo_url: '',
    telegram_url: '',
    instagram_url: '',
    tiktok_url: '',
    website_url: '',
    shipping_info: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (settings) {
      setFormData({
        name: settings.name || '',
        logo_url: settings.logo_url || '',
        telegram_url: settings.telegram_url || '',
        instagram_url: settings.instagram_url || '',
        tiktok_url: settings.tiktok_url || '',
        website_url: settings.website_url || '',
        shipping_info: settings.shipping_info || '',
      });
    }
  }, [settings]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Назва магазину обов'язкова";
    }

    if (formData.telegram_url && !isValidUrl(formData.telegram_url)) {
      newErrors.telegram_url = 'Посилання має починатися з https://';
    }
    if (formData.instagram_url && !isValidUrl(formData.instagram_url)) {
      newErrors.instagram_url = 'Посилання має починатися з https://';
    }
    if (formData.tiktok_url && !isValidUrl(formData.tiktok_url)) {
      newErrors.tiktok_url = 'Посилання має починатися з https://';
    }
    if (formData.website_url && !isValidUrl(formData.website_url)) {
      newErrors.website_url = 'Посилання має починатися з https://';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      await updateMutation.mutateAsync({
        storeId,
        data: formData,
      });
      toast.success('Налаштування збережено');
      setIsDirty(false);
    } catch {
      toast.error('Помилка при збереженні налаштувань');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  const readOnly = !isOwner;
  const store = dashboardData?.store;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/store-menu">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Налаштування магазину</h1>
          <p className="text-muted-foreground">
            Керуйте профілем та налаштуваннями вашого магазину
          </p>
        </div>
      </div>

      {readOnly && (
        <Alert>
          <Eye className="h-4 w-4" />
          <AlertDescription>
            Ви переглядаєте налаштування як менеджер. Для редагування зверніться до власника
            магазину.
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Settings */}
          <div className="space-y-6 lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Основна інформація</CardTitle>
                <CardDescription>Назва та логотип вашого магазину</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Назва магазину *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={e => handleChange('name', e.target.value)}
                    disabled={readOnly}
                    className={errors.name ? 'border-destructive' : ''}
                  />
                  {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="logo">Логотип</Label>
                  <div className="flex items-center gap-4">
                    <div className="h-24 w-24 overflow-hidden rounded-lg border">
                      {formData.logo_url ? (
                        <OptimizedImage
                          src={formData.logo_url}
                          alt="Logo"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-muted">
                          <Store className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <Input
                        id="logo"
                        value={formData.logo_url}
                        onChange={e => handleChange('logo_url', e.target.value)}
                        placeholder="URL логотипу"
                        disabled={readOnly}
                      />
                      <p className="mt-1 text-sm text-muted-foreground">
                        Введіть URL зображення або завантажте файл
                      </p>
                    </div>
                    {!readOnly && (
                      <Button type="button" variant="outline" className="shrink-0">
                        <Upload className="mr-2 h-4 w-4" />
                        Завантажити
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Соціальні мережі</CardTitle>
                <CardDescription>Посилання на ваші соціальні мережі</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="telegram">Telegram</Label>
                  <Input
                    id="telegram"
                    value={formData.telegram_url}
                    onChange={e => handleChange('telegram_url', e.target.value)}
                    placeholder="https://t.me/..."
                    disabled={readOnly}
                    className={errors.telegram_url ? 'border-destructive' : ''}
                  />
                  {errors.telegram_url && (
                    <p className="text-sm text-destructive">{errors.telegram_url}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="instagram">Instagram</Label>
                  <Input
                    id="instagram"
                    value={formData.instagram_url}
                    onChange={e => handleChange('instagram_url', e.target.value)}
                    placeholder="https://instagram.com/..."
                    disabled={readOnly}
                    className={errors.instagram_url ? 'border-destructive' : ''}
                  />
                  {errors.instagram_url && (
                    <p className="text-sm text-destructive">{errors.instagram_url}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tiktok">TikTok</Label>
                  <Input
                    id="tiktok"
                    value={formData.tiktok_url}
                    onChange={e => handleChange('tiktok_url', e.target.value)}
                    placeholder="https://tiktok.com/@..."
                    disabled={readOnly}
                    className={errors.tiktok_url ? 'border-destructive' : ''}
                  />
                  {errors.tiktok_url && (
                    <p className="text-sm text-destructive">{errors.tiktok_url}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Власний сайт</Label>
                  <Input
                    id="website"
                    value={formData.website_url}
                    onChange={e => handleChange('website_url', e.target.value)}
                    placeholder="https://..."
                    disabled={readOnly}
                    className={errors.website_url ? 'border-destructive' : ''}
                  />
                  {errors.website_url && (
                    <p className="text-sm text-destructive">{errors.website_url}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Інформація про доставку</CardTitle>
                <CardDescription>Опишіть умови доставки для ваших клієнтів</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={formData.shipping_info}
                  onChange={e => handleChange('shipping_info', e.target.value)}
                  placeholder="Наприклад: Доставка по Україні 1-3 дні, безкоштовна доставка від 2000 грн..."
                  rows={4}
                  disabled={readOnly}
                />
              </CardContent>
            </Card>

            {!readOnly && (
              <div className="flex gap-4">
                <Button
                  type="submit"
                  disabled={updateMutation.isPending || !isDirty}
                  variant="pill"
                  size="pill"
                >
                  {updateMutation.isPending ? 'Збереження...' : 'Зберегти зміни'}
                </Button>
                {isDirty && (
                  <Button
                    type="button"
                    variant="pillOutline"
                    size="pill"
                    onClick={() => {
                      if (settings) {
                        setFormData({
                          name: settings.name || '',
                          logo_url: settings.logo_url || '',
                          telegram_url: settings.telegram_url || '',
                          instagram_url: settings.instagram_url || '',
                          tiktok_url: settings.tiktok_url || '',
                          website_url: settings.website_url || '',
                          shipping_info: settings.shipping_info || '',
                        });
                        setIsDirty(false);
                        setErrors({});
                      }
                    }}
                  >
                    Скасувати
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Preview Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Попередній перегляд</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Store Preview */}
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 overflow-hidden rounded-lg border">
                    {formData.logo_url ? (
                      <OptimizedImage
                        src={formData.logo_url}
                        alt="Logo"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-muted">
                        <Store className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{formData.name || 'Назва магазину'}</p>
                    {store?.is_verified && (
                      <Badge variant="secondary" className="mt-1 text-xs">
                        Verified
                      </Badge>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Social Links Preview */}
                <div className="space-y-2">
                  <p className="text-sm font-medium">Соціальні мережі:</p>
                  <div className="flex flex-wrap gap-2">
                    {formData.telegram_url && (
                      <a
                        href={formData.telegram_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline"
                      >
                        Telegram
                      </a>
                    )}
                    {formData.instagram_url && (
                      <a
                        href={formData.instagram_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline"
                      >
                        Instagram
                      </a>
                    )}
                    {formData.tiktok_url && (
                      <a
                        href={formData.tiktok_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline"
                      >
                        TikTok
                      </a>
                    )}
                    {formData.website_url && (
                      <a
                        href={formData.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline"
                      >
                        Website
                      </a>
                    )}
                    {!formData.telegram_url &&
                      !formData.instagram_url &&
                      !formData.tiktok_url &&
                      !formData.website_url && (
                        <p className="text-sm text-muted-foreground">Не вказано</p>
                      )}
                  </div>
                </div>

                <Separator />

                {/* Shipping Preview */}
                <div>
                  <p className="text-sm font-medium">Доставка:</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {formData.shipping_info || 'Інформація про доставку не вказана'}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Link href={`/stores/${storeId}`} target="_blank">
              <Button variant="pillOutline" size="pill" className="w-full">
                <Eye className="mr-2 h-4 w-4" />
                Переглянути сторінку магазину
              </Button>
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}

export default function StoreSettingsPage() {
  const { selectedStoreId, isLoading } = useStoreContext();
  const { data: dashboardData } = useStoreDashboard(selectedStoreId || '');
  const isOwner = dashboardData?.store.access_type === 'owner';

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <Skeleton className="h-20" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!selectedStoreId) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">
              ID магазину не вказано. Перейдіть зі списку ваших магазинів.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <StoreMenuLayout>
      <SettingsContent storeId={selectedStoreId} isOwner={isOwner} />
    </StoreMenuLayout>
  );
}
