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

import { useClientLanguage } from '@/hooks/useClientLanguage';

export const ClientInitializer = () => {
  // Sync language from localStorage after mount
  useClientLanguage();

  // This component renders nothing - it only runs side effects
  return null;
};
