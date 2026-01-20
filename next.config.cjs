const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['example.com', 'localhost'],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5173',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3000/api/:path*',
      },
      {
        source: '/api/upload/:path*',
        destination: 'http://localhost:3000/api/upload/:path*',
      },
      {
        source: '/api/v1/:path*',
        destination: 'http://localhost:3000/api/v1/:path*',
      },
    ];
  },
  experimental: {
    appDir: true,
    // Helps reduce bundle size for certain libraries by rewriting imports.
    optimizePackageImports: ['lucide-react', 'date-fns'],
  },

  // Reduce client JS size in production.
  compiler:
    process.env.NODE_ENV === 'production'
      ? {
          removeConsole: {
            exclude: ['error'],
          },
        }
      : undefined,
};

module.exports = withBundleAnalyzer(nextConfig);
