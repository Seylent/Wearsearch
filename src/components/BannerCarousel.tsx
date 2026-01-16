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

export function BannerCarousel({ banners, autoPlayInterval = 5000 }: Readonly<BannerCarouselProps>) {
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
    <div className="relative w-full overflow-hidden bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 rounded-2xl shadow-lg">
      {/* Banner Content */}
      <div className="relative h-[250px] md:h-[350px] lg:h-[400px]">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src={currentBanner.image_url}
            alt={currentBanner.title}
            fill
            priority={currentIndex === 0}
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
        </div>

        {/* Text Content */}
        <div className="relative h-full flex items-center">
          <div className="container mx-auto px-4 md:px-6 lg:px-8">
            <div className="max-w-2xl text-white">
              <h2 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 drop-shadow-lg animate-fade-in">
                {currentBanner.title}
              </h2>
              
              {currentBanner.subtitle && (
                <h3 className="text-xl md:text-2xl lg:text-3xl mb-4 drop-shadow-lg animate-fade-in animation-delay-100">
                  {currentBanner.subtitle}
                </h3>
              )}
              
              {currentBanner.description && (
                <p className="text-base md:text-lg lg:text-xl mb-6 drop-shadow-lg animate-fade-in animation-delay-200">
                  {currentBanner.description}
                </p>
              )}
              
              {currentBanner.link_url && (
                <Link
                  href={currentBanner.link_url}
                  onClick={() => handleBannerClick(currentBanner)}
                  className="inline-flex items-center gap-2 px-6 py-3 md:px-8 md:py-4 bg-white text-gray-900 font-semibold rounded-full hover:bg-gray-100 transition-all transform hover:scale-105 shadow-xl animate-fade-in animation-delay-300"
                >
                  {currentBanner.link_text || 'Дізнатися більше'}
                  <ChevronRight className="w-5 h-5" />
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Arrows */}
        {banners.length > 1 && (
          <>
            <button
              onClick={handlePrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-2 md:p-3 bg-white/80 hover:bg-white rounded-full shadow-lg transition-all hover:scale-110"
              aria-label="Previous banner"
            >
              <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 text-gray-900" />
            </button>
            
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 md:p-3 bg-white/80 hover:bg-white rounded-full shadow-lg transition-all hover:scale-110"
              aria-label="Next banner"
            >
              <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-gray-900" />
            </button>
          </>
        )}
      </div>

      {/* Dots Navigation */}
      {banners.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 md:gap-3">
          {banners.map((banner, index) => (
            <button
              key={banner.id}
              onClick={() => handleDotClick(index)}
              className={`transition-all rounded-full ${
                index === currentIndex
                  ? 'w-8 md:w-10 h-2 md:h-3 bg-white'
                  : 'w-2 md:w-3 h-2 md:h-3 bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`Go to banner ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
