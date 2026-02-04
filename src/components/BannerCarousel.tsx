/**
 * Banner Carousel Component
 * Responsive carousel for displaying banners on homepage
 */

'use client';

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Banner } from '@/types/banner';
import { bannerService } from '@/services/bannerService';

interface BannerCarouselProps {
  banners: Banner[];
  autoPlayInterval?: number;
}

export function BannerCarousel({
  banners,
  autoPlayInterval = 5000,
}: Readonly<BannerCarouselProps>) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [impressionTracked, setImpressionTracked] = useState<Set<string>>(new Set());
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Track impression when banner is visible
  useEffect(() => {
    const currentBanner = banners[currentIndex];
    if (currentBanner && !impressionTracked.has(currentBanner.id)) {
      bannerService.trackImpression(currentBanner.id);
      setImpressionTracked(prev => new Set(prev).add(currentBanner.id));
    }
  }, [currentIndex, banners, impressionTracked]);

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying || banners.length <= 1) return;

    timerRef.current = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % banners.length);
    }, autoPlayInterval);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isAutoPlaying, banners.length, autoPlayInterval]);

  const handlePrevious = () => {
    setIsAutoPlaying(false);
    setCurrentIndex(prev => (prev - 1 + banners.length) % banners.length);
  };

  const handleNext = () => {
    setIsAutoPlaying(false);
    setCurrentIndex(prev => (prev + 1) % banners.length);
  };

  const handleDotClick = (index: number) => {
    setIsAutoPlaying(false);
    setCurrentIndex(index);
  };

  const handleBannerClick = (banner: Banner) => {
    bannerService.trackClick(banner.id);
  };

  const currentBanner = banners[currentIndex];
  const bannerImage = currentBanner?.image_url || '';

  if (!banners || banners.length === 0) {
    return null;
  }

  return (
    <div className="relative w-full max-w-[1200px] mx-auto overflow-hidden bg-black rounded-xl shadow-lg">
      {/* Banner Content - адаптивний розмір для кращої видимості */}
      {/* Висота збільшена для гармонійного вигляду в контенті */}
      <div className="relative w-full h-[180px] sm:h-[220px] md:h-[250px] lg:h-[280px]">
        {/* Background Image */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Image
            src={bannerImage || '/placeholder.svg'}
            alt={currentBanner.title || 'Banner'}
            fill
            priority={currentIndex === 0}
            className="object-contain bg-black/50"
            sizes="(max-width: 768px) 100vw, 1200px"
          />
        </div>

        {currentBanner.link_url ? (
          <Link
            href={currentBanner.link_url}
            onClick={() => handleBannerClick(currentBanner)}
            className="absolute inset-0"
            aria-label={currentBanner.title || currentBanner.link_text || 'Banner'}
          />
        ) : null}

        {/* Navigation Arrows */}
        {banners.length > 1 && (
          <>
            <button
              onClick={handlePrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/90 hover:bg-white rounded-full shadow-xl transition-all hover:scale-110 z-10"
              aria-label="Previous banner"
            >
              <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 text-gray-900" />
            </button>

            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/90 hover:bg-white rounded-full shadow-xl transition-all hover:scale-110 z-10"
              aria-label="Next banner"
            >
              <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-gray-900" />
            </button>
          </>
        )}
      </div>

      {/* Dots Navigation */}
      {banners.length > 1 && (
        <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 flex gap-2 md:gap-3 z-10 bg-white border border-border rounded-full px-4 py-2">
          {banners.map((banner, index) => (
            <button
              key={banner.id}
              onClick={() => handleDotClick(index)}
              className={`transition-all rounded-full ${
                index === currentIndex
                  ? 'w-8 h-2 bg-white'
                  : 'w-2 h-2 bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`Go to banner ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
