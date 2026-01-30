import Link from 'next/link';
import { NeonAbstractions } from '@/components/NeonAbstractions';
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
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16 sm:pt-20">
      <div className="absolute inset-0 z-0" aria-hidden="true">
        <NeonAbstractions />
      </div>

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center mt-4 sm:mt-16 md:mt-20">
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold mb-4 sm:mb-6 tracking-tight">
            <span className="block text-white filter brightness-110">
              {h1Title || fallbackTitleLines[0]}
            </span>
            {!h1Title && (
              <>
                {fallbackTitleLines.slice(1).map(line => (
                  <span key={line} className="block text-white filter brightness-110">
                    {line}
                  </span>
                ))}
              </>
            )}
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-6 sm:mb-10 leading-relaxed backdrop-blur-sm px-4">
            {contentText || "Curated collections from the world's most innovative designers"}
          </p>

          {showCtas && (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-6 sm:mb-10">
              {primaryCtaLabel && primaryCtaHref && (
                <Link
                  href={primaryCtaHref}
                  className="inline-flex items-center justify-center h-12 px-6 rounded-full bg-white text-black font-semibold text-sm sm:text-base transition hover:bg-white/90"
                >
                  {primaryCtaLabel}
                </Link>
              )}
              {secondaryCtaLabel && secondaryCtaHref && (
                <Link
                  href={secondaryCtaHref}
                  className="inline-flex items-center justify-center h-12 px-6 rounded-full border border-white/40 text-white font-semibold text-sm sm:text-base transition hover:border-white/70"
                >
                  {secondaryCtaLabel}
                </Link>
              )}
            </div>
          )}

          <ScrollButton targetId="products-section" />
        </div>
      </div>
    </section>
  );
}
