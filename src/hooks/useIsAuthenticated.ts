'use client';

import { useAuth } from '@/features/auth/hooks/useAuth';

export const useIsAuthenticated = (): boolean => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated;
};
