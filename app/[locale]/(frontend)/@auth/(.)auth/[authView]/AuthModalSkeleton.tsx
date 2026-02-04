import { QuickView } from '@widgets/product-view';
import { Skeleton } from '@shared/ui/skeleton';

export function AuthModalSkeleton() {
  return (
    <QuickView open={true}>
      <main className="flex grow flex-col items-center justify-center self-center min-h-[60vh]">
        <div className="w-full max-w-md p-8 space-y-6">
          {/* Title */}
          <Skeleton className="h-8 w-3/4 mx-auto" />

          {/* Form inputs */}
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>

          {/* Button */}
          <Skeleton className="h-10 w-full" />

          {/* Link */}
          <Skeleton className="h-4 w-1/2 mx-auto" />
        </div>
      </main>
    </QuickView>
  );
}
