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
  const { user, isAdmin } = useAuth();

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
          {isMounted && isAdmin && (
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

      {/* Mobile Menu */}
      {nav.mobileMenuOpen && (
        <div
          className="md:hidden fixed top-20 left-2 right-2 bg-foreground/95 text-background backdrop-blur-2xl rounded-2xl border border-background/20 shadow-2xl overflow-hidden z-40 dark:bg-zinc-900/95 dark:text-white dark:border-zinc-700/80"
          role="menu"
          aria-label={t('aria.mainNavigation')}
        >
          <div className="flex flex-col">
            {navLinks.map(link => (
              <Link
                key={link.name}
                href={link.href}
                onClick={nav.closeMobileMenu}
                className={`px-6 py-4 min-h-[52px] text-base font-medium transition-all duration-150 border-b border-background/10 touch-manipulation active:scale-[0.98] dark:border-zinc-800/50 ${
                  pathname === link.href
                    ? 'text-background bg-background/10 dark:text-white dark:bg-zinc-800/60'
                    : 'text-background/70 active:text-background active:bg-background/10 dark:text-zinc-300 dark:active:text-white dark:active:bg-zinc-800/30'
                }`}
              >
                {link.name}
              </Link>
            ))}

            {/* Currency Switch in mobile menu */}
            <div className="px-6 py-3 border-b border-background/10 dark:border-zinc-800/50">
              <CurrencySwitch
                variant="ghost"
                size="default"
                showExchangeRate={false}
                layout="row"
                className="w-full justify-start h-10 text-background/70 hover:text-background hover:bg-background/10 dark:text-zinc-300 dark:hover:text-white dark:hover:bg-zinc-800/30"
                containerClassName="items-center w-full"
              />
            </div>

            <button
              className="px-6 py-3 text-base font-medium transition-all duration-300 text-background/70 active:text-background active:bg-background/10 text-left border-b border-background/10 dark:text-zinc-300 dark:active:text-white dark:active:bg-zinc-800/30 dark:border-zinc-800/50"
              onClick={() => {
                nav.closeMobileMenu();
                // Trigger ContactsDialog - we need to open it programmatically
                document
                  .querySelector('[data-contacts-trigger]')
                  ?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
              }}
            >
              {t('nav.contacts')}
            </button>
            {isMounted && isAdmin && (
              <Link
                href="/admin"
                onClick={nav.closeMobileMenu}
                className={`px-6 py-3 text-base font-medium transition-all duration-300 ${
                  pathname === '/admin'
                    ? 'text-background bg-background/10 dark:text-white dark:bg-zinc-800/60'
                    : 'text-background/70 active:text-background active:bg-background/10 dark:text-zinc-300 dark:active:text-white dark:active:bg-zinc-800/30'
                }`}
              >
                {t('nav.admin')}
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Search Dropdown */}
      {nav.showSearch && <SearchDropdown onClose={nav.closeSearch} />}
    </header>
  );
};

export default Navigation;

export { Navigation };
