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
    if (typeof window === 'undefined' || typeof document === 'undefined') return;
    
    // Full title with site name
    const fullTitle = title.includes(DEFAULT_SITE_NAME) 
      ? title 
      : `${title} | ${DEFAULT_SITE_NAME}`;
    
    // Update document title
    document.title = fullTitle;

    // Canonical URL - use provided or construct from current location
    const canonicalUrl = canonical || `${window.location.origin}${pathname}`;

    // Helper to update or create meta tag
    const updateMeta = (selector: string, attribute: string, content: string) => {
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
        // Silently fail if DOM is not available
        console.debug('Failed to update meta tag:', selector, error);
      }
    };

    // Update basic meta tags
    updateMeta('meta[name="description"]', 'name', description);
    if (keywords) {
      updateMeta('meta[name="keywords"]', 'name', keywords);
    }
    if (author) {
      updateMeta('meta[name="author"]', 'name', author);
    }

    // Robots meta
    if (noindex) {
      updateMeta('meta[name="robots"]', 'name', 'noindex, nofollow');
    } else {
      try {
        const robotsMeta = document.querySelector('meta[name="robots"]');
        if (robotsMeta && robotsMeta.parentNode) {
          robotsMeta.parentNode.removeChild(robotsMeta);
        }
      } catch (_error) {
        // Silently fail
      }
    }

    // Open Graph tags
    updateMeta('meta[property="og:title"]', 'property', fullTitle);
    updateMeta('meta[property="og:description"]', 'property', description);
    updateMeta('meta[property="og:type"]', 'property', type);
    updateMeta('meta[property="og:url"]', 'property', canonicalUrl);
    updateMeta('meta[property="og:image"]', 'property', image);
    updateMeta('meta[property="og:site_name"]', 'property', DEFAULT_SITE_NAME);
    
    if (publishedTime) {
      updateMeta('meta[property="article:published_time"]', 'property', publishedTime);
    }
    if (modifiedTime) {
      updateMeta('meta[property="article:modified_time"]', 'property', modifiedTime);
    }

    // Twitter Card tags
    updateMeta('meta[name="twitter:card"]', 'name', 'summary_large_image');
    updateMeta('meta[name="twitter:site"]', 'name', DEFAULT_TWITTER_HANDLE);
    updateMeta('meta[name="twitter:title"]', 'name', fullTitle);
    updateMeta('meta[name="twitter:description"]', 'name', description);
    updateMeta('meta[name="twitter:image"]', 'name', image);

    // Canonical URL
    try {
      if (document.head) {
        let linkCanonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
        if (!linkCanonical) {
          linkCanonical = document.createElement('link');
          linkCanonical.rel = 'canonical';
          document.head.appendChild(linkCanonical);
        }
        linkCanonical.href = canonicalUrl;
      }
    } catch (error) {
      console.debug('Failed to update canonical link:', error);
    }

    // Structured Data (JSON-LD)
    if (structuredData) {
      try {
        if (document.head) {
          let script = document.querySelector('script[type="application/ld+json"][data-dynamic]') as HTMLScriptElement;
          if (!script) {
            script = document.createElement('script');
            script.type = 'application/ld+json';
            script.setAttribute('data-dynamic', 'true');
            document.head.appendChild(script);
          }
          script.textContent = JSON.stringify(structuredData);
        }
      } catch (error) {
        console.debug('Failed to update structured data:', error);
      }
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
