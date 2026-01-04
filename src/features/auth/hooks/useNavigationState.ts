/**
 * Navigation State Hook
 * Manages navigation UI state (mobile menu, search, etc.)
 */

import { useState, useCallback } from 'react';

export const useNavigationState = () => {
  const [showSearch, setShowSearch] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const openSearch = useCallback(() => {
    setShowSearch(true);
    setMobileMenuOpen(false); // Close mobile menu when opening search
  }, []);

  const closeSearch = useCallback(() => {
    setShowSearch(false);
  }, []);

  const toggleMobileMenu = useCallback(() => {
    setMobileMenuOpen(prev => !prev);
    setShowSearch(false); // Close search when opening mobile menu
  }, []);

  const closeMobileMenu = useCallback(() => {
    setMobileMenuOpen(false);
  }, []);

  const closeAll = useCallback(() => {
    setShowSearch(false);
    setMobileMenuOpen(false);
  }, []);

  return {
    showSearch,
    mobileMenuOpen,
    openSearch,
    closeSearch,
    toggleMobileMenu,
    closeMobileMenu,
    closeAll,
  };
};
