/**
 * Translation API Route
 * Proxy to backend translation service integrated with LibreTranslate
 */

import { NextRequest, NextResponse } from 'next/server';

interface TranslationResponse {
  translatedText?: string;
  sourceLanguage?: string;
  targetLanguage?: string;
  error?: string;
}

export async function POST(request: NextRequest): Promise<NextResponse<TranslationResponse>> {
  try {
    const body = await request.json();
    const { text, from, to } = body;

    if (!text?.trim()) {
      return NextResponse.json({
        error: 'Text is required',
      }, { status: 400 });
    }

    if (!to) {
      return NextResponse.json({
        error: 'Target language (to) is required',
      }, { status: 400 });
    }

    // Forward to backend translation API with same format
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3000';
    const response = await fetch(`${backendUrl}/api/translate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: text.trim(),
        from: from || 'auto',
        to,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json({
        error: errorData.message || `Backend error: ${response.status}`,
      }, { status: response.status });
    }

    const data = await response.json();
    
    // Return backend response as-is
    return NextResponse.json(data);

  } catch (error) {
    console.error('Translation proxy error:', error);
    return NextResponse.json({
      error: 'Translation service unavailable',
    }, { status: 500 });
  }
}