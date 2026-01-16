import { useCurrency } from '@/contexts/CurrencyContext';

/**
 * Hook для форматування цін
 * 
 * ⚠️ ВАЖЛИВО: Конвертацію робить BACKEND!
 * - Frontend додає параметр ?currency=USD до API запитів
 * - Backend повертає вже сконвертовані ціни
 * - Цей hook тільки форматує отримані ціни з правильним символом валюти
 * 
 * @see docs/FRONTEND_CURRENCY_GUIDE.md
 */
export const useCurrencyConversion = () => {
  const { currency } = useCurrency();

  /**
   * Форматує ціну з правильним символом валюти
   * @param price - Ціна (вже сконвертована backend'ом якщо currency=USD)
   * @returns Відформатована ціна з символом валюти
   */
  const formatPrice = (price: number): string => {
    const symbol = currency === 'USD' ? '$' : '₴';
    
    if (currency === 'USD') {
      return `${symbol}${price.toFixed(2)}`;
    } else {
      return `${price.toFixed(0)} ${symbol}`;
    }
  };

  /**
   * Форматує діапазон цін
   * @param minPrice - Мінімальна ціна (вже сконвертована)
   * @param maxPrice - Максимальна ціна (вже сконвертована)
   */
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