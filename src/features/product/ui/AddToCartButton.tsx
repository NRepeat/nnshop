'use client';

import { useEffect } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { toast } from 'sonner';
import { Button } from '@shared/ui/button';
import addToCart from '../api/add-to-cart';
import { ProductVariant } from '@shared/lib/shopify/types/storefront.types';
import Option from './Option';
import { Product } from '@shared/types/product/types';
import { useTranslations } from 'next-intl';

function SubmitButton() {
  const { pending } = useFormStatus();
  const t = useTranslations('ProductPage');
  return (
    <Button
      type="submit"
      size="lg"
      className="w-full h-14 text-md rounded-none"
      disabled={pending}
      aria-disabled={pending}
    >
      {pending ? t('addingToCart') : t('addToCart')}
    </Button>
  );
}

export function AddToCartButton({
  product,
  selectedVariant,
}: {
  product: Product;
  selectedVariant: ProductVariant;
}) {
  const [formState, formAction] = useFormState(addToCart, {
    success: false,
    message: '',
  });

  useEffect(() => {
    if (formState.message) {
      if (formState.success) {
        toast.success(formState.message);
      } else {
        toast.error(formState.message);
      }
    }
  }, [formState]);

  return (
    <form className="mt-6" action={formAction}>
      <Option
        product={product}
        selectedOption={
          selectedVariant
            ? selectedVariant?.selectedOptions.find(
                (option) => option.name === 'Color',
              )?.value
            : ''
        }
      />
      <input
        type="hidden"
        name="variantId"
        value={
          selectedVariant
            ? selectedVariant.id
            : product?.variants.edges[0].node.id
        }
      />
      <div className="product-form__buttons mt-8">
        <SubmitButton />
      </div>
    </form>
  );
}
