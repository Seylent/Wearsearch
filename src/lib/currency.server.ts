import { cookies } from 'next/headers';

export type Currency = 'USD' | 'UAH' | 'EUR';

const CURRENCY_COOKIE_NAME = 'preferred_currency';
const DEFAULT_CURRENCY: Currency = 'USD';

/**
 * Get currency from server-side cookies
 * Use this in Server Components
 */
export async function getCurrency(): Promise<Currency> {
  const cookieStore = cookies();
  const currency = cookieStore.get(CURRENCY_COOKIE_NAME)?.value;
  
  if (currency === 'USD' || currency === 'UAH' || currency === 'EUR') {
    return currency;
  }
  
  return DEFAULT_CURRENCY;
}

/**
 * Currency conversion rates
 * In production, fetch from API or database
 */
const CONVERSION_RATES: Record<Currency, number> = {
  USD: 1,
  UAH: 41.5,
  EUR: 0.92,
};

/**
 * Convert price to target currency
 */
export function convertPrice(
  price: number,
  from: Currency,
  to: Currency
): number {
  if (from === to) return price;
  
  // Convert to USD first, then to target currency
  const inUSD = price / CONVERSION_RATES[from];
  return inUSD * CONVERSION_RATES[to];
}

/**
 * Format price with currency symbol
 */
export function formatPrice(price: number, currency: Currency): string {
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(price);

  const symbols: Record<Currency, string> = {
    USD: '$',
    UAH: '₴',
    EUR: '€',
  };

  return `${symbols[currency]}${formatted}`;
}
