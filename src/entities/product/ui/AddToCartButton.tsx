'use client';

import { useActionState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { toast } from 'sonner';
import { Button } from '@shared/ui/button';
import addToCart from '../api/add-to-cart';
import { ProductVariant } from '@shared/lib/shopify/types/storefront.types';
import { Product } from '@shared/types/product/types';
import { useTranslations } from 'next-intl';
import clsx from 'clsx';

function SubmitButton({
  variant = 'default',
  disabled,
}: {
  variant?: string;
  disabled: boolean;
}) {
  const { pending } = useFormStatus();
  const t = useTranslations('ProductPage');
  return (
    <Button
      type="submit"
      //@ts-expect-error
      variant={variant}
      className="w-full h-10 md:h-14 text-md rounded-none"
      disabled={disabled || pending}
      aria-disabled={pending}
    >
      {pending ? t('addingToCart') : t('addToCart')}
    </Button>
  );
}

export function AddToCartButton({
  product,
  selectedVariant,
  className,
  variant,
}: {
  product: Product;
  selectedVariant?: ProductVariant;
  className?: string;
  variant?: string;
}) {
  const [formState, formAction] = useActionState(addToCart, {
    success: false,
    message: '',
  });
  // useEffect(() => {
  //   if (formState.message) {
  //     if (formState.success) {
  //       toast.success(formState.message);
  //     } else {
  //       toast.error(formState.message);
  //     }
  //   }
  // }, [formState]);
  const isProductAvalible = selectedVariant
    ? selectedVariant?.quantityAvailable !== 0
    : //@ts-ignore
      product?.totalInventory !== 0;
  return (
    <form className="w-full" action={formAction}>
      <input
        type="hidden"
        name="variantId"
        value={
          selectedVariant
            ? selectedVariant.id
            : product?.variants.edges[0].node.id
        }
      />
      <div className={clsx('product-form__buttons mt-1 md:mt-4', className)}>
        <SubmitButton variant={variant} disabled={!isProductAvalible} />
      </div>
    </form>
  );
}
