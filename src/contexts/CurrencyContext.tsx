'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '@/services/api';

export type CurrencyCode = 'UAH' | 'USD';

export interface CurrencyInfo {
  code: CurrencyCode;
  symbol: string;
  convertedFrom?: string;
  convertedAt?: string;
}

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
}

export const CurrencyProvider: React.FC<CurrencyProviderProps> = ({ children }) => {
  const [currency, setCurrencyState] = useState<CurrencyCode>(() => {
    if (typeof window === 'undefined') return 'UAH';
    const saved = localStorage.getItem('preferredCurrency');
    return (saved === 'USD' || saved === 'UAH') ? saved : 'UAH';
  });
  
  const [exchangeRate, setExchangeRate] = useState<ExchangeRate | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setCurrency = (newCurrency: CurrencyCode) => {
    setCurrencyState(newCurrency);
    localStorage.setItem('preferredCurrency', newCurrency);
  };

  // Отримати курс валют (опціонально)
  const fetchExchangeRate = async () => {
    if (currency === 'UAH') {
      setExchangeRate(null);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get('/currency/rates');
      
      if (response.status === 200) {
        const data = response.data;
        setExchangeRate({
          rate: data.USD_UAH || 40.50, // Updated fallback rate
          updatedAt: data.updatedAt || new Date().toISOString()
        });
      } else {
        throw new Error('Failed to fetch exchange rate');
      }
    } catch (_err) {
      console.warn('Exchange rate API not available, using fallback rate of 40.50 UAH/USD');
      setExchangeRate({
        rate: 40.50, // Updated fallback rate (January 2026)
        updatedAt: new Date().toISOString()
      });
      setError('Exchange rate service unavailable');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExchangeRate();
  }, [currency, fetchExchangeRate]);

  const value = {
    currency,
    setCurrency,
    exchangeRate,
    loading,
    error
  };

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

// Хук для додавання currency параметру до API запитів
export const useAPIWithCurrency = () => {
  const { currency } = useCurrency();
  
  const addCurrencyParam = (url: string) => {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}currency=${currency}`;
  };
  
  return { addCurrencyParam, currency };
};

// Утіліта для форматування символів валют
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

// Утіліта для отримання назви валюти
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