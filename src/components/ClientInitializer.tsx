/**
 * Client-Side Initialization Component
 * Handles client-only initialization to prevent hydration mismatches
 *
 * 🔒 This component:
 * - Syncs language from localStorage AFTER mount
 * - Prevents "Text content does not match server-rendered HTML" error
 * - Ensures server renders default language, client switches after hydration
 */

'use client';

import { useEffect } from 'react';
import { useClientLanguage } from '@/hooks/useClientLanguage';
import { useCurrency } from '@/contexts/CurrencyContext';
import { currencyStorage, hasCurrencyCookie } from '@/utils/currencyStorage';

export const ClientInitializer = () => {
  // Sync language from localStorage after mount
  const { language } = useClientLanguage();
  const { setCurrency } = useCurrency();

  useEffect(() => {
    if (hasCurrencyCookie()) return;
    const nextCurrency = language.startsWith('en') ? 'USD' : 'UAH';
    currencyStorage.setCurrency(nextCurrency);
    setCurrency(nextCurrency);
  }, [language, setCurrency]);

  // This component renders nothing - it only runs side effects
  return null;
};
