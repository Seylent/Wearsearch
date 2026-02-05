'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
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
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useNavigationState } from '@/features/auth/hooks/useNavigationState';
import { Search, User as UserIcon, Menu, X, ChevronDown } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';
import { categoryService, type Category } from '@/services/categoryService';
import { useIsTouchDevice } from '@/hooks/use-touch-device';
import { useIsMobile } from '@/hooks/use-mobile';
import { COLLECTION_SLUGS, getCollectionConfig } from '@/constants/collections';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const Navigation: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { t, i18n } = useTranslation();

  // 🔥 Попередження hydration error - тільки на клієнті
  const [isMounted, setIsMounted] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeMega, setActiveMega] = useState<string | null>(null);
  const [categoryTree, setCategoryTree] = useState<Category[]>([]);
  const [flatCategories, setFlatCategories] = useState<Category[]>([]);
  const [mobileCategoriesOpen, setMobileCategoriesOpen] = useState(false);
  const [openMobileCategoryIds, setOpenMobileCategoryIds] = useState<Record<string, boolean>>({});
  const reduceMotion = useReducedMotion();
  const isTouchDevice = useIsTouchDevice();
  const shouldAnimate = !reduceMotion && !isTouchDevice;
  const closeMegaTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, [i18n.language]);

  useEffect(() => {
    let isActive = true;
    const lang = (i18n.language || 'uk').split('-')[0];
    const cacheKey = `nav-categories-${lang}`;

    const applyCached = () => {
      try {
        const raw = sessionStorage.getItem(cacheKey);
        if (!raw) return false;
        const cached = JSON.parse(raw) as {
          tree: Category[];
          categories: Category[];
          savedAt: number;
        };
        if (!cached?.savedAt || Date.now() - cached.savedAt > 10 * 60 * 1000) return false;
        setCategoryTree(cached.tree || []);
        setFlatCategories(cached.categories || []);
        return true;
      } catch {
        return false;
      }
    };

    if (typeof window !== 'undefined' && applyCached()) {
      return () => {
        isActive = false;
      };
    }

    Promise.all([
      categoryService.getCategoryTree(lang),
      categoryService.getCategories({ isActive: true, lang }),
    ])
      .then(([tree, all]) => {
        if (!isActive) return;
        const activeTree = tree.filter(category => category.isActive !== false);
        const activeFlat = all.filter(category => category.isActive !== false);
        setCategoryTree(activeTree);
        setFlatCategories(activeFlat);
        if (typeof window !== 'undefined') {
          sessionStorage.setItem(
            cacheKey,
            JSON.stringify({
              tree: activeTree,
              categories: activeFlat,
              savedAt: Date.now(),
            })
          );
        }
      })
      .catch(error => {
        if (!isActive) return;
        console.warn('Failed to load categories:', error);
        // Use fallback categories when API fails - they now include subcategories
        const fallback = categoryService.getFallbackCategories();
        setCategoryTree(fallback);
        setFlatCategories(fallback);
      });

    return () => {
      isActive = false;
    };
  }, [i18n.language]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Use centralized auth hook — лише після mount
  const { user, canAccessStoreMenu, canAccessAdminPanel } = useAuth();
  const userRole = isRecord(user) && typeof user.role === 'string' ? user.role : undefined;

  // Use navigation state hook
  const nav = useNavigationState();
  const { mobileMenuOpen, closeAll } = nav;
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!mobileMenuOpen) {
      setMobileCategoriesOpen(false);
      setOpenMobileCategoryIds({});
    }
  }, [mobileMenuOpen]);

  useEffect(() => {
    closeAll();
  }, [pathname, closeAll]);

  useEffect(() => {
    if (!isMobile && mobileMenuOpen) {
      nav.closeMobileMenu();
    }
  }, [isMobile, mobileMenuOpen, nav]);

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

  const navLinkBaseClass =
    'min-h-[40px] px-4 rounded-full flex items-center justify-center border border-earth/20 text-xs uppercase tracking-[0.28em] font-semibold transition-all duration-150 touch-manipulation hover:border-earth/40 active:scale-95 font-helvetica700';

  const categoryColumns = useMemo(() => {
    const topCategories = categoryTree.slice(0, 4);
    if (topCategories.length === 0 && flatCategories.length === 0) return [];

    const hasSubcategories = topCategories.some(category =>
      (category.subcategories || []).some(sub => sub.isActive !== false)
    );

    if (topCategories.length > 0 && hasSubcategories) {
      return topCategories.map(category => {
        const categorySlug = category.slug || category.name;
        const subcategories = (category.subcategories || []).filter(
          subcategory => subcategory.isActive !== false
        );
        const links = subcategories.length
          ? [
              {
                label: t('mega.viewAllCategory', 'All {{name}}', { name: category.name }),
                href: `/products?type=${encodeURIComponent(categorySlug)}`,
              },
              ...subcategories.slice(0, 6).map(subcategory => ({
                label: subcategory.name,
                href: `/products?type=${encodeURIComponent(subcategory.slug || subcategory.name)}`,
              })),
            ]
          : [
              {
                label: t('mega.viewAllCategory', 'All {{name}}', { name: category.name }),
                href: `/products?type=${encodeURIComponent(categorySlug)}`,
              },
            ];

        return {
          title: category.name,
          links,
        };
      });
    }

    const source = flatCategories.length > 0 ? flatCategories : categoryTree;
    const chunkSize = Math.max(1, Math.ceil(source.length / 4));
    const columns: Array<{ title: string; links: Array<{ label: string; href: string }> }> = [];

    for (let i = 0; i < source.length; i += chunkSize) {
      const chunk = source.slice(i, i + chunkSize);
      if (chunk.length === 0) continue;
      columns.push({
        title: t('mega.categories', 'Categories'),
        links: chunk.slice(0, 8).map(category => ({
          label: category.name,
          href: `/products?type=${encodeURIComponent(category.slug || category.name)}`,
        })),
      });
    }

    return columns;
  }, [categoryTree, flatCategories, t]);

  const collectionLinks = useMemo(() => {
    const locale = i18n.language === 'en' ? 'en' : 'uk';
    return COLLECTION_SLUGS.map(slug => {
      const config = getCollectionConfig(slug);
      return {
        label: config?.title[locale] ?? config?.title.en ?? slug,
        href: `/collections/${slug}`,
      };
    });
  }, [i18n.language]);

  const mobileCategoryNodes = useMemo(() => {
    return categoryTree.length > 0 ? categoryTree : flatCategories;
  }, [categoryTree, flatCategories]);

  const renderMobileCategoryTree = (nodes: Category[], depth = 0) => (
    <ul className={depth === 0 ? 'mt-3 space-y-2' : 'mt-2 space-y-2 pl-4 border-l border-earth/10'}>
      {nodes.map(node => {
        const slug = node.slug || node.name;
        const children = (node.subcategories || []).filter(child => child.isActive !== false);
        const nodeKey = String(node.id || slug);
        const isOpen = !!openMobileCategoryIds[nodeKey];
        return (
          <li key={`${node.id}-${depth}`}>
            {children.length > 0 ? (
              <div>
                <button
                  type="button"
                  onClick={() =>
                    setOpenMobileCategoryIds(prev => ({ ...prev, [nodeKey]: !isOpen }))
                  }
                  className="w-full flex items-center justify-between text-sm text-warm-gray hover:text-earth transition-colors"
                >
                  <span>{node.name}</span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                  />
                </button>
                <Link
                  href={`/products?type=${encodeURIComponent(slug)}`}
                  onClick={nav.closeMobileMenu}
                  className="mt-1 block text-[11px] uppercase tracking-[0.2em] text-earth/70 hover:text-earth"
                >
                  {t('mega.viewAllCategory', 'All {{name}}', { name: node.name })}
                </Link>
                {isOpen ? renderMobileCategoryTree(children, depth + 1) : null}
              </div>
            ) : (
              <Link
                href={`/products?type=${encodeURIComponent(slug)}`}
                onClick={nav.closeMobileMenu}
                className="block text-sm text-warm-gray hover:text-earth transition-colors"
              >
                {node.name}
              </Link>
            )}
          </li>
        );
      })}
    </ul>
  );

  const megaMenus: Record<
    string,
    {
      columns: Array<{ title: string; links: Array<{ label: string; href: string }> }>;
      imageTitle: string;
      imageCopy: string;
    }
  > = categoryColumns.length
    ? {
        '/products': {
          columns: [
            ...categoryColumns.slice(0, 3),
            ...(collectionLinks.length
              ? [
                  {
                    title: t('mega.collections', 'Collections'),
                    links: collectionLinks,
                  },
                ]
              : []),
          ],
          imageTitle: t('mega.featureTitle', 'Curated picks'),
          imageCopy: t(
            'mega.featureCopy',
            'Discover new drops and essentials from trusted stores.'
          ),
        },
      }
    : {};

  const activeMegaMenu = activeMega ? megaMenus[activeMega] : null;
  const megaVariants = {
    hidden: reduceMotion ? { opacity: 1, height: 'auto' } : { opacity: 0, height: 0 },
    show: {
      opacity: 1,
      height: 'auto',
      transition: reduceMotion ? { duration: 0 } : { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
    },
    exit: reduceMotion
      ? { opacity: 1, height: 'auto' }
      : { opacity: 0, height: 0, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } },
  };

  const megaContentVariants = {
    hidden: { opacity: 1 },
    show: {
      opacity: 1,
      transition: reduceMotion ? {} : { staggerChildren: 0.05 },
    },
  };

  const megaItemVariants = {
    hidden: reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 },
    show: reduceMotion
      ? { opacity: 1, y: 0 }
      : { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
  };

  const cancelMegaClose = () => {
    if (closeMegaTimeoutRef.current) {
      window.clearTimeout(closeMegaTimeoutRef.current);
      closeMegaTimeoutRef.current = null;
    }
  };

  const scheduleMegaClose = () => {
    cancelMegaClose();
    closeMegaTimeoutRef.current = window.setTimeout(() => {
      setActiveMega(null);
    }, 150);
  };

  return (
    <header
      className={`fixed left-0 right-0 top-0 z-[80] pointer-events-auto transition-[background-color,box-shadow] duration-300 ${
        isScrolled
          ? 'bg-background/95 shadow-sm backdrop-blur border-b border-border/60'
          : 'bg-background/95 md:bg-transparent'
      }`}
    >
      <nav
        className="flex items-center justify-between gap-0 max-w-[1800px] w-full mx-auto px-4 sm:px-6 md:px-12 lg:px-16 py-3 sm:py-4 min-h-[60px] sm:min-h-0"
        role="navigation"
        aria-label={t('aria.mainNavigation')}
        suppressHydrationWarning
        onMouseEnter={cancelMegaClose}
        onMouseLeave={scheduleMegaClose}
      >
        {/* Left Section - Logo */}
        <button
          className="flex items-center gap-1.5 sm:gap-2 group px-1.5 sm:px-3 py-2 transition-colors focus-visible:ring-2 focus-visible:ring-earth/40 focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
          onClick={handleLogoClick}
          aria-label={t('aria.navigateToHomepage')}
          suppressHydrationWarning
        >
          <Image
            src="/logow1.webp"
            alt="Wearsearch"
            width={36}
            height={36}
            className="h-7 w-7 sm:h-9 sm:w-9 object-contain"
            priority
          />
          <span className="flex font-logo items-center leading-none text-foreground text-xs sm:text-lg md:text-xl uppercase tracking-[0.06em] sm:tracking-[0.05em] whitespace-nowrap">
            Wearsearch
          </span>
        </button>

        {/* Center Section - Navigation Links (Desktop) */}
        <div className="hidden md:flex items-center gap-6 flex-1 justify-center px-6 py-2">
          {navLinks.map(link => (
            <Link
              key={link.name}
              href={link.href}
              onMouseEnter={() => setActiveMega(megaMenus[link.href] ? link.href : null)}
              onFocus={() => setActiveMega(megaMenus[link.href] ? link.href : null)}
              className={`${navLinkBaseClass} ${
                pathname === link.href
                  ? 'text-earth border-earth/40 bg-sand/40'
                  : 'text-warm-gray hover:text-earth'
              }`}
            >
              {link.name}
            </Link>
          ))}
          <Link
            href="/contacts"
            className={`${navLinkBaseClass} ${
              pathname === '/contacts'
                ? 'text-earth border-earth/40 bg-sand/40'
                : 'text-warm-gray hover:text-earth'
            }`}
          >
            {t('nav.contacts')}
          </Link>
          {isMounted && canAccessStoreMenu && (
            <Link
              href="/store-menu"
              className={`${navLinkBaseClass} ${
                pathname === '/store-menu' || pathname.startsWith('/store-menu/')
                  ? 'text-earth border-earth/40 bg-sand/40'
                  : 'text-warm-gray hover:text-earth'
              }`}
            >
              {t('nav.storeMenu', 'Мій магазин')}
            </Link>
          )}

          {isMounted && canAccessAdminPanel && (
            <Link
              href="/admin"
              className={`${navLinkBaseClass} ${
                pathname === '/admin'
                  ? 'text-earth border-earth/40 bg-sand/40'
                  : 'text-warm-gray hover:text-earth'
              }`}
            >
              {t('nav.admin')}
            </Link>
          )}
        </div>

        {/* Right Section - Search, Language, Menu & Profile */}
        <div className="flex items-center gap-1 sm:gap-3 px-1.5 sm:px-3 py-2">
          {/* Mobile Menu Button */}
          <button
            className="md:hidden min-w-[40px] min-h-[40px] w-10 h-10 rounded-full flex items-center justify-center border border-earth/20 text-earth hover:border-earth/40 active:scale-95 transition-all duration-150 touch-manipulation"
            onClick={nav.toggleMobileMenu}
            aria-label={nav.mobileMenuOpen ? t('aria.closeMenu') : t('aria.openMenu')}
            aria-expanded={nav.mobileMenuOpen}
          >
            {nav.mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          {/* Search Button */}
          <button
            className="min-w-[40px] min-h-[40px] w-10 h-10 md:w-9 md:h-9 md:min-w-0 md:min-h-0 rounded-full flex items-center justify-center border border-earth/20 text-earth hover:border-earth/40 active:scale-95 transition-all duration-150 touch-manipulation"
            onClick={nav.openSearch}
            aria-label={t('aria.openSearch')}
          >
            <Search className="w-5 h-5" />
          </button>

          <ThemeToggle className="flex" />

          <div className="hidden sm:block">
            <LanguageSelector />
          </div>

          <div className="sm:hidden">
            <LanguageSelector
              labelLayout="stacked"
              showCurrencyToggle
              triggerClassName="min-w-[40px] min-h-[40px] w-10 h-10 px-1.5"
            />
          </div>

          <div className="hidden sm:block">
            <CurrencySwitch
              variant="ghost"
              size="sm"
              className="h-9 w-auto px-2 text-xs uppercase tracking-[0.2em] text-warm-gray hover:text-earth"
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
                  className="min-w-[40px] min-h-[40px] w-10 h-10 md:w-9 md:h-9 md:min-w-0 md:min-h-0 rounded-full flex items-center justify-center border border-earth/20 text-earth hover:border-earth/40 active:scale-95 transition-all duration-150 touch-manipulation"
                  onClick={() => router.push('/auth')}
                  aria-label={t('aria.signIn')}
                >
                  <UserIcon className="w-5 h-5" />
                </button>
              )
            ) : (
              // 🚀 SSR-safe placeholder - однаковий на сервері і клієнті
              <button
                className="min-w-[40px] min-h-[40px] w-10 h-10 md:w-9 md:h-9 md:min-w-0 md:min-h-0 rounded-full flex items-center justify-center border border-earth/20 text-earth hover:border-earth/40 active:scale-95 transition-all duration-150 touch-manipulation"
                onClick={() => router.push('/auth')}
                aria-label={t('aria.signIn')}
              >
                <UserIcon className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </nav>

      {shouldAnimate ? (
        <AnimatePresence>
          {activeMegaMenu && (
            <motion.div
              className="hidden md:block absolute top-full left-0 right-0 bg-background/95 border-t border-border overflow-hidden"
              variants={megaVariants}
              initial="hidden"
              animate="show"
              exit="exit"
              onMouseEnter={cancelMegaClose}
              onMouseLeave={scheduleMegaClose}
            >
              <motion.div className="max-w-[1800px] mx-auto px-6 md:px-12 lg:px-16 py-10">
                <motion.div
                  className="grid grid-cols-[1.4fr_1.4fr_1.4fr_1.4fr_1fr] gap-10"
                  variants={megaContentVariants}
                >
                  {activeMegaMenu.columns.map(column => (
                    <motion.div key={column.title} variants={megaItemVariants}>
                      <div className="text-xs uppercase tracking-[0.2em] text-warm-gray mb-4">
                        {column.title}
                      </div>
                      <ul className="space-y-2">
                        {column.links.map(link => (
                          <li key={link.label}>
                            <Link
                              href={link.href}
                              onClick={() => setActiveMega(null)}
                              className="text-sm text-earth hover:text-warm-gray transition-colors"
                            >
                              {link.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  ))}
                  <motion.div
                    variants={megaItemVariants}
                    initial={reduceMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative rounded-3xl bg-muted overflow-hidden flex flex-col justify-end p-6"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-background via-muted to-border opacity-90" />
                    <div className="relative z-10">
                      <div className="text-xs uppercase tracking-[0.2em] text-warm-gray mb-2">
                        {activeMegaMenu.imageTitle}
                      </div>
                      <div className="text-lg font-serif text-earth mb-2">
                        {t('mega.featureSubtitle', 'Editorial Selection')}
                      </div>
                      <p className="text-sm text-warm-gray">{activeMegaMenu.imageCopy}</p>
                    </div>
                  </motion.div>
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      ) : activeMegaMenu ? (
        <div
          className="hidden md:block absolute top-full left-0 right-0 bg-background/95 border-t border-border overflow-hidden"
          onMouseEnter={cancelMegaClose}
          onMouseLeave={scheduleMegaClose}
        >
          <div className="max-w-[1800px] mx-auto px-6 md:px-12 lg:px-16 py-10">
            <div className="grid grid-cols-[1.4fr_1.4fr_1.4fr_1.4fr_1fr] gap-10">
              {activeMegaMenu.columns.map(column => (
                <div key={column.title}>
                  <div className="text-xs uppercase tracking-[0.2em] text-warm-gray mb-4">
                    {column.title}
                  </div>
                  <ul className="space-y-2">
                    {column.links.map(link => (
                      <li key={link.label}>
                        <Link
                          href={link.href}
                          onClick={() => setActiveMega(null)}
                          className="text-sm text-earth hover:text-warm-gray transition-colors"
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              <div className="relative rounded-3xl bg-muted overflow-hidden flex flex-col justify-end p-6">
                <div className="absolute inset-0 bg-gradient-to-br from-background via-muted to-border opacity-90" />
                <div className="relative z-10">
                  <div className="text-xs uppercase tracking-[0.2em] text-warm-gray mb-2">
                    {activeMegaMenu.imageTitle}
                  </div>
                  <div className="text-lg font-serif text-earth mb-2">
                    {t('mega.featureSubtitle', 'Editorial Selection')}
                  </div>
                  <p className="text-sm text-warm-gray">{activeMegaMenu.imageCopy}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {shouldAnimate && isMobile ? (
        <AnimatePresence>
          {nav.mobileMenuOpen && (
            <>
              <motion.div
                className="md:hidden fixed inset-0 bg-black/20 z-40"
                onClick={nav.closeMobileMenu}
                aria-hidden="true"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={reduceMotion ? { duration: 0 } : { duration: 0.3 }}
              />
              <motion.div
                className="md:hidden fixed top-0 left-0 h-[100dvh] w-[82vw] max-w-[360px] bg-sand/95 text-earth rounded-r-3xl border-r border-earth/10 shadow-[18px_0_40px_rgba(0,0,0,0.16)] backdrop-blur-xl overflow-hidden z-50 flex flex-col"
                role="menu"
                aria-label={t('aria.mainNavigation')}
                initial={reduceMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={reduceMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                transition={
                  reduceMotion ? { duration: 0 } : { duration: 0.4, ease: [0.22, 1, 0.36, 1] }
                }
              >
                <div className="sticky top-0 z-10 flex items-center justify-between px-6 pt-6 pb-3 bg-sand/95 backdrop-blur border-b border-earth/10">
                  <div className="text-xs uppercase tracking-[0.2em] text-warm-gray">
                    {t('nav.menu', 'Menu')}
                  </div>
                  <button
                    onClick={nav.closeMobileMenu}
                    className="w-10 h-10 rounded-full flex items-center justify-center border border-earth/15 text-earth hover:border-earth/40"
                    aria-label={t('aria.closeMenu')}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                {isMounted && user && (
                  <div className="px-6 py-4 border-b border-border">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                        <UserIcon className="w-5 h-5 text-earth" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium text-sm text-earth">
                          {user.email || 'User'}
                        </span>
                        <span className="text-xs text-warm-gray">{userRole || 'Buyer'}</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex-1 flex flex-col gap-3 overflow-y-auto px-4 pb-6">
                  <div className="flex items-center gap-2 px-2">
                    <ThemeToggle />
                    <span className="text-xs uppercase tracking-[0.2em] text-warm-gray">
                      {t('common.theme', 'Theme')}
                    </span>
                  </div>
                  {navLinks.map(link => {
                    if (link.href === '/products') {
                      return (
                        <div
                          key={link.name}
                          className="rounded-2xl border border-earth/10 bg-card/70"
                        >
                          <button
                            type="button"
                            onClick={() => setMobileCategoriesOpen(prev => !prev)}
                            className="w-full px-5 py-3.5 min-h-[52px] text-sm uppercase tracking-[0.2em] transition-all duration-150 text-warm-gray active:text-earth flex items-center justify-between"
                          >
                            <span>{t('footer.allClothing', 'Весь одяг')}</span>
                            <ChevronDown
                              className={`w-4 h-4 transition-transform duration-200 ${
                                mobileCategoriesOpen ? 'rotate-180' : ''
                              }`}
                            />
                          </button>
                          {mobileCategoriesOpen && mobileCategoryNodes.length > 0 && (
                            <div className="px-5 pb-4">
                              {renderMobileCategoryTree(mobileCategoryNodes)}
                            </div>
                          )}
                        </div>
                      );
                    }

                    return (
                      <Link
                        key={link.name}
                        href={link.href}
                        onClick={nav.closeMobileMenu}
                        className={`px-5 py-3.5 min-h-[52px] text-sm uppercase tracking-[0.2em] transition-all duration-150 touch-manipulation active:scale-[0.98] flex items-center gap-3 rounded-full border ${
                          pathname === link.href
                            ? 'text-earth border-earth/40 bg-card'
                            : 'text-warm-gray border-earth/10 bg-card/70 active:text-earth active:border-earth/30'
                        }`}
                      >
                        {link.name}
                      </Link>
                    );
                  })}

                  <button
                    className="px-5 py-3.5 min-h-[52px] text-sm uppercase tracking-[0.2em] transition-all duration-150 text-warm-gray active:text-earth text-left rounded-full border border-earth/10 bg-card/70 flex items-center gap-3"
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
                      className={`px-5 py-3.5 min-h-[52px] text-sm uppercase tracking-[0.2em] transition-all duration-150 flex items-center gap-3 rounded-full border ${
                        pathname === '/store-menu' || pathname.startsWith('/store-menu/')
                          ? 'text-earth border-earth/40 bg-card'
                          : 'text-warm-gray border-earth/10 bg-card/70 active:text-earth active:border-earth/30'
                      }`}
                    >
                      {t('nav.storeMenu', 'Мій магазин')}
                    </Link>
                  )}

                  {isMounted && canAccessAdminPanel && (
                    <Link
                      href="/admin"
                      onClick={nav.closeMobileMenu}
                      className={`px-5 py-3.5 min-h-[52px] text-sm uppercase tracking-[0.2em] transition-all duration-150 flex items-center gap-3 rounded-full border ${
                        pathname === '/admin'
                          ? 'text-earth border-earth/40 bg-card'
                          : 'text-warm-gray border-earth/10 bg-card/70 active:text-earth active:border-earth/30'
                      }`}
                    >
                      {t('nav.admin')}
                    </Link>
                  )}

                  {isMounted && user && (
                    <button
                      className="px-5 py-3.5 min-h-[52px] text-sm uppercase tracking-[0.2em] transition-all duration-150 text-destructive text-left rounded-full border border-destructive/30 bg-card/70 flex items-center gap-3"
                      onClick={() => {
                        nav.closeMobileMenu();
                        router.push('/auth');
                      }}
                    >
                      {t('auth.signOut', 'Sign Out')}
                    </button>
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      ) : nav.mobileMenuOpen && isMobile ? (
        <>
          <div
            className="md:hidden fixed inset-0 bg-black/20 z-40"
            onClick={nav.closeMobileMenu}
            aria-hidden="true"
          />
          <div
            className="md:hidden fixed top-0 left-0 h-[100dvh] w-[82vw] max-w-[360px] bg-sand/95 text-earth rounded-r-3xl border-r border-earth/10 shadow-[18px_0_40px_rgba(0,0,0,0.16)] backdrop-blur-xl overflow-hidden z-50 flex flex-col"
            role="menu"
            aria-label={t('aria.mainNavigation')}
          >
            <div className="flex items-center justify-between px-6 pt-6 pb-3">
              <div className="text-xs uppercase tracking-[0.2em] text-warm-gray">
                {t('nav.menu', 'Menu')}
              </div>
              <button
                onClick={nav.closeMobileMenu}
                className="w-10 h-10 rounded-full flex items-center justify-center border border-earth/15 text-earth hover:border-earth/40"
                aria-label={t('aria.closeMenu')}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {isMounted && user && (
              <div className="px-6 py-4 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                    <UserIcon className="w-5 h-5 text-earth" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium text-sm text-earth">{user.email || 'User'}</span>
                    <span className="text-xs text-warm-gray">{userRole || 'Buyer'}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex-1 flex flex-col gap-3 overflow-y-auto px-4 pb-6">
              {navLinks.map(link => {
                if (link.href === '/products') {
                  return (
                    <div key={link.name} className="rounded-2xl border border-earth/10 bg-card/70">
                      <button
                        type="button"
                        onClick={() => setMobileCategoriesOpen(prev => !prev)}
                        className="w-full px-5 py-3.5 min-h-[52px] text-sm uppercase tracking-[0.2em] transition-all duration-150 text-warm-gray active:text-earth flex items-center justify-between"
                      >
                        <span>{t('footer.allClothing', 'Весь одяг')}</span>
                        <ChevronDown
                          className={`w-4 h-4 transition-transform duration-200 ${
                            mobileCategoriesOpen ? 'rotate-180' : ''
                          }`}
                        />
                      </button>
                      {mobileCategoriesOpen && mobileCategoryNodes.length > 0 && (
                        <div className="px-5 pb-4">
                          {renderMobileCategoryTree(mobileCategoryNodes)}
                        </div>
                      )}
                    </div>
                  );
                }

                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={nav.closeMobileMenu}
                    className={`px-5 py-3.5 min-h-[52px] text-sm uppercase tracking-[0.2em] transition-all duration-150 touch-manipulation active:scale-[0.98] flex items-center gap-3 rounded-full border ${
                      pathname === link.href
                        ? 'text-earth border-earth/40 bg-card'
                        : 'text-warm-gray border-earth/10 bg-card/70 active:text-earth active:border-earth/30'
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}

              <button
                className="px-5 py-3.5 min-h-[52px] text-sm uppercase tracking-[0.2em] transition-all duration-150 text-warm-gray active:text-earth text-left rounded-full border border-earth/10 bg-card/70 flex items-center gap-3"
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
                  className={`px-5 py-3.5 min-h-[52px] text-sm uppercase tracking-[0.2em] transition-all duration-150 flex items-center gap-3 rounded-full border ${
                    pathname === '/store-menu' || pathname.startsWith('/store-menu/')
                      ? 'text-earth border-earth/40 bg-card'
                      : 'text-warm-gray border-earth/10 bg-card/70 active:text-earth active:border-earth/30'
                  }`}
                >
                  {t('nav.storeMenu', 'Мій магазин')}
                </Link>
              )}

              {isMounted && canAccessAdminPanel && (
                <Link
                  href="/admin"
                  onClick={nav.closeMobileMenu}
                  className={`px-5 py-3.5 min-h-[52px] text-sm uppercase tracking-[0.2em] transition-all duration-150 flex items-center gap-3 rounded-full border ${
                    pathname === '/admin'
                      ? 'text-earth border-earth/40 bg-card'
                      : 'text-warm-gray border-earth/10 bg-card/70 active:text-earth active:border-earth/30'
                  }`}
                >
                  {t('nav.admin')}
                </Link>
              )}

              {isMounted && user && (
                <button
                  className="px-5 py-3.5 min-h-[52px] text-sm uppercase tracking-[0.2em] transition-all duration-150 text-destructive text-left rounded-full border border-destructive/30 bg-card/70 flex items-center gap-3"
                  onClick={() => {
                    nav.closeMobileMenu();
                    router.push('/auth');
                  }}
                >
                  {t('auth.signOut', 'Sign Out')}
                </button>
              )}
            </div>
          </div>
        </>
      ) : null}

      {shouldAnimate ? (
        <AnimatePresence>
          {nav.showSearch && <SearchDropdown onClose={nav.closeSearch} />}
        </AnimatePresence>
      ) : nav.showSearch ? (
        <SearchDropdown onClose={nav.closeSearch} />
      ) : null}
    </header>
  );
};

export default Navigation;

export { Navigation };
