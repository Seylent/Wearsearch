/**
 * Unified API Service
 * Single axios instance with centralized configuration
 */

import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { getAuth, clearAuth } from '@/utils/authStorage';
import { API_CONFIG } from '@/config/api.config';
import { handleApiError as createApiError, ApiError } from './api/errorHandler';
import type { ApiError as ApiErrorType } from '@/types';
import { z } from 'zod';

/**
 * Rate Limit Handler
 * Implements exponential backoff for 429 responses
 */
const RATE_LIMIT_CONFIG = {
  maxRetries: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 30000, // 30 seconds
};

const sleep = (ms: number): Promise<void> => 
  new Promise(resolve => setTimeout(resolve, ms));

const getRetryDelay = (retryCount: number, retryAfter?: number): number => {
  if (retryAfter) {
    return retryAfter * 1000; // Convert seconds to ms
  }
  // Exponential backoff: 1s, 2s, 4s, etc.
  const delay = RATE_LIMIT_CONFIG.baseDelay * Math.pow(2, retryCount);
  // Add jitter (±25%) to prevent thundering herd
  const jitter = delay * 0.25 * (Math.random() - 0.5);
  return Math.min(delay + jitter, RATE_LIMIT_CONFIG.maxDelay);
};

/**
 * Request Queue for throttling
 * Prevents too many simultaneous requests
 */
class RequestQueue {
  private queue: Array<() => Promise<void>> = [];
  private running = 0;
  private readonly maxConcurrent = 6; // Max concurrent requests
  private readonly minDelay = 50; // Min delay between requests (ms)
  private lastRequestTime = 0;

  async add<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      const execute = async () => {
        // Enforce minimum delay between requests
        const now = Date.now();
        const timeSinceLastRequest = now - this.lastRequestTime;
        if (timeSinceLastRequest < this.minDelay) {
          await sleep(this.minDelay - timeSinceLastRequest);
        }
        this.lastRequestTime = Date.now();
        this.running++;
        
        try {
          const result = await fn();
          resolve(result);
        } catch (error) {
          reject(error);
        } finally {
          this.running--;
          this.processNext();
        }
      };

      if (this.running < this.maxConcurrent) {
        execute();
      } else {
        this.queue.push(execute);
      }
    });
  }

  private processNext(): void {
    if (this.queue.length > 0 && this.running < this.maxConcurrent) {
      const next = this.queue.shift();
      if (next) next();
    }
  }
}

const _requestQueue = new RequestQueue();

// Import AUTH_TOKEN_KEY for checking if user was logged in
const AUTH_TOKEN_KEY = 'wearsearch.auth';

const createClient = (baseURL: string): AxiosInstance => {
  return axios.create({
    baseURL,
    timeout: API_CONFIG.TIMEOUT,
    withCredentials: API_CONFIG.WITH_CREDENTIALS,
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

type FallbackConfig = {
  fallbackClient?: AxiosInstance;
  shouldFallbackToLegacy?: (config: InternalAxiosRequestConfig, error: AxiosError) => boolean;
};

const ENABLE_LEGACY_FALLBACK = process.env.NEXT_PUBLIC_ENABLE_LEGACY_FALLBACK === 'true';

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null;

const isSuccessDataEnvelope = (data: unknown): data is { success: true; data: unknown } =>
  isRecord(data) && data.success === true && 'data' in data;

const isRouteNotFoundPayload = (data: unknown): boolean => {
  if (!data || typeof data !== 'object') return false;
  const anyData = data as Record<string, unknown>;

  // v1 error envelope: { error: { code, message } }
  const errorObj = isRecord(anyData.error) ? anyData.error : undefined;
  const v1Message = errorObj?.message;
  const v1Code = errorObj?.code;
  if (typeof v1Message === 'string' && v1Message.toLowerCase().includes('route not found')) return true;
  if (typeof v1Code === 'string' && v1Code.toLowerCase().includes('route')) return true;

  // legacy shapes sometimes: { message }, { error }, { error_code }
  const message = anyData.message;
  const error = anyData.error;
  if (typeof message === 'string' && message.toLowerCase().includes('route not found')) return true;
  if (typeof error === 'string' && error.toLowerCase().includes('route not found')) return true;

  return false;
};

const defaultShouldFallbackToLegacy = (config: InternalAxiosRequestConfig, error: AxiosError): boolean => {
  const url = String(config.url || '');
  // Don't spam fallback for v1-only BFF endpoints.
  if (url.startsWith('/pages/')) return false;
  if (url === '/admin/dashboard') return false;

  const status = error.response?.status;
  if (status !== 404) return false;
  return isRouteNotFoundPayload(error.response?.data);
};

/**
 * Public endpoints that don't require authentication
 * Used to suppress "No token available" warnings for public routes
 */
const PUBLIC_ENDPOINT_PATTERNS: Array<string | RegExp> = [
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/items',
  '/brands',
  '/categories',
  '/stores',
  '/search',
  '/seo/',
  '/pages/',
  /^\/items\/[^/]+$/,           // GET /items/:id
  /^\/items\/[^/]+\/similar$/,  // GET /items/:id/similar
  /^\/items\/[^/]+\/stores$/,   // GET /items/:id/stores
  /^\/wishlist\/public\//,      // GET /wishlist/public/:shareId
];

const isPublicEndpoint = (url: string): boolean => {
  return PUBLIC_ENDPOINT_PATTERNS.some(pattern => {
    if (typeof pattern === 'string') {
      return url.includes(pattern);
    }
    return pattern.test(url);
  });
};

const attachInterceptors = (client: AxiosInstance, fallback?: FallbackConfig) => {
  /**
   * Request interceptor - adds auth token to requests
   */
  client.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const token = getAuth();
      const url = config.url || '';

      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
        // Only log in development and for non-trivial requests
        if (process.env.NODE_ENV !== 'production' && !url.includes('/items') && !url.includes('/search')) {
          console.log(`🔑 Auth token attached to ${config.method?.toUpperCase()} ${url}`);
        }
      } else if (!token && url && !isPublicEndpoint(url)) {
        // Only warn for endpoints that likely require authentication
        console.warn(`⚠️ No token available for ${config.method?.toUpperCase()} ${url}`);
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
  client.interceptors.response.use(
    (response: AxiosResponse) => {
      // Unwrap backend response if it has success/data structure
      if (isSuccessDataEnvelope(response.data)) return { ...response, data: response.data.data };
      return response;
    },
    async (error: AxiosError) => {
      const config = error.config as (InternalAxiosRequestConfig & { 
        __wearsearchTriedLegacy?: boolean;
        __rateLimitRetryCount?: number;
      }) | undefined;

      // Handle 429 Rate Limit with automatic retry
      if (error.response?.status === 429 && config) {
        const retryCount = config.__rateLimitRetryCount || 0;
        
        if (retryCount < RATE_LIMIT_CONFIG.maxRetries) {
          // Get Retry-After header if present
          const retryAfterHeader = error.response.headers['retry-after'];
          const retryAfter = retryAfterHeader ? parseInt(retryAfterHeader, 10) : undefined;
          const delay = getRetryDelay(retryCount, retryAfter);
          
          if (process.env.NODE_ENV !== 'production') {
            console.log(`⏳ Rate limited. Retrying in ${Math.round(delay / 1000)}s (attempt ${retryCount + 1}/${RATE_LIMIT_CONFIG.maxRetries})...`);
          }
          
          await sleep(delay);
          
          // Retry the request
          config.__rateLimitRetryCount = retryCount + 1;
          return client.request(config);
        } else {
          if (process.env.NODE_ENV !== 'production') {
            console.warn('⚠️ Rate limit: max retries exceeded');
          }
        }
      }

      // Automatic fallback: if v1 route is missing, retry the same request against legacy /api.
      try {
        const cfg = config;
        if (
          cfg &&
          !cfg.__wearsearchTriedLegacy &&
          fallback?.fallbackClient &&
          (fallback.shouldFallbackToLegacy ?? defaultShouldFallbackToLegacy)(cfg, error)
        ) {
          cfg.__wearsearchTriedLegacy = true;

          // Ensure fallback client uses its own baseURL.
          const retryConfig: InternalAxiosRequestConfig = { ...cfg };
          delete retryConfig.baseURL;

          if (process.env.NODE_ENV !== 'production') {
            console.warn('↩️ v1 route missing; retrying via legacy API:', {
              method: retryConfig.method,
              url: retryConfig.url,
            });
          }

          return await fallback.fallbackClient.request(retryConfig);
        }
      } catch {
        // If fallback logic fails, continue with normal error handling.
      }

      const apiError = createApiError(error);

      // Handle authentication errors globally
      if (apiError.isAuthError()) {
        // Check if user was actually logged in before
        const wasAuthenticated = typeof window !== 'undefined' && (!!localStorage.getItem(AUTH_TOKEN_KEY) || !!localStorage.getItem('access_token'));

        console.log('🚨 Authentication error detected:', {
          status: apiError.status,
          message: apiError.message,
          url: error.config?.url,
          wasAuthenticated
        });

        // Only clear auth and show message if user was actually logged in
        if (wasAuthenticated) {
          console.log('🧹 Clearing auth and dispatching logout event');
          clearAuth();

          // Dispatch custom event for auth handling (avoid direct window.location)
          window.dispatchEvent(new CustomEvent('auth:logout', {
            detail: { reason: 'unauthorized' }
          }));
        } else {
          console.log('ℹ️ Auth error for non-authenticated user - ignoring');
        }
      }

      // Log errors in development
      if (process.env.NODE_ENV !== 'production') {
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
};

/**
 * Create axios instances with default configuration
 */
export const api: AxiosInstance = createClient(API_CONFIG.BASE_URL);
export const apiLegacy: AxiosInstance = createClient(API_CONFIG.LEGACY_BASE_URL);

attachInterceptors(api, ENABLE_LEGACY_FALLBACK ? { fallbackClient: apiLegacy } : undefined);
attachInterceptors(apiLegacy);


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
      if (process.env.NODE_ENV !== 'production') {
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
      if (process.env.NODE_ENV !== 'production') {
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
      if (process.env.NODE_ENV !== 'production') {
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
      if (process.env.NODE_ENV !== 'production') {
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
      if (process.env.NODE_ENV !== 'production') {
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
