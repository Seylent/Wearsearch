/**
 * Banner Management Component
 * Admin interface for creating, editing, and deleting banners
 */

'use client';

import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { BannerCard } from '@/components/admin/BannerCard';
import { BannerForm } from '@/components/admin/BannerForm';
import { bannerService } from '@/services/bannerService';
import type { Banner, CreateBannerRequest } from '@/types/banner';

export function BannerManager() {
  const [banners, setBanners] = useState<Banner[]>([]); // Самостійний стан

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);

  // Form state
  const [formData, setFormData] = useState<CreateBannerRequest>({
    title: '',
    subtitle: '',
    description: '',
    image_url: '',
    link_url: '',
    link_text: 'Дізнатися більше',
    position: 0,
    is_active: true,
    target_type: 'all',
    priority: 5,
    start_date: '',
    end_date: '',
  });

  useEffect(() => {
    loadBanners();
  }, []);

  const loadBanners = async () => {
    try {
      setLoading(true);
      const data = await bannerService.getBanners({ include_inactive: true });
      setBanners(data);
      setError(null);
    } catch (err) {
      setError('Помилка завантаження банерів');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setError(null);
      if (editingBanner) {
        const updated = await bannerService.updateBanner(editingBanner.id, formData);
        setBanners(prev => prev.map(b => (b.id === updated.id ? updated : b)));
      } else {
        const created = await bannerService.createBanner(formData);
        setBanners(prev => [...prev, created]);
      }

      resetForm();
    } catch (err) {
      setError((err as Error)?.message || 'Не вдалося зберегти банер');
    }
  };

  const handleEdit = (banner: Banner) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title,
      subtitle: banner.subtitle || '',
      description: banner.description || '',
      image_url: banner.image_url,
      link_url: banner.link_url || '',
      link_text: banner.link_text,
      position: banner.position,
      is_active: banner.is_active,
      target_type: banner.target_type,
      priority: banner.priority,
      start_date: banner.start_date || '',
      end_date: banner.end_date || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Ви впевнені, що хочете видалити цей банер?')) return;

    try {
      await bannerService.deleteBanner(id);
      setBanners(prev => prev.filter(b => b.id !== id));
      alert('Банер видалено!');
    } catch (err) {
      alert('Помилка видалення: ' + (err as Error).message);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      subtitle: '',
      description: '',
      image_url: '',
      link_url: '',
      link_text: 'Дізнатися більше',
      position: 0,
      is_active: true,
      target_type: 'all',
      priority: 5,
      start_date: '',
      end_date: '',
    });
    setEditingBanner(null);
    setShowForm(false);
  };

  if (loading) {
    return <div className="p-4 md:p-6 text-center text-sm md:text-base">Завантаження...</div>;
  }

  return (
    <div className="space-y-4 md:space-y-6 p-2 md:p-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h2 className="text-xl md:text-2xl font-bold">Управління банерами</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-3 md:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm md:text-base self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 md:w-5 md:h-5" />
          Додати банер
        </button>
      </div>

      {error && (
        <div className="p-3 md:p-4 bg-red-500/10 text-red-200 border border-red-500/20 rounded-lg text-sm md:text-base">
          {error}
        </div>
      )}

      {/* Form */}
      {showForm && (
        <BannerForm
          formData={formData}
          onChange={setFormData}
          onSubmit={handleSubmit}
          onCancel={resetForm}
          editingBanner={editingBanner}
        />
      )}

      {/* Banner List */}
      <div className="grid grid-cols-1 gap-3 md:gap-4">
        {banners.length === 0 ? (
          <div className="text-center py-8 md:py-12 text-muted-foreground text-sm md:text-base">
            Банерів ще немає. Створіть перший!
          </div>
        ) : (
          banners.map(banner => (
            <BannerCard
              key={banner.id}
              banner={banner}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>
    </div>
  );
}
