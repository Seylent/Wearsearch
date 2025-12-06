import { useState } from 'react';
import { cn } from '@/lib/utils';

interface ProductImageProps {
  src: string;
  alt: string;
  className?: string;
  aspectRatio?: 'square' | 'portrait' | 'landscape';
  removeBackground?: boolean;
}

export const ProductImage = ({ 
  src, 
  alt, 
  className = '',
  aspectRatio = 'square',
  removeBackground = false
}: ProductImageProps) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  const aspectRatioClass = {
    square: 'aspect-square',
    portrait: 'aspect-[3/4]',
    landscape: 'aspect-[4/3]'
  }[aspectRatio];

  return (
    <div 
      className={cn(
        'relative overflow-hidden rounded-xl',
        aspectRatioClass,
        className
      )}
    >
      {/* Background with blur effect */}
      <div 
        className="absolute inset-0 blur-2xl opacity-20 scale-110"
        style={{
          backgroundImage: `url(${src})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      />

      {/* Main image */}
      <div className="relative w-full h-full flex items-center justify-center p-4">
        {!loaded && !error && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin" />
          </div>
        )}
        
        <img
          src={src}
          alt={alt}
          className={cn(
            'max-w-full max-h-full object-contain transition-all duration-500',
            loaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95',
            removeBackground && 'mix-blend-multiply dark:mix-blend-screen',
            error && 'hidden'
          )}
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
          loading="lazy"
        />

        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-card/50 backdrop-blur-sm">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-muted flex items-center justify-center">
                📦
              </div>
              <p className="text-sm text-muted-foreground">Image unavailable</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductImage;

