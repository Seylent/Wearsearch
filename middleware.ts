import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Debug logging
  console.log('[Middleware] Request:', pathname);
  
  // Middleware disabled - routes work without locale prefixes
  // Client-side i18n via i18next handles language switching
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
