import React from 'react';

export function MainCollectionGridSkeleton() {
  return (
    <div className="main-collection-grid flex flex-col container animate-pulse">
      <div className="gap-12 flex flex-col py-8">
        {/* Title skeleton */}
        <div className="pl-4 pt-4 max-w-4xl h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>

        <div className="flex flex-col gap-5 md:grid md:grid-cols-3 items-center">
          {Array.from({ length: 3 }).map((_, i) => ( // Assuming 3 collections for the skeleton
            <div key={i} className="flex flex-col relative group w-[370px] md:w-full">
              <div className="object-contain w-full h-[375px] md:h-[450px] lg:h-[530px] max-h-[530px] bg-gray-200 dark:bg-gray-700"></div>
              <div className="absolute bottom-5 left-5 h-8 w-3/4 bg-gray-300 dark:bg-gray-800 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}