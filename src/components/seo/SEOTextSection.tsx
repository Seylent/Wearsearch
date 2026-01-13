/**
 * SEO-оптимізований компонент для категорій
 * Містить SEO-текст під списком товарів
 */

import React from 'react';

interface SEOTextSectionProps {
  title: string;
  content: string;
  keywords?: string[];
  isExpanded?: boolean;
}

export const SEOTextSection: React.FC<SEOTextSectionProps> = ({
  title,
  content,
  keywords = [],
  isExpanded = false,
}) => {
  const [expanded, setExpanded] = React.useState(isExpanded);

  return (
    <section className="mt-12 mb-8 px-4 max-w-7xl mx-auto">
      <div className="bg-zinc-900/50 border border-white/10 rounded-xl p-6 md:p-8">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
          {title}
        </h2>
        
        <div className={`text-gray-300 leading-relaxed ${!expanded ? 'line-clamp-4' : ''}`}>
          <div dangerouslySetInnerHTML={{ __html: content }} />
        </div>

        {!isExpanded && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-4 text-white/80 hover:text-white transition-colors underline"
            aria-expanded={expanded}
          >
            {expanded ? 'Згорнути' : 'Читати більше'}
          </button>
        )}

        {keywords.length > 0 && (
          <div className="mt-6 pt-6 border-t border-white/10">
            <p className="text-sm text-gray-400 mb-2">Популярні запити:</p>
            <div className="flex flex-wrap gap-2">
              {keywords.map((keyword, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-white/5 rounded-full text-sm text-gray-300 border border-white/10"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

/**
 * SEO-тексти для категорій (приклади)
 */
export const CATEGORY_SEO_CONTENT: Record<string, { title: string; content: string; keywords: string[] }> = {
  'krosovisky': {
    title: 'Як обрати кросівки: повний гід',
    content: `
      <p class="mb-4">
        <strong>Кросівки</strong> — це найпопулярніший тип взуття у сучасному світі моди. 
        Вони поєднують комфорт, стиль та функціональність, що робить їх ідеальним вибором 
        для повсякденного носіння, спорту та активного відпочинку.
      </p>
      <p class="mb-4">
        На нашій платформі ви можете <strong>порівняти ціни на кросівки</strong> від різних 
        магазинів та брендів. Ми зібрали найкращі пропозиції від Nike, Adidas, New Balance, 
        Puma та інших провідних виробників, щоб ви могли знайти ідеальну пару за найкращою ціною.
      </p>
      <p>
        Використовуйте фільтри для пошуку кросівок за розміром, кольором, брендом та ціною. 
        Знайдіть найвигіднішу пропозицію за лічені секунди!
      </p>
    `,
    keywords: ['Nike кросівки', 'Adidas кросівки', 'купити кросівки', 'кросівки ціна', 'спортивне взуття'],
  },
  'odag': {
    title: 'Модний одяг онлайн: як обрати краще',
    content: `
      <p class="mb-4">
        Шукаєте <strong>модний одяг</strong> за доступними цінами? Wearsearch допомагає 
        порівняти пропозиції від різних інтернет-магазинів в одному місці. Економте час 
        та гроші, знаходячи найкращі ціни на одяг від топових брендів.
      </p>
      <p class="mb-4">
        У нашому каталозі представлений одяг для чоловіків та жінок: футболки, светри, 
        куртки, джинси та багато іншого. Використовуйте фільтри для швидкого пошуку 
        потрібного товару за розміром, кольором, брендом та ціновим діапазоном.
      </p>
      <p>
        Порівнюйте ціни, читайте характеристики та обирайте найвигідніші пропозиції. 
        Всі актуальні ціни в режимі реального часу!
      </p>
    `,
    keywords: ['одяг онлайн', 'купити одяг', 'модний одяг', 'одяг ціна', 'інтернет-магазин одягу'],
  },
  'nike': {
    title: 'Nike — офіційна продукція за найкращими цінами',
    content: `
      <p class="mb-4">
        <strong>Nike</strong> — це світовий лідер у виробництві спортивного взуття та одягу. 
        Бренд відомий своїми інноваційними технологіями, якістю матеріалів та стильним дизайном.
      </p>
      <p class="mb-4">
        На Wearsearch ви можете знайти всю продукцію Nike: від легендарних Air Force 1 та Air Max 
        до новітніх моделей бігових кросівок. Порівнюйте ціни від різних магазинів та обирайте 
        найвигіднішу пропозицію.
      </p>
      <p>
        Використовуйте наш сервіс для пошуку Nike за моделлю, розміром або ціною. 
        Знайдіть свою ідеальну пару за найкращою ціною!
      </p>
    `,
    keywords: ['Nike Air Force 1', 'Nike Air Max', 'Nike Dunk', 'Nike кросівки ціна', 'Nike Україна'],
  },
};

/**
 * Функція для отримання SEO-контенту
 */
export function getCategorySEOContent(categorySlug: string) {
  return CATEGORY_SEO_CONTENT[categorySlug] || null;
}
