'use client';

import { useState, useRef } from 'react';
import { toast } from 'sonner';
import { Button } from '@shared/ui/button';
import addToCart from '../api/add-to-cart';
import { ProductVariant } from '@shared/lib/shopify/types/storefront.types';
import { Product } from '@shared/types/product/types';
import { useTranslations } from 'next-intl';
import clsx from 'clsx';
import { authClient } from '@features/auth/lib/auth-client';

function SubmitButton({
  variant = 'default',
  disabled,
  pending,
  isProductAvailable,
}: {
  variant?: string;
  disabled: boolean;
  pending: boolean;
  isProductAvailable: boolean;
}) {
  const t = useTranslations('ProductPage');

  let buttonText = t('addToCart');
  if (pending) {
    buttonText = t('addingToCart');
  } else if (isProductAvailable) {
    buttonText = t('outOfStock');
  }

  return (
    <Button
      type="submit"
      //@ts-expect-error
      variant={variant}
      className="w-full h-10 md:h-14 text-md rounded-md"
      disabled={disabled || pending}
      aria-disabled={pending}
    >
      {buttonText}
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
  const [isPending, setIsPending] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const t = useTranslations('ProductPage');

  // Check product availability
  const isProductAvailable = selectedVariant
    ? selectedVariant?.quantityAvailable !== 0
    : //@ts-ignore
      product?.totalInventory !== 0;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isProductAvailable && !selectedVariant) {
      toast.warning(t('variantNotSelected')+"!",{style:{justifyContent:"center",backgroundColor:"#FFF4E5",color:"#B98900",border:"1px solid #FFCC47"}});
      return
    }
    // Check if product is available before proceeding
    if (!isProductAvailable) {
      toast.error(t('productNotAvailable'));
      return;
    }

    setIsPending(true);
    const savedScroll = window.scrollY;

    try {
      const { data: session } = await authClient.getSession();

      if (!session?.user) {
        const result = await authClient.signIn.anonymous();

        if (!result.data) {
          toast.error(t('sessionCreationFailed'));
          setIsPending(false);
          return;
        }
      }

      const variantId = selectedVariant
        ? selectedVariant.id
        : product?.variants.edges[0].node.id;

      const formData = new FormData();
      formData.append('variantId', variantId!);

      const result = await addToCart(null, formData);

      if (result.success) {
        toast.success(t('addedToCart'));
      } else {
        // Show specific error message or generic one
        const errorMessage =
          result.message === 'No products available'
            ? t('productNotAvailable')
            : result.message || t('failedToAdd');
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error(t('failedToAdd'));
    } finally {
      setIsPending(false);
      // requestAnimationFrame runs before paint (immediate visual restore)
      // setTimeout(0) runs after all React effects (including Next.js router scroll from revalidateTag)
      requestAnimationFrame(() => window.scrollTo({ top: savedScroll, behavior: 'instant' }));
      setTimeout(() => window.scrollTo({ top: savedScroll, behavior: 'instant' }), 0);
    }
  };

  return (
    <form ref={formRef} className="w-full" onSubmit={handleSubmit}>
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
        <SubmitButton
          variant={variant}
          disabled={!isProductAvailable}
          isProductAvailable={!isProductAvailable}
          pending={isPending}
        />
      </div>
    </form>
  );
}
