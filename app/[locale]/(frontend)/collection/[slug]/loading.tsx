import { ProductCardSkeleton } from '@entities/product/ui/ProductCardSkeleton';

export default function Loading() {
  return (
    <div className="flex items-center justify-center h-fit min-h-screen ">
      <div className="grid grid-cols-2 gap-2 sm:gap-2 sm:grid-cols-2 md:grid-cols-3 lg:gap-8 lg:grid-cols-3 xl:grid-cols-4 ">
        {Array.from({ length: 18 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>  
    </div>
  );
}
