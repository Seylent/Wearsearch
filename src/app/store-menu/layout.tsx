/**
 * Store Menu Root Layout
 * Provides StoreContext for all store-menu pages
 */

import { StoreProvider } from '@/features/store-menu/context/StoreContext';

export default function StoreMenuRootLayout({ children }: { children: React.ReactNode }) {
  return <StoreProvider>{children}</StoreProvider>;
}
