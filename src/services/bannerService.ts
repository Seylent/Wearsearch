/**
 * Banner API Service
 * Handles all banner-related API operations
 */

import { api } from './api';
import type { 
  Banner, 
  CreateBannerRequest, 
  BannerListResponse, 
  BannerResponse,
  BannerAnalyticsResponse 
} from '@/types/banner';

export const bannerService = {
  /**
   * Get all banners (public access)
   */
  async getBanners(params?: {
    target_type?: 'all' | 'category' | 'brand' | 'product';
    target_id?: string;
    include_inactive?: boolean;
  }): Promise<Banner[]> {
    const queryParams = new URLSearchParams();
    if (params?.target_type) queryParams.set('target_type', params.target_type);
    if (params?.target_id) queryParams.set('target_id', params.target_id);
    if (params?.include_inactive) queryParams.set('include_inactive', 'true');

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/banners?${queryString}` : '/banners';
    const response = await api.get<BannerListResponse>(endpoint);
    return response.data.data.banners;
  },

  /**
   * Get a specific banner by ID
   */
  async getBanner(id: string): Promise<Banner> {
    const response = await api.get<BannerResponse>(`/banners/${id}`);
    return response.data.data.banner;
  },

  /**
   * Create a new banner (admin only)
   */
  async createBanner(data: CreateBannerRequest): Promise<Banner> {
    const response = await api.post<BannerResponse>('/banners', data);
    return response.data.data.banner;
  },

  /**
   * Update an existing banner (admin only)
   */
  async updateBanner(id: string, data: Partial<CreateBannerRequest>): Promise<Banner> {
    const response = await api.put<BannerResponse>(`/banners/${id}`, data);
    return response.data.data.banner;
  },

  /**
   * Delete a banner (admin only)
   */
  async deleteBanner(id: string): Promise<void> {
    await api.delete(`/banners/${id}`);
  },

  /**
   * Track banner impression
   */
  async trackImpression(bannerId: string): Promise<void> {
    try {
      await api.post(`/banners/${bannerId}/impression`, {
        page_url: globalThis.window === undefined ? '' : globalThis.window.location.href,
        user_agent: globalThis.navigator === undefined ? '' : globalThis.navigator.userAgent,
      });
    } catch (error) {
      // Silently fail if backend hasn't implemented this endpoint yet (404)
      // Log other errors for debugging
      if (error && typeof error === 'object' && 'status' in error) {
        const status = (error as { status: number }).status;
        if (status !== 404) {
          console.error('Failed to track banner impression:', error);
        }
      }
    }
  },

  /**
   * Track banner click
   */
  async trackClick(bannerId: string): Promise<void> {
    try {
      await api.post(`/banners/${bannerId}/click`, {
        page_url: globalThis.window === undefined ? '' : globalThis.window.location.href,
        user_agent: globalThis.navigator === undefined ? '' : globalThis.navigator.userAgent,
      });
    } catch (error) {
      // Silently fail if backend hasn't implemented this endpoint yet (404)
      // Log other errors for debugging
      if (error && typeof error === 'object' && 'status' in error) {
        const status = (error as { status: number }).status;
        if (status !== 404) {
          console.error('Failed to track banner click:', error);
        }
      }
    }
  },

  /**
   * Get banner analytics (admin only)
   */
  async getAnalytics(
    bannerId: string,
    params?: {
      start_date?: string;
      end_date?: string;
    }
  ): Promise<BannerAnalyticsResponse['data']> {
    const queryParams = new URLSearchParams();
    if (params?.start_date) queryParams.set('start_date', params.start_date);
    if (params?.end_date) queryParams.set('end_date', params.end_date);

    const queryString = queryParams.toString();
    const endpoint = queryString 
      ? `/banners/${bannerId}/analytics?${queryString}` 
      : `/banners/${bannerId}/analytics`;
    const response = await api.get<BannerAnalyticsResponse>(endpoint);
    return response.data.data;
  },
};
