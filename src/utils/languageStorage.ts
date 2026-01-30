/**
 * Language Utilities - Cookie-based Storage
 * Keeps server-rendered content aligned with client language
 */

export type LanguageCode = 'uk' | 'en';

export const LANGUAGE_COOKIE = {
  name: 'wearsearch_language',
  maxAge: 365 * 24 * 60 * 60, // 1 year
  path: '/',
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
};

export const languageStorage = {
  getLanguage(): LanguageCode {
    if (globalThis.window === undefined) return 'uk';

    const value = document.cookie
      .split('; ')
      .find(row => row.startsWith(`${LANGUAGE_COOKIE.name}=`))
      ?.split('=')[1];

    return value === 'en' || value === 'uk' ? value : 'uk';
  },
};

export const setLanguageCookie = (language: LanguageCode): void => {
  if (globalThis.window === undefined) return;

  const value = language === 'en' || language === 'uk' ? language : 'uk';
  const cookieValue = `${LANGUAGE_COOKIE.name}=${value}; Max-Age=${LANGUAGE_COOKIE.maxAge}; Path=${LANGUAGE_COOKIE.path}; SameSite=${LANGUAGE_COOKIE.sameSite}${LANGUAGE_COOKIE.secure ? '; Secure' : ''}`;
  document.cookie = cookieValue;
};

export async function getServerLanguage(): Promise<LanguageCode> {
  if (globalThis.window !== undefined) {
    return languageStorage.getLanguage();
  }

  try {
    const { cookies } = await import('next/headers');
    const cookieStore = cookies();
    const language = cookieStore.get(LANGUAGE_COOKIE.name)?.value;
    return language === 'en' || language === 'uk' ? language : 'uk';
  } catch {
    return 'uk';
  }
}
