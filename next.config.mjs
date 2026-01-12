/* eslint-env node */
import bundleAnalyzer from '@next/bundle-analyzer';

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Performance optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
  
  // Enable optimized loading
  reactStrictMode: true,
  swcMinify: true,
  
  // Production optimizations
  poweredByHeader: false,
  generateEtags: true,
  
  // Image optimization
  images: {
    domains: ['wearsearch.com', 'images.wearsearch.com'],
    remotePatterns: [
        {
            protocol: 'https',
            hostname: '**',
        },
    ],
    formats: ['image/webp', 'image/avif'],
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
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || process.env.API_PROXY_TARGET || 'http://localhost:3000';
    console.log('[Next.js] API Proxy target:', backendUrl);
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
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },

  // Temporarily skip TypeScript checking during build
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Skip ESLint during build
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default withBundleAnalyzer(nextConfig);
