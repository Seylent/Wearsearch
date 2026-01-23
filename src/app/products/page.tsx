import { Suspense } from 'react';
import { Metadata } from 'next';
import { generateSearchMetadata } from '@/lib/seo/metadata-utils';
import { shouldIndexPage } from '@/lib/seo/helpers';
import { fetchBackendJson } from '@/lib/backendFetch';
import { JsonLd, generateBreadcrumbSchema } from '@/lib/seo/structured-data';

// Components
import { ProductsContent } from '@/components/ProductsContent';

// Динамічний metadata залежно від фільтрів
export async function generateMetadata({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}): Promise<Metadata> {
  const params = new URLSearchParams();

  // Конвертуємо searchParams в URLSearchParams
  Object.entries(searchParams).forEach(([key, value]) => {
    if (value) {
      if (Array.isArray(value)) {
        value.forEach(v => params.append(key, v));
      } else {
        params.set(key, value);
      }
    }
  });

  const shouldIndex = shouldIndexPage('/products', params);
  const categoryType = typeof searchParams.type === 'string' ? searchParams.type : undefined;

  // Якщо це SEO сторінка категорії - отримуємо дані з API
  if (shouldIndex && categoryType) {
    try {
      const res = await fetchBackendJson<any>(`/categories/${categoryType}?lang=uk`, {
        next: { revalidate: 3600 },
      });

      if (res) {
        const data = res.data;
        const category = data.category || data.data?.category || data;

        return {
          title: category.seo_title || `${category.name} | Wearsearch`,
          description: category.seo_description || category.description,
          alternates: {
            canonical: category.canonical_url,
          },
          robots: {
            index: true,
            follow: true,
          },
          openGraph: {
            title: category.seo_title || category.name,
            description: category.seo_description || category.description,
            type: 'website',
          },
        };
      }
    } catch (error) {
      console.error('Error fetching category metadata:', error);
    }
  }

  // Для фільтрованих сторінок - noindex
  return generateSearchMetadata();
}

// Server Component
export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>
      }
    >
      <JsonLd
        data={generateBreadcrumbSchema([
          { name: 'Головна', url: process.env.NEXT_PUBLIC_SITE_URL || 'https://wearsearch.com' },
          {
            name: 'Товари',
            url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://wearsearch.com'}/products`,
          },
        ])}
      />
      <ProductsContent />
    </Suspense>
  );
}
