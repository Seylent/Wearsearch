import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode, command }) => {
  // loadEnv ensures VITE_* vars are available here (do not rely on process.env)
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  const proxyTarget = env.VITE_API_PROXY_TARGET || 'http://localhost:3000';
  const devPort = Number(env.VITE_DEV_PORT || 5173) || 5173;

  return ({
  server: {
    host: "0.0.0.0",
    port: devPort,
    strictPort: false,
    // Allow ngrok only in development
    allowedHosts: mode === 'development' 
      ? [
          'localhost',
          '.ngrok.io',
          '.ngrok-free.dev',
          'parasynaptic-kim-hippological.ngrok-free.dev'
        ]
      : undefined,
    // Proxy API requests during dev server runs.
    // This keeps frontend requests on :8080 while forwarding /api/* to backend :3000.
    proxy: command === 'serve'
      ? {
          '/api': {
            target: proxyTarget,
            changeOrigin: true,
            secure: false,
            ws: true,
          },
          // Redirect sitemap.xml to backend
          '/sitemap.xml': {
            target: proxyTarget,
            changeOrigin: true,
            secure: false,
            rewrite: (_path) => '/api/v1/sitemap.xml',
          },
          // Redirect robots.txt to backend
          '/robots.txt': {
            target: proxyTarget,
            changeOrigin: true,
            secure: false,
            rewrite: (_path) => '/api/v1/robots.txt',
          },
        }
      : undefined,
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    target: 'esnext',
    minify: 'esbuild',
    cssMinify: true,
    reportCompressedSize: true, // Show sizes
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
          router: ['react-router-dom'],
          query: ['@tanstack/react-query'],
          i18n: ['i18next', 'react-i18next'],
          framer: ['framer-motion'],
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
    sourcemap: false,
    chunkSizeWarningLimit: 500,
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query',
      'i18next',
      'react-i18next',
      'lucide-react',
      'zod',
      'react-hook-form',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-select',
      '@radix-ui/react-checkbox',
      '@radix-ui/react-label',
      '@radix-ui/react-toast',
      '@radix-ui/react-tooltip',
    ],
    esbuildOptions: {
      target: 'esnext',
    },
  },
});
});
