import { Skeleton } from '@shared/ui/skeleton';
import { MainCollectionGridSkeleton } from '@entities/home/ui/MainCollectionGridSkeleton';
import { ProductCarouselSkeleton } from '@entities/home/ui/ProductCarouselSkeleton';
import { PreviewsCollectionsSkeleton } from '@entities/home/ui/PreviewsCollectionsSkeleton';

export default function Loading() {
  return (
    <div className="flex flex-col">
      {/* Hero banner skeleton */}
      <Skeleton className="w-full h-[60vh] md:h-[75vh] rounded-none" />

      {/* Main collection grid */}
      <MainCollectionGridSkeleton />

      {/* Product carousel */}
      <ProductCarouselSkeleton />

      {/* Previews collections */}
      <PreviewsCollectionsSkeleton />

      {/* Second product carousel */}
      <ProductCarouselSkeleton />
    </div>
  );
}
