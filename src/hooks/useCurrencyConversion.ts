import { useCurrency } from '@/contexts/CurrencyContext';

/**
 * Hook для форматування цін (БЕЗ конвертації)
 * Бекенд відправляє ціни в потрібній валюті через параметр ?currency=UAH/USD
 */
export const useCurrencyConversion = () => {
  const { currency } = useCurrency();

  // Просто форматує ціну з символом валюти
  const formatPrice = (price: number): string => {
    const symbol = currency === 'USD' ? '$' : '₴';
    
    if (currency === 'USD') {
      return `${symbol}${price.toFixed(2)}`;
    } else {
      return `${price.toFixed(0)} ${symbol}`;
    }
  };

  const formatPriceRange = (minPrice: number, maxPrice: number): string => {
    const symbol = currency === 'USD' ? '$' : '₴';
    
    if (currency === 'USD') {
      return `${symbol}${minPrice.toFixed(2)} - ${symbol}${maxPrice.toFixed(2)}`;
    } else {
      return `${minPrice.toFixed(0)} ${symbol} - ${maxPrice.toFixed(0)} ${symbol}`;
    }
  };

  const getCurrencySymbol = (): string => {
    return currency === 'USD' ? '$' : '₴';
  };

  const getCurrencyDecimals = (): number => {
    return currency === 'USD' ? 2 : 0;
  };

  return {
    currency,
    formatPrice,
    formatPriceRange,
    getCurrencySymbol,
    getCurrencyDecimals
  };
};