import React from 'react';

export function PreviewsCollectionsSkeleton() {
  return (
    <div className="previews-collections animate-pulse">
      <div className="flex flex-col gap-8 py-12">
        <div className="container flex flex-col items-center gap-6">
          <div className="h-9 bg-gray-200 dark:bg-gray-700 rounded w-64"></div>
          <div className="flex gap-4">
             {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
             ))}
          </div>
        </div>
        <div className="relative flex flex-col md:flex-row gap-4">
          <div className="md:w-1/2 aspect-[4/5] bg-gray-200 dark:bg-gray-700"></div>
          <div className="md:w-1/2 flex flex-col gap-8 p-8">
            <div className="grid grid-cols-2 gap-4">
               {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex flex-col gap-2">
                    <div className="aspect-[4/5] bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  </div>
               ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
