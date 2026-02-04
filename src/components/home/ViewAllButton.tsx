'use client';

import { useRouter } from 'next/navigation';

type ViewAllVariant = 'dark' | 'glass';

const baseClass =
  'inline-flex items-center justify-center w-full sm:w-auto px-8 py-3 rounded-full text-[10px] sm:text-xs uppercase tracking-[0.2em] sm:tracking-[0.3em] transition-all duration-300 font-black';

const variants: Record<ViewAllVariant, string> = {
  dark: 'border border-border bg-black text-white hover:bg-black/90',
  glass: 'border border-white/20 bg-white/5 text-white hover:bg-white/10 hover:border-white/30',
};

export function ViewAllButton({
  label = 'View All Products',
  variant = 'dark',
}: Readonly<{ label?: string; variant?: ViewAllVariant }>) {
  const router = useRouter();

  return (
    <nav className="text-center mt-12">
      <button
        onClick={() => router.push('/products')}
        className={`${baseClass} ${variants[variant]}`}
      >
        <span className="relative">{label}</span>
      </button>
    </nav>
  );
}
