/**
 * Application Providers
 * Centralized provider configuration
 */

'use client';

import { ReactNode, Suspense } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { ApiError } from '@/services/api/errorHandler';
import { FavoritesProvider } from '@/contexts/FavoritesContext';
import { CurrencyProvider } from '@/contexts/CurrencyContext';
import { CurrencyCode } from '@/utils/currencyStorage';
import { AuthErrorBoundary } from '@/components/auth/AuthErrorBoundary';
import { ClientInitializer } from '@/components/ClientInitializer';

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
      refetchOnMount: true, // Allow refetch on mount for fresh data
      refetchOnReconnect: true, // Refetch when connection restored
      refetchInterval: false, // Disable automatic refetching
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
      staleTime: 5 * 60 * 1000, // 5 minutes - more reactive
      gcTime: 30 * 60 * 1000, // 30 minutes cache time - more reasonable
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
  initialCurrency?: CurrencyCode;
}

export const AppProviders = ({ children, initialCurrency }: AppProvidersProps) => {
  // Resource hints будуть додані через окремий компонент в layout
  
  return (
    <QueryClientProvider client={queryClient}>
      <Suspense fallback={null}>
        <CurrencyProvider initialCurrency={initialCurrency}>
          <FavoritesProvider>
            <TooltipProvider>
              <AuthErrorBoundary>
                <ClientInitializer />
                {children}
              </AuthErrorBoundary>
              <Toaster />
              <Sonner />
            </TooltipProvider>
          </FavoritesProvider>
        </CurrencyProvider>
      </Suspense>
    </QueryClientProvider>
  );
};

export { AppProviders as NextProviders };
