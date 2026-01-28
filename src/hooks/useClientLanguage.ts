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
    const explicitPreference =
      typeof window !== 'undefined'
        ? localStorage.getItem('wearsearch_language_explicit') === 'true'
        : false;

    if (explicitPreference && i18n.language !== savedLanguage) {
      console.log(`🌍 Syncing language: ${i18n.language} -> ${savedLanguage}`);
      i18n.changeLanguage(savedLanguage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount - i18n is stable

  return { language: i18n.language };
};
