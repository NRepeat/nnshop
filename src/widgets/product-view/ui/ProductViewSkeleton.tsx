import { Skeleton } from '@shared/ui/skeleton';

export const ProductViewSkeleton = () => {
  return (
    <div className="container my-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1fr_0.7fr_1.3fr] gap-6 lg:gap-12">
        {/* Gallery — col-span-1 lg:col-span-2 */}
        <div className="col-span-1 lg:col-span-2 flex flex-col items-center w-full">
          <div className="max-w-[600px] w-full flex flex-col gap-2">
            {/* Main image */}
            <Skeleton className="w-full aspect-square max-h-[60vh] rounded" />
            {/* Thumbnails */}
            <div className="flex gap-1 px-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="basis-1/5 aspect-square rounded" />
              ))}
            </div>
          </div>
        </div>

        {/* Product Info — col 3 */}
        <div className="flex flex-col gap-[30px] w-full">
          {/* Vendor + title + sku + price */}
          <div className="space-y-2">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-7 w-1/3 mt-1" />
          </div>

          {/* Size selector */}
          <div className="space-y-3">
            <Skeleton className="h-4 w-12" />
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-11 w-14 rounded" />
              ))}
            </div>
          </div>

          {/* Color swatches */}
          <div className="space-y-3">
            <Skeleton className="h-4 w-16" />
            <div className="flex gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="w-10 h-10 rounded" />
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
          </div>

          {/* Add to cart */}
          <Skeleton className="h-12 w-full rounded" />

          {/* Quick order + price subscribe */}
          <div className="flex gap-0 w-full">
            <Skeleton className="h-12 w-1/2 rounded-l" />
            <Skeleton className="h-12 w-1/2 rounded-r" />
          </div>

          {/* Accordion */}
          <div className="border-t pt-0 space-y-0">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full mt-px" />
          </div>
        </div>
      </div>
    </div>
  );
};
