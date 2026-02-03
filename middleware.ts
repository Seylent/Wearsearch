import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(_request: NextRequest) {
  const response = NextResponse.next();
  const isDev = process.env.NODE_ENV !== 'production';
  const connectSrc = [
    "'self'",
    'https://*.supabase.co',
    'https://wearsearch.com',
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

  // Set security headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-DNS-Prefetch-Control', 'on');

  // Content Security Policy
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com;
    style-src 'self' 'unsafe-inline';
    img-src 'self' blob: data: https://*.supabase.co https://*.amazonaws.com https://wearsearch.com https://images.wearsearch.com;
    font-src 'self';
    connect-src ${connectSrc.join(' ')};
    frame-src 'self';
    base-uri 'self';
    form-action 'self';
    ${isDev ? '' : 'upgrade-insecure-requests;'}
  `
    .replace(/\s+/g, ' ')
    .trim();

  response.headers.set('Content-Security-Policy', cspHeader);

  return response;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
