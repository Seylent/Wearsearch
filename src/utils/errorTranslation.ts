/**
 * Translation utilities for error codes, success messages, and data fields
 * Centralizes translation logic for backend response codes
 */

import i18n from '@/i18n';

/**
 * Translate error code to localized message
 * Falls back to displaying the error code itself if translation not found
 */
export function translateErrorCode(errorCode: string | undefined | null): string {
  if (!errorCode) {
    return i18n.t('errorCodes.UNKNOWN_ERROR');
  }

  const key = `errorCodes.${errorCode}`;
  const translated = i18n.t(key);

  // If translation is the same as the key, it means it wasn't found
  if (translated === key) {
    // Log missing error code in development
    if (import.meta.env.DEV) {
      console.warn(`Missing error code translation: ${errorCode}`);
    }
    
    // Return formatted error code as fallback
    return `Error: ${errorCode.replace(/_/g, ' ')}`;
  }

  return translated;
}

/**
 * Translate success code to localized message
 * Falls back to generic success message if translation not found
 */
export function translateSuccessCode(successCode: string | undefined | null): string {
  if (!successCode) {
    return i18n.t('common.success');
  }

  const key = `successCodes.${successCode}`;
  const translated = i18n.t(key);

  // If translation is the same as the key, it means it wasn't found
  if (translated === key) {
    // Log missing success code in development
    if (import.meta.env.DEV) {
      console.warn(`Missing success code translation: ${successCode}`);
    }
    
    // Return generic success message as fallback
    return i18n.t('common.success');
  }

  return translated;
}

/**
 * Translate product type (enum value)
 * Backend returns: "Shoes", "Outerwear", "Tops", "Bottoms", "Dresses", "Accessories"
 */
export function translateProductType(type: string | undefined | null): string {
  if (!type) {
    return '';
  }

  const key = `productTypes.${type}`;
  const translated = i18n.t(key);

  // If translation not found, return original type
  if (translated === key) {
    if (import.meta.env.DEV) {
      console.warn(`Missing product type translation: ${type}`);
    }
    return type;
  }

  return translated;
}

/**
 * Translate gender (enum value)
 * Backend returns: "Male", "Female", "Unisex", or lowercase variants: "men", "women", "unisex"
 */
export function translateGender(gender: string | undefined | null): string {
  if (!gender) {
    return '';
  }

  const key = `gender.${gender}`;
  const translated = i18n.t(key);

  // If translation not found, return original gender
  if (translated === key) {
    if (import.meta.env.DEV) {
      console.warn(`Missing gender translation: ${gender}`);
    }
    return gender;
  }

  return translated;
}

/**
 * Extract error code from API error response
 * Handles different error response formats
 */
export function extractErrorCode(error: any): string | null {
  // Priority 1: error_code field (new backend format)
  if (error?.response?.data?.error_code) {
    return error.response.data.error_code;
  }

  // Priority 2: code field (alternative format)
  if (error?.response?.data?.code) {
    return error.response.data.code;
  }

  // Priority 3: HTTP status code mapping
  const status = error?.response?.status;
  if (status) {
    switch (status) {
      case 401:
        return 'AUTH_UNAUTHORIZED';
      case 403:
        return 'FORBIDDEN';
      case 404:
        return 'NOT_FOUND';
      case 400:
        return 'BAD_REQUEST';
      case 500:
        return 'SERVER_ERROR';
      default:
        return 'UNKNOWN_ERROR';
    }
  }

  // Priority 4: Network error
  if (error?.message === 'Network Error' || !error?.response) {
    return 'NETWORK_ERROR';
  }

  return null;
}

/**
 * Get user-friendly error message from API error
 * Prefers error_code translation, falls back to error message
 */
export function getErrorMessage(error: any): string {
  // Try to get error code first
  const errorCode = extractErrorCode(error);
  if (errorCode) {
    return translateErrorCode(errorCode);
  }

  // Fallback to error message field (for backward compatibility)
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }

  if (error?.response?.data?.error) {
    return error.response.data.error;
  }

  if (error?.message) {
    return error.message;
  }

  return translateErrorCode('UNKNOWN_ERROR');
}

/**
 * Get user-friendly success message from API response
 * Prefers success_code translation, falls back to message field
 */
export function getSuccessMessage(response: any): string {
  // Try to get success code first
  const successCode = response?.data?.success_code || response?.success_code;
  if (successCode) {
    return translateSuccessCode(successCode);
  }

  // Fallback to message field (for backward compatibility)
  if (response?.data?.message) {
    return response.data.message;
  }

  if (response?.message) {
    return response.message;
  }

  return translateSuccessCode('SUCCESS');
}

/**
 * Type guard to check if error has error_code
 */
export function hasErrorCode(error: any): error is { response: { data: { error_code: string } } } {
  return error?.response?.data?.error_code !== undefined;
}

/**
 * Type guard to check if response has success_code
 */
export function hasSuccessCode(response: any): response is { data: { success_code: string } } {
  return response?.data?.success_code !== undefined || response?.success_code !== undefined;
}

export default {
  translateErrorCode,
  translateSuccessCode,
  translateProductType,
  translateGender,
  extractErrorCode,
  getErrorMessage,
  getSuccessMessage,
  hasErrorCode,
  hasSuccessCode,
};
