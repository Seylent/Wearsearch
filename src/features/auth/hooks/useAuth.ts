/**
 * Authentication Hook
 * Centralized auth state management with React Query caching
 */

import { useCallback, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { authService } from '@/services/authService';
import { clearAuth } from '@/utils/authStorage';
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

const asError = (error: unknown): Error => {
  if (error instanceof Error) return error;
  if (typeof error === 'string') return new Error(error);
  if (error && typeof error === 'object') return new Error(JSON.stringify(error));
  return new Error(error instanceof Error ? error.message : JSON.stringify(error));
};

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
        if (status === 401) {
          console.log('⚠️ Auth token invalid or expired, clearing session');
          // Clear any stale auth tokens on 401
          clearAuth();
          return null;
        }
        if (status === 429) {
          console.log('⏳ Auth check rate limited, will retry later');
          return null;
        }
        logAuthError(asError(error), 'CHECK_AUTH');
        return null;
      }
    },
    staleTime: 15 * 60 * 1000, // Consider data fresh for 15 minutes (збільшено)
    gcTime: 45 * 60 * 1000, // Cache for 45 minutes (збільшено)
    refetchOnWindowFocus: false, // Don't refetch when window gains focus
    refetchOnMount: false, // Don't refetch on component mount if data exists
    retry: (failureCount, error) => {
      // Don't retry on 401 (unauthorized) or 429 (rate limit)
      const status = getErrorStatus(error);
      if (status === 401 || status === 429) {
        return false;
      }
      // Retry other errors up to 1 time only (зменшено з 2)
      return failureCount < 1;
    },
    retryDelay: (attemptIndex) => Math.min(2000 * 2 ** attemptIndex, 60000), // Збільшено затримку
    // Only enable query if user might be authenticated (check on client-side only)
    enabled: globalThis.window !== undefined && authService.isAuthenticated(),
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
      globalThis.window.dispatchEvent(new Event('auth:logout'));
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

    globalThis.window.addEventListener('auth:login', handleAuthLogin);
    globalThis.window.addEventListener('auth:logout', handleAuthLogout);

    return () => {
      globalThis.window.removeEventListener('auth:login', handleAuthLogin);
      globalThis.window.removeEventListener('auth:logout', handleAuthLogout);
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
