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
          // Simplified chunk strategy - fewer chunks, fewer requests
          
          // All node_modules in one vendor chunk for fewer HTTP requests
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
    chunkSizeWarningLimit: 1000, // Allow larger chunks to reduce HTTP requests
    // Disable CSS code splitting - combine all CSS into one file
    cssCodeSplit: false,
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
}));
