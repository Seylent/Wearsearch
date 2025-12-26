/**
 * Application Entry Point
 * Optimized for fast initial render
 */

import { createRoot } from 'react-dom/client';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found');
}

// Render immediately without waiting for i18n
createRoot(rootElement).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);

// Initialize i18n asynchronously after first render
import('./i18n').catch(err => {
  console.error('Failed to load i18n:', err);
});
