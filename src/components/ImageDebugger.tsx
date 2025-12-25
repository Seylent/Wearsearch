import React, { memo } from 'react';

interface ImageDebuggerProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
}

const ImageDebugger: React.FC<ImageDebuggerProps> = memo(({ src, alt = '', className = '', ...rest }) => {
  const [failed, setFailed] = React.useState(false);

  return (
    <div className={`w-full h-full bg-muted flex items-center justify-center ${className}`}>
      {!failed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
          onError={() => setFailed(true)}
          {...rest}
        />
      ) : (
        <div className="text-sm text-muted-foreground p-4">Image failed to load</div>
      )}
    </div>
  );
});

ImageDebugger.displayName = 'ImageDebugger';

export default ImageDebugger;
