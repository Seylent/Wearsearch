'use client';

export function ScrollButton({ targetId }: Readonly<{ targetId: string }>) {
  return (
    <div className="flex justify-center mb-6 sm:mb-10">
      <button
        onClick={() => {
          const section = document.getElementById(targetId);
          section?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }}
        className="relative w-12 h-12 sm:w-16 sm:h-16 rounded-full border-2 border-border bg-white hover:border-foreground transition-all duration-300 flex items-center justify-center group cursor-pointer"
        aria-label="Scroll to products"
      >
        <svg
          className="w-6 h-6 text-foreground"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
        </svg>
      </button>
    </div>
  );
}
