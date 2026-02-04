'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { ScrollButton } from './ScrollButton';

interface HomeHeroProps {
  h1Title?: string;
  contentText?: string;
  heroTitleLines?: string[];
  primaryCtaLabel?: string;
  primaryCtaHref?: string;
  secondaryCtaLabel?: string;
  secondaryCtaHref?: string;
}

export function HomeHero({
  h1Title,
  contentText,
  heroTitleLines,
  primaryCtaLabel,
  primaryCtaHref,
  secondaryCtaLabel,
  secondaryCtaHref,
}: Readonly<HomeHeroProps>) {
  const { t } = useTranslation();
  const fallbackTitleLines = heroTitleLines?.length
    ? heroTitleLines
    : [
        t('home.heroTitleLine1', 'Wearsearch'),
        t('home.heroTitleLine2', 'Порівнюй ціни на одяг'),
        t('home.heroTitleLine3', 'в одному місці'),
      ];
  const showCtas =
    Boolean(primaryCtaLabel && primaryCtaHref) || Boolean(secondaryCtaLabel && secondaryCtaHref);

  return (
    <section className="relative min-h-[76svh] sm:min-h-[84svh] md:min-h-[92svh] w-full overflow-hidden text-earth">
      <div className="relative z-10 h-full flex flex-col justify-end">
        <div className="max-w-[1800px] mx-auto w-full px-6 md:px-12 lg:px-16 pt-10 pb-16 sm:pt-12 sm:pb-20 md:pt-14 md:pb-24 mt-20 sm:mt-32 md:mt-48">
          <p className="text-base md:text-lg text-earth/70 max-w-2xl mb-6 md:mb-8 font-medium leading-relaxed">
            {contentText ||
              t(
                'home.heroDescription',
                'Wearsearch — це платформа, де бренди та магазини розміщують свої колекції. Знаходьте одяг, взуття та аксесуари в одному місці, порівнюйте ціни та зберігайте улюблені товари.'
              )}
          </p>
          <h1 className="font-display text-4xl sm:text-5xl md:text-7xl lg:text-9xl text-earth leading-[0.95] sm:leading-[0.9] max-w-[20ch] sm:max-w-4xl font-semibold tracking-[-0.02em]">
            <span className="block">{h1Title || fallbackTitleLines[0]}</span>
            {!h1Title && (
              <>
                {fallbackTitleLines.slice(1).map(line => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </>
            )}
          </h1>

          {showCtas && (
            <div className="mt-6 sm:mt-8 md:mt-12 flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
              {primaryCtaLabel && primaryCtaHref && (
                <Link
                  href={primaryCtaHref}
                  className="inline-flex items-center justify-center w-full sm:w-auto px-6 sm:px-8 py-3 text-[10px] sm:text-xs uppercase tracking-[0.2em] sm:tracking-[0.3em] bg-earth text-cream hover:bg-warm-gray transition-colors rounded-full font-black"
                >
                  {primaryCtaLabel}
                </Link>
              )}
              {secondaryCtaLabel && secondaryCtaHref && (
                <Link
                  href={secondaryCtaHref}
                  className="inline-flex items-center justify-center w-full sm:w-auto px-6 sm:px-8 py-3 text-[10px] sm:text-xs uppercase tracking-[0.2em] sm:tracking-[0.3em] border border-earth text-earth hover:bg-earth hover:text-cream transition-colors rounded-full font-black"
                >
                  {secondaryCtaLabel}
                </Link>
              )}
            </div>
          )}

          <div className="mt-6 sm:mt-8 md:mt-10">
            <ScrollButton targetId="products-section" />
          </div>
        </div>
      </div>
    </section>
  );
}
