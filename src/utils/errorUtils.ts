/**
 * Error Utility Functions
 * Type-safe error handling helpers
 */

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

/**
 * Type guard to check if error is an Error instance
 */
export function isError(error: unknown): error is Error {
  return error instanceof Error;
}

/**
 * Type guard to check if error has a message property
 */
export function hasMessage(error: unknown): error is { message: string } {
  return (
    isRecord(error) &&
    typeof error.message === 'string'
  );
}

/**
 * Type guard for axios-style canceled errors
 */
export function isCanceledError(error: unknown): error is { name: string; code: string } {
  return (
    isRecord(error) &&
    ((typeof error.name === 'string' && error.name === 'CanceledError') ||
      (typeof error.code === 'string' && error.code === 'ERR_CANCELED'))
  );
}

/**
 * Safely extract error message from unknown error
 */
export function getErrorMessage(error: unknown, fallback: string = 'An error occurred'): string {
  if (isError(error)) {
    return error.message;
  }
  if (hasMessage(error)) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return fallback;
}

/**
 * Type guard for auth errors
 */
export function isAuthError(error: unknown): boolean {
  if (!hasMessage(error)) return false;
  const msg = error.message.toLowerCase();
  return msg.includes('unauthorized') || 
         msg.includes('authentication') || 
         msg.includes('token') ||
         msg.includes('login');
}

/**
 * Type guard for rate limit errors (429)
 */
export function isRateLimitError(error: unknown): boolean {
  return isRecord(error) && 
    ((error.status === 429) || 
     (isRecord(error.response) && error.response.status === 429) ||
     (hasMessage(error) && error.message.toLowerCase().includes('rate limit')));
}

/**
 * Type guard for server errors (500+)
 */
export function isServerError(error: unknown): boolean {
  const status = getErrorStatus(error);
  return status !== undefined && status >= 500;
}

/**
 * Get error status code
 */
export function getErrorStatus(error: unknown): number | undefined {
  if (isRecord(error)) {
    if (typeof error.status === 'number') return error.status;
    if (isRecord(error.response) && typeof error.response.status === 'number') {
      return error.response.status;
    }
  }
  return undefined;
}

/**
 * Get user-friendly error message for different error types
 */
export function getLocalizedErrorMessage(error: unknown, t?: (key: string, fallback?: string) => string): string {
  const translate = t || ((key: string, fallback?: string) => fallback || key);
  
  if (isRateLimitError(error)) {
    return translate('errors.rateLimited', 'Too many requests. Please try again in a few minutes.');
  }
  
  if (isServerError(error)) {
    return translate('errors.serverError', 'Server is temporarily unavailable. Please try again later.');
  }
  
  if (isAuthError(error)) {
    return translate('errors.authRequired', 'Please log in to continue.');
  }
  
  if (isCanceledError(error)) {
    return translate('errors.requestCanceled', 'Request was canceled.');
  }
  
  // Network error
  if (hasMessage(error) && error.message.toLowerCase().includes('network')) {
    return translate('errors.networkError', 'Network connection error. Please check your internet connection.');
  }
  
  return getErrorMessage(error, translate('errors.unknown', 'Something went wrong. Please try again.'));
}
