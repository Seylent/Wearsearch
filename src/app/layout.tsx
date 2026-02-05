import type { Metadata, Viewport } from 'next';
import { Montserrat } from 'next/font/google';
import { NextProviders } from './providers';
import Navigation from '@/components/layout/Navigation';
import Footer from '@/components/layout/Footer';
import { GlobalBackground } from '@/components/layout/GlobalBackground';
import { ResourceHintsInitializer } from '@/components/ResourceHintsInitializer';
import { Analytics } from '@/components/Analytics';
import { ClientOnlyOverlays } from '@/components/ClientOnlyOverlays';
import { CookieBanner } from '@/components/CookieBanner';
import { getServerLanguage } from '@/utils/languageStorage';
import './globals.css';

const montserrat = Montserrat({
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '500', '600', '700', '800', '900'],
  display: 'swap',
  variable: '--font-montserrat',
});

const metadataBaseUrl = new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://wearsearch.com');

// Basic metadata - pages will override this
export const metadata: Metadata = {
  title: {
    default: 'Wearsearch - Discover Exceptional Fashion',
    template: '%s | Wearsearch',
  },
  description:
    'Discover and shop the latest fashion trends. Find clothing, footwear, and accessories from top stores with worldwide shipping.',
  keywords: [
    'fashion',
    'clothing',
    'shopping',
    'streetwear',
    'designer',
    'brands',
    'online shopping',
  ],
  metadataBase: metadataBaseUrl,
  openGraph: {
    title: 'Wearsearch - Discover Exceptional Fashion',
    description:
      'Discover and shop the latest fashion trends. Find clothing, footwear, and accessories from top stores with worldwide shipping.',
    type: 'website',
    siteName: 'Wearsearch',
    url: metadataBaseUrl,
    images: [
      {
        url: '/og-image.svg',
        width: 1200,
        height: 630,
        alt: 'Wearsearch',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Wearsearch - Discover Exceptional Fashion',
    description:
      'Discover and shop the latest fashion trends. Find clothing, footwear, and accessories from top stores with worldwide shipping.',
    images: ['/og-image.svg'],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/favicon.ico',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default async function RootLayout({ children }: { readonly children: React.ReactNode }) {
  const htmlLang = await getServerLanguage();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://wearsearch.com';
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID;
  const preconnectOrigins = new Set<string>();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (apiUrl && apiUrl.startsWith('http')) {
    try {
      preconnectOrigins.add(new URL(apiUrl).origin);
    } catch {
      // Ignore invalid URL
    }
  }
  preconnectOrigins.add('https://images.wearsearch.com');
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Wearsearch',
    url: siteUrl,
    logo: `${siteUrl}/logow1.webp`,
  };
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Wearsearch',
    url: siteUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${siteUrl}/products?query={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <html lang={htmlLang} suppressHydrationWarning>
      <head>
        {[...preconnectOrigins].map(origin => (
          <link key={origin} rel="preconnect" href={origin} />
        ))}
      </head>
      <body
        className={`relative min-h-screen bg-transparent text-foreground font-sans antialiased selection:bg-foreground/20 ${montserrat.variable}`}
        suppressHydrationWarning
      >
        {gtmId ? (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
              height="0"
              width="0"
              style={{ display: 'none', visibility: 'hidden' }}
              title="gtm"
            />
          </noscript>
        ) : null}
        {/* Skip to main content link for accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-background focus:text-foreground focus:rounded-md focus:outline-none focus:ring-2 focus:ring-foreground"
        >
          Skip to main content
        </a>

        <GlobalBackground />
        <NextProviders initialLanguage={htmlLang}>
          <ResourceHintsInitializer />
          <ClientOnlyOverlays />
          <Navigation />
          <Analytics />
          <CookieBanner />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
          />
          <main id="main-content" className="flex-1 w-full min-h-screen">
            {children}
          </main>
          <Footer />
        </NextProviders>
      </body>
    </html>
  );
}
