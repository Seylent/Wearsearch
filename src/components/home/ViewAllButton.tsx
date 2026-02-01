'use client';

import { useRouter } from 'next/navigation';

export function ViewAllButton({ label = 'View All Products' }: Readonly<{ label?: string }>) {
  const router = useRouter();

  return (
    <nav className="text-center mt-12">
      <button
        onClick={() => router.push('/products')}
        className="relative px-8 py-3 rounded-none border border-border bg-black text-white font-medium text-sm hover:bg-black/90 transition-all duration-300"
      >
        <span className="relative">{label}</span>
      </button>
    </nav>
  );
}
