// API Endpoints Configuration
// All endpoints are relative to the API_BASE_URL defined in api.ts

export const ENDPOINTS = {
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
    LIST: '/products',
    DETAIL: (id: string | number) => `/products/${id}`,
    CREATE: '/products',
    UPDATE: (id: string | number) => `/products/${id}`,
    DELETE: (id: string | number) => `/products/${id}`,
    SEARCH: '/products/search',
    CATEGORIES: '/products/categories',
    BY_CATEGORY: (category: string) => `/products/category/${category}`,
  },

  // User endpoints
  USERS: {
    PROFILE: '/users/profile',
    UPDATE_PROFILE: '/users/profile',
    FAVORITES: '/users/favorites',
    ADD_FAVORITE: (productId: string | number) => `/users/favorites/${productId}`,
    REMOVE_FAVORITE: (productId: string | number) => `/users/favorites/${productId}`,
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
    IMAGE: '/upload/image',
    IMAGES: '/upload/images',
  },
} as const;

export default ENDPOINTS;
