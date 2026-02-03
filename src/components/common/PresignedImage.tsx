'use client';

import Image, { type ImageProps } from 'next/image';
import { usePresignedImage } from '@/hooks/usePresignedImage';

type PresignedImageProps = Omit<ImageProps, 'src'> & {
  src: string;
  fallbackSrc?: string;
};

export const PresignedImage = ({
  src,
  fallbackSrc = '/placeholder.svg',
  ...props
}: PresignedImageProps) => {
  const resolved = usePresignedImage(src);
  const displaySrc = resolved || fallbackSrc;

  return <Image src={displaySrc} {...props} />;
};
