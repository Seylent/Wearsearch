/**
 * GET /api/translate/languages
 * Proxies to backend GET /api/translate/languages
 */

import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<NextResponse> {
  try {
    const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL;
    if (!backendUrl) {
      return NextResponse.json(
        {
          success: false,
          message: 'Backend URL is not configured',
        },
        { status: 500 }
      );
    }
    const response = await fetch(`${backendUrl}/api/translate/languages`, {
      cache: 'no-store',
    });

    const data = await response.json().catch(() => null);
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Translate languages proxy error:', error);
    return NextResponse.json(
      { success: false, message: 'Translation service unavailable' },
      { status: 500 }
    );
  }
}
