// src/widgets/product-view/ui/ProductViewSkeleton.tsx

import { Skeleton } from '@shared/ui/skeleton';

export const ProductViewSkeleton = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1fr_0.7fr_1.3fr] gap-6 lg:gap-12 p-4">
      {/* Gallery Skeleton */}
      <div className="flex flex-col gap-4">
        <Skeleton className="w-full aspect-square rounded-lg" />
        <div className="grid grid-cols-4 gap-2">
          <Skeleton className="w-full aspect-square rounded" />
          <Skeleton className="w-full aspect-square rounded" />
          <Skeleton className="w-full aspect-square rounded" />
          <Skeleton className="w-full aspect-square rounded" />
        </div>
      </div>

      {/* Spacer */}
      <div></div>

      {/* Product Info Skeleton */}
      <div className="flex flex-col gap-6">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="h-10 w-1/4" />
        
        {/* Size Selection Skeleton */}
        <div className="space-y-3">
          <Skeleton className="h-6 w-20" />
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-10 w-12" />
            <Skeleton className="h-10 w-12" />
            <Skeleton className="h-10 w-12" />
          </div>
        </div>

        {/* Buttons Skeleton */}
        <div className="flex flex-col gap-4 mt-4">
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
        </div>

        {/* Accordion Skeleton */}
        <div className="space-y-4 mt-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    </div>
  );
};