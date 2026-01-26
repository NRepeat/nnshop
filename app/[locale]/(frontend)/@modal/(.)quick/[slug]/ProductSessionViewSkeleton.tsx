import React from 'react';
import { QuickView } from '@/widgets/product-view/ui/QuickView';

export function ProductSessionViewSkeleton() {
  return (
    <QuickView open={true}>
      <div className="mt-10 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Gallery / Image Placeholder */}
          <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>

          {/* Product Details Placeholder */}
          <div className="flex flex-col gap-4">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div> {/* Title */}
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div> {/* Price */}
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div> {/* Description line 1 */}
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div> {/* Description line 2 */}
            <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded w-full mt-4"></div> {/* Add to Cart Button */}
          </div>
        </div>
      </div>
    </QuickView>
  );
}
