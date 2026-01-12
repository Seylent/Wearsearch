/**
 * Auth Error Boundary Component
 * Handles authentication errors gracefully and prevents cascades
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';

interface AuthErrorBoundaryProps {
  children: React.ReactNode;
}

export const AuthErrorBoundary = ({ children }: AuthErrorBoundaryProps) => {
  const router = useRouter();
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleAuthLogout = (event: CustomEvent) => {
      const { reason } = event.detail || {};
      
      // Clear all queries to prevent stale data
      queryClient.clear();
      
      // Only redirect if the reason is 'unauthorized' and we're not already on auth page
      if (reason === 'unauthorized' && !globalThis.window.location.pathname.includes('/auth')) {
        // Don't redirect immediately to prevent loops, just clear state
        console.log('🔄 Auth session ended, clearing cache');
      }
    };

    // Listen for auth logout events
    globalThis.window.addEventListener('auth:logout', handleAuthLogout as EventListener);

    return () => {
      globalThis.window.removeEventListener('auth:logout', handleAuthLogout as EventListener);
    };
  }, [router, queryClient]);

  return <>{children}</>;
};

export default AuthErrorBoundary;