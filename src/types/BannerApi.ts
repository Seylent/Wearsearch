/**
 * Banner API Types
 * Type definitions for banner-related API responses
 */

import type { Banner } from '@/types/banner';

export interface BannerListResponse {
  success: boolean;
  data: {
    banners: Banner[];
    total?: number;
  };
}

export interface BannerResponse {
  success: boolean;
  data: {
    banner: Banner;
  };
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

export interface BannerAnalyticsResponse {
  success: boolean;
  data: BannerAnalytics;
}

export interface ApiErrorResponse {
  success: boolean;
  message: string;
  error_code?: string;
  success_code?: string;
}
