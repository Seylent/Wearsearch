/**
 * Page Transition Wrapper
 * Adds smooth fade/slide animations between pages
 */

'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

export const PageTransition: React.FC<PageTransitionProps> = ({ 
  children, 
  className 
}) => {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(false);
  const [displayChildren, setDisplayChildren] = useState(children);

  useEffect(() => {
    // Start with hidden state
    setIsVisible(false);
    
    // Small delay to ensure CSS transition works
    const showTimeout = setTimeout(() => {
      setDisplayChildren(children);
      setIsVisible(true);
    }, 50);

    return () => clearTimeout(showTimeout);
  }, [pathname, children]);

  return (
    <div
      className={cn(
        'transition-all duration-300 ease-out',
        isVisible 
          ? 'opacity-100 translate-y-0' 
          : 'opacity-0 translate-y-2',
        className
      )}
    >
      {displayChildren}
    </div>
  );
};

/**
 * Fade In on Mount animation wrapper
 */
export const FadeIn: React.FC<{
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
}> = ({ children, delay = 0, duration = 500, className }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timeout);
  }, [delay]);

  return (
    <div
      className={cn(
        'transition-all ease-out',
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4',
        className
      )}
      style={{ transitionDuration: `${duration}ms` }}
    >
      {children}
    </div>
  );
};

/**
 * Stagger children animation
 */
export const StaggerChildren: React.FC<{
  children: React.ReactNode;
  staggerDelay?: number;
  className?: string;
}> = ({ children, staggerDelay = 100, className }) => {
  return (
    <div className={className}>
      {React.Children.map(children, (child, index) => (
        <FadeIn delay={index * staggerDelay}>
          {child}
        </FadeIn>
      ))}
    </div>
  );
};

export default PageTransition;
