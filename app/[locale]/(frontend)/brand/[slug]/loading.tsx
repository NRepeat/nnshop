export default function BrandLoading() {
  return (
    <div className="container mx-auto py-10 mt-2 md:mt-10 animate-pulse">
      {/* Breadcrumbs Skeleton */}
      <div className="h-4 bg-gray-200 rounded w-64 mb-8" />

      {/* Header Skeleton */}
      <div className="my-8">
        <div className="h-10 bg-gray-200 rounded w-1/3 mb-4" />
        <div className="max-w-3xl space-y-2">
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-5/6" />
          <div className="h-4 bg-gray-200 rounded w-4/6" />
        </div>
        <div className="h-4 bg-gray-200 rounded w-24 mt-4" />
      </div>

      {/* Products Grid Skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i}>
            <div className="relative w-full aspect-square overflow-hidden bg-gray-200 mb-3 rounded-sm" />
            <div className="space-y-2">
              <div className="h-3 bg-gray-200 rounded w-1/3" />
              <div className="space-y-1">
                <div className="h-4 bg-gray-200 rounded w-full" />
                <div className="h-4 bg-gray-200 rounded w-4/5" />
              </div>
              <div className="h-4 bg-gray-200 rounded w-1/4 mt-2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
