import { Skeleton } from '@/shared/ui/skeleton';

export const ProductQuickViewSkeleton = () => {
  return (
    <div className="bg-white rounded-lg flex gap-8 w-full max-w-4xl p-4 animate-pulse">
      {/* Left column: Image Carousel */}
      <div className="w-1/2">
        <Skeleton className="h-[400px] w-full" />
      </div>

      {/* Right column: Product Details */}
      <div className="w-1/2 flex flex-col gap-4">
        <div className="flex justify-between items-start">
          <div className="w-3/4 space-y-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-6 w-1/4" />
          </div>
          <Skeleton className="h-8 w-8" />
        </div>

        {/* Color options */}
        <div className="mt-4">
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

        <div className="mt-auto pt-6 flex flex-col gap-2">
          {/* Add to Bag button */}
          <Skeleton className="h-12 w-full" />
          {/* View Full Details link */}
          <Skeleton className="h-4 w-1/3 mx-auto" />
        </div>
      </div>
    </div>
  );
};
