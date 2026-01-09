/**
 * Test Utilities
 * Helper functions and wrappers for testing
 */

import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { FavoritesProvider } from '@/contexts/FavoritesContext';
import { CurrencyProvider } from '@/contexts/CurrencyContext';

// Create a test query client with disabled retries and caching
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });

interface AllTheProvidersProps {
  children: React.ReactNode;
}

// All providers wrapper
function AllTheProviders({ children }: AllTheProvidersProps) {
  const queryClient = createTestQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <CurrencyProvider>
        <BrowserRouter>
          <FavoritesProvider>{children}</FavoritesProvider>
        </BrowserRouter>
      </CurrencyProvider>
    </QueryClientProvider>
  );
}

// Custom render with all providers
function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, { wrapper: AllTheProviders, ...options });
}

// Export everything
export * from '@testing-library/react';
export { renderWithProviders as render };
export { createTestQueryClient };
