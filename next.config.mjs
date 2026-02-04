/* eslint-env node */
import bundleAnalyzer from '@next/bundle-analyzer';

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

const imageRemotePatterns = [
  { protocol: 'https', hostname: 'wearsearch.com' },
  { protocol: 'https', hostname: 'images.wearsearch.com' },
  { protocol: 'https', hostname: 'wearsearchs3.s3.eu-north-1.amazonaws.com' },
  { protocol: 'https', hostname: 'uehupppclvnmkuualmum.supabase.co' },
];

if (process.env.NODE_ENV !== 'production') {
  imageRemotePatterns.push({ protocol: 'http', hostname: 'localhost' });
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Performance optimizations
  compiler: {
    removeConsole:
      process.env.NODE_ENV === 'production'
        ? {
            exclude: ['error', 'warn'],
          }
        : false,
  },

  // Enable optimized loading
  reactStrictMode: true,

  // Production optimizations
  poweredByHeader: false,
  generateEtags: true,
  productionBrowserSourceMaps: false,

  // Image optimization
  images: {
    remotePatterns: imageRemotePatterns,
    formats: ['image/webp', 'image/avif'],
    qualities: [75, 90],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Code splitting and optimization
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-icons',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-tabs',
      '@radix-ui/react-toast',
      '@radix-ui/react-select',
      '@radix-ui/react-checkbox',
      '@radix-ui/react-accordion',
      '@radix-ui/react-alert-dialog',
      '@radix-ui/react-avatar',
      '@radix-ui/react-collapsible',
      '@radix-ui/react-context-menu',
      '@radix-ui/react-hover-card',
      '@radix-ui/react-label',
      '@radix-ui/react-menubar',
      '@radix-ui/react-navigation-menu',
      '@radix-ui/react-popover',
      '@radix-ui/react-progress',
      '@radix-ui/react-radio-group',
      '@radix-ui/react-scroll-area',
      '@radix-ui/react-separator',
      '@radix-ui/react-slider',
      'framer-motion',
      'date-fns',
    ],
    serverActions: {
      bodySizeLimit: '2mb',
    },
    // Optimize CSS
    optimizeCss: true,
    // Enable better tree-shaking
    optimizeServerReact: true,
  },

  // Compression
  compress: true,

  // API Rewrites - proxy /api/* to backend
  async rewrites() {
    const backendUrl =
      process.env.NEXT_PUBLIC_API_URL || process.env.API_PROXY_TARGET || 'http://localhost:3000';
    return [
      // Redirect /product/* to /products/* (singular to plural)
      {
        source: '/product/:id',
        destination: '/products/:id',
      },
      {
        source: '/store/:id',
        destination: '/stores/:id',
      },
      // API proxy
      {
        source: '/api/v1/:path*',
        destination: `${backendUrl}/api/v1/:path*`,
      },
      {
        source: '/api/upload/:path*',
        destination: `${backendUrl}/api/upload/:path*`,
      },
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },

  async headers() {
    const isDev = process.env.NODE_ENV !== 'production';
    const baseCsp =
      "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https://*.supabase.co https://*.amazonaws.com https://*.cloudfront.net https://wearsearch.com https://images.wearsearch.com; connect-src 'self' https://*.supabase.co https://api.wearsearch.com; font-src 'self'; frame-ancestors 'none'; base-uri 'self'; object-src 'none'";
    const devCsp =
      "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https://*.supabase.co https://*.amazonaws.com https://*.cloudfront.net https://wearsearch.com https://images.wearsearch.com; connect-src 'self' https://*.supabase.co https://api.wearsearch.com ws:; font-src 'self'; frame-ancestors 'none'; base-uri 'self'; object-src 'none'";
    const csp = isDev ? devCsp : baseCsp;
    return [
      {
        source: '/admin/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: csp,
          },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value:
              'accelerometer=(), autoplay=(), camera=(), clipboard-read=(), clipboard-write=(self), fullscreen=(self), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()',
          },
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
        ],
      },
      {
        source: '/checkout/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: csp,
          },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value:
              'accelerometer=(), autoplay=(), camera=(), clipboard-read=(), clipboard-write=(self), fullscreen=(self), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()',
          },
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
        ],
      },
    ];
  },

  typescript: {
    ignoreBuildErrors: false,
  },
};

export default withBundleAnalyzer(nextConfig);
