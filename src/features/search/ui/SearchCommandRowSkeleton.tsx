'use client';
import { Skeleton } from '@shared/ui/skeleton';

// Mirrors SearchCommandRow geometry exactly:
//   row: flex items-center gap-3, py from CommandItem (py-3 in palette theme)
//   image: w-10 h-10
//   title: flex-1 (h-3.5)
//   price: shrink-0 (h-3.5)
export function SearchCommandRowSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div role="presentation">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 px-2 py-3"
          aria-hidden="true"
        >
          <Skeleton className="w-10 h-10 shrink-0 rounded" />
          <Skeleton className="h-3.5 flex-1 max-w-[60%]" />
          <Skeleton className="h-3.5 w-14 shrink-0" />
        </div>
      ))}
    </div>
  );
}
