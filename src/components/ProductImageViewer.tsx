'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

interface ProductImageViewerProps {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
  initialIndex?: number;
  alt?: string;
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export const ProductImageViewer = ({
  isOpen,
  onClose,
  images,
  initialIndex = 0,
  alt = 'Product image',
}: ProductImageViewerProps) => {
  const allImages = useMemo(() => (images.length > 0 ? images : []), [images]);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const pinchStartDistance = useRef<number | null>(null);
  const pinchStartZoom = useRef(1);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const pendingPosition = useRef({ x: 0, y: 0 });

  const currentImage = allImages[currentIndex] ?? allImages[0];

  useEffect(() => {
    const media = window.matchMedia('(max-width: 768px)');
    const handler = () => setIsMobile(media.matches);
    handler();
    media.addEventListener('change', handler);
    return () => media.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  }, [currentIndex]);

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
      setZoom(1);
      setPosition({ x: 0, y: 0 });
      setIsAnimating(true);
      setIsDark(document.documentElement.classList.contains('dark'));
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    } else {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    };
  }, [isOpen, initialIndex]);

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
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, allImages.length, onClose, zoom]);

  useEffect(
    () => () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    },
    []
  );

  const schedulePositionUpdate = (x: number, y: number) => {
    pendingPosition.current = { x, y };
    if (rafRef.current === null) {
      rafRef.current = requestAnimationFrame(() => {
        setPosition(pendingPosition.current);
        rafRef.current = null;
      });
    }
  };

  const handleResetZoom = () => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleZoomTo = (nextZoom: number) => {
    const clampedZoom = clamp(nextZoom, 1, 4);
    if (clampedZoom === 1) {
      handleResetZoom();
      return;
    }
    setZoom(clampedZoom);
  };

  const handleZoomIn = () => handleZoomTo(zoom + 0.5);
  const handleZoomOut = () => handleZoomTo(zoom - 0.5);

  const handleWheel = (e: React.WheelEvent) => {
    if (isMobile) return;
    e.preventDefault();
    const direction = e.deltaY > 0 ? -0.25 : 0.25;
    handleZoomTo(zoom + direction);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom > 1) {
      setIsDragging(true);
      dragStart.current = { x: e.clientX - position.x, y: e.clientY - position.y };
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoom > 1) {
      schedulePositionUpdate(e.clientX - dragStart.current.x, e.clientY - dragStart.current.y);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      pinchStartDistance.current = Math.hypot(dx, dy);
      pinchStartZoom.current = zoom;
    } else if (zoom > 1 && e.touches.length === 1) {
      setIsDragging(true);
      dragStart.current = {
        x: e.touches[0].clientX - position.x,
        y: e.touches[0].clientY - position.y,
      };
    } else if (zoom === 1 && e.touches.length === 1) {
      touchStartX.current = e.touches[0].clientX;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && pinchStartDistance.current) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const nextDistance = Math.hypot(dx, dy);
      const scale = nextDistance / pinchStartDistance.current;
      handleZoomTo(pinchStartZoom.current * scale);
      return;
    }

    if (isDragging && zoom > 1 && e.touches.length === 1) {
      schedulePositionUpdate(
        e.touches[0].clientX - dragStart.current.x,
        e.touches[0].clientY - dragStart.current.y
      );
    } else if (zoom === 1 && e.touches.length === 1) {
      touchEndX.current = e.touches[0].clientX;
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    pinchStartDistance.current = null;

    if (zoom === 1) {
      const diff = touchStartX.current - touchEndX.current;
      if (Math.abs(diff) > 50 && allImages.length > 1) {
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

  const handleImageClick = () => {
    if (isDragging || isMobile) return;
    if (zoom === 1) {
      handleZoomTo(2);
    } else {
      handleResetZoom();
    }
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

  if (!isOpen || !currentImage) return null;

  const overlayColor = isDark ? 'rgba(0,0,0,0.88)' : 'rgba(248,248,248,0.98)';
  const panelColor = isDark ? 'rgb(10,10,10)' : 'rgb(255,255,255)';
  const panelBorder = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)';
  const panelHeader = isDark ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.9)';
  const panelFooter = isDark ? 'rgba(0,0,0,0.9)' : 'rgba(245,245,245,0.95)';

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999]"
      style={{
        position: 'fixed',
        inset: 0,
        display: 'grid',
        placeItems: 'center',
        padding: '12px',
        minHeight: '100dvh',
      }}
      onClick={handleClose}
    >
      <div
        className={`absolute inset-0 transition-opacity duration-200 ${
          isAnimating ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ backgroundColor: overlayColor }}
      />

      <div
        className={`relative w-full max-w-[640px] md:max-w-[1200px] max-h-[85svh] md:max-h-[92svh] overflow-hidden border transition-all duration-200 flex flex-col rounded-2xl md:rounded-3xl ${
          isAnimating ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-4'
        }`}
        style={{ backgroundColor: panelColor, borderColor: panelBorder }}
        onClick={e => e.stopPropagation()}
      >
        <div
          className="hidden md:flex items-center justify-between px-4 py-3 border-b"
          style={{ backgroundColor: panelHeader, borderColor: panelBorder }}
        >
          <span className="text-xs text-white/70">
            {currentIndex + 1} / {allImages.length}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={handleZoomOut}
              disabled={zoom <= 1}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 active:bg-white/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              title="Zoom out"
            >
              <ZoomOut className="w-4 h-4 text-white/85" />
            </button>
            <span className="text-xs text-white/60 min-w-[40px] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              disabled={zoom >= 4}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 active:bg-white/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              title="Zoom in"
            >
              <ZoomIn className="w-4 h-4 text-white/85" />
            </button>
            {zoom > 1 && (
              <button
                onClick={handleResetZoom}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 active:bg-white/20 transition-colors ml-1"
                title="Reset zoom"
              >
                <RotateCcw className="w-4 h-4 text-white/85" />
              </button>
            )}
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 active:bg-white/20 transition-colors"
          >
            <X className="w-4 h-4 text-white/85" />
          </button>
        </div>

        <div className="md:hidden absolute top-4 left-4 z-20 text-xs text-white/70">
          {currentIndex + 1} / {allImages.length}
        </div>
        <button
          onClick={handleClose}
          className="md:hidden absolute top-3 right-3 z-20 w-8 h-8 rounded-full flex items-center justify-center"
          style={{
            backgroundColor: isDark ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.85)',
            color: isDark ? '#ffffff' : '#111111',
          }}
        >
          <X className="w-4 h-4" />
        </button>

        <div
          ref={imageContainerRef}
          className={`relative h-[60svh] md:flex-1 md:h-auto flex items-center justify-center overflow-hidden ${
            zoom > 1 ? 'cursor-grab' : 'cursor-zoom-in'
          } ${isDragging ? 'cursor-grabbing' : ''}`}
          style={{
            backgroundColor: panelColor,
            touchAction: zoom > 1 ? 'none' : 'pan-y pinch-zoom',
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onClick={handleImageClick}
          onWheel={handleWheel}
        >
          <img
            src={currentImage}
            alt={alt}
            className="w-full h-full object-contain select-none transition-transform duration-100"
            style={{
              transform: `scale(${zoom}) translate(${position.x / zoom}px, ${position.y / zoom}px)`,
              willChange: 'transform',
            }}
            draggable={false}
          />

          {allImages.length > 1 && zoom === 1 && (
            <>
              <button
                onClick={e => {
                  e.stopPropagation();
                  goToPrevious();
                }}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center text-white transition-colors"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={e => {
                  e.stopPropagation();
                  goToNext();
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center text-white transition-colors"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          {allImages.length > 1 && (
            <div className="md:hidden absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
              {allImages.map((_, idx) => (
                <span
                  key={`dot-${idx}`}
                  className={`h-1.5 rounded-full transition-all ${
                    idx === currentIndex ? 'w-4 bg-white' : 'w-1.5 bg-white/40'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {allImages.length > 1 && (
          <div
            className="hidden md:flex px-4 py-3 border-t"
            style={{ backgroundColor: panelFooter, borderColor: panelBorder }}
          >
            <div className="flex items-center gap-2 overflow-x-auto">
              {allImages.map((image, idx) => (
                <button
                  key={`${image}-${idx}`}
                  onClick={() => {
                    setCurrentIndex(idx);
                    handleResetZoom();
                  }}
                  className={`relative h-16 w-16 rounded-lg overflow-hidden border transition-all ${
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

        <div
          className="md:hidden flex items-center justify-center gap-3 py-2 border-t"
          style={{ backgroundColor: panelFooter, borderColor: panelBorder }}
        >
          <button
            onClick={handleZoomOut}
            disabled={zoom <= 1}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 text-white disabled:opacity-40"
            aria-label="Zoom out"
          >
            <ZoomOut className="w-5 h-5" />
          </button>
          <button
            onClick={handleResetZoom}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 text-white"
            aria-label="Reset zoom"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
          <button
            onClick={handleZoomIn}
            disabled={zoom >= 4}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 text-white disabled:opacity-40"
            aria-label="Zoom in"
          >
            <ZoomIn className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default ProductImageViewer;
