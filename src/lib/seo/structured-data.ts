import React, { type ReactElement } from 'react';

const DEFAULT_SITE_NAME = 'Wearsearch';

type JsonLdProps = {
  data: Record<string, unknown> | Array<Record<string, unknown>>;
  nonce?: string;
};

export const JsonLd = ({ data, nonce }: JsonLdProps): ReactElement =>
  React.createElement('script', {
    type: 'application/ld+json',
    dangerouslySetInnerHTML: { __html: JSON.stringify(data) },
    nonce,
  });

export const generateProductStructuredData = (product: {
  id: string;
  name: string;
  description?: string;
  image_url: string;
  price?: number;
  currency?: string;
  brand?: string;
  category?: string;
}) => ({
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: product.name,
  description: product.description || `${product.name} - Available at Wearsearch`,
  image: product.image_url,
  brand: product.brand
    ? {
        '@type': 'Brand',
        name: product.brand,
      }
    : undefined,
  category: product.category,
  offers: product.price
    ? {
        '@type': 'Offer',
        price: product.price,
        priceCurrency: product.currency || 'UAH',
        availability: 'https://schema.org/InStock',
      }
    : undefined,
});

export const generateBreadcrumbStructuredData = (items: Array<{ name: string; url: string }>) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: item.url,
  })),
});

export const generateBreadcrumbSchema = (items: Array<{ name: string; url: string }>) =>
  generateBreadcrumbStructuredData(items);

export const generateItemListSchema = (
  items: Array<{ name: string; url: string }>,
  options?: { name?: string; description?: string }
) => ({
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  ...(options?.name ? { name: options.name } : {}),
  ...(options?.description ? { description: options.description } : {}),
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: item.url,
  })),
});

export const generateOrganizationStructuredData = () => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: DEFAULT_SITE_NAME,
  url: 'https://wearsearch.com',
  logo: 'https://wearsearch.com/logo.png',
  sameAs: ['https://twitter.com/wearsearch', 'https://instagram.com/wearsearch'],
});

export const generateStoreStructuredData = (store: {
  name: string;
  description?: string;
  logo_url?: string;
  url?: string;
  website_url?: string;
  contact_email?: string;
  contact_phone?: string;
  country?: string;
  sameAs?: string[];
}) => {
  const sameAs = store.sameAs?.filter(Boolean);
  const url = store.website_url || store.url;

  return {
    '@context': 'https://schema.org',
    '@type': 'Store',
    name: store.name,
    description: store.description,
    url,
    logo: store.logo_url,
    sameAs: sameAs && sameAs.length > 0 ? sameAs : undefined,
    email: store.contact_email,
    telephone: store.contact_phone,
    address: store.country
      ? {
          '@type': 'PostalAddress',
          addressCountry: store.country,
        }
      : undefined,
  };
};
