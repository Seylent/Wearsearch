/**
 * Authentication Hook
 * Centralized auth state management with React Query caching
 */

import { useCallback, useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { authService } from '@/services/authService';
import { clearAuth, getAuth } from '@/utils/authStorage';
import { logAuthError } from '@/services/logger';
import type { User } from '@/types';

// Cache key for auth queries
const AUTH_QUERY_KEY = ['auth', 'current-user'];

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

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
  const [isMounted, setIsMounted] = useState(false);

  // 🔒 Wait for client-side mount to prevent SSR mismatches
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Check if we have a token client-side
  const hasToken = isMounted ? !!getAuth() : false;

  // Use React Query for caching and preventing duplicate requests
  const {
    data: user,
    isLoading,
    error: _error,
  } = useQuery<User | null, unknown>({
    queryKey: AUTH_QUERY_KEY,
    queryFn: async () => {
      try {
        const token = getAuth();
        console.log('🔍 Fetching current user data...', {
          hasToken: !!token,
          tokenPreview: token ? `${token.substring(0, 20)}...` : 'none',
        });
        return await authService.getCurrentUser();
      } catch (error) {
        // If 401 or 429, return null instead of throwing
        const status = getErrorStatus(error);
        if (status === 401) {
          console.log('⚠️ Auth token invalid or expired, clearing session');
          // Clear any stale auth tokens on 401
          clearAuth();
          // Also clear React Query cache
          queryClient.setQueryData(AUTH_QUERY_KEY, null);
          return null;
        }
        if (status === 429) {
          console.log('⏳ Auth check rate limited, will retry later');
          return null;
        }
        console.error('❌ Auth check failed:', error);
        logAuthError(asError(error), 'CHECK_AUTH');
        return null;
      }
    },
    // 🚀 CRITICAL: Only enable when mounted AND token exists
    enabled: isMounted && hasToken,
    staleTime: 5 * 60 * 1000, // 5 хвилин - зменшено для більш свіжих даних
    gcTime: 10 * 60 * 1000, // 10 хвилин кешу
    refetchOnWindowFocus: false, // 🙅‍♂️ Не refetch при focus
    refetchOnMount: true, // ✅ Refetch при mount для свіжих даних після логіну
    refetchOnReconnect: false, // 🙅‍♂️ Не refetch при reconnect
    retry: (failureCount, error) => {
      // Don't retry on 401 (unauthorized) or 429 (rate limit)
      const status = getErrorStatus(error);
      if (status === 401 || status === 429) {
        return false;
      }
      // Retry other errors up to 1 time only
      return failureCount < 1;
    },
    retryDelay: attemptIndex => Math.min(2000 * 2 ** attemptIndex, 60000),
  });

  const isAdmin = user?.role === 'admin';
  const canAccessAdminPanel = user?.role === 'admin' || user?.role === 'store_owner';

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
    const handleAuthLogin = async () => {
      console.log('🔄 Auth login event received, refetching user...');
      // Force immediate refetch instead of just invalidating
      await queryClient.refetchQueries({
        queryKey: AUTH_QUERY_KEY,
        type: 'active',
      });
    };

    const handleAuthLogout = () => {
      console.log('🚪 Auth logout event received, clearing user data');
      queryClient.setQueryData(AUTH_QUERY_KEY, null);
    };

    if (globalThis.window !== undefined) {
      globalThis.window.addEventListener('auth:login', handleAuthLogin);
      globalThis.window.addEventListener('auth:logout', handleAuthLogout);

      return () => {
        globalThis.window.removeEventListener('auth:login', handleAuthLogin);
        globalThis.window.removeEventListener('auth:logout', handleAuthLogout);
      };
    }
  }, [queryClient]);

  return {
    user: user || null,
    isAdmin,
    canAccessAdminPanel,
    isLoading,
    isAuthenticated: !!user,
    checkAuth,
    logout,
  };
};
