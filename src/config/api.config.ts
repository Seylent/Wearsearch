/**
 * API Configuration
 * Central place for API URLs with environment variable support
 */

// Environment variable helpers
export const getApiUrl = (): string => {
  return process.env.NEXT_PUBLIC_API_URL || process.env.BACKEND_URL || 'http://localhost:3000';
};

export const getApiBaseUrl = (): string => {
  return process.env.NEXT_PUBLIC_API_BASE_URL || '/api/v1';
};

export const getSiteUrl = (): string => {
  return process.env.NEXT_PUBLIC_SITE_URL || 'https://wearsearch.com';
};

// URL helpers
const deriveLegacyBaseUrl = (baseUrl: string): string => {
  const normalized = String(baseUrl || '')
    .trim()
    .replace(/\/+$/, '');
  if (!normalized) return '/api';

  // Most common: '/api/v1' or 'https://host/api/v1' -> remove trailing '/v1'
  if (normalized.endsWith('/api/v1')) return normalized.slice(0, -3);
  if (normalized.endsWith('/v1')) return normalized.slice(0, -3);

  return normalized;
};

const resolveBaseUrl = (): string => {
  const envBase = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL;
  if (envBase) {
    const trimmed = envBase.trim();
    if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
      const port = window.location?.port;
      if (trimmed.startsWith('/') && port && port !== '3000') {
        return `http://localhost:3000${trimmed}`;
      }
    }
    return trimmed;
  }

  if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
    const port = window.location?.port;
    if (port && port !== '3000') {
      return 'http://localhost:3000/api/v1';
    }
  }

  return '/api/v1';
};

const resolvedBaseUrl = resolveBaseUrl();

export const API_CONFIG = {
  // Main API URLs
  BASE_URL: resolvedBaseUrl,
  LEGACY_BASE_URL: deriveLegacyBaseUrl(resolvedBaseUrl),
  API_URL: getApiUrl(),
  SITE_URL: getSiteUrl(),

  // Request configuration
  TIMEOUT: 15000,
  WITH_CREDENTIALS: true,

  // Cache durations (in seconds)
  CACHE: {
    PRODUCT: 3600, // 1 hour
    PRODUCTS: 300, // 5 minutes
    FEATURED: 1800, // 30 minutes
    STORE: 3600, // 1 hour
    STORES: 600, // 10 minutes
    CATEGORY: 3600, // 1 hour
    BRAND: 3600, // 1 hour
    HOMEPAGE: 900, // 15 minutes
    SEO: 1800, // 30 minutes
  },
} as const;

// Validation - warn if not configured in production
if (!process.env.NEXT_PUBLIC_API_BASE_URL && process.env.NODE_ENV === 'production') {
  console.warn('⚠️ NEXT_PUBLIC_API_BASE_URL is not configured. Using default /api/v1.');
}

// Legacy exports for backward compatibility (deprecated)
/** @deprecated Use API_CONFIG.BASE_URL instead */
export const API_BASE_URL = API_CONFIG.BASE_URL;
/** @deprecated Use API_CONFIG.API_URL instead */
export const API_URL = API_CONFIG.API_URL;
