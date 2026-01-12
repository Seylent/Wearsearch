'use client';

/**
 * Authentication Events Hook
 * Handles global authentication events (logout, session expiration, etc.)
 */

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from './use-toast';
import { useTranslation } from 'react-i18next';

interface AuthLogoutEventDetail {
  reason?: 'unauthorized' | 'forbidden' | 'manual' | 'expired';
}

export const useAuthEvents = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { t } = useTranslation();
  
  useEffect(() => {
    /**
     * Handle logout event
     */
    const handleLogout = (event: Event) => {
      const customEvent = event as CustomEvent<AuthLogoutEventDetail>;
      const reason = customEvent.detail?.reason || 'manual';
      
      console.log('🔴 Logout event received:', { 
        reason, 
        currentPath: window.location.pathname 
      });
      
      // Clear all cached data
      queryClient.clear();
      
      // Show appropriate message
      if (reason === 'unauthorized' || reason === 'expired') {
        toast({
          title: t('auth.sessionExpired') || 'Session Expired',
          description: t('auth.pleaseLoginAgain') || 'Please log in again to continue.',
          variant: 'default',
        });
      }
      
      // Navigate to auth page if not already there
      if (!window.location.pathname.includes('/auth')) {
        console.log('🔀 Redirecting to /auth page');
        router.replace('/auth');
      } else {
        console.log('ℹ️ Already on /auth page, skipping redirect');
      }
    };
    
    /**
     * Handle token refresh event
     */
    const handleTokenRefresh = () => {
      // Refetch active queries after token refresh
      queryClient.refetchQueries({
        type: 'active',
        stale: true,
      });
    };
    
    // Register event listeners
    window.addEventListener('auth:logout', handleLogout);
    window.addEventListener('auth:tokenRefreshed', handleTokenRefresh);
    
    // Cleanup
    return () => {
      window.removeEventListener('auth:logout', handleLogout);
      window.removeEventListener('auth:tokenRefreshed', handleTokenRefresh);
    };
  }, [navigate, queryClient, toast, t]);
};

/**
 * Dispatch logout event
 */
export const dispatchLogout = (reason?: AuthLogoutEventDetail['reason']) => {
  window.dispatchEvent(new CustomEvent('auth:logout', {
    detail: { reason: reason || 'manual' }
  }));
};

/**
 * Dispatch token refresh event
 */
export const dispatchTokenRefresh = () => {
  window.dispatchEvent(new CustomEvent('auth:tokenRefreshed'));
};
