import { Suspense } from 'react';
import { Metadata } from 'next';
import ContactsContent from '@/components/pages/ContactsContent';
import { JsonLd, generateBreadcrumbSchema } from '@/lib/seo/structured-data';

// SEO метадані для сторінки контактів
export const metadata: Metadata = {
  title: "Контакти - Wearsearch | Зв'яжіться з нами",
  description:
    "Зв'яжіться з командою Wearsearch. Ми готові допомогти вам з будь-якими питаннями щодо пошуку товарів, порівняння цін та покупок.",
  keywords: [
    'контакти Wearsearch',
    'підтримка клієнтів',
    "зв'язатися з нами",
    'допомога покупцям',
    'служба підтримки',
    'питання про товари',
    'технічна підтримка',
  ],
  openGraph: {
    title: 'Контакти - Wearsearch',
    description:
      "Маєте питання? Зв'яжіться з нашою командою підтримки. Ми завжди готові допомогти!",
    type: 'website',
    url: '/contacts',
    images: [
      {
        url: '/images/contacts-og.jpg',
        width: 1200,
        height: 630,
        alt: "Контакти Wearsearch - зв'яжіться з нами",
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Контакти - Wearsearch',
    description: 'Потрібна допомога? Наша команда готова відповісти на всі ваші питання.',
    images: ['/images/contacts-og.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: '/contacts',
    languages: {
      uk: '/contacts',
      en: '/en/contacts',
    },
  },
};

export default function ContactsPage() {
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
            name: 'Контакти',
            url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://wearsearch.com'}/contacts`,
          },
        ])}
      />
      <ContactsContent />
    </Suspense>
  );
}
