/**
 * Search Filter Detection Utilities
 * Detects if search query matches a color or product type
 * Supports both English and Ukrainian
 */

import { PRODUCT_CATEGORIES } from '@/constants/categories';

// Color mappings (EN/UK -> internal value)
const COLOR_MAPPINGS: Record<string, string> = {
  // English
  'black': 'Black',
  'white': 'White',
  'gray': 'Gray',
  'grey': 'Gray',
  'blue': 'Blue',
  'red': 'Red',
  'green': 'Green',
  'yellow': 'Yellow',
  'orange': 'Orange',
  'pink': 'Pink',
  'purple': 'Purple',
  'brown': 'Brown',
  'beige': 'Beige',
  'navy': 'Navy',
  'maroon': 'Maroon',
  'olive': 'Olive',
  'cream': 'Cream',
  
  // Ukrainian
  'чорний': 'Black',
  'білий': 'White',
  'сірий': 'Gray',
  'синій': 'Blue',
  'червоний': 'Red',
  'зелений': 'Green',
  'жовтий': 'Yellow',
  'помаранчевий': 'Orange',
  'рожевий': 'Pink',
  'фіолетовий': 'Purple',
  'коричневий': 'Brown',
  'бежевий': 'Beige',
  'темно-синій': 'Navy',
  'бордовий': 'Maroon',
};

// Type/Category mappings (EN/UK -> internal value)
const TYPE_MAPPINGS: Record<string, string> = {
  // English
  'jackets': 'jackets',
  'jacket': 'jackets',
  'hoodies': 'hoodies',
  'hoodie': 'hoodies',
  'tshirts': 'T-shirts',
  'tshirt': 'T-shirts',
  't-shirts': 'T-shirts',
  't-shirt': 'T-shirts',
  'pants': 'pants',
  'pant': 'pants',
  'jeans': 'jeans',
  'jean': 'jeans',
  'shorts': 'shorts',
  'short': 'shorts',
  'shoes': 'shoes',
  'shoe': 'shoes',
  'accessories': 'accessories',
  'accessory': 'accessories',
  
  // Ukrainian
  'куртки': 'jackets',
  'куртка': 'jackets',
  'худі': 'hoodies',
  'футболки': 'T-shirts',
  'футболка': 'T-shirts',
  'штани': 'pants',
  'джинси': 'jeans',
  'джинс': 'jeans',
  'шорти': 'shorts',
  'взуття': 'shoes',
  'аксесуари': 'accessories',
  'аксесуар': 'accessories',
};

export interface DetectedFilter {
  type: 'color' | 'category' | null;
  value: string | null;
}

/**
 * Detect if search query matches a color or product type
 * @param query - Search query from user
 * @returns Detected filter type and value
 */
export function detectSearchFilter(query: string): DetectedFilter {
  if (!query || query.trim().length === 0) {
    return { type: null, value: null };
  }

  const normalizedQuery = query.trim().toLowerCase();

  // Check if it's a color
  const detectedColor = COLOR_MAPPINGS[normalizedQuery];
  if (detectedColor) {
    return {
      type: 'color',
      value: detectedColor,
    };
  }

  // Check if it's a product type
  const detectedType = TYPE_MAPPINGS[normalizedQuery];
  if (detectedType) {
    return {
      type: 'category',
      value: detectedType,
    };
  }

  return { type: null, value: null };
}

/**
 * Get all available colors
 */
export function getAvailableColors(): string[] {
  return Array.from(new Set(Object.values(COLOR_MAPPINGS)));
}

/**
 * Get all available categories
 */
export function getAvailableCategories(): string[] {
  return [...PRODUCT_CATEGORIES];
}

/**
 * Check if a string is a valid color
 */
export function isColor(value: string): boolean {
  const normalized = value.trim().toLowerCase();
  return normalized in COLOR_MAPPINGS;
}

/**
 * Check if a string is a valid product type
 */
export function isProductType(value: string): boolean {
  const normalized = value.trim().toLowerCase();
  return normalized in TYPE_MAPPINGS;
}
