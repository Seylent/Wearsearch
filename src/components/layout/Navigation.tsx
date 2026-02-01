'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { UserProfileMenu } from '@/components/UserProfileMenu';
const SearchDropdown = dynamic(
  () => import('@/features/search/components').then(mod => mod.SearchDropdown),
  {
    ssr: false,
    loading: () => null,
  }
);
import { LanguageSelector } from '@/components/LanguageSelector';
import { CurrencySwitch } from '@/components/common/CurrencySwitch';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useNavigationState } from '@/features/auth/hooks/useNavigationState';
import { Search, User as UserIcon, Menu, X } from 'lucide-react';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { useEffect, useState } from 'react';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const Navigation: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useTranslation();

  // 🔥 Попередження hydration error - тільки на клієнті
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Use centralized auth hook — лише після mount
  const { user, canAccessStoreMenu, canAccessAdminPanel } = useAuth();
  const userRole = isRecord(user) && typeof user.role === 'string' ? user.role : undefined;

  // Use navigation state hook
  const nav = useNavigationState();

  const handleLogoClick = () => {
    if (pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      router.push('/');
    }
  };

  const navLinks = [
    { name: t('nav.allItems'), href: '/products' },
    { name: t('nav.stores'), href: '/stores' },
    { name: t('nav.about'), href: '/about' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-4 md:pt-6 px-2 sm:px-4">
      <nav
        className="flex items-center justify-between gap-0 rounded-full border border-foreground/20 bg-foreground/90 text-background backdrop-blur-2xl shadow-[0_10px_30px_rgba(0,0,0,0.25)] max-w-7xl w-full overflow-hidden dark:border-zinc-700/80 dark:bg-zinc-900/80 dark:text-white dark:shadow-[0_8px_32px_rgba(0,0,0,0.6)]"
        role="navigation"
        aria-label={t('aria.mainNavigation')}
        suppressHydrationWarning
      >
        {/* Left Section - Logo */}
        <button
          className="flex items-center gap-2.5 group px-4 sm:px-4 md:px-6 py-2.5 md:py-2 border-r border-background/20 md:hover:bg-background/10 active:bg-background/10 transition-colors focus-visible:ring-2 focus-visible:ring-background focus-visible:ring-offset-2 focus-visible:ring-offset-foreground dark:border-zinc-700/60 dark:md:hover:bg-zinc-800/50 dark:active:bg-zinc-800/50 dark:focus-visible:ring-white dark:focus-visible:ring-offset-zinc-900"
          onClick={handleLogoClick}
          aria-label={t('aria.navigateToHomepage')}
          suppressHydrationWarning
        >
          <span
            className="flex items-center leading-none translate-y-[1px] sm:translate-y-0 text-background text-base sm:text-lg md:text-xl uppercase tracking-wide dark:text-white"
            style={{ fontFamily: "'Youre Gone', Outfit, system-ui, sans-serif" }}
          >
            Wearsearch
          </span>
        </button>

        {/* Center Section - Navigation Links (Desktop) */}
        <div className="hidden md:flex items-center gap-1 flex-1 justify-center px-6 py-2 border-r border-background/20 dark:border-zinc-700/60">
          {navLinks.map((link, index) => (
            <Link
              key={link.name}
              href={link.href}
              className={`px-3 py-1 text-sm font-medium transition-all duration-300 rounded-full ${
                pathname === link.href
                  ? 'text-background bg-background/15 dark:text-white dark:bg-zinc-800/90'
                  : 'text-background/70 hover:text-background hover:bg-background/10 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-zinc-800/60'
              } ${index === 0 ? 'neon-text' : ''}`}
            >
              {link.name}
            </Link>
          ))}
          <Link
            href="/contacts"
            className={`px-4 py-2 text-sm font-medium transition-all duration-300 rounded-full ${
              pathname === '/contacts'
                ? 'text-background bg-background/15 shadow-[0_0_15px_rgba(0,0,0,0.2)] dark:text-white dark:bg-white/10 dark:shadow-[0_0_15px_rgba(255,255,255,0.2)]'
                : 'text-background/70 hover:text-background hover:bg-background/10 hover:shadow-[0_0_15px_rgba(0,0,0,0.2)] dark:text-white/70 dark:hover:text-white dark:hover:bg-white/10 dark:hover:shadow-[0_0_15px_rgba(255,255,255,0.2)]'
            }`}
          >
            {t('nav.contacts')}
          </Link>
          {isMounted && canAccessStoreMenu && (
            <Link
              href="/store-menu"
              className={`px-3 py-1 text-sm font-medium transition-all duration-300 rounded-full ${
                pathname === '/store-menu' || pathname.startsWith('/store-menu/')
                  ? 'text-background bg-background/15 dark:text-white dark:bg-zinc-800/90'
                  : 'text-background/70 hover:text-background hover:bg-background/10 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-zinc-800/60'
              }`}
            >
              {t('nav.storeMenu', 'Мій магазин')}
            </Link>
          )}

          {isMounted && canAccessAdminPanel && (
            <Link
              href="/admin"
              className={`px-3 py-1 text-sm font-medium transition-all duration-300 rounded-full ${
                pathname === '/admin'
                  ? 'text-background bg-background/15 dark:text-white dark:bg-zinc-800/90'
                  : 'text-background/70 hover:text-background hover:bg-background/10 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-zinc-800/60'
              }`}
            >
              {t('nav.admin')}
            </Link>
          )}
        </div>

        {/* Right Section - Search, Language, Menu & Profile */}
        <div className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 md:px-6 py-2 md:py-2">
          {/* Mobile Menu Button */}
          <button
            className="md:hidden min-w-[40px] min-h-[40px] w-10 h-10 rounded-full flex items-center justify-center active:bg-background/10 active:scale-95 transition-all duration-150 touch-manipulation group dark:active:bg-zinc-800/70"
            onClick={nav.toggleMobileMenu}
            aria-label={nav.mobileMenuOpen ? t('aria.closeMenu') : t('aria.openMenu')}
            aria-expanded={nav.mobileMenuOpen}
          >
            {nav.mobileMenuOpen ? (
              <X className="w-5 h-5 text-background/70 md:group-hover:text-background transition-colors dark:text-zinc-400 dark:md:group-hover:text-white" />
            ) : (
              <Menu className="w-5 h-5 text-background/70 md:group-hover:text-background transition-colors dark:text-zinc-400 dark:md:group-hover:text-white" />
            )}
          </button>
          {/* Search Button */}
          <button
            className="min-w-[40px] min-h-[40px] w-10 h-10 md:w-9 md:h-9 md:min-w-0 md:min-h-0 rounded-full flex items-center justify-center md:hover:bg-background/10 active:bg-background/10 active:scale-95 transition-all duration-150 touch-manipulation group dark:md:hover:bg-zinc-800/70 dark:active:bg-zinc-800/70"
            onClick={nav.openSearch}
            aria-label={t('aria.openSearch')}
          >
            <Search className="w-5 h-5 text-background/70 md:group-hover:text-background transition-colors dark:text-zinc-400 dark:md:group-hover:text-white" />
          </button>

          {/* Theme Toggle */}
          <ThemeToggle className="h-10 w-10 md:h-9 md:w-9 bg-background/10 hover:bg-background/20 text-background border-background/20 dark:bg-foreground/5 dark:hover:bg-foreground/10 dark:text-foreground dark:border-border/60" />

          <LanguageSelector />

          {/* Currency Selector */}
          <div className="hidden sm:block">
            <CurrencySwitch
              variant="ghost"
              size="sm"
              className="h-9 w-auto px-2 text-sm text-background/70 hover:text-background hover:bg-background/10 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-zinc-800/70"
            />
          </div>

          {/* Auth state with hydration safety */}
          <div suppressHydrationWarning>
            {isMounted ? (
              // ✨ Client-only auth content
              user ? (
                <UserProfileMenu />
              ) : (
                <button
                  className="min-w-[40px] min-h-[40px] w-10 h-10 md:w-9 md:h-9 md:min-w-0 md:min-h-0 rounded-full flex items-center justify-center md:hover:bg-background/10 active:bg-background/10 active:scale-95 transition-all duration-150 touch-manipulation group dark:md:hover:bg-zinc-800/70 dark:active:bg-zinc-800/70"
                  onClick={() => router.push('/auth')}
                  aria-label={t('aria.signIn')}
                >
                  <UserIcon className="w-5 h-5 text-background/70 md:group-hover:text-background transition-colors dark:text-zinc-400 dark:md:group-hover:text-white" />
                </button>
              )
            ) : (
              // 🚀 SSR-safe placeholder - однаковий на сервері і клієнті
              <button
                className="min-w-[40px] min-h-[40px] w-10 h-10 md:w-9 md:h-9 md:min-w-0 md:min-h-0 rounded-full flex items-center justify-center md:hover:bg-background/10 active:bg-background/10 active:scale-95 transition-all duration-150 touch-manipulation group dark:md:hover:bg-zinc-800/70 dark:active:bg-zinc-800/70"
                onClick={() => router.push('/auth')}
                aria-label={t('aria.signIn')}
              >
                <UserIcon className="w-5 h-5 text-background/70 md:group-hover:text-background transition-colors dark:text-zinc-400 dark:md:group-hover:text-white" />
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Menu - Bottom Sheet */}
      {nav.mobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="md:hidden fixed inset-0 bg-black/50 z-40"
            onClick={nav.closeMobileMenu}
            aria-hidden="true"
          />
          {/* Bottom Sheet Menu - slides up from bottom, stops below navbar */}
          <div
            className="md:hidden fixed bottom-0 left-0 right-0 top-[420px] bg-background text-foreground backdrop-blur-2xl rounded-t-3xl border-t border-border shadow-[0_-10px_40px_rgba(0,0,0,0.3)] overflow-hidden z-50 dark:bg-zinc-900 dark:text-white dark:border-zinc-700/80 animate-slide-up"
            role="menu"
            aria-label={t('aria.mainNavigation')}
          >
            {/* Handle bar */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-12 h-1.5 bg-foreground/20 rounded-full dark:bg-zinc-700" />
            </div>
            {/* User info header if logged in */}
            {isMounted && user && (
              <div className="px-6 py-4 border-b border-border/50 dark:border-zinc-800/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-foreground/10 flex items-center justify-center dark:bg-zinc-800">
                    <UserIcon className="w-5 h-5 text-foreground/70 dark:text-zinc-400" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium text-sm">{user.email || 'User'}</span>
                    <span className="text-xs text-foreground/50 dark:text-zinc-500">
                      {userRole || 'Buyer'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col max-h-[70vh] overflow-y-auto">
              {navLinks.map(link => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={nav.closeMobileMenu}
                  className={`px-6 py-4 min-h-[56px] text-base font-medium transition-all duration-150 border-b border-border/30 touch-manipulation active:scale-[0.98] dark:border-zinc-800/50 flex items-center gap-3 ${
                    pathname === link.href
                      ? 'text-foreground bg-foreground/5 dark:text-white dark:bg-zinc-800/60'
                      : 'text-foreground/70 active:text-foreground active:bg-foreground/5 dark:text-zinc-300 dark:active:text-white dark:active:bg-zinc-800/30'
                  }`}
                >
                  {link.name}
                </Link>
              ))}

              {/* Currency Switch in mobile menu */}
              <div className="px-6 py-4 border-b border-border/30 dark:border-zinc-800/50">
                <div className="flex items-center justify-between">
                  <span className="text-base font-medium text-foreground/70 dark:text-zinc-300">
                    {t('common.currency', 'Currency')}
                  </span>
                  <CurrencySwitch
                    variant="ghost"
                    size="default"
                    showExchangeRate={false}
                    layout="row"
                    className="h-10 px-4 text-foreground/70 hover:text-foreground hover:bg-foreground/5 dark:text-zinc-300 dark:hover:text-white dark:hover:bg-zinc-800/30 rounded-full border border-border/50"
                    containerClassName="items-center"
                  />
                </div>
              </div>

              <button
                className="px-6 py-4 min-h-[56px] text-base font-medium transition-all duration-150 text-foreground/70 active:text-foreground active:bg-foreground/5 text-left border-b border-border/30 dark:text-zinc-300 dark:active:text-white dark:active:bg-zinc-800/30 dark:border-zinc-800/50 flex items-center gap-3"
                onClick={() => {
                  nav.closeMobileMenu();
                  document
                    .querySelector('[data-contacts-trigger]')
                    ?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
                }}
              >
                {t('nav.contacts')}
              </button>

              {isMounted && canAccessStoreMenu && (
                <Link
                  href="/store-menu"
                  onClick={nav.closeMobileMenu}
                  className={`px-6 py-4 min-h-[56px] text-base font-medium transition-all duration-150 border-b border-border/30 dark:border-zinc-800/50 flex items-center gap-3 ${
                    pathname === '/store-menu' || pathname.startsWith('/store-menu/')
                      ? 'text-foreground bg-foreground/5 dark:text-white dark:bg-zinc-800/60'
                      : 'text-foreground/70 active:text-foreground active:bg-foreground/5 dark:text-zinc-300 dark:active:text-white dark:active:bg-zinc-800/30'
                  }`}
                >
                  {t('nav.storeMenu', 'Мій магазин')}
                </Link>
              )}

              {isMounted && canAccessAdminPanel && (
                <Link
                  href="/admin"
                  onClick={nav.closeMobileMenu}
                  className={`px-6 py-4 min-h-[56px] text-base font-medium transition-all duration-150 border-b border-border/30 dark:border-zinc-800/50 flex items-center gap-3 ${
                    pathname === '/admin'
                      ? 'text-foreground bg-foreground/5 dark:text-white dark:bg-zinc-800/60'
                      : 'text-foreground/70 active:text-foreground active:bg-foreground/5 dark:text-zinc-300 dark:active:text-white dark:active:bg-zinc-800/30'
                  }`}
                >
                  {t('nav.admin')}
                </Link>
              )}

              {/* Sign Out button if logged in */}
              {isMounted && user && (
                <button
                  className="px-6 py-4 min-h-[56px] text-base font-medium transition-all duration-150 text-destructive/80 active:text-destructive active:bg-destructive/5 text-left flex items-center gap-3"
                  onClick={() => {
                    nav.closeMobileMenu();
                    // Trigger sign out
                    router.push('/auth');
                  }}
                >
                  {t('auth.signOut', 'Sign Out')}
                </button>
              )}
            </div>
          </div>
        </>
      )}

      {/* Search Dropdown */}
      {nav.showSearch && <SearchDropdown onClose={nav.closeSearch} />}
    </header>
  );
};

export default Navigation;

export { Navigation };
