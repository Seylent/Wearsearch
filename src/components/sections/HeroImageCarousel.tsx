import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

// Hero images - 13 new PNG files with transparent backgrounds
const HERO_IMAGES = [
  {
    src: '/hero/IMG_5814.png',
    fallback: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=1000&fit=crop'
  },
  {
    src: '/hero/IMG_5815.png',
    fallback: 'https://images.unsplash.com/photo-1584735175315-9d5df23860e6?w=800&h=1000&fit=crop'
  },
  {
    src: '/hero/IMG_5816.png',
    fallback: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&h=1000&fit=crop'
  },
  {
    src: '/hero/IMG_5817.png',
    fallback: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=1000&fit=crop'
  },
  {
    src: '/hero/IMG_5818.png',
    fallback: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&h=1000&fit=crop'
  },
  {
    src: '/hero/IMG_5819.png',
    fallback: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&h=1000&fit=crop'
  },
  {
    src: '/hero/IMG_5820.png',
    fallback: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800&h=1000&fit=crop'
  },
  {
    src: '/hero/IMG_5821.png',
    fallback: 'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=800&h=1000&fit=crop'
  },
  {
    src: '/hero/IMG_5822.png',
    fallback: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&h=1000&fit=crop'
  },
  {
    src: '/hero/IMG_5823.png',
    fallback: 'https://images.unsplash.com/photo-1560243563-062bfc001d68?w=800&h=1000&fit=crop'
  },
  {
    src: '/hero/IMG_5824.png',
    fallback: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&h=1000&fit=crop'
  },
  {
    src: '/hero/IMG_5825.png',
    fallback: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&h=1000&fit=crop'
  },
  {
    src: '/hero/IMG_5826.png',
    fallback: 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=800&h=1000&fit=crop'
  },
];

export const HeroImageCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});

  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % HERO_IMAGES.length);
        setTimeout(() => {
          setIsTransitioning(false);
        }, 100); // Delay before fade in for smoother transition
      }, 800); // Longer fade out duration
    }, 5000); // Change image every 5 seconds (more time to view)

    return () => clearInterval(interval);
  }, []);

  const getImageSrc = (index: number) => {
    const image = HERO_IMAGES[index];
    return imageErrors[index] ? image.fallback : image.src;
  };

  const handleImageError = (index: number) => {
    setImageErrors(prev => ({ ...prev, [index]: true }));
  };

  // Positions: left, center, right - different for each of 13 images
  const positions = [
    { x: '-300px', y: '0px', rotate: '-8deg' },   // 1 - Left
    { x: '0px', y: '-50px', rotate: '2deg' },     // 2 - Center top
    { x: '280px', y: '30px', rotate: '6deg' },    // 3 - Right
    { x: '-250px', y: '80px', rotate: '-5deg' },  // 4 - Left bottom
    { x: '100px', y: '-40px', rotate: '3deg' },   // 5 - Center-right
    { x: '0px', y: '50px', rotate: '-3deg' },     // 6 - Center bottom
    { x: '300px', y: '-20px', rotate: '7deg' },   // 7 - Far right
    { x: '-200px', y: '-60px', rotate: '-6deg' }, // 8 - Left top
    { x: '-320px', y: '40px', rotate: '-9deg' },  // 9 - Far left
    { x: '150px', y: '60px', rotate: '4deg' },    // 10 - Right bottom
    { x: '0px', y: '0px', rotate: '0deg' },       // 11 - Perfect center
    { x: '260px', y: '-40px', rotate: '5deg' },   // 12 - Right top
    { x: '-180px', y: '20px', rotate: '-4deg' },  // 13 - Left center
  ];

  const currentPosition = positions[currentIndex % positions.length];

  return (
    <div className="relative w-full h-full">
      {/* Single large floating image */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div 
          className={cn(
            "absolute w-[550px] h-[650px] md:w-[700px] md:h-[850px]",
            "transition-all duration-[2000ms] ease-in-out",
            isTransitioning ? "opacity-0 scale-90" : "opacity-100 scale-100"
          )}
          style={{
            transform: `translateX(${currentPosition.x}) translateY(${currentPosition.y}) rotate(${currentPosition.rotate})`,
          }}
        >
          {/* Product image - clean presentation for transparent PNG */}
          <div className="absolute inset-0 flex items-center justify-center p-4 md:p-8">
            <img
              src={getImageSrc(currentIndex)}
              alt="Fashion"
              className={cn(
                "min-w-[70%] min-h-[70%] max-w-full max-h-full object-contain drop-shadow-[0_0_40px_rgba(255,255,255,0.3)]",
                "transition-all duration-1000 ease-out",
                isTransitioning ? "scale-95 opacity-0" : "scale-100 opacity-100"
              )}
              style={{
                imageRendering: 'high-quality'
              }}
              onError={() => handleImageError(currentIndex)}
            />
          </div>
        </div>
      </div>

      {/* Subtle floating animation overlay */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="absolute w-32 h-32 rounded-full bg-white/5 blur-3xl animate-float"
            style={{
              left: `${20 + i * 30}%`,
              top: `${30 + i * 20}%`,
              animationDelay: `${i * 1.5}s`,
              animationDuration: '8s',
            }}
          />
        ))}
      </div>

      {/* Progress dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-30">
        {HERO_IMAGES.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setIsTransitioning(true);
              setTimeout(() => {
                setCurrentIndex(index);
                setIsTransitioning(false);
              }, 300);
            }}
            className={cn(
              "h-1 rounded-full transition-all duration-500",
              index === currentIndex 
                ? "w-8 bg-white" 
                : "w-1 bg-white/30 hover:bg-white/50"
            )}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroImageCarousel;

