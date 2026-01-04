/**
 * Application Router
 * Centralized routing configuration with lazy loading and page transitions
 */

import { lazy, Suspense, ReactNode } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { useAuthEvents } from '@/hooks/useAuthEvents';

const AnimatedRoutes = lazy(() => import('@/app/AnimatedRoutes').then((m) => ({ default: m.AnimatedRoutes })));

// Loading fallback component with smooth animation
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="text-center animate-in fade-in-0 duration-300">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
      <p className="text-sm text-muted-foreground">Loading...</p>
    </div>
  </div>
);

/**
 * Auth Events Manager Component
 * Handles global authentication events inside the router context
 */
const AuthEventsManager = ({ children }: { children: ReactNode }) => {
  useAuthEvents();
  return <>{children}</>;
};

export const AppRouter = () => (
  <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
    <AuthEventsManager>
      <Suspense fallback={<PageLoader />}>
        <AnimatedRoutes />
      </Suspense>
    </AuthEventsManager>
  </BrowserRouter>
);
