/* Admin banners content - Client only */

'use client';

import { BannerManager } from '@/components/admin/BannerManager';
import { useAuth } from '@/features/auth/hooks/useAuth';

export default function AdminBannersContent() {
  const { isAuthenticated, permissions } = useAuth();

  if (!isAuthenticated) {
    return null;
  }

  if (!permissions.canManageBanners) {
    return (
      <div className="min-h-screen text-foreground flex items-center justify-center">
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
    <div className="min-h-screen text-foreground">
      <div className="max-w-[1800px] mx-auto px-6 md:px-12 lg:px-16 py-8">
        <BannerManager />
      </div>
    </div>
  );
}
