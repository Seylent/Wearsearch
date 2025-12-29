import React, { memo } from 'react';

interface ImageDebuggerProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  loading?: 'lazy' | 'eager';
}

const ImageDebugger: React.FC<ImageDebuggerProps> = memo(({ 
  src, 
  alt = '', 
  className = '', 
  loading = 'lazy',
  ...rest 
}) => {
  const [failed, setFailed] = React.useState(false);
  const [isVisible, setIsVisible] = React.useState(false);
  const imgRef = React.useRef<HTMLImageElement>(null);

  // Only load image when it's about to become visible
  React.useEffect(() => {
    if (!imgRef.current || loading === 'eager') {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        });
      },
      { rootMargin: '50px' } // Start loading 50px before visible
    );

    observer.observe(imgRef.current);

    return () => observer.disconnect();
  }, [loading]);

  return (
    <div ref={imgRef} className={`w-full h-full bg-muted flex items-center justify-center ${className}`}>
      {!failed && isVisible ? (
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
          loading={loading}
          onError={() => setFailed(true)}
          {...rest}
        />
      ) : !failed ? (
        <div className="w-full h-full bg-gradient-to-br from-gray-900 to-black" />
      ) : (
        <div className="text-sm text-muted-foreground p-4">Image failed to load</div>
      )}
    </div>
  );
});

ImageDebugger.displayName = 'ImageDebugger';

export default ImageDebugger;
