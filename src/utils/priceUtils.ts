/**
 * Price Utilities
 * Utilities for handling price conversion and formatting
 */

/**
 * Normalize price from various API formats
 * Handles cases where API returns prices in cents, wrong units, or inconsistent formats
 */
export const normalizePrice = (price: string | number | undefined): number => {
  if (!price) return 0;
  
  // Convert to number if string
  let numPrice: number;
  if (typeof price === 'string') {
    // Remove any currency symbols and parse
    const cleanPrice = price.replace(/[^\d.,]/g, '');
    numPrice = Number.parseFloat(cleanPrice.replace(',', '.'));
  } else {
    numPrice = price;
  }
  
  // If not a valid number, return 0
  if (!Number.isFinite(numPrice)) return 0;
  
  // If price is negative, return 0
  if (numPrice < 0) return 0;
  
  // Most clothing prices should be between $5-$500 USD
  // If the price is in this reasonable range, treat it as USD and convert to UAH
  if (numPrice >= 5 && numPrice <= 1000) {
    // This looks like a reasonable USD price - convert to UAH
    return numPrice * 40.5; // Use current exchange rate
  }
  
  // If price is very small (under $5), might need adjustment
  if (numPrice < 5 && numPrice > 0) {
    // Very low price, might be in wrong format
    return numPrice * 400; // Conservative multiplier
  }
  
  // If price is already in UAH range (1000-50000), keep as is
  if (numPrice >= 1000 && numPrice <= 50000) {
    return numPrice;
  }
  
  // If price is extremely high (over 50000), might be in kopecks
  if (numPrice > 50000) {
    return numPrice / 100;
  }
  
  // Default: return as is
  return numPrice;
};

/**
 * Format price range for display
 */
export const formatPriceRange = (
  minPrice: number, 
  maxPrice: number, 
  currency: string = 'UAH'
): string => {
  const symbol = currency === 'USD' ? '$' : '₴';
  const decimals = currency === 'USD' ? 2 : 0;
  
  if (minPrice === maxPrice) {
    return `${symbol}${minPrice.toFixed(decimals)}`;
  }
  
  return `${symbol}${minPrice.toFixed(decimals)} - ${symbol}${maxPrice.toFixed(decimals)}`;
};

/**
 * Parse price from string with multiple possible formats
 */
export const parsePrice = (priceString: string | number): number => {
  if (typeof priceString === 'number') return priceString;
  if (!priceString) return 0;
  
  // Handle formats like "1,234.56", "$123", "₴1234", "123 UAH", etc.
  let cleaned = priceString.toString()
    .replace(/[$₴]/g, '') // Remove currency symbols
    .replace(/[A-Za-z]/g, '') // Remove letters like UAH, USD
    .replace(/\s/g, '') // Remove spaces
    .trim();
  
  // Handle comma as decimal separator
  if (cleaned.includes(',') && cleaned.includes('.')) {
    // Format like "1,234.56" - remove comma
    cleaned = cleaned.replace(',', '');
  } else if (cleaned.includes(',') && !cleaned.includes('.')) {
    // Format like "123,45" - replace comma with dot
    cleaned = cleaned.replace(',', '.');
  }
  
  const parsed = parseFloat(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
};

/**
 * Detect if price might be in wrong currency/units
 */
export const isPriceSuspicious = (price: number): boolean => {
  // Prices under 10 UAH for clothing are suspicious
  if (price < 10) return true;
  
  // Prices over 500,000 UAH are suspicious
  if (price > 500000) return true;
  
  return false;
};

/**
 * Auto-correct suspicious prices with heuristics
 */
export const autoCorrectPrice = (price: number, expectedRange?: { min: number; max: number }): number => {
  if (!isPriceSuspicious(price)) return price;
  
  // If we have expected range, try to fit the price
  if (expectedRange) {
    // If price is too low, might be in dollars
    if (price < expectedRange.min && price > 0) {
      const corrected = price * 40; // USD to UAH approximate
      if (corrected >= expectedRange.min && corrected <= expectedRange.max) {
        return corrected;
      }
    }
    
    // If price is too high, might be in kopecks
    if (price > expectedRange.max) {
      const corrected = price / 100;
      if (corrected >= expectedRange.min && corrected <= expectedRange.max) {
        return corrected;
      }
    }
  }
  
  // Default corrections
  if (price < 10 && price > 0) {
    return price * 40; // Assume USD to UAH
  }
  
  if (price > 100000) {
    return price / 100; // Assume kopecks to UAH
  }
  
  return price;
};