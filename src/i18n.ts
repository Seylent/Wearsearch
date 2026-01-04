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
  DEFAULT: SUPPORTED_LANGUAGES.EN,
  STORAGE_KEY: 'wearsearch_language',
  SUPPORTED: [SUPPORTED_LANGUAGES.EN, SUPPORTED_LANGUAGES.UK]
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
      const stored = localStorage.getItem(LANGUAGE_CONFIG.STORAGE_KEY);
      if (stored && LANGUAGE_CONFIG.SUPPORTED.includes(stored as SupportedLanguage)) {
        return stored as SupportedLanguage;
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
   * Detect language from URL path (for future SEO implementation)
   * Example: /en/products -> 'en', /uk/about -> 'uk'
   */
  detectLanguageFromURL(): SupportedLanguage | null {
    try {
      const pathParts = window.location.pathname.split('/').filter(Boolean);
      const firstPart = pathParts[0];
      
      if (firstPart && LANGUAGE_CONFIG.SUPPORTED.includes(firstPart as SupportedLanguage)) {
        return firstPart as SupportedLanguage;
      }
    } catch (error) {
      console.warn('Failed to detect language from URL:', error);
    }
    return null;
  },

  /**
   * Get initial language (URL > localStorage > default)
   */
  getInitialLanguage(): SupportedLanguage {
    // Priority 1: URL path (for SEO-friendly URLs in future)
    const urlLang = this.detectLanguageFromURL();
    if (urlLang) {
      return urlLang;
    }

    // Priority 2: Stored preference
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

// Initialize with centralized language detection
const initialLanguage = languageService.getInitialLanguage();

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
      if (import.meta.env.DEV) {
        console.debug(`[i18n] Missing key: "${key}" (${lngs.join(', ')}) -> "${fallbackValue}"`);
      }
    },

    // Return key if translation is missing (instead of empty string)
    returnNull: false,
    returnEmptyString: false,
  });

// Centralized language change handler
i18n.on('languageChanged', (lng) => {
  languageService.setLanguage(lng as SupportedLanguage);
  
  // Update HTML lang attribute for accessibility and SEO
  document.documentElement.lang = lng;
  
  // Log language change in development
  if (import.meta.env.DEV) {
    console.log(`Language changed to: ${lng}`);
  }
});

// Set initial HTML lang attribute
document.documentElement.lang = initialLanguage;

export default i18n;
