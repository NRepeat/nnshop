import { Product } from '@shared/types/product/types';
import { Button } from '@shared/ui/button';
import { Label } from '@shared/ui/label';
import clsx from 'clsx';
import Link from 'next/link';

const Option = ({
  product,
  selectedOption,
}: {
  product: Product;
  selectedOption: string | undefined;
}) => {
  if (!product) return null;
  const findVariantId = (optionName: string, optionValue: string) => {
    const option = product.options.find((o) => o.name === optionName);
    if (!option) return null;
    const variant = product.variants.edges.find((v) =>
      v.node.selectedOptions.some((o) => o.value === optionValue),
    );
    if (!variant) return null;
    return variant.node.id.split('/').pop();
  };
  return (
    <>
      <div className="mt-6 space-y-4">
        {product.options.map(
          (option: any) =>
            option.name === 'Color' &&
            option.values.length > 1 && (
              <div key={option.id}>
                <Label className="text-sm font-medium">{option.name}</Label>

                <div className="flex flex-wrap gap-2 mt-2">
                  {option.values.map((value: string) => (
                    <Link
                      href={`/products/${product.handle}/variant/${findVariantId(option.name, value)}`}
                      scroll={false}
                      key={value}
                      className={clsx('rounded-full px-4 py-2', {
                        'bg-black text-white':
                          selectedOption?.toLowerCase() === value.toLowerCase(),
                      })}
                    >
                      {value}
                    </Link>
                  ))}
                </div>
              </div>
            ),
        )}
      </div>
    </>
  );
};

export default Option;
