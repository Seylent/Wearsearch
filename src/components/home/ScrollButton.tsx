'use client';

type ScrollButtonVariant = 'light' | 'glass';

const baseClass =
  'relative w-12 h-12 sm:w-16 sm:h-16 rounded-full border-2 transition-all duration-300 flex items-center justify-center group cursor-pointer';

const variants: Record<ScrollButtonVariant, { button: string; icon: string }> = {
  light: {
    button: 'border-border bg-white hover:border-foreground',
    icon: 'text-foreground',
  },
  glass: {
    button: 'border-white/30 bg-white/5 backdrop-blur-md hover:bg-white/10 hover:border-white/40',
    icon: 'text-white',
  },
};

export function ScrollButton({
  targetId,
  variant = 'light',
}: Readonly<{ targetId: string; variant?: ScrollButtonVariant }>) {
  const { button, icon } = variants[variant];

  return (
    <div className="flex justify-center mb-6 sm:mb-10">
      <button
        onClick={() => {
          const section = document.getElementById(targetId);
          section?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }}
        className={`${baseClass} ${button}`}
        aria-label="Scroll to products"
      >
        <svg
          className={`w-6 h-6 ${icon}`}
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
