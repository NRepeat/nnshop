'use client';

import { Link } from '@shared/i18n/navigation';
import { ArrowRight } from 'lucide-react';
import { decodeHtmlEntities } from '@shared/lib/utils/decodeHtmlEntities';

type BrandCardProps = {
  brand: string;
  productCount?: number;
};

export const BrandCard = ({ brand, productCount }: BrandCardProps) => {
  const brandSlug = brand.toLowerCase().replace(/\s+/g, '-');

  return (
    <Link
      href={`/brand/${brandSlug}`}
      className="group relative bg-white border border-gray-200 rounded-md p-6 hover:border-gray-300 hover:shadow-md transition-all duration-200"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-gray-700 transition-colors">
            {decodeHtmlEntities(brand)}
          </h3>
          {productCount !== undefined && (
            <p className="text-sm text-gray-500 mt-1">
              {productCount} {productCount === 1 ? 'товар' : 'товарів'}
            </p>
          )}
        </div>
        <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all" />
      </div>
    </Link>
  );
};
