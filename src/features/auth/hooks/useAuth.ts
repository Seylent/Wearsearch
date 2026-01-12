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

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null;

const getErrorStatus = (error: unknown): number | undefined => {
  if (!isRecord(error)) return undefined;
  const direct = error.status;
  if (typeof direct === 'number') return direct;
  const response = error.response;
  if (!isRecord(response)) return undefined;
  const status = response.status;
  return typeof status === 'number' ? status : undefined;
};

const asError = (error: unknown): Error => (error instanceof Error ? error : new Error(String(error)));

export const useAuth = () => {
  const queryClient = useQueryClient();

  // Use React Query for caching and preventing duplicate requests
  const { data: user, isLoading, error: _error } = useQuery<User | null, unknown>({
    queryKey: AUTH_QUERY_KEY,
    queryFn: async () => {
      try {
        // Only fetch user if authenticated
        if (!authService.isAuthenticated()) {
          console.log('ℹ️ Skipping getCurrentUser - not authenticated');
          return null;
        }
        
        console.log('🔍 Fetching current user data...');
        return await authService.getCurrentUser();
      } catch (error) {
        // If 401 or 429, return null instead of throwing
        const status = getErrorStatus(error);
        if (status === 401 || status === 429) {
          console.log('⚠️ Auth check failed with status:', status);
          return null;
        }
        logAuthError(asError(error), 'CHECK_AUTH');
        return null;
      }
    },
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Cache for 10 minutes
    retry: (failureCount, error) => {
      // Don't retry on 401 (unauthorized) or 429 (rate limit)
      const status = getErrorStatus(error);
      if (status === 401 || status === 429) {
        return false;
      }
      // Retry other errors up to 2 times
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    // Only enable query if user might be authenticated (check on client-side only)
    enabled: typeof window !== 'undefined' && authService.isAuthenticated(),
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
      logAuthError(asError(error), 'LOGOUT');
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
