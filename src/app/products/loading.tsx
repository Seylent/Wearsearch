import { ProductGridSkeleton } from '@/components/common/SkeletonLoader';

export default function Loading() {
  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-16">
      <div className="container mx-auto px-4">
        <ProductGridSkeleton count={12} />
      </div>
    </div>
  );
}
