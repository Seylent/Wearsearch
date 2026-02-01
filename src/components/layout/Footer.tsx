'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';

const Footer = () => {
  const { t } = useTranslation();

  const footerLinks = {
    shop: [
      { name: t('footer.allItems'), href: '/products' },
      { name: t('footer.saved'), href: '/favorites' },
      { name: t('footer.wishlists'), href: '/wishlists' },
    ],
    company: [{ name: t('footer.about'), href: '/about' }],
  };

  return (
    <footer className="bg-white border-t border-border pt-16 pb-12">
      <div className="max-w-[1800px] mx-auto px-6 md:px-12 lg:px-16">
        <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr] gap-12 mb-14">
          <div>
            <div className="mb-6 max-w-md">
              <Link
                href="/"
                className="inline-flex items-center gap-3 text-earth hover:text-warm-gray transition-colors"
                aria-label={t('aria.navigateToHomepage')}
              >
                <Image
                  src="/WEARSEARCH.png"
                  alt="Wearsearch"
                  width={140}
                  height={32}
                  className="h-8 w-[140px]"
                />
              </Link>
              <p className="text-sm text-warm-gray leading-relaxed mt-4 max-w-md">
                {t('footer.brandDescription', '© 2026 wearsearch. Створено для зручних покупок.')}
              </p>
            </div>
          </div>

          <div>
            <h4 className="font-serif mb-5 text-xs tracking-[0.25em] uppercase text-earth">
              {t('footer.shop')}
            </h4>
            <ul className="space-y-3">
              {footerLinks.shop.map(link => (
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
            <h4 className="font-serif mb-5 text-xs tracking-[0.25em] uppercase text-earth">
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
              <li>
                <Link
                  href="/contacts"
                  className="text-sm text-warm-gray hover:text-earth transition-colors"
                >
                  {t('footer.contact')}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-clay flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-xs uppercase tracking-[0.2em] text-warm-gray">
            {t('footer.madeFor', 'Designed for effortless shopping')}
          </div>
          <div className="flex gap-6">
            <Link
              href="/privacy"
              className="text-xs uppercase tracking-[0.2em] text-warm-gray hover:text-earth transition-colors select-none"
            >
              {t('footer.privacyPolicy')}
            </Link>
            <Link
              href="/terms"
              className="text-xs uppercase tracking-[0.2em] text-warm-gray hover:text-earth transition-colors select-none"
            >
              {t('footer.termsOfService')}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
