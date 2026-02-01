import { ProductGridSkeleton } from '@/components/common/SkeletonLoader';

export default function Loading() {
  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-16">
      <div className="max-w-[1800px] mx-auto px-6 md:px-12 lg:px-16">
        <h1 className="text-3xl font-bold mb-8">Favorites</h1>
        <ProductGridSkeleton count={8} />
      </div>
    </div>
  );
}
