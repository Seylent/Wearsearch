// Central export file for all services
export { default as api, handleApiError } from './api';
export { default as ENDPOINTS } from './endpoints';
export { authService } from './authService';
export { productService } from './productService';
export { userService } from './userService';
export { uploadService } from './uploadService';

// Export types
export type {
  User,
  LoginCredentials,
  RegisterData,
  AuthResponse,
} from '@/types';

export type {
  Product,
  Store,
  ProductFilters,
  PaginationParams,
  ProductsResponse,
} from './productService';

export type {
  UserProfile,
  UpdateProfileData,
  FavoriteProduct,
} from './userService';

export type {
  UploadResponse,
  MultipleUploadResponse,
} from './uploadService';
