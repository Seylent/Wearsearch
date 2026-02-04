/**
 * User Context API Service
 * Новий endpoint для отримання контексту користувача та управління командами
 */

import { api } from '../api';

export interface StoreInfo {
  id: string;
  name: string;
  logo_url?: string;
}

export interface BrandInfo {
  id: string;
  name: string;
  logo_url?: string;
}

export interface TeamMember {
  user_id: string;
  email: string;
  name?: string;
  role: string;
  added_at: string;
}

export interface UserContext {
  user_id: string;
  roles: string[];
  is_admin: boolean;
  is_store_owner: boolean;
  is_brand_owner: boolean;
  is_store_manager: boolean;
  stores: {
    owned: StoreInfo[];
    managed: StoreInfo[];
    all: StoreInfo[];
  };
  brands: {
    owned: BrandInfo[];
    managed: BrandInfo[];
  };
  dashboard_type: 'super_admin' | 'brand_owner' | 'store_owner' | 'store_manager' | 'user';
}

export interface UserContextResponse {
  success: boolean;
  data: UserContext;
}

const handleApiError = (error: unknown, defaultMessage: string): never => {
  if (error instanceof Error) {
    throw new Error(`${defaultMessage}: ${error.message}`);
  }
  throw new Error(defaultMessage);
};

export const userContextApi = {
  /**
   * Get user context for dashboard type detection
   * GET /api/v1/users/me/context
   */
  getContext: async (): Promise<UserContext> => {
    try {
      const response = await api.get<UserContextResponse>('/api/v1/users/me/context');
      return response.data.data;
    } catch (error) {
      return handleApiError(error, 'Failed to fetch user context');
    }
  },

  /**
   * Store Team Management
   */

  // GET /api/v1/stores/:id/members - Get store team members
  getStoreMembers: async (storeId: string): Promise<TeamMember[]> => {
    try {
      const response = await api.get<{ success: boolean; data: TeamMember[] }>(
        `/stores/${storeId}/members`
      );
      return response.data.data;
    } catch (error) {
      return handleApiError(error, 'Failed to fetch store members');
    }
  },

  // POST /api/v1/stores/:id/members - Add manager to store
  addStoreMember: async (storeId: string, userId: string): Promise<void> => {
    try {
      await api.post(`/stores/${storeId}/members`, { user_id: userId });
    } catch (error) {
      handleApiError(error, 'Failed to add store member');
    }
  },

  // DELETE /api/v1/stores/:id/members/:userId - Remove manager from store
  removeStoreMember: async (storeId: string, userId: string): Promise<void> => {
    try {
      await api.delete(`/stores/${storeId}/members/${userId}`);
    } catch (error) {
      handleApiError(error, 'Failed to remove store member');
    }
  },

  /**
   * Brand Team Management
   */

  // GET /api/v1/brands/:id/members - Get brand team members
  getBrandMembers: async (brandId: string): Promise<TeamMember[]> => {
    try {
      const response = await api.get<{ success: boolean; data: TeamMember[] }>(
        `/brands/${brandId}/members`
      );
      return response.data.data;
    } catch (error) {
      return handleApiError(error, 'Failed to fetch brand members');
    }
  },

  // POST /api/v1/brands/:id/members - Add manager to brand
  addBrandMember: async (
    brandId: string,
    userId: string,
    role: string = 'manager'
  ): Promise<void> => {
    try {
      await api.post(`/brands/${brandId}/members`, { user_id: userId, role });
    } catch (error) {
      handleApiError(error, 'Failed to add brand member');
    }
  },

  // DELETE /api/v1/brands/:id/members/:userId - Remove member from brand
  removeBrandMember: async (brandId: string, userId: string): Promise<void> => {
    try {
      await api.delete(`/brands/${brandId}/members/${userId}`);
    } catch (error) {
      handleApiError(error, 'Failed to remove brand member');
    }
  },

  /**
   * Store Product Sizes Management
   */

  // GET /api/v1/stores/:storeId/products/:productId/sizes - Get available sizes
  getStoreProductSizes: async (storeId: string, productId: string): Promise<string[]> => {
    try {
      const response = await api.get<{ success: boolean; data: string[] }>(
        `/stores/${storeId}/products/${productId}/sizes`
      );
      return response.data.data || [];
    } catch (error) {
      return handleApiError(error, 'Failed to fetch product sizes');
    }
  },

  // PUT /api/v1/stores/:storeId/products/:productId/sizes - Update available sizes
  updateStoreProductSizes: async (
    storeId: string,
    productId: string,
    sizes: string[]
  ): Promise<void> => {
    try {
      await api.put(`/stores/${storeId}/products/${productId}/sizes`, { sizes });
    } catch (error) {
      handleApiError(error, 'Failed to update product sizes');
    }
  },
};

export default userContextApi;
