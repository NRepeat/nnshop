import { Skeleton } from '@shared/ui/skeleton';

export default function Loading() {
  return (
    <div className="flex flex-col">
      {/* Hero banner skeleton */}
      <Skeleton className="w-full h-[60vh] md:h-[75vh] rounded-none" />

      {/* Product carousel skeleton */}
      <div className="container py-10 flex flex-col gap-6">
        <Skeleton className="h-7 w-48" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-3">
              <Skeleton className="h-[220px] w-full rounded-xl" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
