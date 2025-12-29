/**
 * Main Application Component
 */

import { AppProviders } from './app/providers';
import { AppRouter } from './app/router';
import SkipToContent from './components/SkipToContent';
import './index.css';

const App = () => (
  <>
    <SkipToContent />
    <AppProviders>
      <AppRouter />
    </AppProviders>
  </>
);

export default App;
