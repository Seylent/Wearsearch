/**
 * Unified API Service
 * Single axios instance with centralized configuration
 */

import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { getAuth, clearAuth } from '@/utils/authStorage';
import type { ApiResponse, ApiError } from '@/types';

// Use relative URL for API requests - works with Vite proxy and ngrok
const API_BASE_URL = '/api';

/**
 * Create axios instance with default configuration
 */
export const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
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
    // Handle common errors
    if (error.response) {
      switch (error.response.status) {
        case 401:
          // Unauthorized - clear auth and redirect to login
          console.log('Unauthorized request - token cleared');
          clearAuth();
          
          // Only redirect if not already on auth page
          if (!window.location.pathname.includes('/auth')) {
            window.location.href = '/auth';
          }
          break;
          
        case 403:
          // Forbidden
          console.error('Forbidden access');
          break;
          
        case 404:
          // Not found
          console.log('Resource not found:', error.config?.url);
          break;
          
        case 500:
          // Server error
          console.error('Server error:', error.response.data);
          break;
          
        default:
          console.error('API error:', error.response.status, error.response.data);
      }
    } else if (error.request) {
      // Request made but no response received
      console.error('Network error - no response received');
    } else {
      // Error setting up request
      console.error('Request setup error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

/**
 * Centralized error handler
 */
export const handleApiError = (error: unknown): ApiError => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiResponse>;
    
    return {
      message: axiosError.response?.data?.message || 
               axiosError.response?.data?.error ||
               axiosError.message || 
               'An unexpected error occurred',
      status: axiosError.response?.status,
      code: axiosError.code,
    };
  }
  
  if (error instanceof Error) {
    return {
      message: error.message,
    };
  }
  
  return {
    message: 'An unexpected error occurred',
  };
};

/**
 * Type-safe API wrapper functions
 */
export const apiGet = async <T = any>(url: string, config?: any): Promise<T> => {
  const response = await api.get<T>(url, config);
  return response.data;
};

export const apiPost = async <T = any>(url: string, data?: any, config?: any): Promise<T> => {
  const response = await api.post<T>(url, data, config);
  return response.data;
};

export const apiPut = async <T = any>(url: string, data?: any, config?: any): Promise<T> => {
  const response = await api.put<T>(url, data, config);
  return response.data;
};

export const apiPatch = async <T = any>(url: string, data?: any, config?: any): Promise<T> => {
  const response = await api.patch<T>(url, data, config);
  return response.data;
};

export const apiDelete = async <T = any>(url: string, config?: any): Promise<T> => {
  const response = await api.delete<T>(url, config);
  return response.data;
};

export default api;
