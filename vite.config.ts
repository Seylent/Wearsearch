import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "0.0.0.0",
    port: 8080,
    // Allow ngrok only in development
    allowedHosts: mode === 'development' 
      ? [
          'localhost',
          '.ngrok.io',
          '.ngrok-free.dev',
          'parasynaptic-kim-hippological.ngrok-free.dev'
        ]
      : undefined,
    proxy: mode === 'development' 
      ? {
          '/api': {
            target: process.env.VITE_API_PROXY_TARGET || 'http://localhost:3000',
            changeOrigin: true,
            secure: false,
            ws: true,
          }
        }
      : undefined,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    target: 'esnext',
    minify: 'esbuild',
    cssMinify: true,
    reportCompressedSize: false, // Faster builds
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Stable vendor chunk strategy - fewer chunks, stable hydration
          
          // Core React dependencies - keep together for stable bootstrap
          if (id.includes('node_modules/react') || 
              id.includes('node_modules/react-dom') ||
              id.includes('node_modules/react-router') ||
              id.includes('@tanstack/react-query')) {
            return 'vendor-react';
          }
          
          // i18n as separate chunk (moderate size)
          if (id.includes('i18next') || id.includes('react-i18next')) {
            return 'vendor-i18n';
          }
          
          // UI library (Radix + Lucide)
          if (id.includes('@radix-ui') || id.includes('lucide-react')) {
            return 'vendor-ui';
          }
          
          // All other node_modules in vendor
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
        // Optimize chunk sizes
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
    sourcemap: mode === 'development',
    chunkSizeWarningLimit: 600, // Reduced from 1000
    // Enable CSS code splitting
    cssCodeSplit: true,
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query',
      'i18next',
      'react-i18next',
    ],
  },
}));
