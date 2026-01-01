import { Skeleton } from '@/shared/ui/skeleton';

export const ProductViewSkeleton = () => {
  return (
    <div className="container  w-full py-12 space-y-24 animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Left column: Image Gallery */}
        <div className="flex flex-col gap-4">
          <Skeleton className="w-full h-[500px]" />
          <div className="flex gap-2">
            <Skeleton className="w-24 h-24" />
            <Skeleton className="w-24 h-24" />
            <Skeleton className="w-24 h-24" />
          </div>
        </div>
        {/* Right column: Product Details */}
        <div className="flex flex-col gap-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-6 w-1/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />

          {/* Color options */}
          <div className="mt-6">
            <Skeleton className="h-4 w-24" />
            <div className="flex gap-2 mt-2">
              <Skeleton className="w-8 h-8 rounded-full" />
              <Skeleton className="w-8 h-8 rounded-full" />
              <Skeleton className="w-8 h-8 rounded-full" />
            </div>
          </div>

          {/* Size options */}
          <div className="mt-4">
            <div className="flex justify-between items-center">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-16" />
            </div>
            <div className="flex gap-2 mt-2">
              <Skeleton className="w-12 h-10" />
              <Skeleton className="w-12 h-10" />
              <Skeleton className="w-12 h-10" />
            </div>
          </div>

          {/* Add to Bag button */}
          <Skeleton className="h-12 w-full mt-6" />

          {/* Accordion items */}
          <div className="mt-6 space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>

      {/* Style With section */}
      <div>
        <Skeleton className="h-8 w-1/3 mx-auto mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Skeleton className="h-[300px]" />
          <Skeleton className="h-[300px]" />
          <Skeleton className="h-[300px]" />
        </div>
      </div>

      {/* Recently Viewed section */}
      <div>
        <Skeleton className="h-8 w-1/3 mx-auto mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Skeleton className="h-[300px]" />
          <Skeleton className="h-[300px]" />
          <Skeleton className="h-[300px]" />
        </div>
      </div>
    </div>
  );
};
