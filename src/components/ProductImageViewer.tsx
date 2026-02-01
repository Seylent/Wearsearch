import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import NextImage from 'next/image';
import { X, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';

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

  const startPoint = useRef({ x: 0, y: 0, time: 0 });
  const pinchStartDistance = useRef<number | null>(null);
  const pinchStartZoom = useRef(1);
  const zoomRef = useRef(1);
  const zoomRaf = useRef<number | null>(null);

  const currentImage = allImages[currentIndex] ?? allImages[0];

  useEffect(() => {
    if (!isOpen) return;
    setCurrentIndex(initialIndex);
    setZoom(1);
    zoomRef.current = 1;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, initialIndex]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'ArrowLeft' && allImages.length > 1 && zoomRef.current === 1) {
        setCurrentIndex(prev => (prev - 1 + allImages.length) % allImages.length);
      }
      if (event.key === 'ArrowRight' && allImages.length > 1 && zoomRef.current === 1) {
        setCurrentIndex(prev => (prev + 1) % allImages.length);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, allImages.length, onClose]);

  useEffect(() => {
    if (!isOpen || allImages.length === 0) return;
    const current = allImages[currentIndex];
    const prev = allImages[(currentIndex - 1 + allImages.length) % allImages.length];
    const next = allImages[(currentIndex + 1) % allImages.length];
    [current, prev, next].forEach(src => {
      if (!src) return;
      const img = new Image();
      img.src = src;
    });
  }, [isOpen, allImages, currentIndex]);

  useEffect(
    () => () => {
      if (zoomRaf.current !== null) {
        cancelAnimationFrame(zoomRaf.current);
      }
    },
    []
  );

  const handleZoomTo = (nextZoom: number) => {
    const clamped = clamp(nextZoom, 1, 4);
    zoomRef.current = clamped;
    if (zoomRaf.current === null) {
      zoomRaf.current = requestAnimationFrame(() => {
        setZoom(zoomRef.current);
        zoomRaf.current = null;
      });
    }
  };

  const handleToggleZoom = () => {
    if (zoomRef.current === 1) {
      handleZoomTo(2.2);
    } else {
      handleZoomTo(1);
    }
  };

  const handlePrev = () => {
    if (allImages.length <= 1 || zoomRef.current !== 1) return;
    setCurrentIndex(prev => (prev - 1 + allImages.length) % allImages.length);
  };

  const handleNext = () => {
    if (allImages.length <= 1 || zoomRef.current !== 1) return;
    setCurrentIndex(prev => (prev + 1) % allImages.length);
  };

  const handleTouchStart = (event: React.TouchEvent) => {
    if (event.touches.length === 2) {
      const dx = event.touches[0].clientX - event.touches[1].clientX;
      const dy = event.touches[0].clientY - event.touches[1].clientY;
      pinchStartDistance.current = Math.hypot(dx, dy);
      pinchStartZoom.current = zoomRef.current;
      return;
    }

    if (event.touches.length === 1) {
      startPoint.current = {
        x: event.touches[0].clientX,
        y: event.touches[0].clientY,
        time: Date.now(),
      };
    }
  };

  const handleTouchMove = (event: React.TouchEvent) => {
    if (event.touches.length === 2 && pinchStartDistance.current) {
      event.preventDefault();
      const dx = event.touches[0].clientX - event.touches[1].clientX;
      const dy = event.touches[0].clientY - event.touches[1].clientY;
      const nextDistance = Math.hypot(dx, dy);
      const scale = nextDistance / pinchStartDistance.current;
      handleZoomTo(pinchStartZoom.current * scale);
    }
  };

  const handleTouchEnd = (event: React.TouchEvent) => {
    if (pinchStartDistance.current) {
      pinchStartDistance.current = null;
      return;
    }

    const touch = event.changedTouches[0];
    if (!touch) return;

    const dx = touch.clientX - startPoint.current.x;
    const dy = touch.clientY - startPoint.current.y;
    const dt = Date.now() - startPoint.current.time;

    if (zoomRef.current === 1 && Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy)) {
      if (dx < 0) handleNext();
      if (dx > 0) handlePrev();
      return;
    }

    if (Math.abs(dx) < 8 && Math.abs(dy) < 8 && dt < 300) {
      handleToggleZoom();
    }
  };

  if (!isOpen || !currentImage) return null;

  return createPortal(
    <div className="fixed inset-0 z-[120] bg-black/95 text-white overflow-hidden">
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />

      <div className="relative z-[1] flex flex-col h-full min-h-0">
        <div className="flex items-center justify-between px-5 sm:px-8 py-4">
          <div className="text-sm text-white/60">
            {currentIndex + 1} / {allImages.length}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="relative flex-1 flex items-start justify-center overflow-hidden min-h-0 pt-2 sm:pt-4">
          {allImages.length > 1 && zoomRef.current === 1 && (
            <>
              <button
                type="button"
                onClick={handlePrev}
                className="absolute left-4 sm:left-8 z-10 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 transition"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="absolute right-4 sm:right-8 z-10 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 transition"
                aria-label="Next image"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          <div
            className="relative max-h-[70vh] max-w-[92vw] sm:max-w-[80vw]"
            onClick={handleToggleZoom}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{
              cursor: zoom > 1 ? 'zoom-out' : 'zoom-in',
              touchAction: 'none',
            }}
          >
            <NextImage
              src={currentImage}
              alt={alt}
              fill
              sizes="(max-width: 768px) 92vw, 80vw"
              className="object-contain select-none"
              draggable={false}
              priority
              style={{
                transform: `scale(${zoom})`,
                transition: 'transform 160ms ease',
                willChange: 'transform',
              }}
            />
            <div className="absolute right-4 bottom-4 flex items-center gap-2">
              <div className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs text-white/70">
                <ZoomIn className="w-3 h-3" />
                {Math.round(zoom * 100)}%
              </div>
            </div>
          </div>
        </div>

        <div className="px-4 sm:px-8 pb-6 flex-none">
          <div className="flex gap-3 overflow-x-auto py-3">
            {allImages.map((image, index) => (
              <button
                key={`${image}-${index}`}
                type="button"
                onClick={() => setCurrentIndex(index)}
                className={`relative h-16 w-16 sm:h-20 sm:w-20 flex-shrink-0 overflow-hidden rounded-xl border transition ${
                  index === currentIndex
                    ? 'border-white/80 ring-2 ring-white/40'
                    : 'border-white/10 opacity-70 hover:opacity-100'
                }`}
                aria-label={`Open image ${index + 1}`}
              >
                <NextImage
                  src={image}
                  alt={alt}
                  width={80}
                  height={80}
                  className="h-full w-full object-cover"
                  draggable={false}
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
