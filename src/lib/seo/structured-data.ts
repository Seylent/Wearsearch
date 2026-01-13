/**
 * Структуровані дані (JSON-LD) для покращення SEO
 */

import React from 'react';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://wearsearch.com';
const SITE_NAME = 'Wearsearch';

// Базові типи для structured data
interface StructuredData {
  '@context': 'https://schema.org';
  '@type': string;
  [key: string]: any;
}

/**
 * Organization Schema для всього сайту
 */
export function generateOrganizationSchema(): StructuredData {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    description: 'Порівняння цін на модний одяг, взуття та аксесуари',
    sameAs: [
      // Додайте посилання на соціальні мережі
      // 'https://facebook.com/wearsearch',
      // 'https://instagram.com/wearsearch',
      // 'https://twitter.com/wearsearch',
    ],
  };
}

/**
 * WebSite Schema з пошуковою функцією
 */
export function generateWebSiteSchema(): StructuredData {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

/**
 * Product Schema для сторінки продукту
 */
export function generateProductSchema(product: {
  id: string;
  name: string;
  description?: string;
  brand?: string;
  image?: string;
  price?: number;
  currency?: string;
  availability?: 'InStock' | 'OutOfStock' | 'PreOrder';
  rating?: number;
  reviewCount?: number;
}): StructuredData {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    brand: product.brand ? {
      '@type': 'Brand',
      name: product.brand,
    } : undefined,
    image: product.image,
    offers: {
      '@type': 'Offer',
      price: product.price?.toString(),
      priceCurrency: product.currency || 'UAH',
      availability: `https://schema.org/${product.availability || 'InStock'}`,
      url: `${SITE_URL}/products/${product.id}`,
    },
    aggregateRating: product.rating && product.reviewCount ? {
      '@type': 'AggregateRating',
      ratingValue: product.rating.toString(),
      reviewCount: product.reviewCount.toString(),
    } : undefined,
  };
}

/**
 * BreadcrumbList Schema для навігації
 */
export function generateBreadcrumbSchema(
  items: Array<{ name: string; url: string }>
): StructuredData {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * Компонент для вставки JSON-LD на сторінку
 */
export function JsonLd({ data }: { data: StructuredData }) {
  return React.createElement('script', {
    type: 'application/ld+json',
    dangerouslySetInnerHTML: { __html: JSON.stringify(data) },
  });
}
