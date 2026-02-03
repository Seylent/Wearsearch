import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const nonce = btoa(crypto.randomUUID()).slice(0, 16);
  const isDev = process.env.NODE_ENV !== 'production';
  const connectSrc = [
    "'self'",
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
    script-src 'self' 'nonce-${nonce}' https://www.googletagmanager.com https://www.google-analytics.com;
    style-src 'self' 'unsafe-inline';
    img-src 'self' https://*.amazonaws.com https://*.cloudfront.net https://www.google-analytics.com data: blob:;
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

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });

  response.headers.set('Content-Security-Policy', cspHeader);

  return response;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)'],
};
