'use client';

import Script from 'next/script';
import { useEffect, useMemo, useState } from 'react';
import { useCurrency } from '@/contexts/CurrencyContext';

declare global {
  interface Window {
    dataLayer: unknown[];
  }
}

const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;

const getNonce = () => {
  if (typeof document === 'undefined') return undefined;
  return document.querySelector('meta[name="csp-nonce"]')?.getAttribute('content') || undefined;
};

export const Analytics = () => {
  const { currency } = useCurrency();
  const [isAllowed, setIsAllowed] = useState(false);

  useEffect(() => {
    const updateConsent = () => {
      if (typeof window === 'undefined') return;
      setIsAllowed(window.localStorage.getItem('cookiesAccepted') === 'true');
    };

    updateConsent();
    window.addEventListener('storage', updateConsent);
    window.addEventListener('wearsearch:cookies-accepted', updateConsent as EventListener);

    return () => {
      window.removeEventListener('storage', updateConsent);
      window.removeEventListener('wearsearch:cookies-accepted', updateConsent as EventListener);
    };
  }, []);

  useEffect(() => {
    if (!isAllowed || typeof window === 'undefined') return;
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: 'currency_update', currency: currency || 'UAH' });
  }, [currency, isAllowed]);

  const nonce = useMemo(() => (isAllowed ? getNonce() : undefined), [isAllowed]);

  if (!GTM_ID || !isAllowed) return null;

  return (
    <>
      <Script
        id="gtm-init"
        nonce={nonce}
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html:
            "window.dataLayer=window.dataLayer||[];window.dataLayer.push({'gtm.start':new Date().getTime(),event:'gtm.js'});",
        }}
      />
      <Script
        id="gtm"
        nonce={nonce}
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtm.js?id=${GTM_ID}`}
      />
    </>
  );
};

const normalizeItem = (product: {
  id?: string | number | null;
  name?: string | null;
  brand?: string | null;
  price?: number | null;
  quantity?: number | null;
}) => ({
  item_id: product.id ? String(product.id) : undefined,
  item_name: product.name ?? undefined,
  item_brand: product.brand ?? undefined,
  price: typeof product.price === 'number' ? product.price : undefined,
  quantity: typeof product.quantity === 'number' ? product.quantity : 1,
});

export const useEcommerce = () => {
  const { currency } = useCurrency();

  const pushEvent = (eventName: string, data: Record<string, unknown>) => {
    if (typeof window === 'undefined' || !window.dataLayer) return;

    window.dataLayer.push({ ecommerce: null });
    window.dataLayer.push({
      event: eventName,
      ecommerce: {
        currency: currency || 'UAH',
        ...data,
      },
    });
  };

  return {
    viewItem: (product: {
      id?: string | number | null;
      name?: string | null;
      brand?: string | null;
      price?: number | null;
      quantity?: number | null;
    }) =>
      pushEvent('view_item', {
        value: typeof product.price === 'number' ? product.price : undefined,
        items: [normalizeItem(product)],
      }),
  };
};
