'use client';

import Image, { type ImageProps } from 'next/image';

type PresignedImageProps = Omit<ImageProps, 'src'> & {
  src: string;
  fallbackSrc?: string;
};

export const PresignedImage = ({
  src,
  fallbackSrc = '/placeholder.svg',
  ...props
}: PresignedImageProps) => {
  const displaySrc = src || fallbackSrc;

  return <Image src={displaySrc} {...props} />;
};
