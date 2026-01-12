/**
 * Currency Utilities - Cookie-based Storage
 * Optimized currency management with server-side compatibility
 */

export type CurrencyCode = 'UAH' | 'USD';

// Cookie configuration
export const CURRENCY_COOKIE = {
  name: 'currency',
  maxAge: 365 * 24 * 60 * 60, // 1 year
  path: '/',
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production'
};

// Client-side cookie utilities
export const currencyStorage = {
  /**
   * Get currency from cookies (client-side)
   */
  getCurrency(): CurrencyCode {
    if (typeof window === 'undefined') return 'UAH';
    
    const value = document.cookie
      .split('; ')
      .find(row => row.startsWith(`${CURRENCY_COOKIE.name}=`))
      ?.split('=')[1];
    
    return (value === 'USD' || value === 'UAH') ? value : 'UAH';
  },

  /**
   * Set currency in cookies (client-side)
   */
  setCurrency(currency: CurrencyCode): void {
    if (typeof window === 'undefined') return;
    
    const cookieValue = `${CURRENCY_COOKIE.name}=${currency}; Max-Age=${CURRENCY_COOKIE.maxAge}; Path=${CURRENCY_COOKIE.path}; SameSite=${CURRENCY_COOKIE.sameSite}${CURRENCY_COOKIE.secure ? '; Secure' : ''}`;
    document.cookie = cookieValue;
  }
};

/**
 * Server-side currency detection (use in server components only)
 */
export async function getServerCurrency(): Promise<CurrencyCode> {
  if (typeof window !== 'undefined') {
    // Client-side fallback
    return currencyStorage.getCurrency();
  }
  
  try {
    // Dynamic import to avoid bundling in client
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    const currency = cookieStore.get(CURRENCY_COOKIE.name)?.value;
    return (currency === 'USD' || currency === 'UAH') ? currency : 'UAH';
  } catch {
    return 'UAH';
  }
}

/**
 * Utility functions for currency formatting
 */
export const getCurrencySymbol = (code: CurrencyCode): string => {
  switch (code) {
    case 'UAH':
      return '₴';
    case 'USD':
      return '$';
    default:
      return code;
  }
};

export const getCurrencyName = (code: CurrencyCode): string => {
  switch (code) {
    case 'UAH':
      return 'UAH';
    case 'USD':
      return 'USD';
    default:
      return code;
  }
};