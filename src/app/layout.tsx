import type { Metadata, Viewport } from 'next';
import { headers } from 'next/headers';
import { Inter } from 'next/font/google';
import { NextProviders } from './providers';
import { getServerCurrency } from '@/utils/currencyStorage';
import Navigation from '@/components/layout/Navigation';
import Footer from '@/components/layout/Footer';
import { ResourceHintsInitializer } from '@/components/ResourceHintsInitializer';
import { Analytics } from '@/components/Analytics';
import { ClientOnlyOverlays } from '@/components/ClientOnlyOverlays';
import { CookieBanner } from '@/components/CookieBanner';
import './globals.css';

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  display: 'swap',
  variable: '--font-inter',
});

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
  metadataBase: new URL('https://wearsearch.com'), // Replace with actual domain
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/favicon.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default async function RootLayout({ children }: { readonly children: React.ReactNode }) {
  // Keep SSR deterministic; client updates <html lang> after hydration.
  const htmlLang = 'uk';
  const initialCurrency = await getServerCurrency();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://wearsearch.com';
  const nonce = (await headers()).get('x-nonce') || undefined;
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Wearsearch',
    url: siteUrl,
    logo: `${siteUrl}/favicon.png`,
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
      <head>{nonce ? <meta name="csp-nonce" content={nonce} /> : null}</head>
      <body
        className={`min-h-screen bg-background text-foreground font-sans antialiased overflow-x-hidden selection:bg-foreground/20 ${inter.variable}`}
        suppressHydrationWarning
      >
        {/* Skip to main content link for accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-white focus:text-black focus:rounded-md focus:outline-none focus:ring-2 focus:ring-white"
        >
          Skip to main content
        </a>

        <NextProviders initialCurrency={initialCurrency}>
          <ResourceHintsInitializer />
          <ClientOnlyOverlays />
          <Navigation />
          <Analytics />
          <CookieBanner />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
            nonce={nonce}
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
            nonce={nonce}
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
