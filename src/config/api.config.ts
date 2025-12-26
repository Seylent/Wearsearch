/**
 * API Configuration
 * Central place for API URLs with environment variable support
 */

export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || '/api',
  TIMEOUT: 15000,
  WITH_CREDENTIALS: true,
} as const;

// Validation - warn if not configured in production
if (!import.meta.env.VITE_API_BASE_URL && import.meta.env.PROD) {
  console.error('⚠️ VITE_API_BASE_URL is not configured! API calls may fail in production.');
}

// Legacy exports for backward compatibility (deprecated)
/** @deprecated Use API_CONFIG.BASE_URL instead */
export const API_BASE_URL = API_CONFIG.BASE_URL;
/** @deprecated Use API_CONFIG.BASE_URL instead */
export const API_URL = API_CONFIG.BASE_URL;
