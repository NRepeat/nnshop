import { Skeleton } from '@shared/ui/skeleton';
import { MainCollectionGridSkeleton } from '@entities/home/ui/MainCollectionGridSkeleton';
import { ProductCarouselSkeleton } from '@entities/home/ui/ProductCarouselSkeleton';
import { PreviewsCollectionsSkeleton } from '@entities/home/ui/PreviewsCollectionsSkeleton';

export function HomePageSkeleton() {
  return (
    <div className="flex flex-col">
      <Skeleton className="w-full h-[60vh] md:h-[75vh] rounded-none" />
      <MainCollectionGridSkeleton />
      <ProductCarouselSkeleton />
      <PreviewsCollectionsSkeleton />
      <ProductCarouselSkeleton />
    </div>
  );
}
