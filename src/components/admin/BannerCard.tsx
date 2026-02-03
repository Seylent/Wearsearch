/**
 * Banner Card Component
 * Displays a single banner in the admin panel with edit/delete actions
 */

'use client';

import Image from 'next/image';
import { Edit2, Trash2, Eye, EyeOff, TrendingUp } from 'lucide-react';
import type { Banner } from '@/types/banner';
import { usePresignedImage } from '@/hooks/usePresignedImage';

interface BannerCardProps {
  banner: Banner;
  onEdit: (banner: Banner) => void;
  onDelete: (id: string) => void;
}

export function BannerCard({ banner, onEdit, onDelete }: BannerCardProps) {
  const bannerImage = usePresignedImage(banner.image_url);
  return (
    <div className="bg-card/30 text-foreground rounded-xl overflow-hidden border border-border/50 backdrop-blur-sm hover:bg-card/40 transition-colors">
      <div className="flex flex-col md:flex-row">
        {/* Image Preview */}
        <div className="relative w-full md:w-48 h-24 md:h-40 bg-gray-100 shrink-0">
          <Image
            src={bannerImage || '/placeholder.svg'}
            alt={banner.title}
            fill
            className="object-cover"
            unoptimized
            sizes="(max-width: 768px) 100vw, 192px"
          />
        </div>

        {/* Content */}
        <div className="flex-1 p-4 flex flex-col">
          {/* Header */}
          <div className="flex justify-between items-start mb-2">
            <div className="flex-1 min-w-0">
              <h3 className="text-base md:text-lg font-semibold truncate">{banner.title}</h3>
              {banner.subtitle && (
                <p className="text-sm text-muted-foreground truncate">{banner.subtitle}</p>
              )}
            </div>
            <div className="ml-2 shrink-0">
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

          {/* Stats */}
          <div className="flex flex-wrap gap-3 md:gap-4 text-xs md:text-sm text-muted-foreground mb-3">
            <span className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3 md:w-4 md:h-4" />
              <span>Показів: {banner.impression_count}</span>
            </span>
            <span>Кліків: {banner.click_count}</span>
            <span>Пріоритет: {banner.priority}</span>
            <span className="capitalize">Ціль: {banner.target_type}</span>
          </div>

          {/* Actions */}
          <div className="mt-auto flex gap-2">
            <button
              onClick={() => onEdit(banner)}
              className="flex items-center gap-1 px-3 py-1.5 text-sm bg-white/5 text-foreground rounded-lg hover:bg-white/10 transition-colors border border-white/10"
            >
              <Edit2 className="w-4 h-4" />
              Редагувати
            </button>
            <button
              onClick={() => onDelete(banner.id)}
              className="flex items-center gap-1 px-3 py-1.5 text-sm bg-red-500/10 text-red-300 rounded-lg hover:bg-red-500/15 transition-colors border border-red-500/20"
            >
              <Trash2 className="w-4 h-4" />
              Видалити
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
