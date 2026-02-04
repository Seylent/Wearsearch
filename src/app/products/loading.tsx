export default function Loading() {
  return (
    <div className="min-h-screen text-foreground pt-24 pb-16">
      <div className="max-w-[1800px] mx-auto px-6 md:px-12 lg:px-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {Array.from({ length: 8 }).map((_, idx) => (
            <div
              key={`skeleton-${idx}`}
              className="h-full flex flex-col rounded-lg overflow-hidden border border-white/10 bg-white/5 animate-pulse"
            >
              <div className="relative aspect-[4/5] bg-white/10" />
              <div className="p-3 flex-1 flex flex-col justify-between space-y-2">
                <div className="space-y-2">
                  <div className="h-3 w-20 bg-white/10 rounded" />
                  <div className="space-y-1.5">
                    <div className="h-3 w-full bg-white/10 rounded" />
                    <div className="h-3 w-3/4 bg-white/10 rounded" />
                  </div>
                </div>
                <div className="h-4 w-24 bg-white/10 rounded mt-2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
