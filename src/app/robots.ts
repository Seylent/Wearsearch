import type { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://wearsearch.com';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/$', '/products?type=', '/brands/', '/categories/', '/stores/'],
        disallow: [
          '/products?*q=',
          '/products?*color=',
          '/products?*material=',
          '/products?*size=',
          '/products?*brand=',
          '/products?*price_min=',
          '/products?*price_max=',
          '/auth/',
          '/favorites/',
          '/profile/',
          '/store-menu/',
          '/admin/',
          '/account/',
          '/cart/',
          '/checkout/',
          '/test/',
          '/api/',
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
