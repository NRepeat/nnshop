export const FavoriteProductCardSkeleton = () => {
  return (
    <div className="animate-pulse">
      {/* Image Skeleton */}
      <div className="relative w-full aspect-square overflow-hidden bg-gray-200 mb-3 rounded-sm" />

      {/* Info Skeleton */}
      <div className="space-y-2">
        {/* Vendor */}
        <div className="h-3 bg-gray-200 rounded w-1/3" />

        {/* Title */}
        <div className="space-y-1">
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-4/5" />
        </div>

        {/* Price */}
        <div className="h-4 bg-gray-200 rounded w-1/4 mt-2" />
      </div>
    </div>
  );
};

export const FavoriteGridSkeleton = () => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
      {Array.from({ length: 10 }).map((_, i) => (
        <FavoriteProductCardSkeleton key={i} />
      ))}
    </div>
  );
};
