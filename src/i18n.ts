import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslations from './locales/en.json';
import ukTranslations from './locales/uk.json';

/**
 * Supported languages configuration
 */
export const SUPPORTED_LANGUAGES = {
  EN: 'en',
  UK: 'uk'
} as const;

export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[keyof typeof SUPPORTED_LANGUAGES];

export const LANGUAGE_CONFIG = {
  DEFAULT: SUPPORTED_LANGUAGES.UK,
  STORAGE_KEY: 'wearsearch_language',
  SUPPORTED: [SUPPORTED_LANGUAGES.UK, SUPPORTED_LANGUAGES.EN]
} as const;

/**
 * Centralized language persistence utilities
 */
export const languageService = {
  /**
   * Get current language from localStorage with validation
   */
  getLanguage(): SupportedLanguage {
    try {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(LANGUAGE_CONFIG.STORAGE_KEY);
        if (stored && LANGUAGE_CONFIG.SUPPORTED.includes(stored as SupportedLanguage)) {
          return stored as SupportedLanguage;
        }
      }
    } catch (error) {
      console.warn('Failed to read language from localStorage:', error);
    }
    return LANGUAGE_CONFIG.DEFAULT;
  },

  /**
   * Save language preference to localStorage
   */
  setLanguage(language: SupportedLanguage): void {
    try {
      if (!LANGUAGE_CONFIG.SUPPORTED.includes(language)) {
        console.warn(`Invalid language: ${language}. Using default.`);
        language = LANGUAGE_CONFIG.DEFAULT;
      }
      localStorage.setItem(LANGUAGE_CONFIG.STORAGE_KEY, language);
    } catch (error) {
      console.error('Failed to save language to localStorage:', error);
    }
  },

  /**
   * Detect language from URL path (DISABLED - not using URL-based i18n)
   * Example: /en/products -> 'en', /uk/about -> 'uk'
   */
  detectLanguageFromURL(): SupportedLanguage | null {
    // Disabled - we use localStorage only for language preference
    return null;
  },

  /**
   * Get initial language (localStorage > default)
   */
  getInitialLanguage(): SupportedLanguage {
    // URL detection disabled - use stored preference only
    return this.getLanguage();
  }
};

const resources = {
  en: {
    translation: enTranslations
  },
  uk: {
    translation: ukTranslations
  }
};

// 🔒 ALWAYS use default language on initial load to prevent hydration mismatch
// Client-side language switch will happen after mount via useEffect
const initialLanguage = LANGUAGE_CONFIG.DEFAULT;

if (!i18n.isInitialized) {
  i18n
    .use(initReactI18next)
    .init({
      resources,
      lng: initialLanguage,
      fallbackLng: LANGUAGE_CONFIG.DEFAULT,
      
      interpolation: {
        escapeValue: false
      },

      // Missing key handling for better debugging
      saveMissing: true,
      missingKeyHandler: (lngs, ns, key, fallbackValue) => {
        // Only log in development and use debug level to reduce noise
        if (process.env.NODE_ENV !== 'production') {
          console.debug(`[i18n] Missing key: "${key}" (${lngs.join(', ')}) -> "${fallbackValue}"`);
        }
      },

      // Return key if translation is missing (instead of empty string)
      returnNull: false,
      returnEmptyString: false,
      
      // Prevent hydration issues
      react: {
        useSuspense: false
      }
    });

  // Centralized language change handler
  i18n.on('languageChanged', (lng) => {
    languageService.setLanguage(lng as SupportedLanguage);
    
    // Update HTML lang attribute for accessibility and SEO
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lng;
    }
    
    // Log language change in development
    if (process.env.NODE_ENV !== 'production') {
      console.log(`Language changed to: ${lng}`);
    }
  });
}

// Set initial HTML lang attribute - client-side only
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  document.documentElement.lang = initialLanguage;
}

export { default } from 'i18next';
