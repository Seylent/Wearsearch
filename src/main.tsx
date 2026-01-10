/**
 * Application Entry Point
 * Optimized for fast initial render
 */

import { createRoot } from 'react-dom/client';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';
import { initWebVitals } from './utils/webVitals';
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

// Prevent layout shift when opening dropdowns/modals
// Save original body width and apply it to prevent shift
let originalBodyWidth: string | null = null;
let scrollbarWidth = 0;

const preventLayoutShift = () => {
  // Calculate scrollbar width
  scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
  document.documentElement.style.setProperty('--scrollbar-width', `${scrollbarWidth}px`);
  
  // Monitor body overflow changes
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
        const bodyStyle = window.getComputedStyle(document.body);
        const overflow = bodyStyle.overflow;
        
        // If overflow is hidden (modal opened), compensate for scrollbar
        if (overflow === 'hidden' || bodyStyle.paddingRight !== '0px') {
          if (!originalBodyWidth) {
            originalBodyWidth = document.body.style.width;
          }
          // Force body to maintain its width
          document.body.style.width = `calc(100vw - ${scrollbarWidth}px)`;
        } else {
          // Restore original width
          if (originalBodyWidth !== null) {
            document.body.style.width = originalBodyWidth;
            originalBodyWidth = null;
          }
        }
      }
    });
  });
  
  observer.observe(document.body, {
    attributes: true,
    attributeFilter: ['style'],
  });
};

preventLayoutShift();
window.addEventListener('resize', () => {
  scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
  document.documentElement.style.setProperty('--scrollbar-width', `${scrollbarWidth}px`);
});

// Initialize Web Vitals monitoring
initWebVitals();
