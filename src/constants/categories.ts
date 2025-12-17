/**
 * Product Categories
 * Standard categories for all products in the system
 */

export const PRODUCT_CATEGORIES = [
  'jackets',
  'hoodies',
  'T-shirts',
  'pants',
  'jeans',
  'shorts',
  'shoes',
  'accessories'
] as const;

export type ProductCategory = typeof PRODUCT_CATEGORIES[number];

/**
 * Get display name for category (capitalize first letter)
 */
export function getCategoryDisplayName(category: string): string {
  return category.charAt(0).toUpperCase() + category.slice(1);
}
