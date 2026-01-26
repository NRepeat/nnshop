import React from 'react';

export function HeaderContentSkeleton() {
  return (
    <div className="container w-full animate-pulse">
      <div className="w-full font-sans text-foreground grid grid-cols-3 sm:grid-cols-3 md:grid-cols-3 text-base py-3">
        {/* Left section for navigation/MenuSheet */}
        <div className="justify-start w-full items-center hidden md:flex flex-row gap-4">
          <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
        <div className="md:hidden flex items-center gap-2">
          <div className="h-8 w-8 rounded bg-gray-200 dark:bg-gray-700"></div> {/* MenuSheet icon */}
          <div className="h-8 w-20 rounded bg-gray-200 dark:bg-gray-700"></div> {/* SearchSession */}
        </div>
        {/* Center section (logo is outside this suspended part) - this part is for alignment */}
        <div className="flex items-center justify-center">
            {/* The actual logo is rendered as children, so it will appear immediately */}
            {/* This div is just for occupying space and maintaining the grid layout */}
        </div>
        {/* Right section for HeaderOptions */}
        <div className="flex justify-end items-center gap-4">
          <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700"></div> {/* Account/User */}
          <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700"></div> {/* Favorites */}
          <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700"></div> {/* Cart */}
        </div>
      </div>
      {/* Mobile navigation part */}
      <div className="justify-center w-full items-center flex md:hidden flex-row pb-1">
        <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    </div>
  );
}
