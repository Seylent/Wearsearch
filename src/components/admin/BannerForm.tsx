/**
 * Banner Form Component
 * Form for creating and editing banners
 */

'use client';

import { ImageUploader } from '@/components/ImageUploader';
import type { CreateBannerRequest, Banner } from '@/types/banner';

interface BannerFormProps {
  formData: CreateBannerRequest;
  onChange: (data: CreateBannerRequest) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  editingBanner: Banner | null;
}

export function BannerForm({
  formData,
  onChange,
  onSubmit,
  onCancel,
  editingBanner,
}: BannerFormProps) {
  const handleChange = <K extends keyof CreateBannerRequest>(
    field: K,
    value: CreateBannerRequest[K]
  ) => {
    onChange({ ...formData, [field]: value });
  };

  return (
    <form
      onSubmit={onSubmit}
      className="bg-card/30 text-foreground p-4 md:p-6 rounded-xl space-y-4 border border-border/50 backdrop-blur-sm"
    >
      <h3 className="text-lg md:text-xl font-semibold mb-2 md:mb-4">
        {editingBanner ? 'Редагувати банер' : 'Новий банер'}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
        {/* Title */}
        <div className="md:col-span-2">
          <label htmlFor="banner-title" className="block text-xs md:text-sm font-medium mb-1">
            Заголовок *
          </label>
          <input
            id="banner-title"
            type="text"
            required
            value={formData.title}
            onChange={e => handleChange('title', e.target.value)}
            className="w-full px-2.5 md:px-3 py-1.5 md:py-2 text-sm md:text-base bg-background/60 border border-border/60 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Subtitle */}
        <div className="md:col-span-2">
          <label htmlFor="banner-subtitle" className="block text-xs md:text-sm font-medium mb-1">
            Підзаголовок
          </label>
          <input
            id="banner-subtitle"
            type="text"
            value={formData.subtitle}
            onChange={e => handleChange('subtitle', e.target.value)}
            className="w-full px-2.5 md:px-3 py-1.5 md:py-2 text-sm md:text-base bg-background/60 border border-border/60 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Description */}
        <div className="md:col-span-2">
          <label htmlFor="banner-description" className="block text-xs md:text-sm font-medium mb-1">
            Опис
          </label>
          <textarea
            id="banner-description"
            value={formData.description}
            onChange={e => handleChange('description', e.target.value)}
            rows={2}
            className="w-full px-2.5 md:px-3 py-1.5 md:py-2 text-sm md:text-base bg-background/60 border border-border/60 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
          />
        </div>

        {/* Image upload */}
        <div className="md:col-span-2">
          <label className="block text-xs md:text-sm font-medium mb-1">
            Завантажити зображення
          </label>
          <ImageUploader
            onImageUpload={url => handleChange('image_url', url)}
            currentImage={formData.image_url}
          />
        </div>

        {/* Link URL */}
        <div>
          <label htmlFor="banner-link-url" className="block text-xs md:text-sm font-medium mb-1">
            Посилання
          </label>
          <input
            id="banner-link-url"
            type="url"
            value={formData.link_url}
            onChange={e => handleChange('link_url', e.target.value)}
            placeholder="https://example.com/page"
            className="w-full px-2.5 md:px-3 py-1.5 md:py-2 text-sm md:text-base bg-background/60 border border-border/60 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Link Text */}
        <div>
          <label htmlFor="banner-link-text" className="block text-xs md:text-sm font-medium mb-1">
            Текст кнопки
          </label>
          <input
            id="banner-link-text"
            type="text"
            value={formData.link_text}
            onChange={e => handleChange('link_text', e.target.value)}
            className="w-full px-2.5 md:px-3 py-1.5 md:py-2 text-sm md:text-base bg-background/60 border border-border/60 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Target Type */}
        <div>
          <label htmlFor="banner-target-type" className="block text-xs md:text-sm font-medium mb-1">
            Тип цілі
          </label>
          <select
            id="banner-target-type"
            value={formData.target_type}
            onChange={e =>
              handleChange('target_type', e.target.value as CreateBannerRequest['target_type'])
            }
            className="w-full px-2.5 md:px-3 py-1.5 md:py-2 text-sm md:text-base bg-background/60 border border-border/60 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Усі сторінки</option>
            <option value="category">Категорія</option>
            <option value="brand">Бренд</option>
            <option value="product">Продукт</option>
          </select>
        </div>

        {/* Priority */}
        <div>
          <label htmlFor="banner-priority" className="block text-xs md:text-sm font-medium mb-1">
            Пріоритет (1-10)
          </label>
          <input
            id="banner-priority"
            type="number"
            min="1"
            max="10"
            value={formData.priority}
            onChange={e => handleChange('priority', Number.parseInt(e.target.value, 10))}
            className="w-full px-2.5 md:px-3 py-1.5 md:py-2 text-sm md:text-base bg-background/60 border border-border/60 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Start Date */}
        <div>
          <label htmlFor="banner-start-date" className="block text-xs md:text-sm font-medium mb-1">
            Дата початку
          </label>
          <input
            id="banner-start-date"
            type="datetime-local"
            value={formData.start_date}
            onChange={e => handleChange('start_date', e.target.value)}
            className="w-full px-2.5 md:px-3 py-1.5 md:py-2 text-sm md:text-base bg-background/60 border border-border/60 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* End Date */}
        <div>
          <label htmlFor="banner-end-date" className="block text-xs md:text-sm font-medium mb-1">
            Дата завершення
          </label>
          <input
            id="banner-end-date"
            type="datetime-local"
            value={formData.end_date}
            onChange={e => handleChange('end_date', e.target.value)}
            className="w-full px-2.5 md:px-3 py-1.5 md:py-2 text-sm md:text-base bg-background/60 border border-border/60 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Active Status */}
        <div className="md:col-span-2">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.is_active}
              onChange={e => handleChange('is_active', e.target.checked)}
              className="w-4 h-4 text-blue-600"
            />
            <span className="text-xs md:text-sm font-medium">Активний</span>
          </label>
        </div>
      </div>

      <div className="flex gap-3 pt-2 md:pt-4">
        <button
          type="submit"
          className="flex-1 md:flex-none px-4 md:px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm md:text-base"
        >
          {editingBanner ? 'Оновити' : 'Створити'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 md:flex-none px-4 md:px-6 py-2 bg-white/5 text-foreground rounded-lg hover:bg-white/10 transition-colors text-sm md:text-base border border-white/10"
        >
          Скасувати
        </button>
      </div>
    </form>
  );
}
