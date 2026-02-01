import Link from 'next/link';
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
  const fallbackTitleLines = heroTitleLines?.length
    ? heroTitleLines
    : ['Discover', 'Exceptional', 'Fashion'];
  const showCtas =
    Boolean(primaryCtaLabel && primaryCtaHref) || Boolean(secondaryCtaLabel && secondaryCtaHref);

  return (
    <section className="relative min-h-[100svh] w-full overflow-hidden bg-white text-earth">
      <div className="relative z-10 h-full flex flex-col justify-center md:justify-end">
        <div className="max-w-[1800px] mx-auto w-full px-6 md:px-12 lg:px-16 py-20 md:pb-32">
          <p className="text-[11px] sm:text-sm md:text-base uppercase tracking-[0.15em] sm:tracking-[0.2em] text-earth/70 mb-4 md:mb-6">
            {contentText || "Curated collections from the world's most innovative designers"}
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl md:text-7xl lg:text-9xl text-earth leading-[0.95] sm:leading-[0.9] max-w-[20ch] sm:max-w-4xl">
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
                  className="inline-flex items-center justify-center w-full sm:w-auto px-6 sm:px-8 py-3 text-[10px] sm:text-xs uppercase tracking-[0.2em] sm:tracking-[0.3em] bg-earth text-cream hover:bg-warm-gray transition-colors rounded-full"
                >
                  {primaryCtaLabel}
                </Link>
              )}
              {secondaryCtaLabel && secondaryCtaHref && (
                <Link
                  href={secondaryCtaHref}
                  className="inline-flex items-center justify-center w-full sm:w-auto px-6 sm:px-8 py-3 text-[10px] sm:text-xs uppercase tracking-[0.2em] sm:tracking-[0.3em] border border-earth text-earth hover:bg-earth hover:text-cream transition-colors rounded-full"
                >
                  {secondaryCtaLabel}
                </Link>
              )}
            </div>
          )}

          <div className="mt-8 md:mt-10">
            <ScrollButton targetId="products-section" />
          </div>
        </div>
      </div>
    </section>
  );
}
