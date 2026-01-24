'use client';

import { useEffect, useState } from 'react';
import { isAuthenticated } from '@/utils/authStorage';

export const useIsAuthenticated = (): boolean => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const updateAuthState = () => {
      setIsLoggedIn(isAuthenticated());
    };

    updateAuthState();

    if (globalThis.window === undefined) return;

    globalThis.window.addEventListener('authChange', updateAuthState);
    globalThis.window.addEventListener('auth:login', updateAuthState);
    globalThis.window.addEventListener('auth:logout', updateAuthState);
    globalThis.window.addEventListener('storage', updateAuthState);

    return () => {
      globalThis.window.removeEventListener('authChange', updateAuthState);
      globalThis.window.removeEventListener('auth:login', updateAuthState);
      globalThis.window.removeEventListener('auth:logout', updateAuthState);
      globalThis.window.removeEventListener('storage', updateAuthState);
    };
  }, []);

  return isLoggedIn;
};
