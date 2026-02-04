/**
 * SEO Metadata Utilities
 * Генерація title, description та OpenGraph метаданих згідно SEO-ТЗ
 */

import type { Metadata } from 'next';

const SITE_NAME = 'Wearsearch';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://wearsearch.com';

// Максимальна довжина для SEO
const MAX_TITLE_LENGTH = 60;
const MAX_DESCRIPTION_LENGTH = 160;

/**
 * Генерує title згідно формули: Основний запит + уточнення | Назва проєкту
 * @param mainQuery - Основний пошуковий запит (наприклад: "Nike кросівки")
 * @param clarification - Уточнення (наприклад: "ціни, порівняння магазинів")
 * @returns Оптимізований title (50-60 символів)
 */
export function generateSEOTitle(mainQuery: string, clarification?: string): string {
  let title = mainQuery;

  if (clarification) {
    title = `${mainQuery} — ${clarification}`;
  }

  title = `${title} | ${SITE_NAME}`;

  // Перевірка довжини
  if (title.length > MAX_TITLE_LENGTH) {
    const maxMainLength = MAX_TITLE_LENGTH - SITE_NAME.length - 3; // 3 для " | "
    title = `${mainQuery.substring(0, maxMainLength)}... | ${SITE_NAME}`;
  }

  return title;
}

/**
 * Генерує description згідно формули: Що це + користь + дія
 * @param what - Що це (наприклад: "Порівняй ціни на кросівки Nike")
 * @param benefit - Користь (наприклад: "в різних магазинах")
 * @param action - Дія (наприклад: "Знайди найвигіднішу пропозицію")
 * @returns Оптимізований description (140-160 символів)
 */
export function generateSEODescription(what: string, benefit?: string, action?: string): string {
  let description = what;

  if (benefit) {
    description += ` ${benefit}`;
  }

  if (action) {
    description += `. ${action}`;
  }

  // Обрізаємо якщо занадто довго
  if (description.length > MAX_DESCRIPTION_LENGTH) {
    description = description.substring(0, MAX_DESCRIPTION_LENGTH - 3) + '...';
  }

  return description;
}

/**
 * Генерує повні метадані для категорій
 */
export function generateCategoryMetadata(
  categoryName: string,
  options?: {
    description?: string;
    imageUrl?: string;
    keywords?: string[];
  }
): Metadata {
  const title = generateSEOTitle(categoryName, 'порівняння цін онлайн');

  const description =
    options?.description ||
    generateSEODescription(
      `Знайди найкращі пропозиції на ${categoryName.toLowerCase()}`,
      'з актуальними цінами від різних магазинів',
      'Порівнюй та обирай вигідніше на Wearsearch'
    );

  return {
    title,
    description,
    keywords: options?.keywords,
    openGraph: {
      title: `${categoryName} | ${SITE_NAME}`,
      description,
      images: options?.imageUrl ? [options.imageUrl] : [],
      type: 'website',
      siteName: SITE_NAME,
      url: `${SITE_URL}/categories/${encodeURIComponent(categoryName.toLowerCase())}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${categoryName} | ${SITE_NAME}`,
      description,
      images: options?.imageUrl ? [options.imageUrl] : [],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

/**
 * Генерує повні метадані для брендів
 */
export function generateBrandMetadata(
  brandName: string,
  options?: {
    description?: string;
    imageUrl?: string;
    keywords?: string[];
  }
): Metadata {
  const title = generateSEOTitle(`${brandName} — офіційна продукція`, 'ціни та порівняння');

  const description =
    options?.description ||
    generateSEODescription(
      `Вся продукція ${brandName} в одному місці`,
      'Порівнюй ціни від різних магазинів',
      'Знайди найкращу пропозицію за лічені секунди'
    );

  return {
    title,
    description,
    keywords: options?.keywords,
    openGraph: {
      title: `${brandName} | ${SITE_NAME}`,
      description,
      images: options?.imageUrl ? [options.imageUrl] : [],
      type: 'website',
      siteName: SITE_NAME,
      url: `${SITE_URL}/brands/${encodeURIComponent(brandName.toLowerCase())}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${brandName} | ${SITE_NAME}`,
      description,
      images: options?.imageUrl ? [options.imageUrl] : [],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

/**
 * Генерує повні метадані для конкретної моделі/продукту
 */
export function generateProductMetadata(
  productName: string,
  brandName?: string,
  options?: {
    description?: string;
    imageUrl?: string;
    price?: string;
    currency?: string;
    keywords?: string[];
    canonicalUrl?: string;
  }
): Metadata {
  const fullName = brandName ? `${brandName} ${productName}` : productName;
  const title = generateSEOTitle(fullName, 'де купити вигідно');
  const canonicalUrl = options?.canonicalUrl;

  const description =
    options?.description ||
    generateSEODescription(
      `${fullName} — порівняння цін`,
      'від перевірених магазинів',
      'Обери найкращу пропозицію на Wearsearch'
    );

  return {
    title,
    description,
    keywords: options?.keywords,
    openGraph: {
      title: `${fullName} | ${SITE_NAME}`,
      description,
      images: options?.imageUrl ? [options.imageUrl] : [],
      type: 'website',
      siteName: SITE_NAME,
      ...(canonicalUrl ? { url: canonicalUrl } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: `${fullName} | ${SITE_NAME}`,
      description,
      images: options?.imageUrl ? [options.imageUrl] : [],
    },
    ...(canonicalUrl ? { alternates: { canonical: canonicalUrl } } : {}),
    robots: {
      index: true,
      follow: true,
    },
  };
}

/**
 * Метадані для сторінки пошуку (з noindex)
 */
export function generateSearchMetadata(query?: string): Metadata {
  const title = query ? `Результати пошуку: ${query} | ${SITE_NAME}` : `Пошук | ${SITE_NAME}`;

  const description = query
    ? `Знайдено результати для запиту "${query}". Порівнюй ціни та обирай краще на Wearsearch.`
    : 'Шукай товари, бренди та магазини. Порівнюй ціни в одному місці.';

  return {
    title,
    description,
    robots: {
      index: false, // Не індексуємо пошукові сторінки згідно ТЗ
      follow: true,
    },
  };
}

/**
 * Метадані для сторінок з фільтрами (з noindex)
 */
export function generateFilteredPageMetadata(
  basePage: string,
  filters: Record<string, string>
): Metadata {
  const filterStr = Object.entries(filters)
    .map(([key, value]) => `${key}: ${value}`)
    .join(', ');

  return {
    title: `${basePage} — ${filterStr} | ${SITE_NAME}`,
    description: `${basePage} з фільтрами: ${filterStr}`,
    robots: {
      index: false, // Не індексуємо фільтровані сторінки згідно ТЗ
      follow: true,
    },
  };
}

/**
 * Базові метадані для головної сторінки
 */
export function generateHomeMetadata(): Metadata {
  return {
    title: `${SITE_NAME} — Знайди найкращі ціни на одяг та взуття онлайн`,
    description:
      'Порівнюй ціни на модний одяг, взуття та аксесуари від топових брендів. Знайди найвигідніші пропозиції в одному місці.',
    keywords: [
      'порівняння цін',
      'одяг онлайн',
      'взуття',
      'бренди',
      'мода',
      'шопінг',
      'найкращі ціни',
    ],
    openGraph: {
      title: `${SITE_NAME} — Порівняння цін на моду`,
      description: 'Знайди найкращі ціни на одяг, взуття та аксесуари від топових брендів',
      type: 'website',
      siteName: SITE_NAME,
      url: SITE_URL,
      images: [
        {
          url: `${SITE_URL}/og-image.svg`,
          width: 1200,
          height: 630,
          alt: SITE_NAME,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${SITE_NAME} — Порівняння цін на моду`,
      description: 'Знайди найкращі ціни на одяг, взуття та аксесуари',
      images: [`${SITE_URL}/og-image.svg`],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}
