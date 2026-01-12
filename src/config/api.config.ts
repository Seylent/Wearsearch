/**
 * API Configuration
 * Central place for API URLs with environment variable support
 */

const deriveLegacyBaseUrl = (baseUrl: string): string => {
  const normalized = String(baseUrl || '').trim().replace(/\/+$/, '');
  if (!normalized) return '/api';

  // Most common: '/api/v1' or 'https://host/api/v1' -> remove trailing '/v1'
  if (normalized.endsWith('/api/v1')) return normalized.slice(0, -3);
  if (normalized.endsWith('/v1')) return normalized.slice(0, -3);

  return normalized;
};

export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || '/api/v1',
  LEGACY_BASE_URL: deriveLegacyBaseUrl(process.env.NEXT_PUBLIC_API_BASE_URL || '/api/v1'),
  TIMEOUT: 15000,
  WITH_CREDENTIALS: true,
} as const;

// Validation - warn if not configured in production
if (!process.env.NEXT_PUBLIC_API_BASE_URL && process.env.NODE_ENV === 'production') {
  console.warn('⚠️ NEXT_PUBLIC_API_BASE_URL is not configured. Using default /api/v1.');
}

// Legacy exports for backward compatibility (deprecated)
/** @deprecated Use API_CONFIG.BASE_URL instead */
export const API_BASE_URL = API_CONFIG.BASE_URL;
/** @deprecated Use API_CONFIG.BASE_URL instead */
export const API_URL = API_CONFIG.BASE_URL;
