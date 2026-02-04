const isDirectUrl = (value: string) =>
  value.startsWith('http://') ||
  value.startsWith('https://') ||
  value.startsWith('/') ||
  value.startsWith('data:') ||
  value.startsWith('blob:');

export const usePresignedImage = (source?: string) => {
  if (!source) return '';
  if (isDirectUrl(source)) return source;
  if (process.env.NODE_ENV !== 'production') {
    console.warn('Non-absolute image URL detected; backend should return full URLs:', source);
  }
  return source;
};

export const usePresignedImages = (sources: string[]) => {
  return sources.map(source => {
    if (!source) return '';
    if (isDirectUrl(source)) return source;
    if (process.env.NODE_ENV !== 'production') {
      console.warn('Non-absolute image URL detected; backend should return full URLs:', source);
    }
    return source;
  });
};
