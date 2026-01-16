/**
 * Admin Banners Page
 * Page for managing website banners
 */

import { Metadata } from 'next';
import { BannerManager } from '@/components/admin/BannerManager';

export const metadata: Metadata = {
  title: 'Управління банерами - Адмін панель',
  description: 'Створення та редагування банерів для головної сторінки',
};

export default function AdminBannersPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <BannerManager />
      </div>
    </div>
  );
}
