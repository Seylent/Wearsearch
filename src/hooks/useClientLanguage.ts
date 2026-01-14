/**
 * Client Language Synchronization Hook
 * Ensures language preference is applied AFTER hydration to prevent mismatch
 * 
 * 🔒 This hook solves the hydration error:
 * - Server always renders with default language (UK)
 * - Client reads localStorage and switches language AFTER mount
 * - Prevents "Text content does not match server-rendered HTML" error
 */

'use client';

import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { languageService } from '@/i18n';

export const useClientLanguage = () => {
  const { i18n } = useTranslation();

  useEffect(() => {
    // 🔄 Sync language from localStorage AFTER component mounts
    const savedLanguage = languageService.getLanguage();
    
    if (i18n.language !== savedLanguage) {
      console.log(`🌍 Syncing language: ${i18n.language} -> ${savedLanguage}`);
      i18n.changeLanguage(savedLanguage);
    }
  }, []); // Run once on mount

  return { language: i18n.language };
};
