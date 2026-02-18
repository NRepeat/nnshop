import { Skeleton } from '@shared/ui/skeleton';
import { ProductViewSkeleton } from '@widgets/product-view/ui/ProductViewSkeleton';

export default function Loading() {
  return (
    <div className="container space-y-16 my-10 h-fit min-h-screen">
      {/* Breadcrumb skeleton — home / gender / brand / product */}
      <div className="flex items-center gap-1.5">
        <Skeleton className="h-4 w-16" />
        <span className="text-muted-foreground/40 text-sm">/</span>
        <Skeleton className="h-4 w-20" />
        <span className="text-muted-foreground/40 text-sm">/</span>
        <Skeleton className="h-4 w-24" />
        <span className="text-muted-foreground/40 text-sm">/</span>
        <Skeleton className="h-4 w-32" />
      </div>

      <ProductViewSkeleton />
    </div>
  );
}
