/**
 * Translation Hook
 * For handling product description translations with backend API
 */

'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export interface TranslatedDescription {
  en?: string;
  ua?: string;
  original?: string;
}

export const useProductTranslation = () => {
  const { i18n } = useTranslation();
  const [isTranslating, setIsTranslating] = useState(false);

  /**
   * Get localized description based on current language
   */
  const getLocalizedDescription = (product: {
    description?: string;
    description_en?: string;
    description_ua?: string;
  }): string => {
    const currentLang = i18n.language;
    
    if (currentLang === 'uk' || currentLang === 'ua') {
      // Prefer Ukrainian translation, fallback chain
      return product.description_ua 
        || product.description_en 
        || product.description 
        || '';
    } else {
      // Prefer English, fallback chain
      return product.description_en 
        || product.description 
        || product.description_ua 
        || '';
    }
  };

  /**
   * Translate description using backend API
   */
  const translateDescription = async (
    text: string,
    fromLang: string = 'en',
    toLang: string = 'uk'
  ): Promise<string> => {
    if (!text.trim()) return '';

    setIsTranslating(true);
    
    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text.trim(),
          from: fromLang,
          to: toLang,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      if (data?.success && typeof data.translated === 'string') {
        return data.translated;
      }

      // Graceful fallback
      return text;
    } catch (error) {
      console.error('Translation error:', error);
      // Return original text on error (graceful degradation)
      return text;
    } finally {
      setIsTranslating(false);
    }
  };

  return {
    getLocalizedDescription,
    translateDescription,
    isTranslating,
  };
};
