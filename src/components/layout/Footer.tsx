'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { API_CONFIG } from '@/config/api.config';

type CategoryNode = {
  id?: string | number;
  name: string;
  slug?: string;
  children?: CategoryNode[];
};

const Footer = () => {
  const { t, i18n } = useTranslation();
  const [categoryTree, setCategoryTree] = useState<CategoryNode[]>([]);
  const [flatCategories, setFlatCategories] = useState<CategoryNode[]>([]);

  useEffect(() => {
    const controller = new AbortController();
    const lang = (i18n.language || 'uk').split('-')[0];

    const fetchCategories = async () => {
      try {
        const response = await fetch(
          `${API_CONFIG.LEGACY_BASE_URL}/categories?tree=1&lang=${encodeURIComponent(lang)}`,
          {
            signal: controller.signal,
          }
        );
        if (!response.ok) return;
        const data = (await response.json()) as {
          categories?: CategoryNode[];
          tree?: CategoryNode[];
        };
        if (Array.isArray(data.tree)) {
          setCategoryTree(data.tree);
        }
        if (Array.isArray(data.categories)) {
          setFlatCategories(data.categories);
        }
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          setCategoryTree([]);
        }
      }
    };

    fetchCategories();

    return () => controller.abort();
  }, [i18n.language]);

  const footerLinks = {
    company: [
      { name: t('footer.about'), href: '/about' },
      { name: t('footer.contact'), href: '/contacts' },
      { name: t('footer.careers', 'Careers'), href: '/contacts' },
    ],
    legal: [
      { name: t('footer.privacyPolicy'), href: '/privacy' },
      { name: t('footer.termsOfService'), href: '/terms' },
    ],
  };

  const categoryList = useMemo(() => {
    if (categoryTree.length > 0) return categoryTree;
    return flatCategories;
  }, [categoryTree, flatCategories]);

  const renderCategoryTree = (nodes: CategoryNode[], depth = 0) => (
    <ul className={depth === 0 ? 'space-y-3' : 'mt-2 space-y-2 pl-4 border-l border-border/30'}>
      {nodes.map(node => {
        const slug = node.slug || node.name;
        const href = `/products?type=${encodeURIComponent(slug)}`;

        return (
          <li key={`${node.id ?? node.name}-${depth}`}>
            <Link href={href} className="text-sm text-warm-gray hover:text-earth transition-colors">
              {node.name}
            </Link>
            {Array.isArray(node.children) && node.children.length > 0
              ? renderCategoryTree(node.children, depth + 1)
              : null}
          </li>
        );
      })}
    </ul>
  );

  return (
    <footer className="bg-sand border-t border-border pt-12 sm:pt-14 pb-8 sm:pb-10">
      <div className="max-w-[1800px] mx-auto px-6 md:px-12 lg:px-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr] gap-10 sm:gap-12 lg:gap-16">
          <div className="space-y-4">
            <Link
              href="/"
              className="inline-flex items-center gap-3 text-earth hover:text-warm-gray transition-colors"
              aria-label={t('aria.navigateToHomepage')}
            >
              <Image
                src="/logow1.webp"
                alt="Wearsearch"
                width={140}
                height={48}
                className="h-12 w-auto"
              />
            </Link>
            <p className="text-sm text-warm-gray leading-relaxed max-w-sm">
              {t('footer.brandDescription', '© 2026 wearsearch. Створено для зручних покупок.')}
            </p>
          </div>

          <div>
            <h4 className="font-serif mb-4 text-[11px] sm:text-xs tracking-[0.18em] sm:tracking-[0.25em] uppercase text-earth">
              {t('footer.allClothing', 'Весь одяг')}
            </h4>
            {categoryList.length > 0 ? (
              renderCategoryTree(categoryList)
            ) : (
              <div className="text-sm text-warm-gray">{t('common.loading')}</div>
            )}
          </div>

          <div>
            <h4 className="font-serif mb-4 text-[11px] sm:text-xs tracking-[0.18em] sm:tracking-[0.25em] uppercase text-earth">
              {t('footer.company')}
            </h4>
            <ul className="space-y-3">
              {footerLinks.company.map(link => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-warm-gray hover:text-earth transition-colors select-none"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-serif mb-4 text-[11px] sm:text-xs tracking-[0.18em] sm:tracking-[0.25em] uppercase text-earth">
              {t('footer.legal', 'Правова інформація')}
            </h4>
            <ul className="space-y-3">
              {footerLinks.legal.map(link => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-warm-gray hover:text-earth transition-colors select-none"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 sm:mt-12 pt-6 sm:pt-8 border-t border-clay flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="text-[11px] sm:text-xs uppercase tracking-[0.18em] sm:tracking-[0.2em] text-warm-gray">
            © 2026 Wearsearch
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
