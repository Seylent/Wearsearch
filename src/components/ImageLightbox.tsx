import { useState, useEffect, useRef } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface ImageLightboxProps {
  src: string;
  alt: string;
  isOpen: boolean;
  onClose: () => void;
  images?: string[];
  initialIndex?: number;
}

export const ImageLightbox = ({ 
  src, 
  alt, 
  isOpen, 
  onClose,
  images = [],
  initialIndex = 0
}: ImageLightboxProps) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);

  const allImages = images.length > 0 ? images : [src];
  const currentImage = allImages[currentIndex] || src;

  // Reset when opened
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, initialIndex]);

  // Keyboard
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && allImages.length > 1) {
        setCurrentIndex(prev => (prev - 1 + allImages.length) % allImages.length);
      }
      if (e.key === "ArrowRight" && allImages.length > 1) {
        setCurrentIndex(prev => (prev + 1) % allImages.length);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, allImages.length, onClose]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    const threshold = 50;

    if (Math.abs(diff) > threshold && allImages.length > 1) {
      if (diff > 0) {
        // Свайп вліво - наступне фото
        setCurrentIndex(prev => (prev + 1) % allImages.length);
      } else {
        // Свайп вправо - попереднє фото
        setCurrentIndex(prev => (prev - 1 + allImages.length) % allImages.length);
      }
    }
    
    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  const goToPrevious = () => {
    setCurrentIndex(prev => (prev - 1 + allImages.length) % allImages.length);
  };

  const goToNext = () => {
    setCurrentIndex(prev => (prev + 1) % allImages.length);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 text-white">
        <span className="text-sm">
          {currentIndex + 1} / {allImages.length}
        </span>
        <button
          onClick={onClose}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 active:bg-white/20"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Image */}
      <div 
        className="flex-1 flex items-center justify-center overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <img
          src={currentImage}
          alt={alt}
          className="max-w-full max-h-full object-contain select-none"
          draggable={false}
        />
      </div>

      {/* Navigation Arrows - Desktop */}
      {allImages.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="hidden sm:flex absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 items-center justify-center text-white"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          
          <button
            onClick={goToNext}
            className="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 items-center justify-center text-white"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Dots */}
      {allImages.length > 1 && (
        <div className="flex items-center justify-center gap-2 p-4">
          {allImages.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`w-2 h-2 rounded-full transition-all ${
                idx === currentIndex ? 'bg-white w-4' : 'bg-white/40'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageLightbox;
