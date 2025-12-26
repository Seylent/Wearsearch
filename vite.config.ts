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
          // React core libraries - keep small for initial load
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) {
            if (id.includes('node_modules/react-dom/client')) {
              return 'react-core';
            }
            return 'react-core';
          }
          
          // React Router - defer
          if (id.includes('node_modules/react-router')) {
            return 'router';
          }
          
          // React Query - defer since data fetches happen after mount
          if (id.includes('@tanstack/react-query')) {
            return 'query';
          }
          
          // Radix UI - split into smaller chunks by component
          if (id.includes('@radix-ui/react-dialog')) {
            return 'ui-dialog';
          }
          if (id.includes('@radix-ui/react-dropdown')) {
            return 'ui-dropdown';
          }
          if (id.includes('@radix-ui')) {
            return 'ui-radix';
          }
          
          // Icons - defer, not needed for initial render
          if (id.includes('lucide-react')) {
            return 'icons-lucide';
          }
          if (id.includes('react-icons')) {
            return 'icons-react';
          }
          
          // i18n libraries - will be loaded async
          if (id.includes('i18next') || id.includes('react-i18next')) {
            return 'i18n';
          }
          
          // Utility libraries - small, can be in vendor
          if (id.includes('clsx') || id.includes('tailwind-merge') || 
              id.includes('class-variance-authority')) {
            return 'utils';
          }
          
          // Form libraries - defer
          if (id.includes('react-hook-form') || id.includes('@hookform')) {
            return 'forms';
          }
          
          // Axios - defer
          if (id.includes('axios')) {
            return 'axios';
          }
          
          // Charts - defer completely
          if (id.includes('recharts')) {
            return 'charts';
          }
          
          // All other node_modules
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
      'axios',
      'lucide-react',
    ],
  },
}));
