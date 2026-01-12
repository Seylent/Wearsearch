'use client';

import { useRouter } from 'next/navigation';

export function ViewAllButton({ label = 'View All Products' }: Readonly<{ label?: string }>) {
  const router = useRouter();
  
  return (
    <nav className="text-center mt-12">
      <button
        onClick={() => router.push('/products')}
        className="relative px-8 py-3 rounded-full border border-white/20 bg-white/5 backdrop-blur-[30px] text-white font-medium text-sm hover:bg-white/10 hover:border-white/30 transition-all duration-300"
      >
        <span className="relative">{label}</span>
      </button>
    </nav>
  );
}
