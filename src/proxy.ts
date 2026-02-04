import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(_request: NextRequest) {
  const isDev = process.env.NODE_ENV !== 'production';
  const connectSrc = [
    "'self'",
    'https://*.supabase.co',
    'https://api.wearsearch.com',
    'https://www.google-analytics.com',
    'https://www.googletagmanager.com',
  ];

  if (isDev) {
    connectSrc.push(
      'http://localhost:3000',
      'http://localhost:5173',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:5173',
      'ws://localhost:3000',
      'ws://localhost:5173',
      'ws://127.0.0.1:3000',
      'ws://127.0.0.1:5173'
    );
  }

  const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com;
    style-src 'self' 'unsafe-inline';
    img-src 'self' https://*.supabase.co https://*.amazonaws.com https://*.cloudfront.net https://www.google-analytics.com https://wearsearch.com https://images.wearsearch.com data: blob:;
    connect-src ${connectSrc.join(' ')};
    font-src 'self';
    frame-src 'self' https://www.googletagmanager.com;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    ${isDev ? '' : 'upgrade-insecure-requests;'}
  `
    .replace(/\s{2,}/g, ' ')
    .trim();

  const response = NextResponse.next();

  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-DNS-Prefetch-Control', 'on');
  response.headers.set(
    'Permissions-Policy',
    'accelerometer=(), autoplay=(), camera=(), clipboard-read=(), clipboard-write=(self), fullscreen=(self), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()'
  );
  response.headers.set('Content-Security-Policy', cspHeader);

  return response;
}

export const middleware = proxy;

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)'],
};
