import { Skeleton } from '@shared/ui/skeleton';
import { MainCollectionGridSkeleton } from '@entities/home/ui/MainCollectionGridSkeleton';
import { ProductCarouselSkeleton } from '@entities/home/ui/ProductCarouselSkeleton';
import { PreviewsCollectionsSkeleton } from '@entities/home/ui/PreviewsCollectionsSkeleton';
import { BrandGridSkeleton } from '@entities/home/ui/BrandGridSkeleton';

export function HomePageSkeleton() {
  return (
    <div className="flex flex-col">
      <Skeleton className="w-full h-[58vh] md:h-[70vh] rounded-none " />
      <BrandGridSkeleton />
      <MainCollectionGridSkeleton />
      <ProductCarouselSkeleton />
      <PreviewsCollectionsSkeleton />
      <ProductCarouselSkeleton />
    </div>
  );
}
