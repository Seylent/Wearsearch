// Central export file for all services
export { default as api, handleApiError } from './api';
export { default as ENDPOINTS } from './endpoints';
export { default as authService } from './authService';
export { default as productService } from './productService';
export { default as userService } from './userService';
export { default as uploadService } from './uploadService';

// Export types
export type {
  User,
  LoginCredentials,
  RegisterData,
  AuthResponse,
  ForgotPasswordData,
  ResetPasswordData,
} from './authService';

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
