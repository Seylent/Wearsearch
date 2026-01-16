/**
 * Banner Management Component
 * Admin interface for creating, editing, and deleting banners
 */

'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Plus, Edit2, Trash2, Eye, EyeOff, TrendingUp } from 'lucide-react';
import { bannerService } from '@/services/bannerService';
import type { Banner, CreateBannerRequest } from '@/types/banner';

export function BannerManager() {
  const [banners, setBanners] = useState<Banner[]>([]);
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
      if (editingBanner) {
        const updated = await bannerService.updateBanner(editingBanner.id, formData);
        setBanners(prev => prev.map(b => b.id === updated.id ? updated : b));
      } else {
        const created = await bannerService.createBanner(formData);
        setBanners(prev => [...prev, created]);
      }
      
      resetForm();
      alert(editingBanner ? 'Банер оновлено!' : 'Банер створено!');
    } catch (err) {
      alert('Помилка: ' + (err as Error).message);
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
      target_id: banner.target_id || '',
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
    });
    setEditingBanner(null);
    setShowForm(false);
  };

  if (loading) {
    return <div className="p-6 text-center">Завантаження...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Управління банерами</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Додати банер
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-lg">
          {error}
        </div>
      )}

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-lg space-y-4 border border-gray-200">
          <h3 className="text-xl font-semibold mb-4">
            {editingBanner ? 'Редагувати банер' : 'Новий банер'}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Title */}
            <div className="md:col-span-2">
              <label htmlFor="banner-title" className="block text-sm font-medium mb-1">
                Заголовок *
              </label>
              <input
                id="banner-title"
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Subtitle */}
            <div className="md:col-span-2">
              <label htmlFor="banner-subtitle" className="block text-sm font-medium mb-1">
                Підзаголовок
              </label>
              <input
                id="banner-subtitle"
                type="text"
                value={formData.subtitle}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label htmlFor="banner-description" className="block text-sm font-medium mb-1">
                Опис
              </label>
              <textarea
                id="banner-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Image URL */}
            <div className="md:col-span-2">
              <label htmlFor="banner-image" className="block text-sm font-medium mb-1">
                URL зображення *
              </label>
              <input
                id="banner-image"
                type="url"
                required
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                placeholder="https://example.com/image.jpg"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Link URL */}
            <div>
              <label htmlFor="banner-link-url" className="block text-sm font-medium mb-1">
                Посилання
              </label>
              <input
                id="banner-link-url"
                type="url"
                value={formData.link_url}
                onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                placeholder="https://example.com/page"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Link Text */}
            <div>
              <label htmlFor="banner-link-text" className="block text-sm font-medium mb-1">
                Текст кнопки
              </label>
              <input
                id="banner-link-text"
                type="text"
                value={formData.link_text}
                onChange={(e) => setFormData({ ...formData, link_text: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Target Type */}
            <div>
              <label htmlFor="banner-target-type" className="block text-sm font-medium mb-1">
                Тип цілі
              </label>
              <select
                id="banner-target-type"
                value={formData.target_type}
                onChange={(e) => setFormData({ ...formData, target_type: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Усі сторінки</option>
                <option value="category">Категорія</option>
                <option value="brand">Бренд</option>
                <option value="product">Продукт</option>
              </select>
            </div>

            {/* Priority */}
            <div>
              <label htmlFor="banner-priority" className="block text-sm font-medium mb-1">
                Пріоритет (1-10)
              </label>
              <input
                id="banner-priority"
                type="number"
                min="1"
                max="10"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: Number.parseInt(e.target.value, 10) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Start Date */}
            <div>
              <label htmlFor="banner-start-date" className="block text-sm font-medium mb-1">
                Дата початку
              </label>
              <input
                id="banner-start-date"
                type="datetime-local"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* End Date */}
            <div>
              <label htmlFor="banner-end-date" className="block text-sm font-medium mb-1">
                Дата завершення
              </label>
              <input
                id="banner-end-date"
                type="datetime-local"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Active Status */}
            <div className="md:col-span-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-sm font-medium">Активний</span>
              </label>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {editingBanner ? 'Оновити' : 'Створити'}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Скасувати
            </button>
          </div>
        </form>
      )}

      {/* Banner List */}
      <div className="grid grid-cols-1 gap-4">
        {banners.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            Банерів ще немає. Створіть перший!
          </div>
        ) : (
          banners.map((banner) => (
            <div
              key={banner.id}
              className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow"
            >
              <div className="flex flex-col md:flex-row">
                {/* Image Preview */}
                <div className="relative w-full md:w-48 h-32 bg-gray-100">
                  <Image
                    src={banner.image_url}
                    alt={banner.title}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Content */}
                <div className="flex-1 p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-lg font-semibold">{banner.title}</h3>
                      {banner.subtitle && (
                        <p className="text-sm text-gray-600">{banner.subtitle}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {banner.is_active ? (
                        <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                          <Eye className="w-3 h-3" />
                          Активний
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          <EyeOff className="w-3 h-3" />
                          Неактивний
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                    <span className="flex items-center gap-1">
                      <TrendingUp className="w-4 h-4" />
                      Показів: {banner.impression_count}
                    </span>
                    <span>Кліків: {banner.click_count}</span>
                    <span>Пріоритет: {banner.priority}</span>
                    <span className="capitalize">Ціль: {banner.target_type}</span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(banner)}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                      Редагувати
                    </button>
                    <button
                      onClick={() => handleDelete(banner.id)}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Видалити
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
