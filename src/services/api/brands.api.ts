/**
 * Brands API Service
 * Handles all brand-related API calls
 */

import { api } from '../api';
import type { Brand, BrandsResponse, Product } from '@/types';

export const brandsApi = {
  /**
   * Get all brands
   */
  getAll: async (): Promise<BrandsResponse> => {
    try {
      const response = await api.get('/brands');
      return response.data;
    } catch (error) {
      console.error('[Brands API] Failed to fetch brands:', error);
      throw error;
    }
  },

  /**
   * Get a single brand by ID
   */
  getById: async (id: string): Promise<Brand> => {
    try {
      const response = await api.get(`/brands/${id}`);
      return response.data;
    } catch (error) {
      console.error(`[Brands API] Failed to fetch brand ${id}:`, error);
      throw error;
    }
  },

  /**
   * Get products for a specific brand
   */
  getProducts: async (brandId: string): Promise<Product[]> => {
    try {
      const response = await api.get(`/brands/${brandId}/products`);
      return response.data;
    } catch (error) {
      console.error(`[Brands API] Failed to fetch products for brand ${brandId}:`, error);
      throw error;
    }
  },

  /**
   * Admin: Create a new brand
   */
  create: async (brandData: Partial<Brand>): Promise<Brand> => {
    try {
      const response = await api.post('/brands', brandData);
      return response.data;
    } catch (error) {
      console.error('[Brands API] Failed to create brand:', error);
      throw error;
    }
  },

  /**
   * Admin: Update a brand
   */
  update: async (id: string, brandData: Partial<Brand>): Promise<Brand> => {
    try {
      const response = await api.put(`/brands/${id}`, brandData);
      return response.data;
    } catch (error) {
      console.error(`[Brands API] Failed to update brand ${id}:`, error);
      throw error;
    }
  },

  /**
   * Admin: Delete a brand
   */
  delete: async (id: string): Promise<void> => {
    try {
      await api.delete(`/brands/${id}`);
    } catch (error) {
      console.error(`[Brands API] Failed to delete brand ${id}:`, error);
      throw error;
    }
  },
};
