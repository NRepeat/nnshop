import React from 'react';

export function HeaderContentSkeleton() {
  return (
    <>
      {/* Desktop left section */}
      <div className="justify-start w-full items-center hidden md:flex flex-row gap-4">
        <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
      </div>
      {/* Mobile left section */}
      <div className="md:hidden flex items-center gap-2">
        <div className="h-8 w-8 rounded bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
        <div className="h-8 w-20 rounded bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
      </div>
    </>
  );
}
