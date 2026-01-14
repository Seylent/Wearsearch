/**
 * Client-Only Mounting Hook
 * Ensures component content only renders on client-side after hydration
 * 
 * 🔒 This hook prevents hydration mismatches for:
 * - Date/time formatting (toLocaleDateString, toLocaleString)
 * - Browser-specific APIs (navigator, localStorage)
 * - Random values (Math.random, Date.now for IDs)
 * 
 * @example
 * const isMounted = useClientOnly();
 * 
 * return (
 *   <div>
 *     {isMounted ? new Date().toLocaleString() : 'Loading...'}
 *   </div>
 * );
 */

'use client';

import { useEffect, useState } from 'react';

export const useClientOnly = (): boolean => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return isMounted;
};
