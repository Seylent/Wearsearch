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
import { logInfo } from '@/services/logger';

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

      logInfo('Logout event received', {
        component: 'useAuthEvents',
        action: 'LOGOUT_EVENT',
        metadata: {
          reason,
          currentPath: globalThis.window.location.pathname,
        },
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
      if (!globalThis.window.location.pathname.includes('/auth')) {
        logInfo('Redirecting to /auth page', {
          component: 'useAuthEvents',
          action: 'REDIRECT_AUTH',
        });
        router.replace('/auth');
      } else {
        logInfo('Already on /auth page, skipping redirect', {
          component: 'useAuthEvents',
          action: 'SKIP_REDIRECT',
        });
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
    globalThis.window.addEventListener('auth:logout', handleLogout);
    globalThis.window.addEventListener('auth:tokenRefreshed', handleTokenRefresh);

    // Cleanup
    return () => {
      globalThis.window.removeEventListener('auth:logout', handleLogout);
      globalThis.window.removeEventListener('auth:tokenRefreshed', handleTokenRefresh);
    };
  }, [router, queryClient, toast, t]);
};

/**
 * Dispatch logout event
 */
export const dispatchLogout = (reason?: AuthLogoutEventDetail['reason']) => {
  globalThis.window.dispatchEvent(
    new CustomEvent('auth:logout', {
      detail: { reason: reason || 'manual' },
    })
  );
};

/**
 * Dispatch token refresh event
 */
export const dispatchTokenRefresh = () => {
  globalThis.window.dispatchEvent(new CustomEvent('auth:tokenRefreshed'));
};
