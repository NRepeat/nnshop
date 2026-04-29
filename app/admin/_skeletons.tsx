import { Skeleton } from '@shared/ui/skeleton';
import { Card, CardHeader } from '@shared/ui/card';

export function StatCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-9 w-24 mt-2" />
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}

export function CardsTableSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div className="border-t">
      <div className="grid grid-cols-[2fr_1.5fr_1fr_0.8fr_2fr_3rem] gap-4 px-4 py-3 border-b bg-muted/40">
        {['Имя', 'Телефон', 'Баланс', 'Статус', 'Email', ''].map((h, i) => (
          <Skeleton key={i} className="h-4 w-20" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="grid grid-cols-[2fr_1.5fr_1fr_0.8fr_2fr_3rem] gap-4 px-4 py-3 border-b items-center"
        >
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-16 ml-auto" />
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-8 w-8" />
        </div>
      ))}
    </div>
  );
}

export function ResultsCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-4 w-72 mt-2" />
      </CardHeader>
      <CardsTableSkeleton />
    </Card>
  );
}

export function DashboardSkeleton() {
  return (
    <>
      <StatCardsSkeleton />
      <ResultsCardSkeleton />
    </>
  );
}

export function CardDetailSkeleton() {
  return (
    <>
      <Card>
        <CardHeader>
          <Skeleton className="h-7 w-64" />
          <div className="flex gap-4 mt-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-48" />
          </div>
        </CardHeader>
        <div className="px-6 pb-6">
          <Skeleton className="h-12 w-48" />
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-4 w-full max-w-sm mt-2" />
          </CardHeader>
          <div className="px-6 pb-6 flex flex-col gap-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-9 w-28" />
          </div>
        </Card>

        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-4 w-72 mt-2" />
          </CardHeader>
          <div className="border-t">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="grid grid-cols-[1.2fr_1fr_1fr_2fr_2fr] gap-4 px-4 py-3 border-b items-center"
              >
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-4 w-16 ml-auto" />
                <Skeleton className="h-4 w-full max-w-32" />
                <Skeleton className="h-4 w-full max-w-32" />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}
