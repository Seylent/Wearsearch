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

  if (!banners || banners.length === 0) {
    return null;
  }

  const currentBanner = banners[currentIndex];

  return (
    <div className="relative w-full overflow-hidden bg-black rounded-2xl shadow-lg">
      {/* Banner Content */}
      <div className="relative h-[90px] sm:h-[120px] md:h-[150px]">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src={currentBanner.image_url}
            alt={currentBanner.title || 'Banner'}
            fill
            priority={currentIndex === 0}
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/10" />
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
              className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-white/80 hover:bg-white rounded-full shadow-lg transition-all hover:scale-110"
              aria-label="Previous banner"
            >
              <ChevronLeft className="w-4 h-4 md:w-5 md:h-5 text-gray-900" />
            </button>

            <button
              onClick={handleNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-white/80 hover:bg-white rounded-full shadow-lg transition-all hover:scale-110"
              aria-label="Next banner"
            >
              <ChevronRight className="w-4 h-4 md:w-5 md:h-5 text-gray-900" />
            </button>
          </>
        )}
      </div>

      {/* Dots Navigation */}
      {banners.length > 1 && (
        <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 flex gap-2 md:gap-3">
          {banners.map((banner, index) => (
            <button
              key={banner.id}
              onClick={() => handleDotClick(index)}
              className={`transition-all rounded-full ${
                index === currentIndex
                  ? 'w-6 md:w-8 h-1.5 md:h-2 bg-white'
                  : 'w-1.5 md:w-2 h-1.5 md:h-2 bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`Go to banner ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
