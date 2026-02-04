'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';

const Footer = () => {
  const { t } = useTranslation();

  const footerLinks = {
    company: [
      { name: t('footer.about'), href: '/about' },
      { name: t('footer.contact'), href: '/contacts' },
    ],
    legal: [
      { name: t('footer.privacyPolicy'), href: '/privacy' },
      { name: t('footer.termsOfService'), href: '/terms' },
    ],
  };

  return (
    <footer className="bg-transparent pt-12 sm:pt-14 pb-8 sm:pb-10">
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

        <div className="mt-10 sm:mt-12 pt-6 sm:pt-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="text-[11px] sm:text-xs uppercase tracking-[0.18em] sm:tracking-[0.2em] text-warm-gray">
            © 2026 Wearsearch
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
