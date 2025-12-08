import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

// Fallback images if API fails
const FALLBACK_IMAGES = [
  '/hero/IMG_5814.png',
  '/hero/IMG_5815.png',
  '/hero/IMG_5816.png',
  '/hero/IMG_5817.png',
  '/hero/IMG_5818.png',
  '/hero/IMG_5819.png',
  '/hero/IMG_5820.png',
  '/hero/IMG_5821.png',
  '/hero/IMG_5822.png',
  '/hero/IMG_5823.png',
  '/hero/IMG_5824.png',
  '/hero/IMG_5825.png',
  '/hero/IMG_5826.png',
];

export const HeroImageCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [heroImages, setHeroImages] = useState<string[]>(FALLBACK_IMAGES);
  const [loading, setLoading] = useState(true);

  // Fetch hero images from API (public endpoint)
  useEffect(() => {
    const fetchHeroImages = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/hero-images');
        const data = await response.json();
        
        if (data.success && data.data && data.data.length > 0) {
          // Filter only active images and extract URLs
          const activeImages = data.data
            .filter((img: any) => img.is_active)
            .map((img: any) => img.image_url);
          
          if (activeImages.length > 0) {
            setHeroImages(activeImages);
          }
        }
      } catch (error) {
        console.log('Using fallback hero images');
        // Keep fallback images
      } finally {
        setLoading(false);
      }
    };

    fetchHeroImages();
  }, []);

  useEffect(() => {
    if (heroImages.length === 0) return;
    
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % heroImages.length);
        setTimeout(() => {
          setIsTransitioning(false);
        }, 100);
      }, 800);
    }, 5000);

    return () => clearInterval(interval);
  }, [heroImages.length]);

  if (loading || heroImages.length === 0) {
    return (
      <div className="relative w-full h-full flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-2 border-foreground border-t-transparent rounded-full"></div>
      </div>
    );
  }

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
          {/* Product image - clean presentation */}
          <div className="absolute inset-0 flex items-center justify-center p-4 md:p-8">
            <img
              src={heroImages[currentIndex]}
              alt="Fashion"
              className={cn(
                "min-w-[70%] min-h-[70%] max-w-full max-h-full object-contain drop-shadow-[0_0_40px_rgba(255,255,255,0.3)]",
                "transition-all duration-1000 ease-out",
                isTransitioning ? "scale-95 opacity-0" : "scale-100 opacity-100"
              )}
              style={{
                imageRendering: 'high-quality'
              }}
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
        {heroImages.map((_, index) => (
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

