/**
 * Hook to detect if the user is on a touch device
 * Useful for conditional rendering of mobile-specific features
 * 
 * @returns {boolean} true if touch device, false otherwise
 * 
 * @example
 * const isTouch = useIsTouchDevice();
 * 
 * return (
 *   <button className={isTouch ? 'min-h-[48px]' : 'min-h-[40px]'}>
 *     Click me
 *   </button>
 * );
 */

import { useState, useEffect } from 'react';

export function useIsTouchDevice(): boolean {
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    const checkTouch = () => {
      // Multiple ways to detect touch capability
      const hasTouchStart = 'ontouchstart' in window;
      const hasTouchPoints = navigator.maxTouchPoints > 0;
      const hasCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
      
      setIsTouch(hasTouchStart || hasTouchPoints || hasCoarsePointer);
    };

    // Check on mount
    checkTouch();
    
    // Re-check on window resize (for hybrid devices)
    window.addEventListener('resize', checkTouch);
    
    return () => window.removeEventListener('resize', checkTouch);
  }, []);

  return isTouch;
}

/**
 * Hook to get the optimal touch target size based on device
 * Returns larger sizes for touch devices
 * 
 * @returns {object} sizes - Object with size values
 * 
 * @example
 * const { buttonSize, iconSize, spacing } = useTouchSizes();
 * 
 * return (
 *   <button className={`h-${buttonSize} w-${buttonSize}`}>
 *     <Icon className={`h-${iconSize} w-${iconSize}`} />
 *   </button>
 * );
 */
export function useTouchSizes() {
  const isTouch = useIsTouchDevice();

  return {
    // Button/touch target sizes (in Tailwind units)
    buttonSize: isTouch ? 12 : 10,        // 48px vs 40px
    buttonSizeClass: isTouch ? 'h-12 w-12' : 'h-10 w-10',
    minTouchTarget: isTouch ? 'min-h-[48px] min-w-[48px]' : 'min-h-[44px] min-w-[44px]',
    
    // Icon sizes
    iconSize: isTouch ? 5 : 4,            // 20px vs 16px
    iconSizeClass: isTouch ? 'h-5 w-5' : 'h-4 w-4',
    
    // Spacing
    spacing: isTouch ? 3 : 2,             // 12px vs 8px
    spacingClass: isTouch ? 'gap-3' : 'gap-2',
    
    // Padding
    padding: isTouch ? 4 : 3,             // 16px vs 12px
    paddingClass: isTouch ? 'p-4' : 'p-3',
    
    // Text sizes (for better readability)
    textSize: isTouch ? 'text-base' : 'text-sm',
    textSizeSmall: isTouch ? 'text-sm' : 'text-xs',
  };
}
