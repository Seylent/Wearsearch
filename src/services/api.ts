/**
 * Unified API Service
 * Single axios instance with centralized configuration
 */

import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { getAuth, clearAuth } from '@/utils/authStorage';
import { API_CONFIG } from '@/config/api.config';
import { handleApiError as createApiError, ApiError } from './api/errorHandler';
import type { ApiResponse } from '@/types';
import type { ApiError as ApiErrorType } from '@/types';
import { z } from 'zod';

/**
 * Create axios instance with default configuration
 */
export const api: AxiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  withCredentials: API_CONFIG.WITH_CREDENTIALS,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request interceptor - adds auth token to requests
 */
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAuth();
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor - handles common errors and unwraps responses
 */
api.interceptors.response.use(
  (response: AxiosResponse) => {
    // Unwrap backend response if it has success/data structure
    if (response.data && typeof response.data === 'object') {
      // If response has { success: true, data: {...} }, unwrap it
      if ('success' in response.data && 'data' in response.data && response.data.success) {
        return { ...response, data: response.data.data };
      }
    }
    return response;
  },
  (error: AxiosError) => {
    const apiError = createApiError(error);
    
    // Handle authentication errors globally
    if (apiError.isAuthError()) {
      console.log('Authentication error - clearing auth');
      clearAuth();
      
      // Dispatch custom event for auth handling (avoid direct window.location)
      window.dispatchEvent(new CustomEvent('auth:logout', { 
        detail: { reason: 'unauthorized' } 
      }));
    }
    
    // Log errors in development
    if (import.meta.env.DEV) {
      if (apiError.isServerError()) {
        console.error('Server error:', apiError);
      } else if (apiError.isNetworkError()) {
        console.error('Network error:', apiError);
      } else if (!apiError.isNotFound()) {
        console.log('API error:', apiError);
      }
    }
    
    return Promise.reject(apiError);
  }
);

/**
 * Centralized error handler (deprecated - use ApiError class directly)
 * @deprecated Import handleApiError from './api/errorHandler' instead
 */
export const handleApiError = (error: unknown): ApiErrorType => {
  const apiError = createApiError(error);
  
  return {
    message: apiError.message,
    status: apiError.status,
    code: apiError.code,
    error_code: apiError.errorCode,
  };
};

/**
 * Type-safe API wrapper functions with optional Zod validation
 */
export const apiGet = async <T>(
  url: string,
  config?: { schema?: z.ZodSchema<T>; [key: string]: unknown }
): Promise<T> => {
  const { schema, ...axiosConfig } = config || {};
  const response = await api.get<T>(url, axiosConfig);
  
  if (schema) {
    try {
      return schema.parse(response.data);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('API response validation failed:', {
          url,
          error: error instanceof z.ZodError ? error.errors : error,
          data: response.data,
        });
      }
      throw new ApiError('Invalid API response format', undefined, undefined, 'VALIDATION_ERROR');
    }
  }
  
  return response.data;
};

export const apiPost = async <T>(
  url: string,
  data?: unknown,
  config?: { schema?: z.ZodSchema<T>; [key: string]: unknown }
): Promise<T> => {
  const { schema, ...axiosConfig } = config || {};
  const response = await api.post<T>(url, data, axiosConfig);
  
  if (schema) {
    try {
      return schema.parse(response.data);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('API response validation failed:', {
          url,
          error: error instanceof z.ZodError ? error.errors : error,
        });
      }
      throw new ApiError('Invalid API response format', undefined, undefined, 'VALIDATION_ERROR');
    }
  }
  
  return response.data;
};

export const apiPut = async <T>(
  url: string,
  data?: unknown,
  config?: { schema?: z.ZodSchema<T>; [key: string]: unknown }
): Promise<T> => {
  const { schema, ...axiosConfig } = config || {};
  const response = await api.put<T>(url, data, axiosConfig);
  
  if (schema) {
    try {
      return schema.parse(response.data);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('API response validation failed:', { url, error });
      }
      throw new ApiError('Invalid API response format', undefined, undefined, 'VALIDATION_ERROR');
    }
  }
  
  return response.data;
};

export const apiPatch = async <T>(
  url: string,
  data?: unknown,
  config?: { schema?: z.ZodSchema<T>; [key: string]: unknown }
): Promise<T> => {
  const { schema, ...axiosConfig } = config || {};
  const response = await api.patch<T>(url, data, axiosConfig);
  
  if (schema) {
    try {
      return schema.parse(response.data);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('API response validation failed:', { url, error });
      }
      throw new ApiError('Invalid API response format', undefined, undefined, 'VALIDATION_ERROR');
    }
  }
  
  return response.data;
};

export const apiDelete = async <T>(
  url: string,
  config?: { schema?: z.ZodSchema<T>; [key: string]: unknown }
): Promise<T> => {
  const { schema, ...axiosConfig } = config || {};
  const response = await api.delete<T>(url, axiosConfig);
  
  if (schema) {
    try {
      return schema.parse(response.data);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('API response validation failed:', { url, error });
      }
      throw new ApiError('Invalid API response format', undefined, undefined, 'VALIDATION_ERROR');
    }
  }
  
  return response.data;
};

// Re-export error handling utilities for convenience
export { ApiError, isApiError, getErrorMessage } from './api/errorHandler';

export default api;
