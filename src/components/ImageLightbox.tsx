import { useState, useEffect } from "react";
import { X, ZoomIn, ZoomOut, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  const [scale, setScale] = useState(1);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const allImages = images.length > 0 ? images : [src];
  const currentImage = allImages[currentIndex] || src;

  // Reset when opened
  useEffect(() => {
    if (isOpen) {
      setScale(1);
      setCurrentIndex(initialIndex);
    }
  }, [isOpen, initialIndex]);

  // Keyboard
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && allImages.length > 1) {
        setCurrentIndex(prev => (prev - 1 + allImages.length) % allImages.length);
        setScale(1);
      }
      if (e.key === "ArrowRight" && allImages.length > 1) {
        setCurrentIndex(prev => (prev + 1) % allImages.length);
        setScale(1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, allImages.length, onClose]);

  if (!isOpen) return null;

  const zoomLevels = [1, 1.5, 2, 2.5, 3];
  const currentZoomIndex = zoomLevels.findIndex(z => z >= scale);

  return (
    <div 
      className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8"
      onClick={onClose}
    >
      {/* Modal Container */}
      <div 
        className="relative bg-card/95 backdrop-blur-xl rounded-2xl border border-border/50 max-w-5xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border/30">
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {allImages.length > 1 ? `${currentIndex + 1} / ${allImages.length}` : "Перегляд фото"}
            </span>
          </div>
          
          {/* Zoom Controls */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-muted/50 rounded-lg p-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setScale(prev => Math.max(1, prev - 0.5))}
                disabled={scale <= 1}
                className="h-8 w-8 p-0"
              >
                <Minus className="w-4 h-4" />
              </Button>
              
              <span className="text-sm font-medium w-14 text-center">
                {Math.round(scale * 100)}%
              </span>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setScale(prev => Math.min(3, prev + 0.5))}
                disabled={scale >= 3}
                className="h-8 w-8 p-0"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Image Container - Scrollable */}
        <div className="overflow-auto max-h-[calc(90vh-80px)] bg-black/20">
          <div 
            className="min-h-[400px] flex items-center justify-center p-4"
            style={{ 
              minWidth: scale > 1 ? `${scale * 100}%` : '100%',
              minHeight: scale > 1 ? `${scale * 100}%` : '400px'
            }}
          >
            <img
              src={currentImage}
              alt={alt}
              className="max-w-none object-contain transition-transform duration-200"
              style={{
                transform: `scale(${scale})`,
                transformOrigin: "center center",
              }}
              draggable={false}
            />
          </div>
        </div>

        {/* Quick Zoom Buttons - Bottom */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-card/90 backdrop-blur-sm rounded-full px-3 py-2 border border-border/50 shadow-lg">
          {zoomLevels.map((zoom) => (
            <button
              key={zoom}
              onClick={() => setScale(zoom)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                scale === zoom 
                  ? 'bg-primary text-primary-foreground' 
                  : 'hover:bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              {zoom === 1 ? 'Fit' : `${Math.round(zoom * 100)}%`}
            </button>
          ))}
        </div>

        {/* Navigation Arrows */}
        {allImages.length > 1 && (
          <>
            <button
              onClick={() => {
                setCurrentIndex(prev => (prev - 1 + allImages.length) % allImages.length);
                setScale(1);
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-card/80 hover:bg-card border border-border/50 flex items-center justify-center transition-colors shadow-lg"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <button
              onClick={() => {
                setCurrentIndex(prev => (prev + 1) % allImages.length);
                setScale(1);
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-card/80 hover:bg-card border border-border/50 flex items-center justify-center transition-colors shadow-lg"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ImageLightbox;
