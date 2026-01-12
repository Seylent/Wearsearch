/**
 * Translation utilities for category names and other common terms
 * Now uses i18next for proper internationalization
 */

import i18n from '@/i18n';

export const getCategoryTranslation = (category: string): string => {
  if (!category) return '';
  
  // Convert to lowercase to match translation keys
  const key = `productTypes.${category.toLowerCase()}`;
  const translated = i18n.t(key);
  
  // If translation not found, try with original case
  if (translated === key) {
    const fallbackKey = `productTypes.${category}`;
    const fallbackTranslated = i18n.t(fallbackKey);
    
    if (fallbackTranslated === fallbackKey) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn(`Missing product type translation: ${category}`);
      }
      return category;
    }
    return fallbackTranslated;
  }
  
  return translated;
};

export const getColorTranslation = (color: string): string => {
  if (!color) return '';
  
  // Convert to lowercase to match translation keys
  const key = `colors.${color.toLowerCase()}`;
  const translated = i18n.t(key);
  
  // If translation not found, return original color
  if (translated === key) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`Missing color translation: ${color}`);
    }
    return color;
  }
  
  return translated;
};

export const getGenderTranslation = (gender: string): string => {
  if (!gender) return '';
  
  // Convert to lowercase to match translation keys
  const key = `gender.${gender.toLowerCase()}`;
  const translated = i18n.t(key);
  
  // If translation not found, try with original case
  if (translated === key) {
    const fallbackKey = `gender.${gender}`;
    const fallbackTranslated = i18n.t(fallbackKey);
    
    if (fallbackTranslated === fallbackKey) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn(`Missing gender translation: ${gender}`);
      }
      return gender;
    }
    return fallbackTranslated;
  }
  
  return translated;
};
