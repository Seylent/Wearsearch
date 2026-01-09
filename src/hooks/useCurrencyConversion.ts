import { useCurrency } from '@/contexts/CurrencyContext';

/**
 * Hook для конвертації цін
 */
export const useCurrencyConversion = () => {
  const { currency, exchangeRate } = useCurrency();

  const convertPrice = (priceUAH: number): number => {
    if (currency === 'UAH' || !exchangeRate) {
      return priceUAH;
    }
    
    // Конвертація з UAH в USD
    return priceUAH / exchangeRate.rate;
  };

  const formatPrice = (priceUAH: number): string => {
    const convertedPrice = convertPrice(priceUAH);
    const symbol = currency === 'USD' ? '$' : '₴';
    
    if (currency === 'USD') {
      return `${symbol}${convertedPrice.toFixed(2)}`;
    } else {
      return `${convertedPrice.toFixed(0)} ${symbol}`;
    }
  };

  const formatPriceRange = (minPriceUAH: number, maxPriceUAH: number): string => {
    const minConverted = convertPrice(minPriceUAH);
    const maxConverted = convertPrice(maxPriceUAH);
    const symbol = currency === 'USD' ? '$' : '₴';
    
    if (currency === 'USD') {
      return `${symbol}${minConverted.toFixed(2)} - ${symbol}${maxConverted.toFixed(2)}`;
    } else {
      return `${minConverted.toFixed(0)} ${symbol} - ${maxConverted.toFixed(0)} ${symbol}`;
    }
  };

  // Конвертація з поточної валюти назад в UAH (для API запитів)
  const convertToUAH = (price: number): number => {
    if (currency === 'UAH' || !exchangeRate) {
      return price;
    }
    
    // Конвертація з USD в UAH
    return price * exchangeRate.rate;
  };

  const getCurrencySymbol = (): string => {
    return currency === 'USD' ? '$' : '₴';
  };

  const getCurrencyDecimals = (): number => {
    return currency === 'USD' ? 2 : 0;
  };

  return {
    currency,
    exchangeRate,
    convertPrice,
    formatPrice,
    formatPriceRange,
    convertToUAH,
    getCurrencySymbol,
    getCurrencyDecimals
  };
};