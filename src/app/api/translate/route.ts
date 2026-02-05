/**
 * Translation API Route
 * Proxy to backend translation service.
 *
 * Backend contract (as provided):
 * POST /api/translate
 *   { text: string, from: string, to: string }
 * -> { success: true, translated: string, from, to, original }
 */

import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

type BackendTranslateResponse =
  | {
      success: true;
      translated: string;
      from: string;
      to: string;
      original: string;
    }
  | {
      success: false;
      message?: string;
      error?: string;
    };

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { text, from, to } = body;

    if (!text?.trim()) {
      return NextResponse.json(
        {
          error: 'Text is required',
        },
        { status: 400 }
      );
    }

    if (!from?.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: 'Source language (from) is required',
        },
        { status: 400 }
      );
    }

    if (!to?.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: 'Target language (to) is required',
        },
        { status: 400 }
      );
    }

    if (typeof text === 'string' && text.length > 5000) {
      return NextResponse.json(
        {
          success: false,
          message: 'Text exceeds 5000 characters limit',
        },
        { status: 400 }
      );
    }

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

    // Forward auth header if present (needed for /batch in some setups; harmless otherwise)
    const authHeader = request.headers.get('authorization');

    const response = await fetch(`${backendUrl}/api/translate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader ? { Authorization: authHeader } : {}),
      },
      body: JSON.stringify({
        text: text.trim(),
        from: from.trim(),
        to: to.trim(),
      }),
    });

    const data = (await response.json().catch(() => null)) as BackendTranslateResponse | null;

    if (!response.ok) {
      return NextResponse.json(
        data ?? { success: false, message: `Backend error: ${response.status}` },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Translation proxy error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Translation service unavailable',
      },
      { status: 500 }
    );
  }
}
