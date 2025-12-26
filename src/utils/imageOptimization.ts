/**
 * Image Optimization Utilities
 * Handles CloudFront URLs and responsive images
 */

/**
 * Get optimized CloudFront URL for images
 * Replaces S3 direct URLs with CloudFront CDN URLs for HTTP/2 and compression
 */
export function getImageUrl(s3Url: string): string {
  if (!s3Url) return '/placeholder.svg';
  
  const CLOUDFRONT_DOMAIN = import.meta.env.VITE_CLOUDFRONT_DOMAIN;
  
  // If CloudFront is not configured, return original URL
  if (!CLOUDFRONT_DOMAIN) return s3Url;
  
  // Replace S3 URL with CloudFront URL
  return s3Url.replace(
    /https?:\/\/[^\/]+\.s3\.[^\/]+\.amazonaws\.com/,
    `https://${CLOUDFRONT_DOMAIN}`
  );
}

/**
 * Generate responsive image srcset for WebP images
 * Returns srcset string with 400w, 800w versions
 * 
 * @example
 * const srcSet = getResponsiveSrcSet('https://bucket.s3.amazonaws.com/products/shoe.jpg');
 * // Returns: "https://cdn.example.com/products/shoe-400w.webp 400w, https://cdn.example.com/products/shoe-800w.webp 800w"
 */
export function getResponsiveSrcSet(imageUrl: string): string {
  if (!imageUrl) return '';
  
  const baseUrl = getImageUrl(imageUrl);
  
  // Replace extension with WebP versions
  const base = baseUrl.replace(/\.(jpg|jpeg|png)$/i, '');
  
  return `${base}-400w.webp 400w, ${base}-800w.webp 800w`;
}

/**
 * Get fallback image URL (original or placeholder)
 */
export function getFallbackImageUrl(imageUrl: string): string {
  return getImageUrl(imageUrl) || '/placeholder.svg';
}

/**
 * Check if WebP versions exist (for gradual rollout)
 * Returns true if -400w.webp or -800w.webp pattern is in URL
 */
export function hasWebPVersions(imageUrl: string): boolean {
  if (!imageUrl) return false;
  return /-\d+w\.webp$/.test(imageUrl);
}
