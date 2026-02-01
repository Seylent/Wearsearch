// API Endpoints Configuration
// All endpoints are relative to the API_BASE_URL defined in api.ts
// Updated to use /api/v1 prefix for all endpoints

export const ENDPOINTS = {
  // Authentication endpoints
  AUTH: {
    LOGIN: '/api/v1/auth/login',
    REGISTER: '/api/v1/auth/register',
    LOGOUT: '/api/v1/auth/logout',
    REFRESH: '/api/v1/auth/refresh',
    ME: '/api/v1/auth/me',
    PASSWORD: '/api/v1/auth/password',
    FORGOT_PASSWORD: '/api/v1/auth/forgot-password',
    RESET_PASSWORD: '/api/v1/auth/reset-password',
  },

  // Product endpoints (seo-products for product detail pages)
  PRODUCTS: {
    LIST: '/api/v1/items',
    DETAIL: (id: string | number) => `/api/v1/items/${id}`,
    STORES: (id: string | number) => `/api/v1/items/${id}/stores`,
    POPULAR_SAVED: '/api/v1/products/popular-saved',
    CREATE: '/api/v1/admin/items',
    UPDATE: (id: string | number) => `/api/v1/admin/items/${id}`,
    DELETE: (id: string | number) => `/api/v1/admin/items/${id}`,
    SEARCH: '/api/v1/items/search',
    CATEGORIES: '/api/v1/items/categories',
    BY_CATEGORY: (category: string) => `/api/v1/items/category/${category}`,
  },

  // User endpoints (now under /api/v1/users/me)
  USERS: {
    PROFILE: '/api/v1/users/me/profile',
    UPDATE_PROFILE: '/api/v1/users/me/profile',
    DISPLAY_NAME: '/api/v1/users/me/profile/display-name',
    BIO: '/api/v1/users/me/profile/bio',
    AVATAR: '/api/v1/users/me/profile/avatar',
    PASSWORD: '/api/v1/users/me/profile/password',
    DELETE_ACCOUNT: '/api/v1/users/me/account',
    FAVORITES: '/api/v1/users/me/favorites',
    ADD_FAVORITE: (productId: string | number) => `/api/v1/users/me/favorites/${productId}`,
    REMOVE_FAVORITE: (productId: string | number) => `/api/v1/users/me/favorites/${productId}`,
    CHECK_FAVORITE: (productId: string | number) => `/api/v1/users/me/favorites/${productId}/check`,
    TOGGLE_FAVORITE: '/api/v1/users/me/favorites/toggle',
    STATS: '/api/v1/users/me/stats',
    SAVED_STORES: '/api/v1/users/me/saved-stores',
    ADD_SAVED_STORE: (storeId: string | number) => `/api/v1/users/me/saved-stores/${storeId}`,
    REMOVE_SAVED_STORE: (storeId: string | number) => `/api/v1/users/me/saved-stores/${storeId}`,
  },

  // Admin endpoints
  ADMIN: {
    USERS: '/api/v1/admin/users',
    USER_DETAIL: (id: string | number) => `/api/v1/admin/users/${id}`,
    STATS: '/api/v1/admin/stats',
    PRODUCTS: '/api/v1/admin/products',
    STORES: {
      LIST: '/api/v1/admin/stores',
      CREATE: '/api/v1/admin/stores',
      UPDATE: (id: string | number) => `/api/v1/admin/stores/${id}`,
      DELETE: (id: string | number) => `/api/v1/admin/stores/${id}`,
    },
  },

  // Upload endpoints
  UPLOAD: {
    IMAGE: '/api/v1/supabase-upload/image',
    AVATAR: '/api/v1/supabase-upload/avatar',
    IMAGES: '/api/v1/supabase-upload/images',
  },

  // Store endpoints
  STORES: {
    LIST: '/api/v1/stores',
    DETAIL: (id: string | number) => `/api/v1/stores/${id}`,
    PRODUCTS: (
      id: string | number,
      params?: { category?: string; page?: number; limit?: number }
    ) => {
      const baseUrl = `/api/v1/stores/${id}/products`;
      const searchParams = new URLSearchParams();
      if (params?.category) searchParams.append('category', params.category);
      if (params?.page) searchParams.append('page', params.page.toString());
      if (params?.limit) searchParams.append('limit', params.limit.toString());
      const query = searchParams.toString();
      return query ? `${baseUrl}?${query}` : baseUrl;
    },
    CREATE: '/api/v1/admin/stores',
    UPDATE: (id: string | number) => `/api/v1/admin/stores/${id}`,
    DELETE: (id: string | number) => `/api/v1/admin/stores/${id}`,
    ADMIN_LIST: '/api/v1/stores',
    MANAGERS: (storeId: string | number) => `/api/v1/stores/${storeId}/managers`,
    REMOVE_MANAGER: (storeId: string | number, userId: string | number) =>
      `/api/v1/stores/${storeId}/managers/${userId}`,
  },

  // Brand endpoints
  BRANDS: {
    LIST: '/api/v1/brands',
    DETAIL: (id: string | number) => `/api/v1/brands/${id}`,
    PRODUCTS: (id: string | number) => `/api/v1/brands/${id}/products`,
    CREATE: '/api/v1/brands',
    UPDATE: (id: string | number) => `/api/v1/brands/${id}`,
    DELETE: (id: string | number) => `/api/v1/brands/${id}`,
    MEMBERS: (brandId: string | number) => `/api/v1/brands/${brandId}/members`,
    REMOVE_MEMBER: (brandId: string | number, userId: string | number) =>
      `/api/v1/brands/${brandId}/members/${userId}`,
  },

  // Statistics endpoint
  STATISTICS: '/api/v1/statistics',

  // Translation endpoint
  TRANSLATE: '/api/v1/translate',

  // Contacts endpoint
  CONTACTS: '/api/v1/contacts',

  // Pages endpoints (for SEO pages)
  PAGES: {
    HOME: '/api/v1/pages/home',
    PRODUCTS: '/api/v1/pages/products',
    PRODUCT_DETAIL: (id: string | number) => `/api/v1/pages/product/${id}`,
    STORES: '/api/v1/pages/stores',
  },

  // Store-menu endpoints
  STORE_MENU: {
    BASE: '/api/v1/store-menu',
    STORES: '/api/v1/store-menu/stores',
    DASHBOARD: (storeId: string) => `/api/v1/store-menu/dashboard?store_id=${storeId}`,
    PRODUCTS: {
      MY: (storeId: string) => `/api/v1/store-menu/products/my?store_id=${storeId}`,
      ALL: '/api/v1/store-menu/products/all',
      CREATE: '/api/v1/store-menu/products',
      DELETE: (productId: string, storeId: string) =>
        `/api/v1/store-menu/products/${productId}?store_id=${storeId}`,
    },
    MANAGERS: (storeId: string) => `/api/v1/store-menu/managers?store_id=${storeId}`,
    SETTINGS: (storeId: string) => `/api/v1/store-menu/settings?store_id=${storeId}`,
  },

  // Favorites sync
  FAVORITES_SYNC: '/api/v1/favorites/sync',
} as const;

export default ENDPOINTS;
