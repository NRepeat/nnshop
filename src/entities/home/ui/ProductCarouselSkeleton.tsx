import React from 'react';

export function ProductCarouselSkeleton() {
  return (
    <div className="product-carousel container animate-pulse">
      <div className="py-8 flex flex-col gap-8">
        <div className="mx-auto h-9 bg-gray-200  rounded w-64"></div>
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="basis-1/2 md:basis-1/4 shrink-0 flex flex-col gap-4">
              <div className="aspect-[4/5] w-full bg-gray-200  rounded"></div>
              <div className="h-4 bg-gray-200  rounded w-3/4"></div>
              <div className="h-4 bg-gray-200  rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
