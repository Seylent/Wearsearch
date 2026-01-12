/**
 * Application Providers
 * Centralized provider configuration
 */

'use client';

import { ReactNode, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { ApiError } from '@/services/api/errorHandler';
import { FavoritesProvider } from '@/contexts/FavoritesContext';
import { CurrencyProvider } from '@/contexts/CurrencyContext';

/**
 * Rate limit error check
 */
const isRateLimitError = (error: unknown): boolean => {
  if (error instanceof ApiError) {
    return error.status === 429;
  }
  if (error && typeof error === 'object' && 'status' in error) {
    return (error as { status: number }).status === 429;
  }
  return false;
};

// Create QueryClient instance with optimized configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnMount: false, // Don't refetch on component mount
      refetchOnReconnect: false, // Don't refetch on reconnect
      retry: (failureCount, error: unknown) => {
        // Don't retry on auth or not found errors
        if (error instanceof ApiError) {
          if (error.isAuthError() || error.isNotFound()) {
            return false;
          }
        }
        // Rate limit errors are handled in API layer with retry
        // Don't retry again at React Query level
        if (isRateLimitError(error)) {
          return false;
        }
        // Retry once on other errors
        return failureCount < 1;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 10 * 60 * 1000, // 10 minutes - data stays fresh longer
      gcTime: 30 * 60 * 1000, // 30 minutes cache time
      // Reduce network waterfall by enabling structural sharing
      structuralSharing: true,
    },
    mutations: {
      retry: false,
    },
  },
});

interface AppProvidersProps {
  children: ReactNode;
}

export const AppProviders = ({ children }: AppProvidersProps) => {
  // Resource hints будуть додані через окремий компонент в layout
  
  return (
    <QueryClientProvider client={queryClient}>
      <CurrencyProvider>
        <FavoritesProvider>
          <TooltipProvider>
            {children}
            <Toaster />
            <Sonner />
          </TooltipProvider>
        </FavoritesProvider>
      </CurrencyProvider>
    </QueryClientProvider>
  );
};

export { AppProviders as NextProviders };
