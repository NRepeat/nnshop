import { ProductCardSkeleton } from '@entities/product/ui/ProductCardSkeleton';

export default function Loading() {
  return (
    <div className=" ">
      {/*{Array.from({ length: 20 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}*/}
      <ProductCardSkeleton />
    </div>
  );
}
