/**
 * Error Toast Hook
 * Provides consistent error handling and display using toast notifications
 */

import { useToast } from './use-toast';
import { useTranslation } from 'react-i18next';
import { ApiError, isApiError, getErrorMessage } from '@/services/api/errorHandler';
import { getErrorMessage as translateError } from '@/utils/errorTranslation';

export const useErrorToast = () => {
  const { toast } = useToast();
  const { t } = useTranslation();
  
  /**
   * Show error toast with proper translation and formatting
   */
  const showError = (error: unknown, customTitle?: string) => {
    let title = customTitle || t('common.error');
    let description: string;
    
    if (isApiError(error)) {
      // Use user-friendly message
      description = error.getUserMessage();
      
      // Try to translate if error_code is available
      if (error.errorCode) {
        description = translateError(error);
      }
      
      // Customize title based on error type
      if (error.isAuthError()) {
        title = t('errors.authError') || 'Authentication Error';
      } else if (error.isServerError()) {
        title = t('errors.serverError') || 'Server Error';
      } else if (error.isNetworkError()) {
        title = t('errors.networkError') || 'Network Error';
      }
    } else if (error instanceof Error) {
      description = error.message;
    } else if (typeof error === 'string') {
      description = error;
    } else {
      description = t('errors.unexpected') || 'An unexpected error occurred';
    }
    
    toast({
      variant: 'destructive',
      title,
      description,
    });
  };
  
  /**
   * Show success toast
   */
  const showSuccess = (message: string, title?: string) => {
    toast({
      title: title || t('common.success'),
      description: message,
    });
  };
  
  /**
   * Show info toast
   */
  const showInfo = (message: string, title?: string) => {
    toast({
      title: title || t('common.info'),
      description: message,
    });
  };
  
  /**
   * Show warning toast
   */
  const showWarning = (message: string, title?: string) => {
    toast({
      title: title || t('common.warning'),
      description: message,
      variant: 'default',
    });
  };
  
  return {
    showError,
    showSuccess,
    showInfo,
    showWarning,
  };
};
