import { Card, CardContent } from '@/shared/ui/card';
import { Skeleton } from '@/shared/ui/skeleton';

export const ProductCardSkeleton = () => {
  return (
    <Card className="h-full shadow-none backdrop-blur-sm bg-transparent border-gray-200 cursor-pointer py-1 px-0.5 md:px-1.5">
      <CardContent className="flex flex-col p-0 border-0 shadow-none h-full justify-between bg-transparent">
        <Skeleton className="w-full h-[350px]" />
        <div className="w-full pt-2 md:pt-6 flex flex-col gap-1 flex-1">
          <Skeleton className="h-4 w-1/4" />
          <div className="flex flex-col justify-between flex-1">
            <div className="w-full flex-col justify-between flex pb-4 mt-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2 mt-2" />
            </div>
            <Skeleton className="h-4 w-1/4" />
          </div>
        </div>
        <div className="w-full mt-1 md:mt-4 flex justify-center">
          <Skeleton className="h-10 w-full" />
        </div>
      </CardContent>
    </Card>
  );
};
