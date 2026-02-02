import { BreadcrumbsSkeleton } from '@shared/ui/breadcrumbs';
import { Skeleton } from '@shared/ui/skeleton';
import { Card, CardContent, CardHeader } from '@shared/ui/card';

export default function Loading() {
  return (
    <div className="container mx-auto py-10 min-h-screen mt-2 md:mt-10">
      <BreadcrumbsSkeleton />

      <div className="mt-4 space-y-6">
        {/* Header card with timeline */}
        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <Skeleton className="h-8 w-32 mb-2" />
                <Skeleton className="h-4 w-40" />
              </div>
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>
          </CardHeader>
          <CardContent>
            {/* Timeline skeleton */}
            <div className="w-full py-4">
              <div className="flex items-center justify-between">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex flex-col items-center flex-1">
                    <div className="flex items-center w-full">
                      {i > 0 && <Skeleton className="h-1 flex-1" />}
                      <Skeleton className="w-8 h-8 rounded-full shrink-0" />
                      {i < 3 && <Skeleton className="h-1 flex-1" />}
                    </div>
                    <Skeleton className="h-3 w-16 mt-2" />
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Two column grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Left column - Contact, Delivery, Payment */}
          <div className="space-y-6">
            {/* Contact card */}
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Skeleton className="w-4 h-4 rounded" />
                  <Skeleton className="h-5 w-20" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </CardContent>
            </Card>

            {/* Delivery card */}
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Skeleton className="w-4 h-4 rounded" />
                  <Skeleton className="h-5 w-24" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </CardContent>
            </Card>

            {/* Payment card */}
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Skeleton className="w-4 h-4 rounded" />
                  <Skeleton className="h-5 w-20" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right column - Order summary */}
          <div>
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Skeleton className="w-4 h-4 rounded" />
                  <Skeleton className="h-5 w-20" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Product items */}
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-start gap-4">
                      <Skeleton className="w-16 h-16 rounded-md shrink-0" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-20" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                      <Skeleton className="h-4 w-20 shrink-0" />
                    </div>
                  ))}
                </div>

                <Skeleton className="h-px w-full my-4" />

                {/* Totals */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <Skeleton className="h-px w-full my-2" />
                  <div className="flex justify-between">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-5 w-28" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
