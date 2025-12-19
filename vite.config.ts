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
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // React core libraries
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'react-vendor';
          }
          
          // React Router
          if (id.includes('node_modules/react-router')) {
            return 'router';
          }
          
          // React Query
          if (id.includes('@tanstack/react-query')) {
            return 'query';
          }
          
          // All Radix UI components in single chunk
          if (id.includes('@radix-ui')) {
            return 'radix-ui';
          }
          
          // Icons (both lucide and react-icons)
          if (id.includes('lucide-react') || id.includes('react-icons')) {
            return 'icons';
          }
          
          // i18n libraries
          if (id.includes('i18next') || id.includes('react-i18next')) {
            return 'i18n';
          }
          
          // Utility libraries
          if (id.includes('clsx') || id.includes('tailwind-merge') || 
              id.includes('class-variance-authority')) {
            return 'utils';
          }
          
          // Form libraries
          if (id.includes('react-hook-form') || id.includes('@hookform')) {
            return 'forms';
          }
          
          // Large vendor libraries
          if (id.includes('axios')) {
            return 'axios';
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
