/**
 * Приклад SEO-оптимізованої сторінки категорії
 * Демонструє правильну структуру H1-H3, metadata та SEO-тексти
 */

import { Suspense } from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { JsonLd, generateBreadcrumbSchema } from '@/lib/seo/structured-data';
import { SEOTextSection } from '@/components/seo/SEOTextSection';

interface CategoryPageProps {
  params: {
    slug: string;
  };
}

// Генерація metadata для SEO
export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = params;
  
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    const lang = 'uk'; // або отримати з headers/cookies
    const response = await fetch(`${API_URL}/api/categories/${slug}?lang=${lang}`, {
      next: { revalidate: 3600 }
    });

    if (!response.ok) {
      return {
        title: 'Категорія не знайдена | Wearsearch',
        description: 'Ця категорія не знайдена',
        robots: { index: false, follow: true },
      };
    }

    const data = await response.json();
    const category = data.category || data;
    
    // Використовуємо SEO дані з бекенду
    return {
      title: category.seo_title || `${category.name} | Wearsearch`,
      description: category.seo_description || category.description,
      alternates: {
        canonical: category.canonical_url,
      },
      openGraph: {
        title: category.seo_title || category.name,
        description: category.seo_description || category.description,
        images: category.image_url ? [category.image_url] : [],
        type: 'website',
        siteName: 'Wearsearch',
        url: category.canonical_url,
      },
      twitter: {
        card: 'summary_large_image',
        title: category.seo_title || category.name,
        description: category.seo_description || category.description,
        images: category.image_url ? [category.image_url] : [],
      },
      robots: {
        index: true,
        follow: true,
      },
    };
  } catch (error) {
    console.error('Error generating category metadata:', error);
    return {
      title: 'Категорія | Wearsearch',
      description: 'Категорія товарів',
      robots: { index: false, follow: true },
    };
  }
}

// Основний компонент сторінки
export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = params;
  
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    
    // Отримуємо дані категорії
    const categoryResponse = await fetch(`${API_URL}/api/categories/${slug}?lang=uk`, {
      next: { revalidate: 3600 }
    });

    if (!categoryResponse.ok) {
      notFound();
    }

    const categoryData = await categoryResponse.json();
    const category = categoryData.category || categoryData;
    
    // Отримуємо товари категорії
    const productsResponse = await fetch(`${API_URL}/api/products?category=${slug}&limit=20`, {
      next: { revalidate: 1800 }
    });
    
    const products = productsResponse.ok ? await productsResponse.json() : [];
    
    // Structured Data для хлібних крихт
    const breadcrumbData = generateBreadcrumbSchema([
      { name: 'Головна', url: process.env.NEXT_PUBLIC_SITE_URL || 'https://wearsearch.com' },
      { name: 'Категорії', url: `${process.env.NEXT_PUBLIC_SITE_URL}/categories` },
      { name: category.name, url: `${process.env.NEXT_PUBLIC_SITE_URL}/categories/${slug}` },
    ]);

    return (
      <>
        {/* JSON-LD для хлібних крихт */}
        <JsonLd data={breadcrumbData} />
        
        <div className="min-h-screen bg-black text-white">
          {/* Hero секція з H1 */}
          <section className="pt-24 pb-12 px-4">
            <div className="max-w-7xl mx-auto">
              {/* Хлібні крихти */}
              <nav className="mb-6 text-sm" aria-label="Навігація">
                <ol className="flex items-center space-x-2 text-gray-400">
                  <li><a href="/" className="hover:text-white transition-colors">Головна</a></li>
                  <li>/</li>
                  <li><a href="/categories" className="hover:text-white transition-colors">Категорії</a></li>
                  <li>/</li>
                  <li className="text-white">{category.name}</li>
                </ol>
              </nav>

              {/* H1 - один на сторінку */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
                {category.name}
              </h1>
              
              {category.description && (
                <p className="text-xl text-gray-300 max-w-3xl">
                  {category.description}
                </p>
              )}
            </div>
          </section>

          {/* H2 - Порівняння цін */}
          <section className="py-8 px-4">
            <div className="max-w-7xl mx-auto">
              <h2 className="text-3xl font-bold mb-8">
                Порівняння цін на {category.name.toLowerCase()}
              </h2>
              
              {/* Тут буде компонент з товарами */}
              <Suspense fallback={
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
                </div>
              }>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {products.map((product: { id: string; image_url?: string; name: string; brand?: string; price: number }) => (
                    <div key={product.id} className="bg-zinc-900 rounded-lg p-4">
                      {/* Карточка товару */}
                      <a href={`/products/${product.id}`} className="block">
                        <img
                          src={product.image_url || '/placeholder.jpg'}
                          alt={product.name}
                          className="w-full h-48 object-cover rounded-lg mb-4"
                        />
                        <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                        <p className="text-gray-400 text-sm mb-2">{product.brand}</p>
                        <p className="text-xl font-bold">{product.price} ₴</p>
                      </a>
                    </div>
                  ))}
                </div>
              </Suspense>
            </div>
          </section>

          {/* H2 - Популярні моделі (якщо є) */}
          {products.length > 0 && (
            <section className="py-8 px-4">
              <div className="max-w-7xl mx-auto">
                <h2 className="text-3xl font-bold mb-6">
                  Популярні моделі {category.name.toLowerCase()}
                </h2>
                
                {/* Підкатегорії як H3 */}
                <div className="space-y-8">
                  <div>
                    <h3 className="text-2xl font-semibold mb-4">
                      Для чоловіків
                    </h3>
                    {/* Список товарів */}
                  </div>
                  
                  <div>
                    <h3 className="text-2xl font-semibold mb-4">
                      Для жінок
                    </h3>
                    {/* Список товарів */}
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* SEO-текст ПІД списком товарів (згідно ТЗ) */}
          {category.seo_text && (
            <SEOTextSection
              title={`Все про ${category.name.toLowerCase()}`}
              content={category.seo_text}
              keywords={category.seo_keywords || []}
            />
          )}
        </div>
      </>
    );
  } catch (error) {
    console.error('Error loading category:', error);
    notFound();
  }
}

// Генерація статичних параметрів для популярних категорій
export async function generateStaticParams() {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    const response = await fetch(`${API_URL}/api/categories?lang=uk`, {
      next: { revalidate: 86400 } // Оновлюємо раз на день
    });

    if (!response.ok) {
      return [];
    }

    const categories = await response.json();
    
    return categories.map((category: { slug: string }) => ({
      slug: category.slug,
    }));
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}
