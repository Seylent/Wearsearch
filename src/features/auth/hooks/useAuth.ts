/**
 * Authentication Hook
 * Centralized auth state management with React Query caching
 */

import { useCallback, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { authService } from '@/services/authService';
import { logAuthError } from '@/services/logger';
import type { User } from '@/types';

// Cache key for auth queries
const AUTH_QUERY_KEY = ['auth', 'current-user'];

export const useAuth = () => {
  const queryClient = useQueryClient();

  // Use React Query for caching and preventing duplicate requests
  const { data: user, isLoading, error } = useQuery({
    queryKey: AUTH_QUERY_KEY,
    queryFn: async () => {
      try {
        return await authService.getCurrentUser();
      } catch (error) {
        // If 401 or 429, return null instead of throwing
        if ((error as any)?.status === 401 || (error as any)?.status === 429) {
          return null;
        }
        logAuthError(error as Error, 'CHECK_AUTH');
        return null;
      }
    },
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Cache for 10 minutes
    retry: (failureCount, error) => {
      // Don't retry on 401 (unauthorized) or 429 (rate limit)
      if ((error as any)?.status === 401 || (error as any)?.status === 429) {
        return false;
      }
      // Retry other errors up to 2 times
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const isAdmin = user?.role === 'admin';

  // Manual refresh function
  const checkAuth = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEY });
  }, [queryClient]);

  // Logout handler
  const logout = useCallback(async () => {
    try {
      await authService.logout();
      // Clear the cached user data
      queryClient.setQueryData(AUTH_QUERY_KEY, null);
      window.dispatchEvent(new Event('auth:logout'));
    } catch (error) {
      logAuthError(error as Error, 'LOGOUT');
    }
  }, [queryClient]);

  // Listen for auth events (login/logout) to refetch
  useEffect(() => {
    const handleAuthLogin = () => {
      checkAuth();
    };

    const handleAuthLogout = () => {
      queryClient.setQueryData(AUTH_QUERY_KEY, null);
    };

    window.addEventListener('auth:login', handleAuthLogin);
    window.addEventListener('auth:logout', handleAuthLogout);

    return () => {
      window.removeEventListener('auth:login', handleAuthLogin);
      window.removeEventListener('auth:logout', handleAuthLogout);
    };
  }, [checkAuth, queryClient]);

  return {
    user: user || null,
    isAdmin,
    isLoading,
    isAuthenticated: !!user,
    checkAuth,
    logout,
  };
};
