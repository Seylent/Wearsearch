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
