// API Endpoints Configuration
// All endpoints are relative to the API_BASE_URL defined in api.ts

export const ENDPOINTS = {
    // Ratings endpoints
    RATINGS: {
      ADD: '/ratings',
      BY_STORE: (storeId: string) => `/ratings/store/${storeId}`,
      BY_USER: (userId: string) => `/ratings/user/${userId}`,
      DELETE: (ratingId: string) => `/ratings/${ratingId}`,
    },
  // Authentication endpoints
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    ME: '/auth/me',
    PROFILE: '/auth/profile',
    PASSWORD: '/auth/password',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
  },

  // Product endpoints
  PRODUCTS: {
    LIST: '/items',
    DETAIL: (id: string | number) => `/items/${id}`,
    STORES: (id: string | number) => `/items/${id}/stores`,
    CREATE: '/admin/products',
    UPDATE: (id: string | number) => `/admin/products/${id}`,
    DELETE: (id: string | number) => `/admin/products/${id}`,
    SEARCH: '/items/search',
    CATEGORIES: '/items/categories',
    BY_CATEGORY: (category: string) => `/items/category/${category}`,
  },

  // User endpoints
  USERS: {
    PROFILE: '/user/profile',
    UPDATE_PROFILE: '/user/profile',
    DISPLAY_NAME: '/user/profile/display-name',
    BIO: '/user/profile/bio',
    AVATAR: '/user/profile/avatar',
    PASSWORD: '/user/profile/password',
    FAVORITES: '/user/favorites',
    ADD_FAVORITE: (productId: string | number) => `/user/favorites/${productId}`,
    REMOVE_FAVORITE: (productId: string | number) => `/user/favorites/${productId}`,
    CHECK_FAVORITE: (productId: string | number) => `/user/favorites/${productId}/check`,
    STATS: '/user/stats',
  },

  // Admin endpoints
  ADMIN: {
    USERS: '/admin/users',
    USER_DETAIL: (id: string | number) => `/admin/users/${id}`,
    STATS: '/admin/stats',
    PRODUCTS: '/admin/products',
  },

  // Upload endpoints
  UPLOAD: {
    IMAGE: '/supabase-upload/image',
    AVATAR: '/supabase-upload/avatar',
    IMAGES: '/supabase-upload/images',
  },

  // Store endpoints
  STORES: {
    LIST: '/stores',
    DETAIL: (id: string | number) => `/stores/${id}`,
    CREATE: '/admin/stores',
    UPDATE: (id: string | number) => `/admin/stores/${id}`,
    DELETE: (id: string | number) => `/admin/stores/${id}`,
    ADMIN_LIST: '/admin/stores', // With search parameter
  },

  // Brand endpoints
  BRANDS: {
    LIST: '/brands',
    DETAIL: (id: string | number) => `/brands/${id}`,
    PRODUCTS: (id: string | number) => `/brands/${id}/products`,
    CREATE: '/brands',
    UPDATE: (id: string | number) => `/brands/${id}`,
    DELETE: (id: string | number) => `/brands/${id}`,
  },
} as const;

export default ENDPOINTS;
