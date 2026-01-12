'use client';

import { useState, useTransition } from 'react';

type Currency = 'USD' | 'UAH' | 'EUR';

interface CurrencySwitcherProps {
  currentCurrency: Currency;
}

export function CurrencySwitcher({ currentCurrency }: Readonly<CurrencySwitcherProps>) {
  const [currency, setCurrency] = useState<Currency>(currentCurrency);
  const [isPending, startTransition] = useTransition();

  const handleCurrencyChange = (newCurrency: Currency) => {
    setCurrency(newCurrency);
    
    startTransition(async () => {
      // Set cookie via API route
      await fetch('/api/currency', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currency: newCurrency }),
      });
      
      // Refresh to apply new currency
      globalThis.window.location.reload();
    });
  };

  const currencies: { value: Currency; label: string; symbol: string }[] = [
    { value: 'USD', label: 'USD', symbol: '$' },
    { value: 'EUR', label: 'EUR', symbol: '€' },
    { value: 'UAH', label: 'UAH', symbol: '₴' },
  ];

  return (
    <div className="flex items-center gap-2">
      {currencies.map((c) => (
        <button
          key={c.value}
          onClick={() => handleCurrencyChange(c.value)}
          disabled={isPending || currency === c.value}
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            currency === c.value
              ? 'bg-white/20 text-white'
              : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
          } ${isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {c.symbol} {c.label}
        </button>
      ))}
    </div>
  );
}
