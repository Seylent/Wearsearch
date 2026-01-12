import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const { currency } = await request.json();
    
    if (!['USD', 'UAH', 'EUR'].includes(currency)) {
      return NextResponse.json(
        { error: 'Invalid currency' },
        { status: 400 }
      );
    }

    const cookieStore = cookies();
    cookieStore.set('preferred_currency', currency, {
      maxAge: 365 * 24 * 60 * 60, // 1 year
      path: '/',
      sameSite: 'lax',
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error setting currency:', error);
    return NextResponse.json(
      { error: 'Failed to set currency' },
      { status: 500 }
    );
  }
}
