import React from 'react';
import { QuickView } from '@widgets/product-view'; // Assuming QuickView can be imported directly

export function AuthModalSkeleton() {
  return (
    <QuickView open={true}>
      <main className="flex grow flex-col items-center justify-center self-center animate-pulse">
        <div className="w-full max-w-md p-8 space-y-4 bg-gray-100 dark:bg-gray-800 rounded-lg shadow-md">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mx-auto mb-6"></div> {/* Title */}
          <div className="space-y-4">
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-full"></div> {/* Input 1 */}
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-full"></div> {/* Input 2 */}
          </div>
          <div className="h-10 bg-blue-400 dark:bg-blue-600 rounded w-full mt-6"></div> {/* Submit button */}
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mx-auto"></div> {/* Link */}
        </div>
      </main>
    </QuickView>
  );
}
