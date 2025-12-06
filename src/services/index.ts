// Central export file for all services
export { default as api, handleApiError } from './api';
export { default as ENDPOINTS } from './endpoints';
export { default as authService } from './authService';
export { default as productService } from './productService';
export { default as userService } from './userService';
export { default as uploadService } from './uploadService';
export { default as storeService } from './storeService';
export { default as ratingsService } from './ratingsService';

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
  ChangePasswordData,
} from './userService';

export type {
  UploadResponse,
  MultipleUploadResponse,
} from './uploadService';

export type {
  Store as StoreType,
  StoreWithPrice,
  StoreFilters,
  CreateStoreData,
  UpdateStoreData,
} from './storeService';

export type {
  Rating,
  CreateRatingData,
  RatingsResponse,
} from './ratingsService';
