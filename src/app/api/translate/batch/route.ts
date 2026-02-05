/**
 * POST /api/translate/batch
 * Proxies to backend POST /api/translate/batch (admin only)
 */

import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest): Promise<NextResponse> {
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
    const authHeader = request.headers.get('authorization');
    const body = await request.text();

    const response = await fetch(`${backendUrl}/api/translate/batch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader ? { Authorization: authHeader } : {}),
      },
      body,
    });

    const data = await response.json().catch(() => null);
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Translate batch proxy error:', error);
    return NextResponse.json(
      { success: false, message: 'Translation service unavailable' },
      { status: 500 }
    );
  }
}
