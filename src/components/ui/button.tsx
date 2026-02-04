import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-black ring-offset-background transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed touch-manipulation active:scale-95 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm hover:shadow-md',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm',
        outline:
          'border-2 border-input bg-background hover:bg-accent hover:text-accent-foreground hover:border-accent',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-sm',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
        pill: 'border border-earth bg-earth text-cream hover:bg-warm-gray uppercase',
        pillOutline: 'border border-earth text-earth hover:bg-earth hover:text-cream uppercase',
      },
      size: {
        default: 'min-h-[44px] h-11 px-6 py-2.5',
        sm: 'min-h-[40px] h-10 rounded-full px-5',
        lg: 'min-h-[48px] h-12 rounded-full px-8 text-base',
        icon: 'min-h-[44px] min-w-[44px] h-11 w-11',
        pill: 'min-h-[44px] h-11 px-6 sm:px-8 text-[10px] sm:text-xs tracking-[0.2em] sm:tracking-[0.3em]',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
