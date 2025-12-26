/**
 * Application Providers
 * Centralized provider configuration
 */

import { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { ApiError } from '@/services/api/errorHandler';

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
        // Retry once on other errors
        return failureCount < 1;
      },
      staleTime: 10 * 60 * 1000, // 10 minutes - data stays fresh longer
      gcTime: 30 * 60 * 1000, // 30 minutes cache time
    },
    mutations: {
      retry: false,
    },
  },
});

interface AppProvidersProps {
  children: ReactNode;
}

export const AppProviders = ({ children }: AppProvidersProps) => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      {children}
      <Toaster />
      <Sonner />
    </TooltipProvider>
  </QueryClientProvider>
);
