import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

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
    // Replace + with spaces first, then encode properly
    const decodedKey = key.replace(/\+/g, ' ');
    const encodedKey = encodeURIComponent(decodedKey).replace(/%2F/g, '/');
    
    // Construct HTTPS URL - adjust region as needed
    return `https://${bucket}.s3.eu-north-1.amazonaws.com/${encodedKey}`;
  }
  
  return url;
}
