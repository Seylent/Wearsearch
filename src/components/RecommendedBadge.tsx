/**
 * RecommendedBadge Component
 * Displays a recommended/verified badge for stores
 */

export function RecommendedBadge({ className = "" }: { className?: string }) {
  return (
    <span 
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-xs text-purple-400 select-none ${className}`}
      style={{
        background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)'
      }}
    >
      ⭐ Recommended
    </span>
  );
}
