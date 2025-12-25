/**
 * RecommendedBadge Component
 * Displays a recommended/verified badge for stores
 */

export function RecommendedBadge({ className = "" }: { className?: string }) {
  return (
    <span 
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/10 border border-white/20 text-xs text-white select-none ${className}`}
      style={{
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.12) 100%)'
      }}
    >
      ⭐ Recommended
    </span>
  );
}
