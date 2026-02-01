/**
 * Banner API Service
 * Handles all banner-related API operations
 */

import { apiBanners } from './api';
import type { Banner, CreateBannerRequest, BannerAnalyticsResponse } from '@/types/banner';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const getArray = (value: unknown, key: string): unknown[] | undefined => {
  if (!isRecord(value)) return undefined;
  const nested = value[key];
  return Array.isArray(nested) ? nested : undefined;
};

const getRecord = (value: unknown, key: string): Record<string, unknown> | undefined => {
  if (!isRecord(value)) return undefined;
  const nested = value[key];
  return isRecord(nested) ? nested : undefined;
};

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

    try {
      const response = await apiBanners.get(endpoint);
      const payload = response.data as unknown;

      // Supported response formats:
      // - { success, data: { banners: [...] } }
      // - { banners: [...] }
      // - [ ... ]
      const banners = (getArray(getRecord(payload, 'data'), 'banners') ??
        getArray(payload, 'banners') ??
        (Array.isArray(payload) ? payload : [])) as Banner[];

      return banners;
    } catch (error) {
      console.error('❌ Error fetching banners:', error);
      return [];
    }
  },

  /**
   * Get a specific banner by ID
   */
  async getBanner(id: string): Promise<Banner> {
    const response = await apiBanners.get(`/banners/${id}`);
    const payload = response.data as unknown;
    const banner = (getRecord(getRecord(payload, 'data'), 'banner') ??
      getRecord(payload, 'banner') ??
      getRecord(payload, 'data') ??
      payload) as Banner;
    return banner;
  },

  /**
   * Create a new banner (admin only)
   */
  async createBanner(data: CreateBannerRequest): Promise<Banner> {
    const response = await apiBanners.post('/banners', data);
    const payload = response.data as unknown;
    const banner = (getRecord(getRecord(payload, 'data'), 'banner') ??
      getRecord(payload, 'banner') ??
      getRecord(payload, 'data') ??
      payload) as Banner;
    return banner;
  },

  /**
   * Update an existing banner (admin only)
   */
  async updateBanner(id: string, data: Partial<CreateBannerRequest>): Promise<Banner> {
    const response = await apiBanners.put(`/banners/${id}`, data);
    const payload = response.data as unknown;
    const banner = (getRecord(getRecord(payload, 'data'), 'banner') ??
      getRecord(payload, 'banner') ??
      getRecord(payload, 'data') ??
      payload) as Banner;
    return banner;
  },

  /**
   * Delete a banner (admin only)
   */
  async deleteBanner(id: string): Promise<void> {
    await apiBanners.delete(`/banners/${id}`);
  },

  /**
   * Track banner impression
   */
  async trackImpression(bannerId: string): Promise<void> {
    try {
      await apiBanners.post(`/banners/${bannerId}/impression`, {
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
      await apiBanners.post(`/banners/${bannerId}/click`, {
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
    const response = await apiBanners.get<BannerAnalyticsResponse>(endpoint);
    return response.data.data;
  },
};
