/* Admin banners page */

'use client';

import { BannerManager } from '@/components/admin/BannerManager';
import { useAuth } from '@/features/auth/hooks/useAuth';

export default function AdminBannersPage() {
  const { isAuthenticated, permissions } = useAuth();

  if (!isAuthenticated) {
    return null;
  }

  if (!permissions.canManageBanners) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center max-w-md px-6">
          <p className="text-lg mb-2">Доступ заборонено</p>
          <p className="text-sm text-muted-foreground">
            У вашої ролі немає доступу до керування банерами.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        <BannerManager />
      </div>
    </div>
  );
}
