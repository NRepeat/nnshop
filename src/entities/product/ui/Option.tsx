'use client';

import { Product } from '@shared/types/product/types';
import { Label } from '@shared/ui/label';
import clsx from 'clsx';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ProductVariant } from '@shared/lib/shopify/types/storefront.types';

const Option = ({
  product,
  selectedVariant,
}: {
  product: Product;
  selectedVariant: ProductVariant;
}) => {
  const pathname = usePathname();

  if (!product) return null;

  return (
    <>
      <div className="mt-6 space-y-4">
        {product.options.map((option) => (
          <div key={option.name}>
            <Label className="text-sm font-medium">{option.name}</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {option.values.map((value) => {
                const currentOptionValue =
                  selectedVariant?.selectedOptions.find(
                    (opt) => opt.name === option.name,
                  )?.value || '';

                const otherSelectedOptions =
                  selectedVariant?.selectedOptions.filter(
                    (opt) => opt.name !== option.name,
                  ) || [];

                const newOptions = [
                  ...otherSelectedOptions,
                  { name: option.name, value },
                ];

                const newVariant = product.variants.edges.find((edge) => {
                  const variantOptions = edge.node.selectedOptions.map(
                    (opt) => ({
                      name: opt.name,
                      value: opt.value,
                    }),
                  );
                  return newOptions.every((newOpt) =>
                    variantOptions.some(
                      (variantOpt) =>
                        variantOpt.name === newOpt.name &&
                        variantOpt.value === newOpt.value,
                    ),
                  );
                });

                const newVariantId = newVariant
                  ? newVariant.node.id.split('/').pop()
                  : undefined;
                const newPath = newVariantId
                  ? `${pathname.split('/variant/')[0]}/variant/${newVariantId}`
                  : pathname;

                return (
                  <Link
                    href={newPath}
                    scroll={false}
                    key={value}
                    className={clsx('rounded-full px-4 py-2', {
                      'bg-black text-white':
                        currentOptionValue.toLowerCase() ===
                        value.toLowerCase(),
                      'border border-gray-300':
                        currentOptionValue.toLowerCase() !==
                        value.toLowerCase(),
                    })}
                  >
                    {value}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default Option;
