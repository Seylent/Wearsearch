/**
 * Translation API Route
 * Proxy to backend translation service integrated with LibreTranslate
 */

import { NextRequest, NextResponse } from 'next/server';

interface TranslationRequest {
  text: string;
  sourceLanguage?: string;
  targetLanguage: string;
}

interface TranslationResponse {
  translatedText?: string;
  sourceLanguage?: string;
  targetLanguage?: string;
  error?: string;
}

export async function POST(request: NextRequest): Promise<NextResponse<TranslationResponse>> {
  try {
    const { text, sourceLanguage = 'auto', targetLanguage }: TranslationRequest = await request.json();

    if (!text?.trim()) {
      return NextResponse.json({
        error: 'Text is required',
      }, { status: 400 });
    }

    if (!targetLanguage) {
      return NextResponse.json({
        error: 'Target language is required',
      }, { status: 400 });
    }

    // Forward to backend translation API
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3000';
    const response = await fetch(`${backendUrl}/api/translate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: text.trim(),
        sourceLanguage,
        targetLanguage,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json({
        error: errorData.message || `Backend error: ${response.status}`,
      }, { status: response.status });
    }

    const data = await response.json();
    
    return NextResponse.json({
      translatedText: data.translatedText,
      sourceLanguage: data.sourceLanguage,
      targetLanguage: data.targetLanguage,
    });

  } catch (error) {
    console.error('Translation proxy error:', error);
    return NextResponse.json({
      error: 'Translation service unavailable',
    }, { status: 500 });
  }
}