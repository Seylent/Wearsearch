import { useState } from "react";

interface ImageDebuggerProps {
  src: string;
  alt: string;
  className?: string;
}

const ImageDebugger = ({ src, alt, className }: ImageDebuggerProps) => {
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadSuccess, setLoadSuccess] = useState(false);

  const handleLoad = () => {
    setLoadSuccess(true);
    console.log('✅ Image loaded successfully:', src);
  };

  const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const error = `Failed to load: ${src}`;
    setLoadError(error);
    console.error('❌ Image load error:', error);
    console.error('Image details:', {
      src,
      naturalWidth: e.currentTarget.naturalWidth,
      naturalHeight: e.currentTarget.naturalHeight,
      complete: e.currentTarget.complete
    });
    e.currentTarget.src = "/placeholder.svg";
  };

  return (
    <div className="relative">
      <img
        src={src || "/placeholder.svg"}
        alt={alt}
        className={className}
        crossOrigin="anonymous"
        onLoad={handleLoad}
        onError={handleError}
      />
      {loadError && (
        <div className="absolute inset-0 bg-red-500/10 flex items-center justify-center text-xs text-red-600 p-2">
          Debug: Check Console
        </div>
      )}
    </div>
  );
};

export default ImageDebugger;
