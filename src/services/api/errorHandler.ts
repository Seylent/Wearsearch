/**
 * Centralized API Error Handling
 * Provides type-safe error handling for all API operations
 */

import axios, { AxiosError } from 'axios';
import type { ApiResponse } from '@/types';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const getString = (value: unknown, key: string): string | undefined => {
  if (!isRecord(value)) return undefined;
  const nested = value[key];
  return typeof nested === 'string' ? nested : undefined;
};

const getRecord = (value: unknown, key: string): Record<string, unknown> | undefined => {
  if (!isRecord(value)) return undefined;
  const nested = value[key];
  return isRecord(nested) ? nested : undefined;
};

/**
 * Custom API Error class with enhanced type safety
 */
export class ApiError extends Error {
  public config?: import('axios').AxiosRequestConfig;
  constructor(
    message: string,
    public status?: number,
    public code?: string,
    public errorCode?: string
  ) {
    super(message);
    this.name = 'ApiError';

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }

  /**
   * Check if error is an authentication error (401 or 403)
   */
  isAuthError(): boolean {
    return this.status === 401 || this.status === 403;
  }

  /**
   * Check if error is a not found error (404)
   */
  isNotFound(): boolean {
    return this.status === 404;
  }

  /**
   * Check if error is a server error (5xx)
   */
  isServerError(): boolean {
    return this.status !== undefined && this.status >= 500;
  }

  /**
   * Check if error is a client error (4xx)
   */
  isClientError(): boolean {
    return this.status !== undefined && this.status >= 400 && this.status < 500;
  }

  /**
   * Check if error is a network error (no response)
   */
  isNetworkError(): boolean {
    return this.status === undefined && this.code === 'ERR_NETWORK';
  }

  /**
   * Get user-friendly error message
   */
  getUserMessage(): string {
    if (this.isNetworkError()) {
      return 'Network error. Please check your internet connection.';
    }

    if (this.isServerError()) {
      return 'Server error. Please try again later.';
    }

    return this.message || 'An unexpected error occurred';
  }
}

/**
 * Handle API errors and convert them to ApiError instances
 */
export const handleApiError = (error: unknown): ApiError => {
  // Handle Axios errors
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiResponse>;
    const status = axiosError.response?.status;
    const responseData = axiosError.response?.data;

    // v1 error envelope support: { error: { code, message, details?, i18n_key? } }
    const v1Error = getRecord(responseData, 'error');

    // Extract error_code (for i18n)
    const errorCode =
      getString(v1Error, 'i18n_key') ??
      getString(v1Error, 'code') ??
      getString(responseData, 'error_code') ??
      getString(responseData, 'code');

    // Extract error message
    const message =
      getString(v1Error, 'message') ??
      getString(responseData, 'message') ??
      getString(responseData, 'error') ??
      axiosError.message ??
      'An unexpected error occurred';

    return new ApiError(message, status, axiosError.code, errorCode);
  }

  // Handle standard Error objects
  if (error instanceof Error) {
    return new ApiError(error.message);
  }

  // Handle unknown errors
  return new ApiError('An unexpected error occurred');
};

/**
 * Type guard to check if error is an ApiError
 */
export const isApiError = (error: unknown): error is ApiError => {
  return error instanceof ApiError;
};

/**
 * Extract error message from any error type
 */
export const getErrorMessage = (error: unknown): string => {
  if (isApiError(error)) {
    return error.getUserMessage();
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  return 'An unexpected error occurred';
};
