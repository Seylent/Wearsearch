import { NeonAbstractions } from '@/components/NeonAbstractions';
import { ScrollButton } from './ScrollButton';

interface HomeHeroProps {
  h1Title?: string;
  contentText?: string;
}

export function HomeHero({ h1Title, contentText }: Readonly<HomeHeroProps>) {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16 sm:pt-20">
      <div className="absolute inset-0 z-0" aria-hidden="true">
        <NeonAbstractions />
      </div>

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center mt-4 sm:mt-16 md:mt-20">
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold mb-4 sm:mb-6 tracking-tight">
            <span className="block text-white filter brightness-110">
              {h1Title || 'Discover'}
            </span>
            {!h1Title && (
              <>
                <span className="block text-white filter brightness-125">
                  Exceptional
                </span>
                <span className="block text-white filter brightness-110">
                  Fashion
                </span>
              </>
            )}
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-6 sm:mb-10 leading-relaxed backdrop-blur-sm px-4">
            {contentText || 'Curated collections from the world\'s most innovative designers'}
          </p>

          <ScrollButton targetId="products-section" />
        </div>
      </div>
    </section>
  );
}
