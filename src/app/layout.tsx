import type { Metadata, Viewport } from 'next';
import { NextProviders } from './providers';
import Navigation from '@/components/layout/Navigation';
import Footer from '@/components/layout/Footer';
import NavigationProgress from '@/components/NavigationProgress';
import { ResourceHintsInitializer } from '@/components/ResourceHintsInitializer';
import "./globals.css";

// Basic metadata - pages will override this
export const metadata: Metadata = {
  title: {
    default: 'Wearsearch - Discover Exceptional Fashion',
    template: '%s | Wearsearch',
  },
  description: 'Discover and shop the latest fashion trends. Find clothing, footwear, and accessories from top stores with worldwide shipping.',
  keywords: ['fashion', 'clothing', 'shopping', 'streetwear', 'designer', 'brands', 'online shopping'],
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

export default function RootLayout({
  children,
}: {
  readonly children: React.ReactNode
}) {
  // Keep lang deterministic between server and client to avoid hydration warnings
  const htmlLang = 'uk';

  return (
    <html lang={htmlLang} className="dark" suppressHydrationWarning> 
      <head>
        {/* Preconnect to external domains for faster loading */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="//images.unsplash.com" />
        <link rel="dns-prefetch" href="//api.wearsearch.com" />
      </head>
      <body className="min-h-screen bg-black text-white font-sans antialiased overflow-x-hidden selection:bg-white/20" suppressHydrationWarning>
         {/* Skip to main content link for accessibility */}
         <a 
           href="#main-content"
           className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-white focus:text-black focus:rounded-md focus:outline-none focus:ring-2 focus:ring-white"
         >
           Skip to main content
         </a>
         
         <NextProviders>
             <ResourceHintsInitializer />
             <NavigationProgress />
             <Navigation />
             <main id="main-content" className="flex-1 w-full min-h-screen">
                {children}
             </main>
             <Footer />
         </NextProviders>
      </body>
    </html>
  );
}
