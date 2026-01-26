import { BreadcrumbsSkeleton } from '@shared/ui/breadcrumbs';
import { Skeleton } from '@shared/ui/skeleton';

export default function Loading() {
  return (
    <div className="container mx-auto py-10 mt-2 md:mt-10">
      <BreadcrumbsSkeleton />
      <div className="mt-8 space-y-6">
        {/* Order Header */}
        <Skeleton className="h-8 w-3/4" />
        {/* Order Status and Date */}
        <div className="flex justify-between items-center">
          <Skeleton className="h-5 w-1/4" />
          <Skeleton className="h-5 w-1/4" />
        </div>
        {/* Order Items */}
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4">
              <Skeleton className="h-16 w-16 rounded-md" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
        {/* Order Summary */}
        <div className="space-y-2">
          <Skeleton className="h-5 w-1/3 ml-auto" />
          <Skeleton className="h-5 w-1/4 ml-auto" />
        </div>
      </div>
    </div>
  );
}