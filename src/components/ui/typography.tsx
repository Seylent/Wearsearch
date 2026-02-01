/**
 * Typography Components
 * Reusable typography components with consistent styling
 */

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/**
 * Heading Component
 * For all heading levels (h1-h6) with consistent styling
 */
const headingVariants = cva('font-display tracking-tight text-foreground', {
  variants: {
    level: {
      1: 'text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold',
      2: 'text-3xl sm:text-4xl md:text-5xl font-bold',
      3: 'text-2xl sm:text-3xl md:text-4xl font-semibold',
      4: 'text-xl sm:text-2xl md:text-3xl font-semibold',
      5: 'text-lg sm:text-xl md:text-2xl font-medium',
      6: 'text-base sm:text-lg md:text-xl font-medium',
    },
    variant: {
      default: '',
      gradient: 'bg-gradient-to-r from-white via-white to-white/80 bg-clip-text text-transparent',
      neon: 'neon-text',
      muted: 'text-muted-foreground',
    },
    align: {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right',
    },
  },
  defaultVariants: {
    level: 1,
    variant: 'default',
    align: 'left',
  },
});

export interface HeadingProps
  extends React.HTMLAttributes<HTMLHeadingElement>, VariantProps<typeof headingVariants> {
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

export const Heading = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ className, level = 1, as, variant, align, ...props }, ref) => {
    const Component = as || (`h${level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6');

    return (
      <Component
        ref={ref}
        className={cn(headingVariants({ level, variant, align, className }))}
        {...props}
      />
    );
  }
);

Heading.displayName = 'Heading';

/**
 * Text Component
 * For body text, descriptions, and paragraphs
 */
const textVariants = cva('text-foreground', {
  variants: {
    size: {
      xs: 'text-xs leading-4',
      sm: 'text-sm leading-5',
      base: 'text-base leading-6',
      lg: 'text-lg leading-7',
      xl: 'text-xl leading-8',
    },
    variant: {
      default: '',
      muted: 'text-muted-foreground',
      secondary: 'text-secondary-foreground',
      destructive: 'text-destructive',
      success: 'text-green-500',
      warning: 'text-yellow-500',
    },
    weight: {
      normal: 'font-normal',
      medium: 'font-medium',
      semibold: 'font-semibold',
      bold: 'font-bold',
    },
    align: {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right',
    },
  },
  defaultVariants: {
    size: 'base',
    variant: 'default',
    weight: 'normal',
    align: 'left',
  },
});

export interface TextProps
  extends React.HTMLAttributes<HTMLElement>, VariantProps<typeof textVariants> {
  as?: 'p' | 'span' | 'div' | 'label';
}

export const Text = React.forwardRef<HTMLElement, TextProps>(
  ({ className, as: Component = 'p', size, variant, weight, align, ...props }, ref) => {
    return (
      <Component
        ref={ref as React.Ref<any>}
        className={cn(textVariants({ size, variant, weight, align, className }))}
        {...props}
      />
    );
  }
);

Text.displayName = 'Text';

/**
 * Label Component
 * For form labels and small descriptive text
 */
const labelVariants = cva(
  'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
  {
    variants: {
      variant: {
        default: 'text-foreground',
        muted: 'text-muted-foreground',
        destructive: 'text-destructive',
      },
      required: {
        true: "after:content-['*'] after:ml-0.5 after:text-destructive",
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      required: false,
    },
  }
);

export interface LabelTextProps
  extends React.LabelHTMLAttributes<HTMLLabelElement>, VariantProps<typeof labelVariants> {}

export const LabelText = React.forwardRef<HTMLLabelElement, LabelTextProps>(
  ({ className, variant, required, ...props }, ref) => {
    return (
      <label ref={ref} className={cn(labelVariants({ variant, required, className }))} {...props} />
    );
  }
);

LabelText.displayName = 'LabelText';

/**
 * Code Component
 * For inline code snippets
 */
export const Code = React.forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>(
  ({ className, ...props }, ref) => {
    return (
      <code
        ref={ref}
        className={cn(
          'relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold',
          className
        )}
        {...props}
      />
    );
  }
);

Code.displayName = 'Code';

/**
 * Pre Component
 * For code blocks
 */
export const Pre = React.forwardRef<HTMLPreElement, React.HTMLAttributes<HTMLPreElement>>(
  ({ className, ...props }, ref) => {
    return (
      <pre
        ref={ref}
        className={cn('overflow-x-auto rounded-lg bg-muted p-4 font-mono text-sm', className)}
        {...props}
      />
    );
  }
);

Pre.displayName = 'Pre';

/**
 * Blockquote Component
 * For quotes and callouts
 */
export const Blockquote = React.forwardRef<
  HTMLQuoteElement,
  React.HTMLAttributes<HTMLQuoteElement>
>(({ className, ...props }, ref) => {
  return (
    <blockquote
      ref={ref}
      className={cn('border-l-4 border-primary pl-4 italic text-muted-foreground', className)}
      {...props}
    />
  );
});

Blockquote.displayName = 'Blockquote';

/**
 * List Component
 * For ordered and unordered lists
 */
export interface ListProps extends React.HTMLAttributes<HTMLUListElement | HTMLOListElement> {
  ordered?: boolean;
}

export const List = React.forwardRef<HTMLUListElement | HTMLOListElement, ListProps>(
  ({ className, ordered = false, ...props }, ref) => {
    const Component = ordered ? 'ol' : 'ul';

    return (
      <Component
        ref={ref as React.Ref<any>}
        className={cn(
          'space-y-2',
          ordered ? 'list-decimal list-inside' : 'list-disc list-inside',
          className
        )}
        {...props}
      />
    );
  }
);

List.displayName = 'List';

/**
 * ListItem Component
 */
export const ListItem = React.forwardRef<HTMLLIElement, React.HTMLAttributes<HTMLLIElement>>(
  ({ className, ...props }, ref) => {
    return <li ref={ref} className={cn('text-foreground', className)} {...props} />;
  }
);

ListItem.displayName = 'ListItem';
