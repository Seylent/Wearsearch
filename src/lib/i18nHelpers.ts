/**
 * i18n Helper Functions
 * Utilities for language detection and URL management
 */

import { SUPPORTED_LANGUAGES, LANGUAGE_CONFIG, type SupportedLanguage } from '@/i18n';

/**
 * Detect language from URL pathname
 */
export function detectLanguageFromPath(pathname: string): SupportedLanguage {
  const segments = pathname.split('/').filter(Boolean);
  const firstSegment = segments[0];
  
  if (firstSegment && LANGUAGE_CONFIG.SUPPORTED.includes(firstSegment as SupportedLanguage)) {
    return firstSegment as SupportedLanguage;
  }
  
  return LANGUAGE_CONFIG.DEFAULT;
}

/**
 * Get pathname without language prefix
 */
export function getPathnameWithoutLocale(pathname: string): string {
  const segments = pathname.split('/').filter(Boolean);
  const firstSegment = segments[0];
  
  if (firstSegment && LANGUAGE_CONFIG.SUPPORTED.includes(firstSegment as SupportedLanguage)) {
    return '/' + segments.slice(1).join('/');
  }
  
  return pathname;
}

/**
 * Add language prefix to pathname
 */
export function addLocaleToPathname(pathname: string, locale: SupportedLanguage): string {
  const cleanPath = getPathnameWithoutLocale(pathname);
  return `/${locale}${cleanPath === '/' ? '' : cleanPath}`;
}

/**
 * Switch language in current URL
 */
export function switchLanguageInPath(currentPath: string, newLocale: SupportedLanguage): string {
  const pathWithoutLocale = getPathnameWithoutLocale(currentPath);
  return addLocaleToPathname(pathWithoutLocale, newLocale);
}
