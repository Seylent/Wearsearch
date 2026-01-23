'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useCurrency, getCurrencySymbol, getCurrencyName } from '@/contexts/CurrencyContext';
import { useTranslation } from 'react-i18next';
import { Coins } from 'lucide-react';

interface CurrencySwitchProps {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
  showExchangeRate?: boolean;
  containerClassName?: string;
  layout?: 'column' | 'row';
}

export const CurrencySwitch: React.FC<CurrencySwitchProps> = ({
  variant = 'outline',
  size = 'default',
  className = '',
  showExchangeRate = false,
  containerClassName = '',
  layout = 'column',
}) => {
  const { currency, setCurrency, exchangeRate, loading } = useCurrency();
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleCurrency = () => {
    setCurrency(currency === 'UAH' ? 'USD' : 'UAH');
  };

  const currentSymbol = getCurrencySymbol(currency);
  const currentName = getCurrencyName(currency);

  const containerLayout =
    layout === 'row' ? 'flex-row items-center gap-3' : 'flex-col items-center gap-2';

  return (
    <div className={`flex ${containerLayout} ${containerClassName}`}>
      <Button
        variant={variant}
        size={size}
        onClick={toggleCurrency}
        className={`flex items-center gap-2 ${className}`}
        disabled={loading}
      >
        <Coins className="h-4 w-4" />
        <span className="font-medium">
          {currentSymbol} {currentName}
        </span>
      </Button>

      {showExchangeRate && currency === 'USD' && exchangeRate && (
        <div className="text-xs text-muted-foreground text-center">
          1 USD = {exchangeRate.rate.toFixed(2)} UAH
          <br />
          <span className="text-xs opacity-75">
            {t('currency.updated', 'Updated')}:{' '}
            {mounted
              ? new Date(exchangeRate.updatedAt).toLocaleTimeString('uk-UA', {
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : '—'}
          </span>
        </div>
      )}
    </div>
  );
};

// Компонент для відображення інформації про конвертацію валюти
interface CurrencyInfoProps {
  currencyInfo?: {
    code: string;
    symbol: string;
    convertedFrom?: string;
    convertedAt?: string;
  };
  className?: string;
}

export const CurrencyInfo: React.FC<CurrencyInfoProps> = ({ currencyInfo, className = '' }) => {
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!currencyInfo?.convertedFrom) {
    return null;
  }

  const convertedDate =
    mounted && currencyInfo.convertedAt
      ? new Date(currencyInfo.convertedAt).toLocaleString('uk-UA', {
          hour: '2-digit',
          minute: '2-digit',
          day: '2-digit',
          month: '2-digit',
        })
      : null;

  return (
    <div className={`flex items-center gap-2 text-sm text-muted-foreground ${className}`}>
      <Coins className="h-3 w-3" />
      <span>
        {currencyInfo.code === 'USD'
          ? t('currency.pricesInDollarsNBU', 'Ціни в доларах (курс НБУ)')
          : t('currency.convertedPrices', 'Конвертовані ціни')}
        {convertedDate && <span className="ml-1 opacity-75">({convertedDate})</span>}
      </span>
    </div>
  );
};
