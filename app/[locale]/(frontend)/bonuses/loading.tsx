import { Card, CardContent, CardHeader } from '@shared/ui/card';
import { Skeleton } from '@shared/ui/skeleton';

export default function Loading() {
  return (
    <div className="h-fit min-h-screen">
      <div className="container">
        <div className="flex flex-col gap-4 md:gap-8 mt-8">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-8 w-40" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <Card>
                <CardHeader className="pb-2">
                  <Skeleton className="h-4 w-32" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-9 w-40" />
                </CardContent>
              </Card>
            </div>
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <Skeleton className="h-5 w-36" />
                </CardHeader>
                <CardContent className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-4/6" />
                  <Skeleton className="h-4 w-3/6" />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
