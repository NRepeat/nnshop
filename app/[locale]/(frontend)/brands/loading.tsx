export default function BrandsLoading() {
  return (
    <div className="container mx-auto py-10 mt-2 md:mt-10 animate-pulse">
      {/* Breadcrumbs Skeleton */}
      <div className="h-4 bg-gray-200 rounded w-64 mb-8" />

      {/* Header Skeleton */}
      <div className="my-8">
        <div className="h-10 bg-gray-200 rounded w-48 mb-4" />
        <div className="h-4 bg-gray-200 rounded w-96" />
      </div>

      {/* Brands Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-md p-6">
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
