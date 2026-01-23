/**
 * Breadcrumbs Component - Simple and Clean
 */

import React from 'react';
import Link from 'next/link';
import { Home } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items = [], className }) => {
  if (items.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className={cn('text-xs sm:text-sm', className)}>
      <div className="flex flex-wrap items-center text-foreground/60">
        <Link href="/" className="hover:text-foreground transition-colors">
          <Home className="w-4 h-4" />
        </Link>

        <span className="mx-2 text-foreground/30">/</span>

        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <React.Fragment key={index}>
              {item.href && !isLast ? (
                <Link href={item.href} className="hover:text-foreground transition-colors">
                  {item.label}
                </Link>
              ) : (
                <span className={isLast ? 'text-foreground' : ''}>{item.label}</span>
              )}

              {!isLast && <span className="mx-2 text-foreground/30">/</span>}
            </React.Fragment>
          );
        })}
      </div>
    </nav>
  );
};

export default Breadcrumbs;
