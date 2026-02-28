import { Skeleton } from '@shared/ui/skeleton';
import { ProductViewSkeleton } from '@widgets/product-view/ui/ProductViewSkeleton';

export default function Loading() {
  return (
    <div className="container space-y-16 my-8 h-fit min-h-screen">
      {/* Breadcrumb skeleton — home / gender / brand / product */}
      <div className="flex gap-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-28" />
      </div>

      <ProductViewSkeleton />
    </div>
  );
}
