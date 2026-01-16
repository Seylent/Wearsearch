/**
 * Banner Types
 * Type definitions for banner management system
 */

export interface Banner {
  id: string;
  title: string;
  subtitle?: string | null;
  description?: string | null;
  image_url: string;
  link_url?: string | null;
  link_text: string;
  position: number;
  is_active: boolean;
  start_date?: string | null;
  end_date?: string | null;
  click_count: number;
  impression_count: number;
  target_type: 'all' | 'category' | 'brand' | 'product';
  target_id?: string | null;
  priority: number;
  created_at?: string;
  updated_at?: string;
}

export interface CreateBannerRequest {
  title: string;
  subtitle?: string;
  description?: string;
  image_url: string;
  link_url?: string;
  link_text?: string;
  position?: number;
  is_active?: boolean;
  start_date?: string;
  end_date?: string;
  target_type?: 'all' | 'category' | 'brand' | 'product';
  target_id?: string;
  priority?: number;
}

export interface BannerAnalytics {
  banner_id: string;
  clicks: number;
  impressions: number;
  click_through_rate: number;
  period: {
    start_date: string;
    end_date: string;
  };
}

export interface BannerListResponse {
  success: boolean;
  data: {
    banners: Banner[];
    total: number;
  };
}

export interface BannerResponse {
  success: boolean;
  data: {
    banner: Banner;
  };
}

export interface BannerAnalyticsResponse {
  success: boolean;
  data: BannerAnalytics;
}
