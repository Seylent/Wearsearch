/**
 * Optimized Currency Context with Cookie Storage
 * Reduced localStorage usage, better SSR support
 */

'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import { api } from '@/services/api';
import { 
  CurrencyCode, 
  currencyStorage
} from '@/utils/currencyStorage';

export { getCurrencySymbol, getCurrencyName } from '@/utils/currencyStorage';

export interface ExchangeRate {
  rate: number;
  updatedAt: string;
}

interface CurrencyContextType {
  currency: CurrencyCode;
  setCurrency: (currency: CurrencyCode) => void;
  exchangeRate: ExchangeRate | null;
  loading: boolean;
  error: string | null;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

interface CurrencyProviderProps {
  children: ReactNode;
  initialCurrency?: CurrencyCode;
}

export const CurrencyProvider: React.FC<CurrencyProviderProps> = ({ 
  children, 
  initialCurrency 
}) => {
  const [currency, setCurrency] = useState<CurrencyCode>(
    initialCurrency || 'UAH'
  );
  const [exchangeRate, setExchangeRate] = useState<ExchangeRate | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  // Hydrate from cookies after component mount
  useEffect(() => {
    if (!initialCurrency) {
      const savedCurrency = currencyStorage.getCurrency();
      setCurrency(savedCurrency);
    }
    setIsHydrated(true);
  }, [initialCurrency]);

  const updateCurrency = useCallback((newCurrency: CurrencyCode) => {
    setCurrency(newCurrency);
    if (isHydrated) {
      currencyStorage.setCurrency(newCurrency);
    }
  }, [isHydrated]);

  // Optimized exchange rate fetching with caching
  const fetchExchangeRate = useCallback(async () => {
    if (currency === 'UAH') {
      setExchangeRate(null);
      return;
    }

    // Check if we have fresh rate (less than 30 minutes old)
    if (exchangeRate?.updatedAt) {
      const lastUpdate = new Date(exchangeRate.updatedAt);
      const now = new Date();
      const thirtyMinutes = 30 * 60 * 1000;
      
      if (now.getTime() - lastUpdate.getTime() < thirtyMinutes) {
        return; // Use cached rate
      }
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get('/currency/rates');
      
      if (response.status === 200) {
        const data = response.data;
        setExchangeRate({
          rate: data.USD_UAH || 40.5,
          updatedAt: data.updatedAt || new Date().toISOString()
        });
      } else {
        throw new Error('Failed to fetch exchange rate');
      }
    } catch (error) {
      console.warn('Exchange rate API not available, using fallback rate', error);
      setExchangeRate({
        rate: 40.5,
        updatedAt: new Date().toISOString()
      });
      setError('Exchange rate service unavailable');
    } finally {
      setLoading(false);
    }
  }, [currency, exchangeRate]);

  // Only fetch exchange rate when currency changes to USD (client-side only)
  useEffect(() => {
    // 🔒 Extra safety: ensure we're truly client-side before API calls
    if (typeof window === 'undefined') return;
    
    if (isHydrated && currency === 'USD') {
      fetchExchangeRate();
    } else if (currency === 'UAH') {
      setExchangeRate(null);
      setError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currency, isHydrated]);

  const value = useMemo(() => ({
    currency,
    setCurrency: updateCurrency,
    exchangeRate,
    loading,
    error
  }), [currency, exchangeRate, loading, error, updateCurrency]);

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};

// Hook for adding currency parameter to API requests
export const useAPIWithCurrency = () => {
  const { currency } = useCurrency();
  
  const addCurrencyParam = (url: string) => {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}currency=${currency}`;
  };
  
  return { addCurrencyParam, currency };
};