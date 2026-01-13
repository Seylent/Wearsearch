/**
 * Product Description Component
 * Displays product description with translation support
 */

'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { useProductTranslation } from '@/hooks/useProductTranslation';

interface ProductDescriptionProps {
  product: {
    description?: string;
    description_en?: string;
    description_ua?: string;
  };
  className?: string;
  maxLength?: number;
  showReadMore?: boolean;
}

export const ProductDescription: React.FC<ProductDescriptionProps> = ({
  product,
  className = '',
  maxLength = 150,
  showReadMore = true,
}) => {
  const { t } = useTranslation();
  const { getLocalizedDescription } = useProductTranslation();
  const [isExpanded, setIsExpanded] = React.useState(false);
  
  const description = getLocalizedDescription(product);
  
  if (!description) return null;
  
  const shouldTruncate = showReadMore && description.length > maxLength;
  const displayText = shouldTruncate && !isExpanded 
    ? description.slice(0, maxLength) + '...'
    : description;
  
  return (
    <div className={`text-sm text-gray-300 ${className}`}>
      <p className="leading-relaxed">
        {displayText}
      </p>
      
      {shouldTruncate && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-2 text-xs text-blue-400 hover:text-blue-300 transition-colors"
        >
          {isExpanded ? t('translation.showLess') : t('translation.readMore')}
        </button>
      )}
    </div>
  );
};