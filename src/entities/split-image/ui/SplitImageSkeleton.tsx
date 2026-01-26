import React from 'react';

export function SplitImageSkeleton() {
  return (
    <section className="container animate-pulse">
      <div className="py-8 md:py-8">
        <div className="flex flex-col gap-8 md:flex-row md:items-center">
          <div className="relative aspect-[4/5] w-full overflow-hidden bg-gray-200 dark:bg-gray-700 md:aspect-auto md:h-[600px] md:w-2/3">
            {/* Image placeholder */}
          </div>

          <div className="w-full md:w-1/3 md:pl-12">
            {/* Text content placeholder */}
            <div className="flex flex-col gap-6 items-start">
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div> {/* Title */}
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div> {/* Button */}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
