'use client';

import { useCallback } from 'react';
import type { MouseEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Send, Instagram, ExternalLink } from 'lucide-react';

declare global {
  interface Window {
    dataLayer: unknown[];
  }
}

type StoreInfo = {
  id: string;
  name: string;
  price?: number | null;
  telegram_url?: string | null;
  instagram_url?: string | null;
  store_url?: string | null;
  affiliate_url?: string | null;
};

interface StorePriceCardProps {
  store: StoreInfo;
  productId: string;
  productName: string;
  productBrand?: string | null;
}

const createClickId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

const withUtm = (url: string, clickId: string) => {
  try {
    const nextUrl = new URL(url);
    nextUrl.searchParams.set('utm_source', 'wearsearch');
    nextUrl.searchParams.set('utm_medium', 'affiliate');
    nextUrl.searchParams.set('ws_click_id', clickId);
    return nextUrl.toString();
  } catch {
    return url;
  }
};

const pushDataLayerEvent = (eventName: string, data: Record<string, unknown>) => {
  if (typeof window === 'undefined' || !window.dataLayer) return;
  window.dataLayer.push({ event: eventName, ...data });
};

export const StorePriceCard = ({
  store,
  productId,
  productName,
  productBrand,
}: StorePriceCardProps) => {
  const handleOutboundClick = useCallback(
    async (url: string | null | undefined, channel: string) => {
      if (!url) return url;
      const clickId = createClickId();
      const affiliateUrl = withUtm(url, clickId);

      if (typeof window !== 'undefined' && window.dataLayer) {
        window.dataLayer.push({ ecommerce: null });
      }
      pushDataLayerEvent('select_item', {
        ecommerce: {
          items: [
            {
              item_id: productId,
              item_name: productName,
              item_brand: productBrand || undefined,
              price: typeof store.price === 'number' ? store.price : undefined,
              item_category: store.name,
            },
          ],
        },
      });

      pushDataLayerEvent('outbound_click', {
        click_id: clickId,
        store_id: store.id,
        store_name: store.name,
        channel,
        destination: affiliateUrl,
      });

      try {
        await fetch('/api/affiliate-clicks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            clickId,
            productId,
            storeId: store.id,
            storeName: store.name,
            price: store.price ?? null,
            channel,
            timestamp: new Date().toISOString(),
            userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
          }),
          keepalive: true,
        });
      } catch {
        // no-op: tracking should not block navigation
      }

      return affiliateUrl;
    },
    [productId, productName, productBrand, store]
  );

  const attachHandler =
    (url: string | null | undefined, channel: string) =>
    async (event: MouseEvent<HTMLAnchorElement>) => {
      const affiliateUrl = await handleOutboundClick(url, channel);
      if (affiliateUrl && event.currentTarget) {
        event.currentTarget.href = affiliateUrl;
      }
    };

  return (
    <div className="flex gap-2">
      {store.telegram_url && (
        <a
          href={store.telegram_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1"
          onClick={attachHandler(store.telegram_url, 'telegram')}
        >
          <Button variant="outline" size="sm" className="w-full">
            <Send className="w-4 h-4 mr-1" />
            Telegram
          </Button>
        </a>
      )}
      {store.instagram_url && (
        <a
          href={store.instagram_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1"
          onClick={attachHandler(store.instagram_url, 'instagram')}
        >
          <Button variant="outline" size="sm" className="w-full">
            <Instagram className="w-4 h-4 mr-1" />
            Instagram
          </Button>
        </a>
      )}
      {(store.affiliate_url || store.store_url) && (
        <a
          href={store.affiliate_url || store.store_url || '#'}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1"
          onClick={attachHandler(store.affiliate_url || store.store_url, 'store')}
        >
          <Button variant="outline" size="sm" className="w-full">
            <ExternalLink className="w-4 h-4 mr-1" />
            Store
          </Button>
        </a>
      )}
    </div>
  );
};
