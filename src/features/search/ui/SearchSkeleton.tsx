import { Skeleton } from '@shared/ui/skeleton';

// Always exactly 2 rows on every breakpoint. Items beyond what fits the row
// width are hidden via responsive `hidden` classes so the rendered height
// stays constant when the viewport changes.
//   mobile/sm: 2 cols × 2 rows = 4 items (indices 0..3 visible)
//   md:       3 cols × 2 rows = 6 items (indices 0..5 visible)
//   lg:       4 cols × 2 rows = 8 items (indices 0..7 visible)
const VISIBILITY = [
  '',
  '',
  '',
  '',
  'hidden md:flex',
  'hidden md:flex',
  'hidden lg:flex',
  'hidden lg:flex',
];

// Mirrors ProductCardSPP layout exactly so swap-in is layout-shift free:
//   outer:  flex flex-col gap-3 w-full
//   image:  aspect-[1/1] w-full
//   text:   flex flex-col gap-1 px-1  (title 2 lines + price row)
export function SearchSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {VISIBILITY.map((cls, i) => (
        <div key={i} className={`flex-col gap-3 w-full flex ${cls}`}>
          <Skeleton className="relative aspect-[1/1] w-full" />
          <div className="flex flex-col gap-1 px-1">
            <Skeleton className="h-3 w-4/5" />
            <Skeleton className="h-3 w-3/5" />
            <Skeleton className="mt-1 h-4 w-2/5" />
          </div>
        </div>
      ))}
    </div>
  );
}
