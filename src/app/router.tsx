/**
 * Application Router
 * Centralized routing configuration with lazy loading
 */

import { lazy, Suspense, ReactNode } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useAuthEvents } from '@/hooks/useAuthEvents';

// Lazy load all route components for better code splitting
const Index = lazy(() => import('@/pages/Index'));
const Products = lazy(() => import('@/pages/Products'));
const Stores = lazy(() => import('@/pages/Stores'));
const ProductDetail = lazy(() => import('@/pages/ProductDetail'));
const About = lazy(() => import('@/pages/About'));
const Auth = lazy(() => import('@/pages/Auth'));
const Admin = lazy(() => import('@/pages/Admin'));
const AdminBrands = lazy(() => import('@/pages/AdminBrands'));
const Favorites = lazy(() => import('@/pages/Favorites'));
const Profile = lazy(() => import('@/pages/Profile'));
const NotFound = lazy(() => import('@/pages/NotFound'));

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
      <p className="text-muted-foreground">Loading...</p>
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
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/products" element={<Products />} />
          <Route path="/stores" element={<Stores />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/about" element={<About />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/brands" element={<AdminBrands />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </AuthEventsManager>
  </BrowserRouter>
);
