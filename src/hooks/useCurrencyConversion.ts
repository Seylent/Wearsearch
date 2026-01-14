import { useCurrency } from '@/contexts/CurrencyContext';

/**
 * Hook для конвертації та форматування цін
 * Конвертує UAH → USD якщо потрібно, використовуючи курс з CurrencyContext
 */
export const useCurrencyConversion = () => {
  const { currency, exchangeRate } = useCurrency();

  /**
   * Конвертує та форматує ціну
   * @param priceInUAH - Ціна в гривнях (базова валюта)
   * @returns Відформатована ціна в поточній валюті
   */
  const formatPrice = (priceInUAH: number): string => {
    let displayPrice = priceInUAH;
    
    // Конвертуємо UAH → USD якщо потрібно
    if (currency === 'USD' && exchangeRate) {
      displayPrice = priceInUAH / exchangeRate.rate;
    }
    
    const symbol = currency === 'USD' ? '$' : '₴';
    
    if (currency === 'USD') {
      return `${symbol}${displayPrice.toFixed(2)}`;
    } else {
      return `${displayPrice.toFixed(0)} ${symbol}`;
    }
  };

  /**
   * Конвертує та форматує діапазон цін
   */
  const formatPriceRange = (minPriceInUAH: number, maxPriceInUAH: number): string => {
    let minDisplay = minPriceInUAH;
    let maxDisplay = maxPriceInUAH;
    
    // Конвертуємо UAH → USD якщо потрібно
    if (currency === 'USD' && exchangeRate) {
      minDisplay = minPriceInUAH / exchangeRate.rate;
      maxDisplay = maxPriceInUAH / exchangeRate.rate;
    }
    
    const symbol = currency === 'USD' ? '$' : '₴';
    
    if (currency === 'USD') {
      return `${symbol}${minDisplay.toFixed(2)} - ${symbol}${maxDisplay.toFixed(2)}`;
    } else {
      return `${minDisplay.toFixed(0)} ${symbol} - ${maxDisplay.toFixed(0)} ${symbol}`;
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
    exchangeRate: exchangeRate?.rate,
    formatPrice,
    formatPriceRange,
    getCurrencySymbol,
    getCurrencyDecimals
  };
};