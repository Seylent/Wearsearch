/**
 * Application Entry Point
 * Optimized for fast initial render
 */

import { createRoot } from 'react-dom/client';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';
import './i18n';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found');
}

// Render immediately
createRoot(rootElement).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);

// Hide static shell once React is rendered
document.body.classList.add('react-loaded');
