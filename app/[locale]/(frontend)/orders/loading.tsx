import { BreadcrumbsSkeleton } from '@shared/ui/breadcrumbs';
import { Skeleton } from '@shared/ui/skeleton';
import { Card, CardContent, CardHeader } from '@shared/ui/card';

export default function Loading() {
  return (
    <div className="container mx-auto py-10 min-h-screen mt-2 md:mt-10">
      <BreadcrumbsSkeleton />
      <Skeleton className="h-8 w-48 my-4" />

      <div className="flex flex-wrap gap-2 mb-6">
        <Skeleton className="h-9 w-20" />
        <Skeleton className="h-9 w-24" />
        <Skeleton className="h-9 w-20" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="h-full">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between gap-2">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
              <div className="flex items-center justify-between mt-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-20" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mt-2">
                {[...Array(4)].map((_, j) => (
                  <Skeleton key={j} className="w-14 h-14 rounded-md" />
                ))}
              </div>
              <Skeleton className="h-4 w-28 mt-3" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
