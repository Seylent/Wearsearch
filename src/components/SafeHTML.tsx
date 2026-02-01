'use client';

import DOMPurify from 'isomorphic-dompurify';
import { useMemo } from 'react';

interface SafeHTMLProps {
  html: string;
  className?: string;
}

export const SafeHTML = ({ html, className }: SafeHTMLProps) => {
  const sanitized = useMemo(
    () =>
      DOMPurify.sanitize(html, {
        ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'ul', 'ol', 'li', 'h2', 'h3', 'h4'],
        ALLOWED_ATTR: ['class'],
      }),
    [html]
  );

  return <div className={className} dangerouslySetInnerHTML={{ __html: sanitized }} />;
};
