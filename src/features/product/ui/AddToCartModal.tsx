'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@shared/ui/dialog';
import { Product } from '@shared/lib/shopify/types/storefront.types';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { cn } from '@shared/lib/utils';
import { CrossedLine } from '@shared/ui/crossed-line';
import { compareSizes } from '@shared/lib/sort-sizes';
import { AddToCartButton } from '@entities/product/ui/AddToCartButton';

interface AddToCartModalProps {
  product: Product;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AddToCartModal = ({
  product,
  open,
  onOpenChange,
}: AddToCartModalProps) => {
  const t = useTranslations('ProductPage');
  const SIZE_NAMES = ['розмір', 'размер', 'size'];

  const sizeOption = product.options?.find((opt) =>
    SIZE_NAMES.includes(opt.name.toLowerCase()),
  );

  const rawSizes = sizeOption?.optionValues?.map((v) => v.name) ?? [];
  const sortedSizes = rawSizes.slice().sort(compareSizes);
  const hasSizes = sortedSizes.length > 0;

  const [selectedSize, setSelectedSize] = useState<string>('');

  const selectedVariant = selectedSize
    ? product.variants.edges.find((edge) =>
        edge.node.selectedOptions.some(
          (opt) =>
            SIZE_NAMES.includes(opt.name.toLowerCase()) &&
            opt.value.toLowerCase() === selectedSize.toLowerCase(),
        ),
      )?.node
    : undefined;

  const handleOpenChange = (val: boolean) => {
    if (!val) setSelectedSize('');
    onOpenChange(val);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>{product.title}</DialogTitle>
        </DialogHeader>

        {hasSizes && (
          <div className="py-2">
            <h3 className="mb-3 text-sm font-medium">{t('selectSize')}</h3>
            <div className="flex flex-wrap gap-2">
              {sortedSizes.map((s) => {
                const variant = product.variants.edges.find((edge) =>
                  edge.node.selectedOptions.some(
                    (opt) =>
                      SIZE_NAMES.includes(opt.name.toLowerCase()) &&
                      opt.value.toLowerCase() === s.toLowerCase(),
                  ),
                )?.node;
                const availableForSale = variant?.availableForSale ?? false;
                const qty = variant?.quantityAvailable ?? -1;
                const isZeroQty = qty === 0;
                const variantAtFitting =
                  variant?.currentlyNotInStock === false && isZeroQty;
                const isUnavailable = !availableForSale && !isZeroQty;
                const showCrossed = isUnavailable || (isZeroQty && !variantAtFitting);
                const showMuted = isUnavailable || isZeroQty;

                return (
                  <button
                    key={s}
                    onClick={() =>
                      setSelectedSize((prev) =>
                        prev.toLowerCase() === s.toLowerCase() ? '' : s,
                      )
                    }
                    disabled={isUnavailable}
                    className={cn(
                      'relative rounded min-w-[50px] h-10 px-3 text-sm border transition-all',
                      {
                        'bg-primary text-primary-foreground border-primary ring-2 ring-offset-1 ring-primary':
                          selectedSize.toLowerCase() === s.toLowerCase(),
                        'border-primary hover:bg-accent':
                          selectedSize.toLowerCase() !== s.toLowerCase() && !showMuted,
                        'opacity-40 border-gray-200':
                          showMuted && selectedSize.toLowerCase() !== s.toLowerCase(),
                      },
                    )}
                  >
                    {s}
                    {showCrossed && <CrossedLine />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="mt-2">
          <AddToCartButton
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            product={product as any}
            selectedVariant={selectedVariant as any}
            onSuccess={() => handleOpenChange(false)}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
