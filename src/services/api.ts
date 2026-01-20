/**
 * Unified API Service
 * Single axios instance with centralized configuration
 */

import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { API_CONFIG } from '@/config/api.config';
import { handleApiError as createApiError, ApiError } from './api/errorHandler';
import { retryWithBackoff } from '@/utils/retryWithBackoff';
import type { ApiError as ApiErrorType } from '@/types';
import { z } from 'zod';

// Lightweight, SSR-friendly token retrieval
const readAuthTokenFromStorage = (): string | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('wearsearch.auth');
    if (raw) {
      const data = JSON.parse(raw) as { token?: string; expiresAt?: number };
      if (data?.token) {
        if (data.expiresAt && Date.now() > data.expiresAt) {
          localStorage.removeItem('wearsearch.auth');
          return null;
        }
        return data.token;
      }
    }
    const legacy = localStorage.getItem('access_token');
    return legacy;
  } catch {
    return null;
  }
};

// Get token (client-side, SSR-safe)
const getAuth = (): string | null => {
  if (typeof window === 'undefined') return null;
  return readAuthTokenFromStorage();
};

/**
 * Rate Limit Handler
 * Implements exponential backoff for 429 responses
 */
const RATE_LIMIT_CONFIG = {
  maxRetries: process.env.NODE_ENV === 'production' ? 5 : 5, // Increased retries for aggressive rate limiting
  baseDelay: process.env.NODE_ENV === 'production' ? 1000 : 1000, // 1s base delay
  maxDelay: process.env.NODE_ENV === 'production' ? 30000 : 10000, // 10s max in dev, 30s in prod
};

const sleep = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

const getRetryDelay = (retryCount: number, retryAfter?: number): number => {
  // In development, ignore server retry-after to prevent super long waits
  if (process.env.NODE_ENV !== 'production') {
    const delay = RATE_LIMIT_CONFIG.baseDelay * Math.pow(2, retryCount);
    const jitter = delay * 0.25 * (Math.random() - 0.5);
    return Math.min(delay + jitter, RATE_LIMIT_CONFIG.maxDelay);
  }

  // In production, respect server retry-after but cap it
  if (retryAfter) {
    const retryMs = retryAfter * 1000;
    return Math.min(retryMs, RATE_LIMIT_CONFIG.maxDelay);
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
  private readonly queue: Array<() => Promise<void>> = [];
  private running = 0;
  private readonly maxConcurrent = process.env.NODE_ENV === 'production' ? 3 : 2; // Very low limit to avoid rate limiting
  private readonly minDelay = process.env.NODE_ENV === 'production' ? 100 : 200; // Higher delay in dev to space out requests
  private lastRequestTime = 0;
  private readonly pendingRequests = new Map<string, Promise<unknown>>(); // Request deduplication

  async add<T>(fn: () => Promise<T>, dedupKey?: string): Promise<T> {
    // Request deduplication - if same request is already pending, return the same promise
    if (dedupKey && this.pendingRequests.has(dedupKey)) {
      return this.pendingRequests.get(dedupKey) as Promise<T>;
    }

    const promise = new Promise<T>((resolve, reject) => {
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
          if (dedupKey) {
            this.pendingRequests.delete(dedupKey);
          }
          this.processNext();
        }
      };

      if (this.running < this.maxConcurrent) {
        execute();
      } else {
        this.queue.push(execute);
      }
    });

    // Store promise for deduplication
    if (dedupKey) {
      this.pendingRequests.set(dedupKey, promise);
    }

    return promise;
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

/**
 * Handle rate limit errors (429) with retry logic
 */
async function handleRateLimitError(
  error: AxiosError,
  config: InternalAxiosRequestConfig & { __rateLimitRetryCount?: number },
  client: AxiosInstance
): Promise<AxiosResponse | null> {
  if (error.response?.status !== 429) return null;

  // Skip retry if requested (e.g., for auth endpoints)
  if (config.headers?.['X-Skip-Retry'] === 'true') {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`⛔ Skipping retry for ${config.url} (X-Skip-Retry header set)`);
    }
    return null;
  }

  const retryCount = config.__rateLimitRetryCount || 0;
  if (retryCount >= RATE_LIMIT_CONFIG.maxRetries) {
    console.warn(
      `⚠️ Max retry attempts (${RATE_LIMIT_CONFIG.maxRetries}) reached for ${config.url}`
    );
    return null;
  }

  const retryAfter = error.response?.headers?.['retry-after'];
  const retryAfterSeconds = retryAfter ? parseInt(retryAfter, 10) : undefined;
  const delay = getRetryDelay(retryCount, retryAfterSeconds);

  if (process.env.NODE_ENV !== 'production') {
    console.log(
      `⏳ Rate limited (429). Retrying in ${Math.round(delay / 1000)}s (attempt ${retryCount + 1}/${RATE_LIMIT_CONFIG.maxRetries})`
    );
  }

  await sleep(delay);

  config.__rateLimitRetryCount = retryCount + 1;
  return client.request(config);
}

/**
 * Handle legacy API fallback for 404 errors
 */
async function handleLegacyFallback(
  error: AxiosError,
  config: InternalAxiosRequestConfig & { __wearsearchTriedLegacy?: boolean },
  fallback?: FallbackConfig
): Promise<AxiosResponse | null> {
  if (!fallback?.fallbackClient || config.__wearsearchTriedLegacy) return null;

  const shouldFallback = fallback.shouldFallbackToLegacy || defaultShouldFallbackToLegacy;
  if (!shouldFallback(config, error)) return null;

  if (process.env.NODE_ENV !== 'production') {
    console.log(`🔄 Falling back to legacy API for ${config.url}`);
  }

  config.__wearsearchTriedLegacy = true;
  return fallback.fallbackClient.request(config);
}

/**
 * Handle authentication errors
 */
function handleAuthError(apiError: ApiError, _originalError: unknown): void {
  const isAuthError = apiError.status === 401;
  if (!isAuthError) return;

  // Check if user was previously authenticated
  const wasAuthenticated = typeof window !== 'undefined' && localStorage.getItem(AUTH_TOKEN_KEY);

  if (wasAuthenticated && process.env.NODE_ENV !== 'production') {
    console.warn('🔒 Authentication error - token may be expired');
  }
}

/**
 * Log API errors in development
 */
function logApiError(apiError: ApiError): void {
  if (process.env.NODE_ENV === 'production') return;

  // Don't log auth errors (too noisy)
  if (apiError.status === 401) return;

  // Don't log rate limit errors (handled separately)
  if (apiError.status === 429) return;

  console.error('❌ API Error:', {
    message: apiError.message,
    status: apiError.status,
    code: apiError.code,
    url: apiError.config?.url,
  });
}

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

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const isSuccessDataEnvelope = (data: unknown): data is { success: true; data: unknown } =>
  isRecord(data) && data.success === true && 'data' in data;

const isRouteNotFoundPayload = (data: unknown): boolean => {
  if (!data || typeof data !== 'object') return false;
  const anyData = data as Record<string, unknown>;

  // v1 error envelope: { error: { code, message } }
  const errorObj = isRecord(anyData.error) ? anyData.error : undefined;
  const v1Message = errorObj?.message;
  const v1Code = errorObj?.code;
  if (typeof v1Message === 'string' && v1Message.toLowerCase().includes('route not found'))
    return true;
  if (typeof v1Code === 'string' && v1Code.toLowerCase().includes('route')) return true;

  // legacy shapes sometimes: { message }, { error }, { error_code }
  const message = anyData.message;
  const error = anyData.error;
  if (typeof message === 'string' && message.toLowerCase().includes('route not found')) return true;
  if (typeof error === 'string' && error.toLowerCase().includes('route not found')) return true;

  return false;
};

const defaultShouldFallbackToLegacy = (
  config: InternalAxiosRequestConfig,
  error: AxiosError
): boolean => {
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
  '/auth/me',
  '/items',
  '/brands',
  '/categories',
  '/stores',
  '/search',
  '/seo/',
  '/pages/',
  /^\/items\/[^/]+$/, // GET /items/:id
  /^\/items\/[^/]+\/similar$/, // GET /items/:id/similar
  /^\/items\/[^/]+\/stores$/, // GET /items/:id/stores
  /^\/wishlist\/public\//, // GET /wishlist/public/:shareId
  /^\/banners\/[^/]+\/impression$/, // POST /banners/:id/impression (analytics)
  /^\/banners\/[^/]+\/click$/, // POST /banners/:id/click (analytics)
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
        // Reduce logging noise in development
        if (
          process.env.NODE_ENV !== 'production' &&
          !url.includes('/items') &&
          !url.includes('/search') &&
          !url.includes('/pages') &&
          !url.includes('/auth/me')
        ) {
          console.log(`🔑 Auth token attached to ${config.method?.toUpperCase()} ${url}`);
        }
      } else if (!token && url && !isPublicEndpoint(url) && !url.includes('/auth/me')) {
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
      const config = error.config as
        | (InternalAxiosRequestConfig & {
            __wearsearchTriedLegacy?: boolean;
            __rateLimitRetryCount?: number;
          })
        | undefined;

      // Handle 429 Rate Limit with automatic retry
      if (config) {
        const rateLimitResult = await handleRateLimitError(error, config, client);
        if (rateLimitResult) return rateLimitResult;
      }

      // Automatic fallback: if v1 route is missing, retry against legacy /api
      if (config) {
        const fallbackResult = await handleLegacyFallback(error, config, fallback);
        if (fallbackResult) return fallbackResult;
      }

      const apiError = createApiError(error);

      // Handle authentication errors globally
      handleAuthError(apiError, error);

      // Log errors in development
      logApiError(apiError);

      throw apiError;
    }
  );
};

/**
 * Create axios instances with default configuration
 */
export const api: AxiosInstance = createClient(API_CONFIG.BASE_URL);
export const apiLegacy: AxiosInstance = createClient(API_CONFIG.LEGACY_BASE_URL);

// API client for banner endpoints (without /v1 suffix)
export const apiBanners: AxiosInstance = createClient('/api');

// API client for image upload endpoints
export const apiUpload: AxiosInstance = createClient('/api');

attachInterceptors(api, ENABLE_LEGACY_FALLBACK ? { fallbackClient: apiLegacy } : undefined);
attachInterceptors(apiLegacy);
attachInterceptors(apiBanners);
attachInterceptors(apiUpload);

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

// Wrapper for GET requests with retry
(api as any).getWithRetry = async <T = unknown>(url: string, config?: Record<string, unknown>) => {
  return retryWithBackoff(() => api.get<T>(url, config), { maxAttempts: 3, initialDelay: 1000 });
};

// Wrapper for POST requests with retry (only for idempotent operations)
(api as any).postWithRetry = async <T = unknown>(
  url: string,
  data?: unknown,
  config?: Record<string, unknown>
) => {
  return retryWithBackoff(() => api.post<T>(url, data, config), {
    maxAttempts: 2,
    initialDelay: 1000,
    shouldRetry: error => {
      const status = (error as AxiosError)?.response?.status;
      // Only retry on network errors or 5xx
      return !status || status >= 500;
    },
  });
};

export default api;
