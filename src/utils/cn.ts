/**
 * Utility Functions
 * Centralized utility functions for the application
 */

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind classes with clsx
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Convert S3 protocol URL to HTTPS URL
 * s3://bucket/path -> https://bucket.s3.region.amazonaws.com/path
 */
export function convertS3UrlToHttps(url: string): string {
  if (!url) return url;
  
  // If already HTTPS, return as is
  if (url.startsWith('https://') || url.startsWith('http://')) {
    return url;
  }
  
  // Convert s3:// to https://
  if (url.startsWith('s3://')) {
    // Extract bucket and key from s3://bucket/key
    const s3Url = url.replace('s3://', '');
    const parts = s3Url.split('/');
    const bucket = parts[0];
    const key = parts.slice(1).join('/');
    
    // Properly encode the key (handle spaces and special characters)
    const decodedKey = key.replace(/\+/g, ' ');
    const encodedKey = encodeURIComponent(decodedKey).replace(/%2F/g, '/');
    
    // Construct HTTPS URL
    return `https://${bucket}.s3.eu-north-1.amazonaws.com/${encodedKey}`;
  }
  
  return url;
}

/**
 * Format price to currency string
 */
export function formatPrice(price: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(price);
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}
