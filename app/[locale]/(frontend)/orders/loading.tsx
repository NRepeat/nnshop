import { BreadcrumbsSkeleton } from '@shared/ui/breadcrumbs';
import { Skeleton } from '@shared/ui/skeleton';

export default function Loading() {
  return (
    <div className="container mx-auto py-10 h-screen mt-2 md:mt-10">
      <BreadcrumbsSkeleton />
      <Skeleton className="h-8 w-64 my-4" /> {/* Skeleton for the title */}
      <div className="grid grid-cols-1 gap-4 mt-6">
        {/* Skeletons for multiple order items */}
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <Skeleton className="h-5 w-48" /> {/* Order ID */}
              <Skeleton className="h-5 w-24" /> {/* Order Status */}
            </div>
            <div className="flex justify-between items-center mb-2">
              <Skeleton className="h-4 w-32" /> {/* Order Date */}
              <Skeleton className="h-4 w-20" /> {/* Order Total */}
            </div>
            <div className="space-y-1">
              <Skeleton className="h-4 w-full" /> {/* Item 1 */}
              <Skeleton className="h-4 w-5/6" /> {/* Item 2 */}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}