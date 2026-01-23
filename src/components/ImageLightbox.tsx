'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

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
  initialIndex = 0,
}: ImageLightboxProps) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isAnimating, setIsAnimating] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const pendingPosition = useRef({ x: 0, y: 0 });

  const allImages = images.length > 0 ? images : [src];
  const currentImage = allImages[currentIndex] || src;

  // Reset zoom when image changes
  useEffect(() => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  }, [currentIndex]);

  // Reset when opened + block scroll
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
      setIsAnimating(true);
      setZoom(1);
      setPosition({ x: 0, y: 0 });
      // Block page scroll
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    } else {
      // Restore scroll
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    };
  }, [isOpen, initialIndex]);

  useEffect(() => {
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  // Keyboard
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && allImages.length > 1 && zoom === 1) {
        setCurrentIndex(prev => (prev - 1 + allImages.length) % allImages.length);
      }
      if (e.key === 'ArrowRight' && allImages.length > 1 && zoom === 1) {
        setCurrentIndex(prev => (prev + 1) % allImages.length);
      }
      if (e.key === '+' || e.key === '=') {
        handleZoomIn();
      }
      if (e.key === '-') {
        handleZoomOut();
      }
      if (e.key === '0') {
        handleResetZoom();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, allImages.length, onClose, zoom]);

  // Zoom functions
  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.5, 4));
  };

  const handleZoomOut = () => {
    setZoom(prev => {
      const newZoom = Math.max(prev - 0.5, 1);
      if (newZoom === 1) {
        setPosition({ x: 0, y: 0 });
      }
      return newZoom;
    });
  };

  const handleResetZoom = () => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  const schedulePositionUpdate = (x: number, y: number) => {
    pendingPosition.current = { x, y };
    if (rafRef.current === null) {
      rafRef.current = requestAnimationFrame(() => {
        setPosition(pendingPosition.current);
        rafRef.current = null;
      });
    }
  };

  // Mouse drag for panning
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom > 1) {
      setIsDragging(true);
      dragStart.current = { x: e.clientX - position.x, y: e.clientY - position.y };
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoom > 1) {
      const newX = e.clientX - dragStart.current.x;
      const newY = e.clientY - dragStart.current.y;
      schedulePositionUpdate(newX, newY);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch handling
  const handleTouchStart = (e: React.TouchEvent) => {
    if (zoom > 1 && e.touches.length === 1) {
      setIsDragging(true);
      dragStart.current = {
        x: e.touches[0].clientX - position.x,
        y: e.touches[0].clientY - position.y,
      };
    } else if (zoom === 1) {
      touchStartX.current = e.touches[0].clientX;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging && zoom > 1 && e.touches.length === 1) {
      const newX = e.touches[0].clientX - dragStart.current.x;
      const newY = e.touches[0].clientY - dragStart.current.y;
      schedulePositionUpdate(newX, newY);
    } else if (zoom === 1) {
      touchEndX.current = e.touches[0].clientX;
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);

    if (zoom === 1) {
      const diff = touchStartX.current - touchEndX.current;
      const threshold = 50;

      if (Math.abs(diff) > threshold && allImages.length > 1) {
        if (diff > 0) {
          setCurrentIndex(prev => (prev + 1) % allImages.length);
        } else {
          setCurrentIndex(prev => (prev - 1 + allImages.length) % allImages.length);
        }
      }
    }

    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  // Double tap to zoom
  const lastTap = useRef<number>(0);
  const handleDoubleClick = () => {
    if (zoom === 1) {
      setZoom(2);
    } else {
      handleResetZoom();
    }
  };

  const handleTap = () => {
    const now = Date.now();
    if (now - lastTap.current < 300) {
      handleDoubleClick();
    }
    lastTap.current = now;
  };

  const goToPrevious = () => {
    if (zoom === 1) {
      setCurrentIndex(prev => (prev - 1 + allImages.length) % allImages.length);
    }
  };

  const goToNext = () => {
    if (zoom === 1) {
      setCurrentIndex(prev => (prev + 1) % allImages.length);
    }
  };

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(onClose, 200);
  };

  if (!isOpen) return null;

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 md:p-6"
      onClick={handleClose}
    >
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity duration-200 ${
          isAnimating ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Compact Modal */}
      <div
        className={`relative w-full h-full md:h-auto md:max-h-[90svh] md:max-w-[1200px] rounded-2xl md:rounded-3xl overflow-hidden border border-white/10 bg-zinc-900/95 backdrop-blur-2xl shadow-[0_8px_40px_rgba(0,0,0,0.5)] transition-all duration-200 flex flex-col ${
          isAnimating ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-4'
        }`}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <span className="text-xs text-white/60">
            {currentIndex + 1} / {allImages.length}
          </span>

          {/* Zoom Controls */}
          <div className="hidden md:flex items-center gap-1">
            <button
              onClick={handleZoomOut}
              disabled={zoom <= 1}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 active:bg-white/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              title="Зменшити"
            >
              <ZoomOut className="w-4 h-4 text-white/80" />
            </button>

            <span className="text-xs text-white/60 min-w-[40px] text-center">
              {Math.round(zoom * 100)}%
            </span>

            <button
              onClick={handleZoomIn}
              disabled={zoom >= 4}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 active:bg-white/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              title="Збільшити"
            >
              <ZoomIn className="w-4 h-4 text-white/80" />
            </button>

            {zoom > 1 && (
              <button
                onClick={handleResetZoom}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 active:bg-white/20 transition-colors ml-1"
                title="Скинути зум"
              >
                <RotateCcw className="w-4 h-4 text-white/80" />
              </button>
            )}
          </div>

          <button
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 active:bg-white/20 transition-colors"
          >
            <X className="w-4 h-4 text-white/80" />
          </button>
        </div>

        {/* Image Container */}
        <div
          ref={imageContainerRef}
          className={`relative flex-1 min-h-[320px] bg-black/40 flex items-center justify-center overflow-hidden ${
            zoom > 1 ? 'cursor-grab' : 'cursor-zoom-in'
          } ${isDragging ? 'cursor-grabbing' : ''}`}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onClick={handleTap}
          onDoubleClick={handleDoubleClick}
        >
          <img
            src={currentImage}
            alt={alt}
            className="max-w-full max-h-full object-contain select-none transition-transform duration-100"
            style={{
              transform: `scale(${zoom}) translate(${position.x / zoom}px, ${position.y / zoom}px)`,
              willChange: 'transform',
            }}
            draggable={false}
          />

          {/* Navigation Arrows - Inside (only when not zoomed) */}
          {allImages.length > 1 && zoom === 1 && (
            <>
              <button
                onClick={e => {
                  e.stopPropagation();
                  goToPrevious();
                }}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center text-white transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <button
                onClick={e => {
                  e.stopPropagation();
                  goToNext();
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center text-white transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          {/* Zoom hint */}
          {zoom === 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full bg-black/60 text-white/70 text-xs pointer-events-none">
              Двічі натисніть для зуму
            </div>
          )}
        </div>

        {/* Thumbnails */}
        {allImages.length > 1 && (
          <div className="px-4 py-3 border-t border-white/10 bg-black/30">
            <div className="flex items-center gap-2 overflow-x-auto">
              {allImages.map((image, idx) => (
                <button
                  key={image}
                  onClick={() => {
                    setCurrentIndex(idx);
                    handleResetZoom();
                  }}
                  className={`relative h-14 w-14 rounded-lg overflow-hidden border transition-all ${
                    idx === currentIndex
                      ? 'border-white'
                      : 'border-white/20 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={image} alt={alt} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default ImageLightbox;
