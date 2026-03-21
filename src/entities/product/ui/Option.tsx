'use client';

import { Product } from '@shared/types/product/types';
import { Label } from '@shared/ui/label';
import clsx from 'clsx';
import { Link, usePathname } from '@shared/i18n/navigation';
import { ProductVariant } from '@shared/lib/shopify/types/storefront.types';
const CLOTHING_ORDER = ['xxs','xs','s','m','l','xl','xxl','xxxl','3xl','4xl','one size'];

const sortSizes = (values: string[]) =>
  [...values].sort((a, b) => {
    const aNum = parseFloat(a);
    const bNum = parseFloat(b);
    if (!isNaN(aNum) && !isNaN(bNum)) return aNum - bNum;
    const aIdx = CLOTHING_ORDER.indexOf(a.toLowerCase());
    const bIdx = CLOTHING_ORDER.indexOf(b.toLowerCase());
    if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
    return a.localeCompare(b);
  });

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
            <div className="flex flex-wrap gap-2 mx-2">
              {sortSizes(option.values).map((value) => {
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

                const isAvailable = !!newVariant?.node.availableForSale;

                const newVariantId = newVariant
                  ? newVariant.node.id.split('/').pop()
                  : undefined;
                const newPath = newVariantId
                  ? `${pathname.split('/variant/')[0]}/variant/${newVariantId}`
                  : pathname;

                const isSelected =
                  currentOptionValue.toLowerCase() === value.toLowerCase();

                return (
                  <Link
                    href={newPath}
                    scroll={false}
                    key={value}
                    className={clsx('relative rounded-full px-4 py-2', {
                      'bg-black text-white': isSelected,
                      'border border-gray-300 text-gray-400 line-through':
                        !isSelected && !isAvailable,
                      'border border-gray-300':
                        !isSelected && isAvailable,
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
