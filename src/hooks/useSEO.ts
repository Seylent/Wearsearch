'use client';

/**
 * useSEO Hook - Dynamic SEO Meta Tags Management
 * 
 * Manages document title, meta description, OpenGraph, Twitter Cards, and canonical URLs
 * SSR-ready structure with proper cleanup
 */

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

interface SEOProps {
  title: string;
  description: string;
  keywords?: string;
  image?: string;
  type?: 'website' | 'article' | 'product';
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  canonical?: string;
  noindex?: boolean;
  structuredData?: object;
}

const DEFAULT_IMAGE = 'https://wearsearch.com/og-image.jpg';
const DEFAULT_SITE_NAME = 'Wearsearch';
const DEFAULT_TWITTER_HANDLE = '@wearsearch';

/**
 * Updates document meta tags dynamically
 * Prepares structure for SSR/prerendering
 */
/**
 * Helper to update or create meta tag
 */
const updateMetaTag = (selector: string, attribute: string, content: string): void => {
  try {
    if (!document.head) return;
    let element = document.querySelector(selector);
    if (!element) {
      element = document.createElement('meta');
      if (attribute === 'property') {
        element.setAttribute('property', selector.replace('meta[property="', '').replace('"]', ''));
      } else {
        element.setAttribute('name', selector.replace('meta[name="', '').replace('"]', ''));
      }
      document.head.appendChild(element);
    }
    element.setAttribute('content', content);
  } catch (error) {
    console.debug('Failed to update meta tag:', selector, error);
  }
};

/**
 * Update all basic meta tags
 */
const updateBasicMeta = (description: string, keywords?: string, author?: string): void => {
  updateMetaTag('meta[name="description"]', 'name', description);
  if (keywords) {
    updateMetaTag('meta[name="keywords"]', 'name', keywords);
  }
  if (author) {
    updateMetaTag('meta[name="author"]', 'name', author);
  }
};

/**
 * Update Open Graph meta tags
 */
const updateOpenGraphTags = (
  fullTitle: string,
  description: string,
  type: string,
  canonicalUrl: string,
  image: string,
  publishedTime?: string,
  modifiedTime?: string
): void => {
  updateMetaTag('meta[property="og:title"]', 'property', fullTitle);
  updateMetaTag('meta[property="og:description"]', 'property', description);
  updateMetaTag('meta[property="og:type"]', 'property', type);
  updateMetaTag('meta[property="og:url"]', 'property', canonicalUrl);
  updateMetaTag('meta[property="og:image"]', 'property', image);
  updateMetaTag('meta[property="og:site_name"]', 'property', DEFAULT_SITE_NAME);
  
  if (publishedTime) {
    updateMetaTag('meta[property="article:published_time"]', 'property', publishedTime);
  }
  if (modifiedTime) {
    updateMetaTag('meta[property="article:modified_time"]', 'property', modifiedTime);
  }
};

/**
 * Update Twitter Card meta tags
 */
const updateTwitterTags = (fullTitle: string, description: string, image: string): void => {
  updateMetaTag('meta[name="twitter:card"]', 'name', 'summary_large_image');
  updateMetaTag('meta[name="twitter:site"]', 'name', DEFAULT_TWITTER_HANDLE);
  updateMetaTag('meta[name="twitter:title"]', 'name', fullTitle);
  updateMetaTag('meta[name="twitter:description"]', 'name', description);
  updateMetaTag('meta[name="twitter:image"]', 'name', image);
};

/**
 * Update canonical link
 */
const updateCanonicalLink = (canonicalUrl: string): void => {
  try {
    if (!document.head) return;
    let linkCanonical = document.querySelector('link[rel="canonical"]');
    if (!linkCanonical) {
      linkCanonical = document.createElement('link');
      linkCanonical.setAttribute('rel', 'canonical');
      document.head.appendChild(linkCanonical);
    }
    linkCanonical.setAttribute('href', canonicalUrl);
  } catch (error) {
    console.debug('Failed to update canonical link:', error);
  }
};

/**
 * Update structured data (JSON-LD)
 */
const updateStructuredData = (structuredData: object): void => {
  try {
    if (!document.head) return;
    let script = document.querySelector('script[type="application/ld+json"][data-dynamic]');
    if (!script) {
      script = document.createElement('script');
      script.type = 'application/ld+json';
      script.dataset.dynamic = 'true';
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(structuredData);
  } catch (error) {
    console.debug('Failed to update structured data:', error);
  }
};

/**
 * Update robots meta tag
 */
const updateRobotsMeta = (noindex: boolean): void => {
  if (noindex) {
    updateMetaTag('meta[name="robots"]', 'name', 'noindex, nofollow');
  } else {
    try {
      const robotsMeta = document.querySelector('meta[name="robots"]');
      robotsMeta?.remove();
    } catch (error) {
      console.debug('Failed to remove robots meta tag:', error);
    }
  }
};

export const useSEO = ({
  title,
  description,
  keywords,
  image = DEFAULT_IMAGE,
  type = 'website',
  author,
  publishedTime,
  modifiedTime,
  canonical,
  noindex = false,
  structuredData,
}: SEOProps) => {
  const pathname = usePathname();

  useEffect(() => {
    // Guard for SSR and cleanup edge cases
    if (globalThis.window === undefined || typeof document === 'undefined') return;
    
    // Full title with site name
    const fullTitle = title.includes(DEFAULT_SITE_NAME) 
      ? title 
      : `${title} | ${DEFAULT_SITE_NAME}`;
    
    // Update document title
    document.title = fullTitle;

    // Canonical URL - use provided or construct from current location
    const canonicalUrl = canonical || `${globalThis.window.location.origin}${pathname}`;

    // Update all meta tags using helper functions
    updateBasicMeta(description, keywords, author);
    updateRobotsMeta(noindex);
    updateOpenGraphTags(fullTitle, description, type, canonicalUrl, image, publishedTime, modifiedTime);
    updateTwitterTags(fullTitle, description, image);
    updateCanonicalLink(canonicalUrl);
    
    if (structuredData) {
      updateStructuredData(structuredData);
    }

    // Cleanup function for SSR hydration
    return () => {
      // Note: In SSR, this cleanup ensures no memory leaks
      // Meta tags are managed per-page, not removed on unmount
    };
  }, [title, description, keywords, image, type, author, publishedTime, modifiedTime, canonical, noindex, structuredData, pathname]);
};

/**
 * Generate Product structured data
 */
export const generateProductStructuredData = (product: {
  id: string;
  name: string;
  description?: string;
  image_url: string;
  price?: number;
  brand?: string;
  category?: string;
}) => ({
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: product.name,
  description: product.description || `${product.name} - Available at Wearsearch`,
  image: product.image_url,
  brand: product.brand ? {
    '@type': 'Brand',
    name: product.brand,
  } : undefined,
  category: product.category,
  offers: product.price ? {
    '@type': 'Offer',
    price: product.price,
    priceCurrency: 'USD',
    availability: 'https://schema.org/InStock',
  } : undefined,
});

/**
 * Generate BreadcrumbList structured data
 */
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

/**
 * Generate Organization structured data
 */
export const generateOrganizationStructuredData = () => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: DEFAULT_SITE_NAME,
  url: 'https://wearsearch.com',
  logo: 'https://wearsearch.com/logo.png',
  sameAs: [
    'https://twitter.com/wearsearch',
    'https://instagram.com/wearsearch',
  ],
});
